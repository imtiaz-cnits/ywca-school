import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id: Number(id) },
      include: {
        attendances: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, employee });
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
      name,
      designation,
      phone,
      email,
      gender,
      nid,
      bloodGroup,
      religion,
      presentAddress,
      permanentAddress,
      photo,
      biometricId,
      smsEnabled,
      status,
    } = body;

    const employee = await prisma.employee.update({
      where: { id: Number(id) },
      data: {
        name: name ? name.trim() : undefined,
        designation: designation ? designation.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        email: email !== undefined ? email?.trim() : undefined,
        gender: gender || undefined,
        nid: nid !== undefined ? nid?.trim() : undefined,
        bloodGroup: bloodGroup !== undefined ? bloodGroup : undefined,
        religion: religion !== undefined ? religion : undefined,
        presentAddress: presentAddress !== undefined ? presentAddress?.trim() : undefined,
        permanentAddress: permanentAddress !== undefined ? permanentAddress?.trim() : undefined,
        photo: photo !== undefined ? photo : undefined,
        biometricId: biometricId !== undefined ? (biometricId ? biometricId.trim() : null) : undefined,
        smsEnabled: smsEnabled !== undefined ? Boolean(smsEnabled) : undefined,
        status: status || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Employee profile updated successfully',
      employee,
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
    await prisma.employee.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

