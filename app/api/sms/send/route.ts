import prisma from '@/lib/prisma';
import { createSchedule } from '@/lib/schedules';
import { normalizePhoneNumber, sendSms } from '@/lib/sms';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      targetType,
      recipientSource,
      sessionId,
      classId,
      sectionId,
      shiftId,
      gender,
      recipientSelection = 'ALL',
      customNumbers,
      recipients, // Array of phone numbers directly passed from client
      message,
      deliveryOption = 'NOW', // 'NOW' | 'SCHEDULE'
      scheduledAt,
      title,
      encoding = 'Unicode',
      segments = 1,
      recipientType = 'STUDENTS',
    } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, message: 'Message content is required.' }, { status: 400 });
    }

    let phoneNumbers: string[] = [];

    // 1. Direct Recipients Array (e.g. from dynamic frontend preview)
    if (Array.isArray(recipients) && recipients.length > 0) {
      phoneNumbers = recipients
        .map((p: string) => normalizePhoneNumber(p))
        .filter((p: string) => p && p.length === 13 && p.startsWith('8801'));
      phoneNumbers = Array.from(new Set(phoneNumbers));
    } else if (targetType === 'ALL_TEACHERS') {
      const teachers = await prisma.employee.findMany({
        where: { type: 'TEACHER', smsEnabled: true, status: 'active' },
        select: { phone: true },
      });
      phoneNumbers = teachers
        .map((t) => normalizePhoneNumber(t.phone))
        .filter((p) => p && p.length === 13 && p.startsWith('8801'));
    } else if (targetType === 'ALL_STAFF') {
      const staff = await prisma.employee.findMany({
        where: { type: 'STAFF', smsEnabled: true, status: 'active' },
        select: { phone: true },
      });
      phoneNumbers = staff
        .map((s) => normalizePhoneNumber(s.phone))
        .filter((p) => p && p.length === 13 && p.startsWith('8801'));
    } else {
      // Resolve mode: FILTERED_STUDENTS, CUSTOM_NUMBERS, or BOTH
      const mode = recipientSource || targetType || 'FILTERED_STUDENTS';
      let studentPhones: string[] = [];
      let customPhones: string[] = [];

      // Query Students if FILTERED_STUDENTS or BOTH
      if (mode === 'FILTERED_STUDENTS' || mode === 'BOTH' || mode === 'STUDENTS') {
        const whereEnrollment: any = {};
        if (sessionId && sessionId !== 'ALL' && sessionId !== '') whereEnrollment.sessionId = Number(sessionId);
        if (classId && classId !== 'ALL' && classId !== '') whereEnrollment.classId = Number(classId);
        if (sectionId && sectionId !== 'ALL' && sectionId !== '') whereEnrollment.sectionId = Number(sectionId);
        if (shiftId && shiftId !== 'ALL' && shiftId !== '') whereEnrollment.shiftId = Number(shiftId);

        const whereStudent: any = { status: 'active' };
        if (gender && gender !== 'ALL' && gender !== '') whereStudent.gender = gender;

        const enrollments = await prisma.studentEnrollment.findMany({
          where: { ...whereEnrollment, student: whereStudent },
          include: {
            student: {
              include: { guardian: true },
            },
          },
        });

        studentPhones = enrollments
          .filter((e) => e.student.smsEnabled)
          .map((e) => {
            if (recipientSelection === 'FATHER') return e.student.guardian?.fatherPhone || '';
            if (recipientSelection === 'MOTHER') return e.student.guardian?.motherPhone || '';
            return e.student.guardian?.guardianPhone || e.student.guardian?.fatherPhone || e.student.guardian?.motherPhone || '';
          })
          .map((p) => normalizePhoneNumber(p))
          .filter((p) => p && p.length === 13 && p.startsWith('8801'));
      }

      // Parse Custom Numbers if CUSTOM_NUMBERS or BOTH
      if ((mode === 'CUSTOM_NUMBERS' || mode === 'CUSTOM' || mode === 'BOTH') && customNumbers) {
        const raw = Array.isArray(customNumbers) ? customNumbers : customNumbers.split(/[\n,;]+/);
        customPhones = raw
          .map((p: string) => normalizePhoneNumber(p))
          .filter((p: string) => p && p.length === 13 && p.startsWith('8801'));
      }

      phoneNumbers = Array.from(new Set([...studentPhones, ...customPhones]));
    }

    if (phoneNumbers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid recipient phone numbers found for this criteria.' },
        { status: 400 }
      );
    }

    // If SCHEDULE FOR LATER
    if (deliveryOption === 'SCHEDULE') {
      const scheduledRecord = createSchedule({
        title:
          title ||
          `Notice Broadcast - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        message: message.trim(),
        recipientCount: phoneNumbers.length,
        recipientType: recipientType || 'STUDENTS',
        recipients: phoneNumbers,
        encoding: encoding as any,
        segments: Number(segments) || 1,
        scheduledAt: scheduledAt || new Date().toISOString(),
        status: 'PENDING',
      });

      return NextResponse.json({
        success: true,
        isScheduled: true,
        message: `Broadcast successfully scheduled for ${new Date(scheduledAt || Date.now()).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })} with ${phoneNumbers.length} recipients.`,
        schedule: scheduledRecord,
      });
    }

    // Immediate Delivery (SEND NOW)
    const result = await sendSms({
      numbers: phoneNumbers,
      message: message.trim(),
      type: 'BULK',
    });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message, error: result.error }, { status: 500 });
    }

    // Save completed broadcast log
    createSchedule({
      title:
        title ||
        `Notice Broadcast - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      message: message.trim(),
      recipientCount: phoneNumbers.length,
      recipientType: recipientType || 'STUDENTS',
      recipients: phoneNumbers,
      encoding: encoding as any,
      segments: Number(segments) || 1,
      scheduledAt: new Date().toISOString(),
      status: 'COMPLETED',
    });

    return NextResponse.json({
      success: true,
      message: `SMS broadcast sent successfully to ${phoneNumbers.length} recipients.`,
      recipientCount: phoneNumbers.length,
      data: result.data,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

