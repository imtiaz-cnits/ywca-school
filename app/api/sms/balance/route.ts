import { getSmsBalance } from '@/lib/sms';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await getSmsBalance();
  return NextResponse.json(result);
}

