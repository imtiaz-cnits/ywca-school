import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { order: 'asc' },
      include: {
        sections: true,
        _count: {
          select: { enrollments: true },
        },
      },
    });
    return NextResponse.json({ success: true, classes });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, numericValue, order } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: 'Class name is required.' }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        numericValue: numericValue ? Number(numericValue) : null,
        order: order ? Number(order) : 0,
      },
    });

    return NextResponse.json({ success: true, message: 'Class created successfully', class: newClass });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, numericValue, order } = body;

    if (!id || !name) {
      return NextResponse.json({ success: false, message: 'ID and Class name are required.' }, { status: 400 });
    }

    const updatedClass = await prisma.class.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
        numericValue: numericValue ? Number(numericValue) : null,
        order: order ? Number(order) : 0,
      },
    });

    return NextResponse.json({ success: true, message: 'Class updated successfully', class: updatedClass });
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

    await prisma.class.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: 'Class deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

