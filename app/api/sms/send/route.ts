import prisma from '@/lib/prisma';
import { sendSms } from '@/lib/sms';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      targetType, // 'CUSTOM' | 'CLASS' | 'SECTION' | 'ALL_STUDENTS' | 'ALL_TEACHERS' | 'ALL_STAFF'
      sessionId,
      classId,
      sectionId,
      customNumbers,
      message,
    } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, message: 'Message content is required.' }, { status: 400 });
    }

    let phoneNumbers: string[] = [];

    if (targetType === 'CUSTOM' && customNumbers) {
      phoneNumbers = Array.isArray(customNumbers) ? customNumbers : customNumbers.split(',');
    } else if (targetType === 'ALL_TEACHERS') {
      const teachers = await prisma.employee.findMany({
        where: { type: 'TEACHER', smsEnabled: true, status: 'active' },
        select: { phone: true },
      });
      phoneNumbers = teachers.map((t) => t.phone);
    } else if (targetType === 'ALL_STAFF') {
      const staff = await prisma.employee.findMany({
        where: { type: 'STAFF', smsEnabled: true, status: 'active' },
        select: { phone: true },
      });
      phoneNumbers = staff.map((s) => s.phone);
    } else {
      // Student queries
      const whereEnrollment: any = {};
      if (sessionId) whereEnrollment.sessionId = Number(sessionId);
      if (classId) whereEnrollment.classId = Number(classId);
      if (sectionId) whereEnrollment.sectionId = Number(sectionId);

      const enrollments = await prisma.studentEnrollment.findMany({
        where: whereEnrollment,
        include: {
          student: {
            include: {
              guardian: true,
            },
          },
        },
      });

      const phones = enrollments
        .filter((e) => e.student.smsEnabled)
        .map((e) => e.student.guardian?.guardianPhone || e.student.guardian?.fatherPhone || '')
        .filter((p) => p && p.trim().length >= 10);

      phoneNumbers = Array.from(new Set(phones));
    }

    if (phoneNumbers.length === 0) {
      return NextResponse.json({ success: false, message: 'No valid recipient phone numbers found for this criteria.' }, { status: 400 });
    }

    const result = await sendSms({
      numbers: phoneNumbers,
      message: message.trim(),
      type: 'BULK',
    });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `SMS sent successfully to ${phoneNumbers.length} recipients.`,
      recipientCount: phoneNumbers.length,
      data: result.data,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

