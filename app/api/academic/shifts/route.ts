import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const shifts = await prisma.shift.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });
    return NextResponse.json({ success: true, shifts });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, startTime, endTime } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: 'Shift name is required.' }, { status: 400 });
    }

    const shift = await prisma.shift.create({
      data: {
        name: name.trim(),
        startTime: startTime?.trim() || null,
        endTime: endTime?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, message: 'Shift created successfully', shift });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, startTime, endTime } = body;

    if (!id || !name) {
      return NextResponse.json({ success: false, message: 'ID and Shift name are required.' }, { status: 400 });
    }

    const shift = await prisma.shift.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
        startTime: startTime?.trim() || null,
        endTime: endTime?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, message: 'Shift updated successfully', shift });
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

    await prisma.shift.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: 'Shift deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

