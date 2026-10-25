import prisma from '@/lib/prisma';
import { getSmsBalance } from '@/lib/sms';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.max(1, Number(searchParams.get('limit') || '10'));
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status')?.trim();
    const type = searchParams.get('type')?.trim();
    const dateRange = searchParams.get('dateRange')?.trim();
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { recipientPhone: { contains: search } },
        { recipientName: { contains: search } },
        { message: { contains: search } },
      ];
    }

    // Status filter
    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Type filter
    if (type && type !== 'ALL') {
      where.type = type;
    }

    // Date range filter
    if (dateRange && dateRange !== 'ALL') {
      const parseDMY = (s: string) => {
        const match = s.trim().match(/^(\d{2})-(\d{2})-(\d{4})/);
        if (match) return new Date(`${match[3]}-${match[2]}-${match[1]}T00:00:00.000Z`);
        return new Date(`${s.trim()}T00:00:00.000Z`);
      };

      if (dateRange.includes(' to ')) {
        const [startStr, endStr] = dateRange.split(' to ');
        const startDate = parseDMY(startStr);
        const endDate = parseDMY(endStr);
        endDate.setHours(23, 59, 59, 999);
        where.sentAt = {
          gte: startDate,
          lte: endDate,
        };
      } else {
        const singleDate = parseDMY(dateRange);
        const endOfSingle = new Date(singleDate);
        endOfSingle.setHours(23, 59, 59, 999);
        where.sentAt = {
          gte: singleDate,
          lte: endOfSingle,
        };
      }
    }

    // Time calculations for summary cards
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    // Parallel fetch: logs, total count, and summary counters
    const [total, logs, sentToday, sentMonth, totalDelivered, totalFailed, balanceInfo] = await Promise.all([
      prisma.smsLog.count({ where }),
      prisma.smsLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      prisma.smsLog.count({
        where: {
          sentAt: { gte: startOfToday },
          status: 'SENT',
        },
      }),
      prisma.smsLog.count({
        where: {
          sentAt: { gte: startOfMonth },
          status: 'SENT',
        },
      }),
      prisma.smsLog.count({
        where: {
          status: 'SENT',
        },
      }),
      prisma.smsLog.count({
        where: {
          status: { in: ['FAILED', 'PENDING'] },
        },
      }),
      getSmsBalance(),
    ]);

    // Enhance logs with recipient info from students/guardians if possible
    const phones = [...new Set(logs.map((l) => l.recipientPhone).filter(Boolean))];
    const guardians = await prisma.guardian.findMany({
      where: {
        OR: [
          { guardianPhone: { in: phones } },
          { fatherPhone: { in: phones } },
        ],
      },
      include: {
        student: {
          include: {
            enrollments: {
              take: 1,
              orderBy: { id: 'desc' },
              include: { class: true },
            },
          },
        },
      },
    });

    const phoneToStudentMap: Record<string, { studentName: string; studentCode: string; className: string }> = {};
    for (const g of guardians) {
      const info = {
        studentName: g.student?.nameEn || '',
        studentCode: g.student?.studentCode || '',
        className: g.student?.enrollments?.[0]?.class?.name || '',
      };
      if (g.guardianPhone) phoneToStudentMap[g.guardianPhone] = info;
      if (g.fatherPhone) phoneToStudentMap[g.fatherPhone] = info;
    }

    const enhancedLogs = logs.map((log) => {
      const match = phoneToStudentMap[log.recipientPhone] || phoneToStudentMap['88' + log.recipientPhone] || phoneToStudentMap[log.recipientPhone.replace(/^88/, '')];
      return {
        ...log,
        recipientStudentName: match?.studentName || log.recipientName || null,
        recipientStudentCode: match?.studentCode || null,
        recipientClassName: match?.className || null,
      };
    });

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      summary: {
        sentToday,
        sentMonth,
        totalDelivered,
        totalFailed,
        balance: balanceInfo.smsCount || balanceInfo.balance || '0',
        smsCount: balanceInfo.smsCount || balanceInfo.balance || '0',
        takaFormatted: balanceInfo.takaFormatted || '0.0',
        provider: 'SMS',
      },
      logs: enhancedLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
