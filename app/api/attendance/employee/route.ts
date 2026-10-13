import prisma from '@/lib/prisma';
import { formatDhakaTime12h, getDhakaAttendanceInfo } from '@/lib/timezone';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || getDhakaAttendanceInfo(new Date()).dateOnlyStr;
    const type = searchParams.get('type') as 'TEACHER' | 'STAFF' | null;

    // Database EmployeeAttendance uses date @db.Date, mapped at midnight UTC
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);

    // Precise Asia/Dhaka day boundaries (+06:00) for bounding AttendanceLog query
    const dhakaDayStartUtc = new Date(`${dateStr}T00:00:00+06:00`);
    const dhakaDayEndUtc = new Date(`${dateStr}T23:59:59.999+06:00`);

    const where: any = { status: 'active' };
    if (type) where.type = type;

    // Parallel fetch: active employees with attendance row + bounded raw logs for the day
    const [employees, rawLogs] = await Promise.all([
      prisma.employee.findMany({
        where,
        orderBy: { id: 'asc' },
        include: {
          attendances: {
            where: { date: startOfDay },
          },
        },
      }),
      prisma.attendanceLog.findMany({
        where: {
          punchTime: {
            gte: dhakaDayStartUtc,
            lte: dhakaDayEndUtc,
          },
        },
        select: {
          biometricUserId: true,
          punchTime: true,
        },
        orderBy: {
          punchTime: 'asc',
        },
      }),
    ]);

    // Group raw punch timestamps by exact biometricUserId
    const rawLogsByBioId = new Map<string, Date[]>();
    for (const log of rawLogs) {
      const bId = String(log.biometricUserId).trim();
      if (!rawLogsByBioId.has(bId)) {
        rawLogsByBioId.set(bId, []);
      }
      rawLogsByBioId.get(bId)!.push(log.punchTime);
    }

    const report = employees.map((emp) => {
      const att = emp.attendances[0] || null;
      const bioId = emp.biometricId ? String(emp.biometricId).trim() : null;
      const empPunches = bioId && rawLogsByBioId.has(bioId) ? rawLogsByBioId.get(bioId)! : [];
      const hasStoredAtt = !!att;

      let status = 'ABSENT';
      let inTime = '-';
      let outTime = '-';
      let source = 'MANUAL';
      let remark = att?.remark || null;

      if (hasStoredAtt) {
        // Ground truth: official stored attendance row exists
        status = att.status;
        inTime = formatDhakaTime12h(att.inTime);
        outTime = formatDhakaTime12h(att.outTime);
        source = att.source;
      } else if (empPunches.length > 0) {
        // Virtual status: biometric punch exists on device, but no confirmed attendance row yet
        status = 'UNDER_REVIEW';
        source = 'BIOMETRIC';
        inTime = formatDhakaTime12h(empPunches[0]);
        outTime = empPunches.length > 1 ? formatDhakaTime12h(empPunches[empPunches.length - 1]) : '-';
        remark = empPunches.length === 1
          ? 'Single raw scan recorded; review pending'
          : `${empPunches.length} raw scans recorded; review pending`;
      }

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        biometricId: emp.biometricId,
        name: emp.name,
        designation: emp.designation,
        type: emp.type,
        phone: emp.phone,
        photo: emp.photo,
        attendanceId: att?.id || null,
        status,
        inTime,
        outTime,
        source,
        rawPunchCount: empPunches.length,
        rawPunches: empPunches.map((p) => formatDhakaTime12h(p)),
        remark,
      };
    });

    const summary = {
      total: report.length,
      present: report.filter((r) => r.status === 'PRESENT').length,
      late: report.filter((r) => r.status === 'LATE').length,
      underReview: report.filter((r) => r.status === 'UNDER_REVIEW').length,
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

