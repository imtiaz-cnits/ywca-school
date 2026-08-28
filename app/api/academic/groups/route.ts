import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, groups });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: 'Group name is required.' }, { status: 400 });
    }

    const group = await prisma.group.create({
      data: { name: name.trim() },
    });

    return NextResponse.json({ success: true, message: 'Group created successfully', group });
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

    await prisma.group.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: 'Group deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

