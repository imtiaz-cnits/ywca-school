import prisma from '@/lib/prisma';
import { normalizePhoneNumber } from '@/lib/sms';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      recipientSource = 'FILTERED_STUDENTS', // 'FILTERED_STUDENTS' | 'CUSTOM_NUMBERS' | 'BOTH'
      sessionId,
      classId,
      sectionId,
      shiftId,
      gender,
      recipientSelection = 'ALL', // 'ALL' | 'GUARDIAN' | 'FATHER' | 'MOTHER'
      customNumbers = '',
    } = body;

    let studentsList: any[] = [];
    let validStudentPhones: string[] = [];
    let missingOrInvalidCount = 0;

    // 1. Process Filtered Students if applicable
    if (recipientSource === 'FILTERED_STUDENTS' || recipientSource === 'BOTH') {
      const whereEnrollment: any = {};
      if (sessionId && sessionId !== 'ALL' && sessionId !== '') {
        whereEnrollment.sessionId = Number(sessionId);
      }
      if (classId && classId !== 'ALL' && classId !== '') {
        whereEnrollment.classId = Number(classId);
      }
      if (sectionId && sectionId !== 'ALL' && sectionId !== '') {
        whereEnrollment.sectionId = Number(sectionId);
      }
      if (shiftId && shiftId !== 'ALL' && shiftId !== '') {
        whereEnrollment.shiftId = Number(shiftId);
      }

      const whereStudent: any = {
        status: 'active',
      };
      if (gender && gender !== 'ALL' && gender !== '') {
        whereStudent.gender = gender;
      }

      const enrollments = await prisma.studentEnrollment.findMany({
        where: {
          ...whereEnrollment,
          student: whereStudent,
        },
        include: {
          student: {
            include: {
              guardian: true,
            },
          },
          class: true,
          section: true,
          shift: true,
        },
        orderBy: [{ classId: 'asc' }, { roll: 'asc' }],
      });

      for (const e of enrollments) {
        const student = e.student;
        const guardian = student.guardian;

        let targetPhone = '';
        if (recipientSelection === 'FATHER') {
          targetPhone = guardian?.fatherPhone || '';
        } else if (recipientSelection === 'MOTHER') {
          targetPhone = guardian?.motherPhone || '';
        } else {
          // 'ALL' or 'GUARDIAN'
          targetPhone = guardian?.guardianPhone || guardian?.fatherPhone || guardian?.motherPhone || '';
        }

        const normalized = targetPhone ? normalizePhoneNumber(targetPhone) : '';
        const isValid = Boolean(normalized && normalized.length === 13 && normalized.startsWith('8801'));

        if (isValid) {
          validStudentPhones.push(normalized);
        } else {
          missingOrInvalidCount++;
        }

        studentsList.push({
          id: student.id,
          studentCode: student.studentCode,
          admissionNo: student.admissionNo,
          nameEn: student.nameEn,
          nameBn: student.nameBn,
          roll: e.roll,
          className: e.class?.name || '-',
          sectionName: e.section?.name || '-',
          shiftName: e.shift?.name || '-',
          guardianName: guardian?.guardianName || guardian?.fatherName || guardian?.motherName || 'N/A',
          guardianPhone: targetPhone || 'Missing',
          normalizedPhone: normalized || null,
          isValid,
        });
      }
    }

    // 2. Process Custom Numbers if applicable
    let validCustomPhones: string[] = [];
    let invalidCustomCount = 0;

    if ((recipientSource === 'CUSTOM_NUMBERS' || recipientSource === 'BOTH') && customNumbers) {
      const rawTokens = customNumbers
        .split(/[\n,;]+/)
        .map((s: string) => s.trim())
        .filter(Boolean);

      let customIndex = 1;
      for (const token of rawTokens) {
        const normalized = normalizePhoneNumber(token);
        const isValid = Boolean(normalized && normalized.length === 13 && normalized.startsWith('8801'));
        if (isValid) {
          validCustomPhones.push(normalized);
        } else {
          invalidCustomCount++;
        }

        studentsList.push({
          id: `custom-${customIndex}`,
          studentCode: `CUSTOM-${String(customIndex).padStart(2, '0')}`,
          admissionNo: `CUST-${String(customIndex).padStart(2, '0')}`,
          nameEn: `Custom Number (${token})`,
          nameBn: `কাস্টম মোবাইল নম্বর`,
          roll: '-',
          className: 'Direct Custom Contact',
          sectionName: '-',
          shiftName: '-',
          guardianName: 'Direct Recipient',
          guardianPhone: token,
          normalizedPhone: normalized || null,
          isValid,
        });
        customIndex++;
      }
    }

    // 3. Aggregate unique valid numbers and counts
    const combinedValidPhones = Array.from(new Set([...validStudentPhones, ...validCustomPhones]));
    const totalMissingOrInvalid = missingOrInvalidCount + invalidCustomCount;

    return NextResponse.json({
      success: true,
      matchingStudents: studentsList.length,
      validNumbersCount: combinedValidPhones.length,
      missingNumbersCount: totalMissingOrInvalid,
      validPhones: combinedValidPhones,
      students: studentsList,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
