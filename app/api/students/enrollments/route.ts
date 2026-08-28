import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentId,
      sessionId,
      classId,
      sectionId,
      shiftId,
      groupId,
      roll,
      enrollmentDate,
    } = body;

    if (!studentId || !sessionId || !classId || !sectionId || !shiftId || !roll) {
      return NextResponse.json(
        { success: false, message: 'All enrollment fields are required.' },
        { status: 400 }
      );
    }

    // Check if student is already enrolled in this session
    const existing = await prisma.studentEnrollment.findFirst({
      where: {
        studentId: Number(studentId),
        sessionId: Number(sessionId),
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Student is already enrolled in this academic session.' },
        { status: 400 }
      );
    }

    const enrollment = await prisma.studentEnrollment.create({
      data: {
        studentId: Number(studentId),
        sessionId: Number(sessionId),
        classId: Number(classId),
        sectionId: Number(sectionId),
        shiftId: Number(shiftId),
        groupId: groupId ? Number(groupId) : null,
        roll: String(roll).trim(),
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
        status: 'enrolled',
      },
      include: {
        student: true,
        session: true,
        class: true,
        section: true,
        shift: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Student re-admitted/enrolled successfully',
      enrollment,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Roll number is already taken in this session/class/section.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

