import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ success: true, students: [] });
    }

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { studentCode: { contains: query } },
          { admissionNo: { contains: query } },
          { nameEn: { contains: query } },
          { nameBn: { contains: query } },
          { guardian: { guardianPhone: { contains: query } } },
        ],
      },
      take: 10,
      include: {
        guardian: true,
        enrollments: {
          orderBy: { id: 'desc' },
          take: 1,
          include: {
            session: true,
            class: true,
            section: true,
            shift: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

