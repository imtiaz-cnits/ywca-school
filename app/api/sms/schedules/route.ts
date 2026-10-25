import { createSchedule, getAllSchedules, processDueSchedules, updateSchedule, updateScheduleStatus } from '@/lib/schedules';
import { sendSms } from '@/lib/sms';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Process any due pending broadcasts before returning list
    await processDueSchedules();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status')?.trim().toUpperCase();
    const search = searchParams.get('search')?.trim().toLowerCase();

    let list = getAllSchedules();

    // Summary counts for filter pills (Image 5)
    const summary = {
      all: list.length,
      pending: list.filter((s) => s.status === 'PENDING').length,
      completed: list.filter((s) => s.status === 'COMPLETED').length,
      partial: list.filter((s) => s.status === 'PARTIAL').length,
      failed: list.filter((s) => s.status === 'FAILED').length,
      cancelled: list.filter((s) => s.status === 'CANCELLED').length,
    };

    if (status && status !== 'ALL') {
      list = list.filter((s) => s.status === status);
    }

    if (search) {
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(search) ||
          s.message.toLowerCase().includes(search) ||
          s.id.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      summary,
      schedules: list,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      message,
      recipientCount,
      recipientType,
      recipients,
      encoding,
      segments,
      scheduledAt,
      status = 'PENDING',
    } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, message: 'Message is required' }, { status: 400 });
    }

    const newSchedule = createSchedule({
      title: title || `Notice Broadcast - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      message: message.trim(),
      recipientCount: Number(recipientCount) || (recipients ? recipients.length : 0),
      recipientType: recipientType || 'STUDENTS',
      recipients: recipients || [],
      encoding: encoding || 'Unicode',
      segments: Number(segments) || 1,
      scheduledAt: scheduledAt || new Date().toISOString(),
      status: status || 'PENDING',
    });

    return NextResponse.json({
      success: true,
      message: 'Broadcast scheduled successfully',
      schedule: newSchedule,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, action, scheduledAt } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    if (action === 'RESCHEDULE' || (scheduledAt && !status && !action)) {
      if (!scheduledAt) {
        return NextResponse.json({ success: false, message: 'New scheduledAt timestamp is required' }, { status: 400 });
      }
      const schedule = getAllSchedules().find((s) => s.id === id);
      if (!schedule) {
        return NextResponse.json({ success: false, message: 'Schedule not found' }, { status: 404 });
      }
      if (schedule.status !== 'PENDING') {
        return NextResponse.json(
          { success: false, message: `Only PENDING schedules can be rescheduled (current status: ${schedule.status})` },
          { status: 400 }
        );
      }
      updateSchedule(id, { scheduledAt });
      return NextResponse.json({
        success: true,
        message: `Schedule successfully updated to ${new Date(scheduledAt).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })} (Dhaka Time)`,
      });
    }

    if (action === 'SEND_NOW') {
      const schedule = getAllSchedules().find((s) => s.id === id);
      if (!schedule) {
        return NextResponse.json({ success: false, message: 'Schedule not found' }, { status: 404 });
      }
      const recipients = schedule.recipients || [];
      if (recipients.length > 0) {
        const sendRes = await sendSms({
          numbers: recipients,
          message: schedule.message,
          type: 'NOTICE',
        });
        updateScheduleStatus(id, sendRes.success ? 'COMPLETED' : 'FAILED');
        return NextResponse.json({
          success: true,
          message: sendRes.success ? 'Broadcast dispatched immediately!' : 'Broadcast dispatch failed',
          details: sendRes,
        });
      } else {
        updateScheduleStatus(id, 'COMPLETED');
        return NextResponse.json({ success: true, message: 'Broadcast marked completed' });
      }
    }

    if (action === 'CANCEL' || status === 'CANCELLED') {
      const schedule = getAllSchedules().find((s) => s.id === id);
      if (!schedule) {
        return NextResponse.json({ success: false, message: 'Schedule not found' }, { status: 404 });
      }
      if (schedule.status !== 'PENDING') {
        return NextResponse.json(
          { success: false, message: `Only PENDING schedules can be cancelled (current status: ${schedule.status})` },
          { status: 400 }
        );
      }
      updateScheduleStatus(id, 'CANCELLED');
      return NextResponse.json({
        success: true,
        message: 'Scheduled broadcast cancelled successfully. Zero SMS deducted.',
      });
    }

    if (!status) {
      return NextResponse.json({ success: false, message: 'Status or action required' }, { status: 400 });
    }

    const updated = updateScheduleStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Schedule not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Schedule updated to ${status}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
