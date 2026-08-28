import prisma from '@/lib/prisma';
import { getSmsBalance } from '@/lib/sms';
import { format } from 'date-fns';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const startOfToday = new Date(`${todayStr}T00:00:00.000Z`);

    const [
      totalStudents,
      totalTeachers,
      totalStaff,
      totalClasses,
      totalSections,
      todayStudentAttendance,
      todayEmployeeAttendance,
      recentPunches,
      currentSession,
    ] = await Promise.all([
      prisma.student.count({ where: { status: 'active' } }),
      prisma.employee.count({ where: { type: 'TEACHER', status: 'active' } }),
      prisma.employee.count({ where: { type: 'STAFF', status: 'active' } }),
      prisma.class.count(),
      prisma.section.count(),
      prisma.studentAttendance.groupBy({
        by: ['status'],
        where: { date: startOfToday },
        _count: { status: true },
      }),
      prisma.employeeAttendance.groupBy({
        by: ['status'],
        where: { date: startOfToday },
        _count: { status: true },
      }),
      prisma.attendanceLog.findMany({
        take: 10,
        orderBy: { id: 'desc' },
      }),
      prisma.session.findFirst({ where: { isCurrent: true } }),
    ]);

    // SMS Balance
    let smsInfo = { totalSent: 'N/A', balance: 'N/A' };
    try {
      const smsRes = await getSmsBalance();
      if (smsRes.success) {
        smsInfo = {
          totalSent: smsRes.totalSent || 'N/A',
          balance: smsRes.balance || 'N/A',
        };
      }
    } catch {
      // ignore
    }

    const studentAttSummary = {
      present: todayStudentAttendance.find((a) => a.status === 'PRESENT')?._count.status || 0,
      late: todayStudentAttendance.find((a) => a.status === 'LATE')?._count.status || 0,
      absent: todayStudentAttendance.find((a) => a.status === 'ABSENT')?._count.status || 0,
    };

    const employeeAttSummary = {
      present: todayEmployeeAttendance.find((a) => a.status === 'PRESENT')?._count.status || 0,
      late: todayEmployeeAttendance.find((a) => a.status === 'LATE')?._count.status || 0,
      absent: todayEmployeeAttendance.find((a) => a.status === 'ABSENT')?._count.status || 0,
    };

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalStaff,
        totalClasses,
        totalSections,
        currentSession: currentSession?.name || 'Not Set',
        studentAttendance: studentAttSummary,
        employeeAttendance: employeeAttSummary,
        sms: smsInfo,
      },
      recentPunches,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

