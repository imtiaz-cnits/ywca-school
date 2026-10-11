import prisma from '@/lib/prisma';
import { formatDhakaTime12h, getDhakaAttendanceInfo } from '@/lib/timezone';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || getDhakaAttendanceInfo(new Date()).dateOnlyStr;
    const sessionId = searchParams.get('sessionId');
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const shiftId = searchParams.get('shiftId');

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);

    const enrollmentWhere: any = {};
    if (sessionId) enrollmentWhere.sessionId = Number(sessionId);
    if (classId) enrollmentWhere.classId = Number(classId);
    if (sectionId) enrollmentWhere.sectionId = Number(sectionId);
    if (shiftId) enrollmentWhere.shiftId = Number(shiftId);

    // Fetch all active enrollments for this class/section
    const enrollments = await prisma.studentEnrollment.findMany({
      where: enrollmentWhere,
      orderBy: { roll: 'asc' },
      include: {
        student: {
          select: {
            id: true,
            studentCode: true,
            nameEn: true,
            nameBn: true,
            photo: true,
            biometricId: true,
            guardian: {
              select: {
                guardianPhone: true,
                fatherPhone: true,
              },
            },
          },
        },
        class: { select: { name: true } },
        section: { select: { name: true } },
        shift: { select: { name: true } },
        attendances: {
          where: { date: startOfDay },
        },
      },
    });

    const report = enrollments.map((enr) => {
      const att = enr.attendances[0] || null;
      return {
        enrollmentId: enr.id,
        studentId: enr.student.id,
        studentCode: enr.student.studentCode,
        name: enr.student.nameEn,
        nameBn: enr.student.nameBn,
        roll: enr.roll,
        photo: enr.student.photo,
        className: enr.class.name,
        sectionName: enr.section?.name || '-',
        shiftName: enr.shift.name,
        phone: enr.student.guardian?.guardianPhone || enr.student.guardian?.fatherPhone || '-',
        attendanceId: att?.id || null,
        status: att ? att.status : 'ABSENT',
        inTime: formatDhakaTime12h(att?.inTime),
        outTime: formatDhakaTime12h(att?.outTime),
        source: att?.source || 'MANUAL',
      };
    });

    const summary = {
      total: report.length,
      present: report.filter((r) => r.status === 'PRESENT').length,
      late: report.filter((r) => r.status === 'LATE').length,
      absent: report.filter((r) => r.status === 'ABSENT').length,
      excused: report.filter((r) => r.status === 'EXCUSED').length,
    };

    return NextResponse.json({
      success: true,
      date: dateStr,
      summary,
      report,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

