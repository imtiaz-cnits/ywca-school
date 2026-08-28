import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { name: 'desc' },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });
    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, isCurrent } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: 'Session name is required.' }, { status: 400 });
    }

    if (isCurrent) {
      await prisma.session.updateMany({
        data: { isCurrent: false },
      });
    }

    const session = await prisma.session.create({
      data: {
        name: name.trim(),
        isCurrent: Boolean(isCurrent),
      },
    });

    return NextResponse.json({ success: true, message: 'Session created successfully', session });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, isCurrent } = body;

    if (!id || !name) {
      return NextResponse.json({ success: false, message: 'ID and Name are required.' }, { status: 400 });
    }

    if (isCurrent) {
      await prisma.session.updateMany({
        where: { id: { not: Number(id) } },
        data: { isCurrent: false },
      });
    }

    const session = await prisma.session.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
        isCurrent: Boolean(isCurrent),
      },
    });

    return NextResponse.json({ success: true, message: 'Session updated successfully', session });
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

    await prisma.session.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: 'Session deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

