import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

    const startOfDay = new Date(`${date}T00:00:00.000Z`);

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
        const { employeeId, status, remark } = item;
        if (!employeeId) continue;

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
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance recorded successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

