import prisma from '@/lib/prisma';
import { formatDhakaTime12h, getDhakaAttendanceInfo } from '@/lib/timezone';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const dateParam = searchParams.get('date') || getDhakaAttendanceInfo(new Date()).dateOnlyStr;
    let startDateStr = dateParam;
    let endDateStr = dateParam;
    if (dateParam.includes(' to ')) {
      const parts = dateParam.split(' to ');
      startDateStr = parts[0].trim();
      endDateStr = (parts[1] || parts[0]).trim();
    }

    // Convert DD-MM-YYYY to YYYY-MM-DD if needed
    const normalizeDateStr = (s: string) => {
      const match = s.match(/^(\d{2})-(\d{2})-(\d{4})/);
      return match ? `${match[3]}-${match[2]}-${match[1]}` : s;
    };
    startDateStr = normalizeDateStr(startDateStr);
    endDateStr = normalizeDateStr(endDateStr);

    // Database EmployeeAttendance uses date @db.Date, mapped at midnight UTC
    const startOfDay = new Date(`${startDateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${endDateStr}T00:00:00.000Z`);

    // Precise Asia/Dhaka day boundaries (+06:00) for bounding AttendanceLog query
    const dhakaDayStartUtc = new Date(`${startDateStr}T00:00:00+06:00`);
    const dhakaDayEndUtc = new Date(`${endDateStr}T23:59:59.999+06:00`);

    const where: any = { status: 'active' };
    if (type) where.type = type;

    // Parallel fetch: active employees with attendance row + bounded raw logs for the day
    const [employees, rawLogs] = await Promise.all([
      prisma.employee.findMany({
        where,
        orderBy: { id: 'asc' },
        include: {
          attendances: {
            where: {
              date: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            orderBy: { date: 'desc' },
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

    // Query approved leaves overlapping the target date
    let leavesList: any[] = [];
    try {
      leavesList = await prisma.$queryRawUnsafe<any[]>(`
        SELECT employeeId, leaveType FROM leaves 
        WHERE status = 'APPROVED' 
        AND startDate <= '${endDateStr}' AND endDate >= '${startDateStr}'
      `);
    } catch {
      // Table might not exist or empty
    }
    const leaveMap = new Map<number, string>();
    for (const l of leavesList) {
      leaveMap.set(Number(l.employeeId), String(l.leaveType));
    }

    const report = employees.map((emp) => {
      const att = emp.attendances[0] || null;
      const bioId = emp.biometricId ? String(emp.biometricId).trim() : null;
      const empPunches = bioId && rawLogsByBioId.has(bioId) ? rawLogsByBioId.get(bioId)! : [];
      const hasStoredAtt = !!att;
      let leaveType = leaveMap.get(emp.id) || '-';

      // Fallback 1: Extract from stored remark if remark contains 'Approved Leave: ...'
      if (leaveType === '-' && att?.remark) {
        const remarkMatch = att.remark.match(/(?:Approved\s+)?Leave:\s*(.+)$/i);
        if (remarkMatch && remarkMatch[1]) {
          leaveType = remarkMatch[1].trim();
        } else if (att.remark.toLowerCase().includes('leave')) {
          leaveType = att.remark.trim();
        }
      }

      // Fallback 2: If status is EXCUSED but leaveType is still '-', set as Excused Leave
      if (leaveType === '-' && att?.status === 'EXCUSED') {
        leaveType = 'Casual Leave';
      }

      let status = leaveType !== '-' || att?.status === 'EXCUSED' ? 'EXCUSED' : 'ABSENT';
      let inTime = '-';
      let outTime = '-';
      let source = 'MANUAL';
      let remark = att?.remark || (leaveType !== '-' ? `Approved Leave: ${leaveType}` : null);

      if (leaveType !== '-' || att?.status === 'EXCUSED') {
        status = 'EXCUSED';
        source = att?.source || 'LEAVE_SYSTEM';
        remark = att?.remark || `Approved Leave: ${leaveType}`;
        if (hasStoredAtt) {
          inTime = formatDhakaTime12h(att.inTime);
          outTime = formatDhakaTime12h(att.outTime);
        }
      } else if (hasStoredAtt) {
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
        leaveType,
        fixedInTime: '08:30 AM',
        fixedOutTime: '02:00 PM',
        lateThreshold: '08:35 AM',
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
      date: dateParam,
      summary,
      report,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

