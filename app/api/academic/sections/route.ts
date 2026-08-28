import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    const where: any = {};
    if (classId) {
      where.classId = Number(classId);
    }

    const sections = await prisma.section.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        class: {
          select: { id: true, name: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });
    return NextResponse.json({ success: true, sections });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, classId, capacity } = body;

    if (!name || !classId) {
      return NextResponse.json({ success: false, message: 'Section name and Class are required.' }, { status: 400 });
    }

    const section = await prisma.section.create({
      data: {
        name: name.trim(),
        classId: Number(classId),
        capacity: capacity ? Number(capacity) : 40,
      },
      include: {
        class: true,
      },
    });

    return NextResponse.json({ success: true, message: 'Section created successfully', section });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, classId, capacity } = body;

    if (!id || !name || !classId) {
      return NextResponse.json({ success: false, message: 'ID, Section name, and Class are required.' }, { status: 400 });
    }

    const section = await prisma.section.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
        classId: Number(classId),
        capacity: capacity ? Number(capacity) : 40,
      },
      include: {
        class: true,
      },
    });

    return NextResponse.json({ success: true, message: 'Section updated successfully', section });
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

    await prisma.section.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: 'Section deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

