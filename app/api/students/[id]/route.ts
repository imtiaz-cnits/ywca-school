import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: {
        guardian: true,
        enrollments: {
          orderBy: { id: 'desc' },
          include: {
            session: true,
            class: true,
            section: true,
            shift: true,
            group: true,
          },
        },
        attendances: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      admissionNo,
      admissionDate,
      nameEn,
      nameBn,
      dob,
      gender,
      bloodGroup,
      religion,
      birthCertificateNo,
      photo,
      biometricId,
      smsEnabled,
      status,
      // Guardian info
      fatherName,
      fatherNid,
      fatherPhone,
      motherName,
      motherNid,
      motherPhone,
      guardianName,
      guardianPhone,
      guardianRelation,
      presentAddress,
      permanentAddress,
      // Current enrollment info
      currentEnrollmentId,
      sessionId,
      classId,
      sectionId,
      shiftId,
      groupId,
      roll,
    } = body;

    const studentId = Number(id);

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update Student
      const student = await tx.student.update({
        where: { id: studentId },
        data: {
          admissionNo: admissionNo ? admissionNo.trim() : undefined,
          admissionDate: admissionDate ? new Date(admissionDate) : undefined,
          nameEn: nameEn ? nameEn.trim() : undefined,
          nameBn: nameBn !== undefined ? nameBn?.trim() : undefined,
          dob: dob ? new Date(dob) : undefined,
          gender: gender || undefined,
          bloodGroup: bloodGroup !== undefined ? bloodGroup : undefined,
          religion: religion !== undefined ? religion : undefined,
          birthCertificateNo: birthCertificateNo !== undefined ? birthCertificateNo : undefined,
          photo: photo !== undefined ? photo : undefined,
          biometricId: biometricId !== undefined ? (biometricId ? biometricId.trim() : null) : undefined,
          smsEnabled: smsEnabled !== undefined ? Boolean(smsEnabled) : undefined,
          status: status || undefined,
        },
      });

      // 2. Update Guardian
      await tx.guardian.upsert({
        where: { studentId },
        create: {
          studentId,
          fatherName: fatherName?.trim() || null,
          fatherNid: fatherNid?.trim() || null,
          fatherPhone: fatherPhone?.trim() || null,
          motherName: motherName?.trim() || null,
          motherNid: motherNid?.trim() || null,
          motherPhone: motherPhone?.trim() || null,
          guardianName: guardianName?.trim() || null,
          guardianPhone: guardianPhone?.trim() || null,
          guardianRelation: guardianRelation?.trim() || null,
          presentAddress: presentAddress?.trim() || null,
          permanentAddress: permanentAddress?.trim() || null,
        },
        update: {
          fatherName: fatherName?.trim() || null,
          fatherNid: fatherNid?.trim() || null,
          fatherPhone: fatherPhone?.trim() || null,
          motherName: motherName?.trim() || null,
          motherNid: motherNid?.trim() || null,
          motherPhone: motherPhone?.trim() || null,
          guardianName: guardianName?.trim() || null,
          guardianPhone: guardianPhone?.trim() || null,
          guardianRelation: guardianRelation?.trim() || null,
          presentAddress: presentAddress?.trim() || null,
          permanentAddress: permanentAddress?.trim() || null,
        },
      });

      // 3. Update current enrollment if provided
      if (currentEnrollmentId && roll) {
        await tx.studentEnrollment.update({
          where: { id: Number(currentEnrollmentId) },
          data: {
            sessionId: sessionId ? Number(sessionId) : undefined,
            classId: classId ? Number(classId) : undefined,
            sectionId: sectionId ? Number(sectionId) : undefined,
            shiftId: shiftId ? Number(shiftId) : undefined,
            groupId: groupId ? Number(groupId) : null,
            roll: String(roll).trim(),
          },
        });
      }

      return student;
    });

    return NextResponse.json({
      success: true,
      message: 'Student profile updated successfully',
      student: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.student.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: 'Student deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

