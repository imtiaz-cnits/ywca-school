import prisma from '@/lib/prisma';
import { generateEmployeeCode } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'TEACHER' | 'STAFF' | null;
    const search = searchParams.get('search');

    const where: any = {};
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { designation: { contains: search } },
        { employeeCode: { contains: search } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({ success: true, employees });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      designation,
      type,
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

    if (!name || !designation || !phone) {
      return NextResponse.json(
        { success: false, message: 'Name, Designation, and Phone are required.' },
        { status: 400 }
      );
    }

    const empType = type === 'STAFF' ? 'STAFF' : 'TEACHER';
    const prefix = empType === 'TEACHER' ? 'TCH' : 'STF';
    const count = await prisma.employee.count({ where: { type: empType } });
    const employeeCode = generateEmployeeCode(prefix, count + 1);

    const employee = await prisma.employee.create({
      data: {
        employeeCode,
        name: name.trim(),
        designation: designation.trim(),
        type: empType,
        phone: phone.trim(),
        email: email?.trim() || null,
        gender: gender || 'MALE',
        nid: nid?.trim() || null,
        bloodGroup: bloodGroup || null,
        religion: religion || null,
        presentAddress: presentAddress?.trim() || null,
        permanentAddress: permanentAddress?.trim() || null,
        photo: photo || null,
        biometricId: biometricId?.trim() || null,
        smsEnabled: smsEnabled !== undefined ? Boolean(smsEnabled) : true,
        status: status || 'active',
      },
    });

    return NextResponse.json({
      success: true,
      message: `${empType === 'TEACHER' ? 'Teacher' : 'Staff'} added successfully`,
      employee,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Employee Code or Biometric ID already exists.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

