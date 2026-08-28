import prisma from '@/lib/prisma';
import { sendSms } from '@/lib/sms';
import { format } from 'date-fns';
import { NextResponse } from 'next/server';

const SYNC_SECRET = process.env.BIOMETRIC_SYNC_SECRET || 'ywca_zkteco_k40_bridge_sync_token_secret_9988';

interface PunchItem {
  userId: string; // Biometric User ID / Badge number in K40
  timestamp: string; // ISO string e.g. "2026-08-29T08:15:22"
  verifyMode?: number;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('x-bridge-token') || request.headers.get('authorization')?.replace('Bearer ', '');
    if (authHeader !== SYNC_SECRET) {
      return NextResponse.json({ success: false, message: 'Invalid bridge secret token' }, { status: 401 });
    }

    const body = await request.json();
    const punches: PunchItem[] = Array.isArray(body.punches) ? body.punches : [body];

    if (punches.length === 0) {
      return NextResponse.json({ success: true, message: 'No punches provided', processedCount: 0 });
    }

    let processedCount = 0;
    const errors: any[] = [];

    for (const punch of punches) {
      try {
        const { userId, timestamp, verifyMode } = punch;
        if (!userId || !timestamp) continue;

        const punchDate = new Date(timestamp);
        const dateOnlyStr = format(punchDate, 'yyyy-MM-dd');
        const startOfDay = new Date(`${dateOnlyStr}T00:00:00.000Z`);

        // 1. Log the raw punch
        await prisma.attendanceLog.create({
          data: {
            biometricUserId: String(userId).trim(),
            punchTime: punchDate,
            verifyMode: verifyMode || 1,
            rawPayload: JSON.stringify(punch),
            processed: true,
          },
        });

        // 2. Check if this biometricUserId belongs to a Student
        const student = await prisma.student.findFirst({
          where: {
            OR: [
              { biometricId: String(userId).trim() },
              { studentCode: String(userId).trim() },
              { admissionNo: String(userId).trim() },
            ],
          },
          include: {
            guardian: true,
            enrollments: {
              orderBy: { id: 'desc' },
              take: 1,
              include: {
                shift: true,
                class: true,
                section: true,
              },
            },
          },
        });

        if (student && student.enrollments.length > 0) {
          const enrollment = student.enrollments[0];
          const existingAtt = await prisma.studentAttendance.findUnique({
            where: {
              enrollmentId_date: {
                enrollmentId: enrollment.id,
                date: startOfDay,
              },
            },
          });

          if (!existingAtt) {
            // First punch of the day: In-Time
            let status: 'PRESENT' | 'LATE' = 'PRESENT';
            // If shift has startTime, check for lateness
            if (enrollment.shift?.startTime) {
              const punchHour = punchDate.getHours();
              const punchMin = punchDate.getMinutes();
              // Example logic: if after 8:30 AM -> LATE
              if (punchHour > 8 || (punchHour === 8 && punchMin > 30)) {
                status = 'LATE';
              }
            }

            await prisma.studentAttendance.create({
              data: {
                studentId: student.id,
                enrollmentId: enrollment.id,
                date: startOfDay,
                inTime: punchDate,
                status,
                source: 'BIOMETRIC',
                smsSent: student.smsEnabled,
              },
            });

            // Send Entry SMS
            const guardianPhone = student.guardian?.guardianPhone || student.guardian?.fatherPhone;
            if (student.smsEnabled && guardianPhone) {
              const timeFormatted = format(punchDate, 'hh:mm a');
              sendSms({
                numbers: [guardianPhone],
                message: `Dear Guardian, your child ${student.nameEn} (Roll: ${enrollment.roll}, Class: ${enrollment.class.name}) reached school at ${timeFormatted}.`,
                type: 'ATTENDANCE_ENTRY',
                recipientName: student.nameEn,
              }).catch((e) => console.error('Attendance SMS Error:', e));
            }
          } else {
            // Subsequent punch: Update Out-Time
            await prisma.studentAttendance.update({
              where: { id: existingAtt.id },
              data: {
                outTime: punchDate,
              },
            });
          }

          processedCount++;
          continue;
        }

        // 3. Check if this biometricUserId belongs to an Employee
        const employee = await prisma.employee.findFirst({
          where: {
            OR: [
              { biometricId: String(userId).trim() },
              { employeeCode: String(userId).trim() },
            ],
          },
        });

        if (employee) {
          const existingAtt = await prisma.employeeAttendance.findUnique({
            where: {
              employeeId_date: {
                employeeId: employee.id,
                date: startOfDay,
              },
            },
          });

          if (!existingAtt) {
            await prisma.employeeAttendance.create({
              data: {
                employeeId: employee.id,
                date: startOfDay,
                inTime: punchDate,
                status: 'PRESENT',
                source: 'BIOMETRIC',
                smsSent: false,
              },
            });
          } else {
            await prisma.employeeAttendance.update({
              where: { id: existingAtt.id },
              data: {
                outTime: punchDate,
              },
            });
          }

          processedCount++;
          continue;
        }
      } catch (err: any) {
        console.error('Punch processing error:', err);
        errors.push({ punch, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} biometric punches.`,
      processedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

