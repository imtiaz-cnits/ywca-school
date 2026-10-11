import prisma from '@/lib/prisma';
import { sendSms } from '@/lib/sms';
import {
  evaluateLateness,
  getDhakaAttendanceInfo,
  isKnownTestId,
  normalizePunchTimestamp,
  parseShiftCutoff,
} from '@/lib/timezone';
import { NextResponse } from 'next/server';

const SYNC_SECRET = process.env.BIOMETRIC_SYNC_SECRET || 'ywca_zkteco_k40_bridge_sync_token_secret_9988';

interface PunchItem {
  userId: string; // Biometric User ID / Badge number in K40 / K60
  timestamp: string; // ISO string or local wall-clock string
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
    let duplicateCount = 0;
    let quarantinedCount = 0;
    let unmappedCount = 0;
    const errors: any[] = [];

    for (const punch of punches) {
      try {
        const { userId, timestamp, verifyMode } = punch;
        if (!userId || !timestamp) continue;

        const biometricUserId = String(userId).trim();
        const punchDate = normalizePunchTimestamp(timestamp);
        const { startOfDay, dhakaHour, dhakaMinute, formattedTime12h } = getDhakaAttendanceInfo(punchDate);

        // 1. Quarantine known setup / test IDs (e.g. historical test ID "2")
        if (isKnownTestId(biometricUserId)) {
          quarantinedCount++;
          const existingTestLog = await prisma.attendanceLog.findFirst({
            where: {
              biometricUserId,
              punchTime: punchDate,
            },
          });

          if (!existingTestLog) {
            await prisma.attendanceLog.create({
              data: {
                biometricUserId,
                punchTime: punchDate,
                verifyMode: verifyMode || 1,
                rawPayload: JSON.stringify({ ...punch, status: 'QUARANTINED', reason: 'KNOWN_TEST_ID' }),
                processed: false,
              },
            });
          }
          // Never assign to real students or employees, never send SMS
          continue;
        }

        // 2. Exact raw punch deduplication (check if this identical punch was already logged)
        const existingLog = await prisma.attendanceLog.findFirst({
          where: {
            biometricUserId,
            punchTime: punchDate,
          },
        });

        if (existingLog) {
          duplicateCount++;
          continue;
        }

        // 3. Match against Student records
        const student = await prisma.student.findFirst({
          where: {
            OR: [
              { biometricId: biometricUserId },
              { studentCode: biometricUserId },
              { admissionNo: biometricUserId },
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
          // Record raw punch in attendance_logs as processed: true
          await prisma.attendanceLog.create({
            data: {
              biometricUserId,
              punchTime: punchDate,
              verifyMode: verifyMode || 1,
              rawPayload: JSON.stringify(punch),
              processed: true,
            },
          });

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
            const cutoff = parseShiftCutoff(enrollment.shift?.startTime);
            const status = evaluateLateness(dhakaHour, dhakaMinute, cutoff.cutoffHour, cutoff.cutoffMinute);

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

            // Send Entry SMS with Bangladesh local time (e.g. "08:30 AM")
            const guardianPhone = student.guardian?.guardianPhone || student.guardian?.fatherPhone;
            if (student.smsEnabled && guardianPhone) {
              sendSms({
                numbers: [guardianPhone],
                message: `Dear Guardian, your child ${student.nameEn} (Roll: ${enrollment.roll}, Class: ${enrollment.class.name}) reached school at ${formattedTime12h}.`,
                type: 'ATTENDANCE_ENTRY',
                recipientName: student.nameEn,
              }).catch((e) => console.error('Attendance SMS Error:', e));
            }
          } else {
            // Subsequent punch: Exit / Out-Time
            // 1. Exact in-time replay isolation: If timestamp is identical to inTime, do not touch outTime
            if (existingAtt.inTime && punchDate.getTime() === existingAtt.inTime.getTime()) {
              processedCount++;
              continue;
            }

            // 2. Exact out-time replay isolation: If timestamp is identical to existing outTime, skip
            if (existingAtt.outTime && punchDate.getTime() === existingAtt.outTime.getTime()) {
              processedCount++;
              continue;
            }

            // 3. Legitimate subsequent punch: Update outTime to the latest distinct physical punch
            const prevOutMs = existingAtt.outTime ? existingAtt.outTime.getTime() : 0;
            if (punchDate.getTime() > prevOutMs) {
              await prisma.studentAttendance.update({
                where: { id: existingAtt.id },
                data: {
                  outTime: punchDate,
                },
              });
            }
          }

          processedCount++;
          continue;
        }

        // 4. Match against Employee records
        const employee = await prisma.employee.findFirst({
          where: {
            OR: [
              { biometricId: biometricUserId },
              { employeeCode: biometricUserId },
            ],
          },
        });

        if (employee) {
          // Record raw punch in attendance_logs as processed: true
          await prisma.attendanceLog.create({
            data: {
              biometricUserId,
              punchTime: punchDate,
              verifyMode: verifyMode || 1,
              rawPayload: JSON.stringify(punch),
              processed: true,
            },
          });

          const existingAtt = await prisma.employeeAttendance.findUnique({
            where: {
              employeeId_date: {
                employeeId: employee.id,
                date: startOfDay,
              },
            },
          });

          if (!existingAtt) {
            // First punch of the day: In-Time (Default staff cutoff: 08:30 AM)
            const status = evaluateLateness(dhakaHour, dhakaMinute, 8, 30);
            await prisma.employeeAttendance.create({
              data: {
                employeeId: employee.id,
                date: startOfDay,
                inTime: punchDate,
                status,
                source: 'BIOMETRIC',
                smsSent: false,
              },
            });
          } else {
            // Subsequent punch: Exit / Out-Time
            // 1. Exact in-time replay isolation: If timestamp is identical to inTime, do not touch outTime
            if (existingAtt.inTime && punchDate.getTime() === existingAtt.inTime.getTime()) {
              processedCount++;
              continue;
            }

            // 2. Exact out-time replay isolation: If timestamp is identical to existing outTime, skip
            if (existingAtt.outTime && punchDate.getTime() === existingAtt.outTime.getTime()) {
              processedCount++;
              continue;
            }

            // 3. Legitimate subsequent punch: Update outTime to latest distinct physical punch
            const prevOutMs = existingAtt.outTime ? existingAtt.outTime.getTime() : 0;
            if (punchDate.getTime() > prevOutMs) {
              await prisma.employeeAttendance.update({
                where: { id: existingAtt.id },
                data: {
                  outTime: punchDate,
                },
              });
            }
          }

          processedCount++;
          continue;
        }

        // 5. Unmapped biometric ID (neither Student nor Employee)
        // Preserve raw punch for auditing, clearly marked as processed: false & reviewRequired: true
        await prisma.attendanceLog.create({
          data: {
            biometricUserId,
            punchTime: punchDate,
            verifyMode: verifyMode || 1,
            rawPayload: JSON.stringify({ ...punch, status: 'UNMAPPED_USER', reviewRequired: true }),
            processed: false,
          },
        });

        unmappedCount++;
      } catch (err: any) {
        console.error('Punch processing error:', err);
        errors.push({ punch, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} biometric punches (duplicates: ${duplicateCount}, quarantined: ${quarantinedCount}, unmapped: ${unmappedCount}).`,
      processedCount,
      duplicateCount,
      quarantinedCount,
      unmappedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


