import fs from 'fs';
import path from 'path';
import { sendSms } from './sms';

export interface ScheduledBroadcast {
  id: string;
  title: string;
  message: string;
  recipientCount: number;
  recipientType: 'STUDENTS' | 'CUSTOM' | 'BOTH';
  recipients?: string[];
  encoding: 'Unicode' | 'GSM';
  segments: number;
  scheduledAt: string; // ISO date string
  status: 'PENDING' | 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'CANCELLED';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'scheduled_broadcasts.json');

// Ensure data directory and file exist with initial sample if empty
function ensureStorage(): ScheduledBroadcast[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      const initial: ScheduledBroadcast[] = [
        {
          id: 'a0ca880a-3031-43d7-9d91-9931f01e54d6',
          title: 'Notice Broadcast - Oct 22, 2026 10:55 PM',
          message: 'আগামী ২৪ অক্টোবর, ২০২৬ তারিখে স্কুলের পিকনিক অনুষ্ঠিত হবে। সকল শিক্ষার্থীকে সময়মতো উপস্থিত থাকার অনুরোধ করা হলো।',
          recipientCount: 2,
          recipientType: 'CUSTOM',
          recipients: ['01711223344', '01822334455'],
          encoding: 'Unicode',
          segments: 1,
          scheduledAt: '2026-10-22T22:55:00.000Z',
          status: 'COMPLETED',
          createdAt: '2026-10-22T22:50:00.000Z',
        },
      ];
      fs.writeFileSync(FILE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export function getAllSchedules(): ScheduledBroadcast[] {
  return ensureStorage().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createSchedule(item: Omit<ScheduledBroadcast, 'id' | 'createdAt'>): ScheduledBroadcast {
  const list = ensureStorage();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sc-${Date.now()}`;
  const newSchedule: ScheduledBroadcast = {
    ...item,
    id,
    createdAt: new Date().toISOString(),
  };
  list.unshift(newSchedule);
  fs.writeFileSync(FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');

  // If already due or due within 5 seconds, trigger immediate process
  if (new Date(newSchedule.scheduledAt).getTime() <= Date.now() + 5000) {
    processDueSchedules().catch(() => {});
  }

  return newSchedule;
}

export function updateSchedule(id: string, updates: Partial<ScheduledBroadcast>): boolean {
  const list = ensureStorage();
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  list[idx] = { ...list[idx], ...updates };
  fs.writeFileSync(FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');

  // If newly updated schedule is already due or due within 5 seconds, trigger immediate process
  if (updates.scheduledAt && new Date(updates.scheduledAt).getTime() <= Date.now() + 5000) {
    processDueSchedules().catch(() => {});
  }

  return true;
}

export function updateScheduleStatus(id: string, status: ScheduledBroadcast['status']): boolean {
  return updateSchedule(id, { status });
}

// Process all due pending schedules (where scheduledAt <= now)
let isProcessing = false;

export async function processDueSchedules(): Promise<{ processed: number; executed: ScheduledBroadcast[] }> {
  if (isProcessing) return { processed: 0, executed: [] };
  isProcessing = true;

  try {
    const list = ensureStorage();
    const now = Date.now();
    const dueItems = list.filter(
      (s) => s.status === 'PENDING' && new Date(s.scheduledAt).getTime() <= now
    );

    if (dueItems.length === 0) {
      return { processed: 0, executed: [] };
    }

    const executed: ScheduledBroadcast[] = [];

    for (const item of dueItems) {
      try {
        const recipients = item.recipients || [];
        if (recipients.length > 0) {
          const sendRes = await sendSms({
            numbers: recipients,
            message: item.message,
            type: 'NOTICE',
          });
          item.status = sendRes.success ? 'COMPLETED' : 'FAILED';
        } else {
          item.status = 'COMPLETED';
        }
        executed.push(item);
      } catch (err) {
        console.error('[SMS Scheduler] Execution error for schedule:', item.id, err);
        item.status = 'FAILED';
        executed.push(item);
      }
    }

    // Safely update file by re-reading to prevent overwriting new additions
    const freshList = ensureStorage();
    for (const exec of executed) {
      const idx = freshList.findIndex((s) => s.id === exec.id);
      if (idx !== -1) {
        freshList[idx].status = exec.status;
      }
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(freshList, null, 2), 'utf-8');
    return { processed: executed.length, executed };
  } catch (err) {
    console.error('[SMS Scheduler] Error in processDueSchedules:', err);
    return { processed: 0, executed: [] };
  } finally {
    isProcessing = false;
  }
}

// Global daemon to check due schedules periodically in background
declare global {
  var __smsScheduleInterval: NodeJS.Timeout | undefined;
}

export function initSchedulerDaemon() {
  if (typeof window !== 'undefined') return;
  if (global.__smsScheduleInterval) return;

  global.__smsScheduleInterval = setInterval(async () => {
    try {
      await processDueSchedules();
    } catch {
      // background loop error safely ignored
    }
  }, 10000); // Checks every 10 seconds
}

// Auto-start daemon on module load in Node environment
if (typeof window === 'undefined') {
  initSchedulerDaemon();
}
