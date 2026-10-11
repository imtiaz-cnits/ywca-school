import prisma from '@/lib/prisma';
import { formatDhakaTime12h, getDhakaAttendanceInfo } from '@/lib/timezone';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || getDhakaAttendanceInfo(new Date()).dateOnlyStr;
    const type = searchParams.get('type') as 'TEACHER' | 'STAFF' | null;

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);

    const where: any = { status: 'active' };
    if (type) where.type = type;

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { id: 'asc' },
      include: {
        attendances: {
          where: { date: startOfDay },
        },
      },
    });

    const report = employees.map((emp) => {
      const att = emp.attendances[0] || null;
      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        name: emp.name,
        designation: emp.designation,
        type: emp.type,
        phone: emp.phone,
        photo: emp.photo,
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

