import prisma from '@/lib/prisma';
import { sendSms } from '@/lib/sms';
import { generateStudentCode } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const shiftId = searchParams.get('shiftId');
    const search = searchParams.get('search');
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const whereEnrollment: any = {};
    if (sessionId) whereEnrollment.sessionId = Number(sessionId);
    if (classId) whereEnrollment.classId = Number(classId);
    if (sectionId) whereEnrollment.sectionId = Number(sectionId);
    if (shiftId) whereEnrollment.shiftId = Number(shiftId);

    const whereStudent: any = {};
    if (search) {
      whereStudent.OR = [
        { nameEn: { contains: search } },
        { nameBn: { contains: search } },
        { studentCode: { contains: search } },
        { admissionNo: { contains: search } },
        { guardian: { guardianPhone: { contains: search } } },
        { guardian: { fatherPhone: { contains: search } } },
      ];
    }

    if (Object.keys(whereEnrollment).length > 0) {
      whereStudent.enrollments = {
        some: whereEnrollment,
      };
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where: whereStudent }),
      prisma.student.findMany({
        where: whereStudent,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          guardian: true,
          enrollments: {
            where: Object.keys(whereEnrollment).length > 0 ? whereEnrollment : undefined,
            orderBy: { id: 'desc' },
            take: 1,
            include: {
              session: { select: { id: true, name: true } },
              class: { select: { id: true, name: true } },
              section: { select: { id: true, name: true } },
              shift: { select: { id: true, name: true } },
              group: { select: { id: true, name: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      students,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      admissionNo,
      admissionDate,
      nameEn,
      nameBn,
      dob,
      gender,
      bloodGroup,
      religion,
      birthCertificateNo,
      photo,
      biometricId,
      smsEnabled,
      // Guardian info
      fatherName,
      fatherNid,
      fatherPhone,
      motherName,
      motherNid,
      motherPhone,
      guardianName,
      guardianPhone,
      guardianRelation,
      presentAddress,
      permanentAddress,
      // Academic enrollment info
      sessionId,
      classId,
      sectionId,
      shiftId,
      groupId,
      roll,
    } = body;

    if (!nameEn || !admissionNo || !sessionId || !classId || !sectionId || !shiftId || !roll) {
      return NextResponse.json(
        { success: false, message: 'Required fields: Student Name, Admission No, Session, Class, Section, Shift, Roll.' },
        { status: 400 }
      );
    }

    // Generate unique student code
    const count = await prisma.student.count();
    const studentCode = generateStudentCode(count + 1);

    const parseFlexibleDate = (val?: string | null): Date | null => {
      if (!val) return null;
      const s = String(val).trim();
      const dmy = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
      if (dmy) {
        return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
      }
      const dt = new Date(s);
      return isNaN(dt.getTime()) ? null : dt;
    };

    // Transaction to create Student, Guardian, and Enrollment together
    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          studentCode,
          admissionNo: admissionNo.trim(),
          admissionDate: parseFlexibleDate(admissionDate) || new Date(),
          nameEn: nameEn.trim(),
          nameBn: nameBn?.trim() || null,
          dob: parseFlexibleDate(dob),
          gender: gender || 'MALE',
          bloodGroup: bloodGroup || null,
          religion: religion || null,
          birthCertificateNo: birthCertificateNo?.trim() || null,
          photo: photo || null,
          biometricId: biometricId?.trim() || null,
          smsEnabled: smsEnabled !== undefined ? Boolean(smsEnabled) : true,
          guardian: {
            create: {
              fatherName: fatherName?.trim() || null,
              fatherNid: fatherNid?.trim() || null,
              fatherPhone: fatherPhone?.trim() || null,
              motherName: motherName?.trim() || null,
              motherNid: motherNid?.trim() || null,
              motherPhone: motherPhone?.trim() || null,
              guardianName: guardianName?.trim() || fatherName?.trim() || null,
              guardianPhone: guardianPhone?.trim() || fatherPhone?.trim() || motherPhone?.trim() || null,
              guardianRelation: guardianRelation?.trim() || 'Parent',
              presentAddress: presentAddress?.trim() || null,
              permanentAddress: permanentAddress?.trim() || null,
            },
          },
          enrollments: {
            create: {
              sessionId: Number(sessionId),
              classId: Number(classId),
              sectionId: Number(sectionId),
              shiftId: Number(shiftId),
              groupId: groupId ? Number(groupId) : null,
              roll: String(roll).trim(),
              status: 'enrolled',
            },
          },
        },
        include: {
          guardian: true,
          enrollments: {
            include: {
              session: true,
              class: true,
              section: true,
              shift: true,
            },
          },
        },
      });

      return student;
    });

    // Optional Welcome SMS
    const primaryPhone = guardianPhone || fatherPhone || motherPhone;
    if (smsEnabled && primaryPhone) {
      sendSms({
        numbers: [primaryPhone],
        message: `Welcome! ${nameEn} has been successfully enrolled in YWCA Nursery School. Student ID: ${studentCode}, Roll: ${roll}.`,
        type: 'SYSTEM',
        recipientName: nameEn,
      }).catch((e) => console.error('SMS Error on admission:', e));
    }

    return NextResponse.json({
      success: true,
      message: 'Student admitted successfully',
      student: result,
    });
  } catch (error: any) {
    console.error('Admission error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Admission number, biometric ID, or Roll number in this section already exists.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

