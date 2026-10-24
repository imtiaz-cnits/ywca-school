import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

function parseDhakaTime(dateStr: string, timeStr?: string): Date | null {
  if (!timeStr || timeStr === '-' || timeStr.trim() === '') return null;
  const trimmed = timeStr.trim();
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridiem = match12[3]?.toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return new Date(`${dateStr}T${hh}:${mm}:00+06:00`);
  }
  const dateObj = new Date(trimmed);
  return isNaN(dateObj.getTime()) ? null : dateObj;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, items, type = 'STUDENT' } = body;

    if (!date || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Date and items array are required.' },
        { status: 400 }
      );
    }

    let dateStr = String(date);
    const match = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})/);
    if (match) {
      dateStr = `${match[3]}-${match[2]}-${match[1]}`;
    }

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);

    if (type === 'STUDENT') {
      for (const item of items) {
        const { enrollmentId, studentId, status, remark } = item;
        if (!enrollmentId || !studentId) continue;

        await prisma.studentAttendance.upsert({
          where: {
            enrollmentId_date: {
              enrollmentId: Number(enrollmentId),
              date: startOfDay,
            },
          },
          create: {
            studentId: Number(studentId),
            enrollmentId: Number(enrollmentId),
            date: startOfDay,
            status: status || 'PRESENT',
            source: 'MANUAL',
            remark: remark || null,
          },
          update: {
            status: status || 'PRESENT',
            source: 'MANUAL',
            remark: remark || null,
          },
        });
      }
    } else {
      for (const item of items) {
        const { employeeId, status, remark, inTime, outTime } = item;
        if (!employeeId) continue;

        const inTimeDate = parseDhakaTime(dateStr, inTime);
        const outTimeDate = parseDhakaTime(dateStr, outTime);

        await prisma.employeeAttendance.upsert({
          where: {
            employeeId_date: {
              employeeId: Number(employeeId),
              date: startOfDay,
            },
          },
          create: {
            employeeId: Number(employeeId),
            date: startOfDay,
            status: status || 'PRESENT',
            inTime: inTimeDate,
            outTime: outTimeDate,
            source: 'MANUAL',
            remark: remark || null,
          },
          update: {
            status: status || 'PRESENT',
            ...(inTime !== undefined ? { inTime: inTimeDate } : {}),
            ...(outTime !== undefined ? { outTime: outTimeDate } : {}),
            source: 'MANUAL',
            remark: remark !== undefined ? remark : undefined,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance recorded successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

