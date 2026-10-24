import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    let query = `
      SELECT 
        l.id,
        l.employeeId,
        l.leaveType,
        l.duration,
        l.leaveAddress,
        l.substituteName,
        l.department,
        DATE_FORMAT(l.startDate, '%Y-%m-%d') as startDate,
        DATE_FORMAT(l.endDate, '%Y-%m-%d') as endDate,
        l.reason,
        l.status,
        l.appliedAt,
        e.name as employeeName,
        e.employeeCode,
        e.designation,
        e.type as employeeType,
        e.photo as employeePhoto
      FROM leaves l
      JOIN employees e ON l.employeeId = e.id
      WHERE 1=1
    `;

    const conditions: string[] = [];
    if (status) {
      conditions.push(`l.status = '${status.replace(/'/g, "''")}'`);
    }
    if (search) {
      const sanitized = search.replace(/'/g, "''");
      conditions.push(`(e.name LIKE '%${sanitized}%' OR e.employeeCode LIKE '%${sanitized}%' OR l.leaveType LIKE '%${sanitized}%')`);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY l.id DESC';

    const leaves: any = await prisma.$queryRawUnsafe(query);

    return NextResponse.json({ success: true, leaves });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      status,
      duration = 'FULL_DAY',
      leaveAddress,
      substituteName,
      department,
    } = body;

    if (!employeeId || !leaveType || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'Employee, Leave Type, and Dates are required' },
        { status: 400 }
      );
    }

    const toIso = (s: string) => {
      const match = s.trim().match(/^(\d{2})-(\d{2})-(\d{4})/);
      return match ? `${match[3]}-${match[2]}-${match[1]}` : s.trim();
    };
    const stDate = toIso(startDate);
    const enDate = toIso(endDate);
    const rsn = reason ? reason.trim().replace(/'/g, "''") : '';
    const stat = status || 'PENDING';
    const dur = duration ? duration.trim().replace(/'/g, "''") : 'FULL_DAY';
    const addr = leaveAddress ? leaveAddress.trim().replace(/'/g, "''") : '';
    const sub = substituteName ? substituteName.trim().replace(/'/g, "''") : '';
    const dept = department ? department.trim().replace(/'/g, "''") : '';

    await prisma.$executeRawUnsafe(`
      INSERT INTO leaves (employeeId, leaveType, startDate, endDate, reason, status, duration, leaveAddress, substituteName, department)
      VALUES (${Number(employeeId)}, '${leaveType.replace(/'/g, "''")}', '${stDate}', '${enDate}', '${rsn}', '${stat}', '${dur}', '${addr}', '${sub}', '${dept}')
    `);

    // If leave is approved, sync attendance for this date range
    if (stat === 'APPROVED') {
      try {
        const start = new Date(stDate);
        const end = new Date(enDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateDay = new Date(d);
          dateDay.setUTCHours(0, 0, 0, 0);
          await prisma.employeeAttendance.upsert({
            where: {
              employeeId_date: {
                employeeId: Number(employeeId),
                date: dateDay,
              },
            },
            create: {
              employeeId: Number(employeeId),
              date: dateDay,
              status: 'EXCUSED',
              source: 'MANUAL',
              remark: `Approved Leave: ${leaveType}`,
            },
            update: {
              status: 'EXCUSED',
              remark: `Approved Leave: ${leaveType}`,
            },
          });
        }
      } catch (attErr) {
        console.error('Attendance sync error for leave:', attErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Leave application recorded successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      status,
      leaveType,
      startDate,
      endDate,
      reason,
      duration,
      leaveAddress,
      substituteName,
      department,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Leave ID is required' }, { status: 400 });
    }

    const toIso = (s: string) => {
      const match = s.trim().match(/^(\d{2})-(\d{2})-(\d{4})/);
      return match ? `${match[3]}-${match[2]}-${match[1]}` : s.trim();
    };

    const updates: string[] = [];
    if (status) updates.push(`status = '${status.replace(/'/g, "''")}'`);
    if (leaveType) updates.push(`leaveType = '${leaveType.replace(/'/g, "''")}'`);
    if (startDate) updates.push(`startDate = '${toIso(startDate)}'`);
    if (endDate) updates.push(`endDate = '${toIso(endDate)}'`);
    if (reason !== undefined) updates.push(`reason = '${reason ? reason.trim().replace(/'/g, "''") : ''}'`);
    if (duration !== undefined) updates.push(`duration = '${duration ? duration.trim().replace(/'/g, "''") : 'FULL_DAY'}'`);
    if (leaveAddress !== undefined) updates.push(`leaveAddress = '${leaveAddress ? leaveAddress.trim().replace(/'/g, "''") : ''}'`);
    if (substituteName !== undefined) updates.push(`substituteName = '${substituteName ? substituteName.trim().replace(/'/g, "''") : ''}'`);
    if (department !== undefined) updates.push(`department = '${department ? department.trim().replace(/'/g, "''") : ''}'`);

    if (updates.length > 0) {
      await prisma.$executeRawUnsafe(`
        UPDATE leaves SET ${updates.join(', ')} WHERE id = ${Number(id)}
      `);
    }

    // If status updated to APPROVED, sync attendance
    if (status === 'APPROVED') {
      try {
        const rows: any[] = await prisma.$queryRawUnsafe(`
          SELECT employeeId, leaveType, DATE_FORMAT(startDate, '%Y-%m-%d') as startDate, DATE_FORMAT(endDate, '%Y-%m-%d') as endDate
          FROM leaves WHERE id = ${Number(id)}
        `);
        if (rows && rows.length > 0) {
          const lv = rows[0];
          const start = new Date(lv.startDate);
          const end = new Date(lv.endDate);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateDay = new Date(d);
            dateDay.setUTCHours(0, 0, 0, 0);
            await prisma.employeeAttendance.upsert({
              where: {
                employeeId_date: {
                  employeeId: Number(lv.employeeId),
                  date: dateDay,
                },
              },
              create: {
                employeeId: Number(lv.employeeId),
                date: dateDay,
                status: 'EXCUSED',
                source: 'MANUAL',
                remark: `Approved Leave: ${lv.leaveType}`,
              },
              update: {
                status: 'EXCUSED',
                remark: `Approved Leave: ${lv.leaveType}`,
              },
            });
          }
        }
      } catch (attErr) {
        console.error('Attendance sync error on leave update:', attErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Leave updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    await prisma.$executeRawUnsafe(`DELETE FROM leaves WHERE id = ${Number(id)}`);
    return NextResponse.json({ success: true, message: 'Leave record deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
