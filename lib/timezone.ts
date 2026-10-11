/**
 * YWCA School Management System - Timezone & Attendance Logic (Asia/Dhaka)
 * 
 * Guarantees that all attendance dates, shift lateness evaluations,
 * and SMS notifications operate strictly in Bangladesh Standard Time (UTC+6),
 * completely independent of the server operating system's local timezone.
 */

export const DHAKA_TIMEZONE = 'Asia/Dhaka';

export interface DhakaAttendanceInfo {
  dateOnlyStr: string;      // e.g. "2026-10-12" (Calendar date in Bangladesh)
  startOfDay: Date;         // Date object representing "YYYY-MM-DD 00:00:00.000Z"
  dhakaHour: number;        // Hour in Dhaka (0-23)
  dhakaMinute: number;      // Minute in Dhaka (0-59)
  dhakaSecond: number;      // Second in Dhaka (0-59)
  formattedTime12h: string; // e.g. "08:30 AM", "02:15 PM" in Bangladesh
}

/**
 * Normalizes punch timestamp strings or Date objects.
 * If a naive timestamp string without timezone offset is provided (e.g. "2026-10-12T08:30:00"),
 * it is treated as local Bangladesh wall-clock time (+06:00).
 */
export function normalizePunchTimestamp(input: Date | string): Date {
  if (input instanceof Date) {
    if (isNaN(input.getTime())) {
      throw new Error(`Invalid Date instance provided: ${input}`);
    }
    return input;
  }

  if (typeof input !== 'string' || !input.trim()) {
    throw new Error(`Invalid timestamp input provided: ${input}`);
  }

  const trimmed = input.trim();
  // Check if string has explicit timezone offset or Z suffix
  const hasTimezone = /[Zz]$|[+-]\d{2}:?\d{2}$/.test(trimmed);

  if (hasTimezone) {
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) {
      throw new Error(`Invalid ISO timestamp: ${input}`);
    }
    return d;
  }

  // Naive local timestamp string from device / bridge: interpret as Asia/Dhaka (+06:00)
  const normalizedIso = trimmed.includes('T') ? `${trimmed}+06:00` : `${trimmed.replace(' ', 'T')}+06:00`;
  const d = new Date(normalizedIso);
  if (isNaN(d.getTime())) {
    throw new Error(`Failed to parse naive timestamp as Asia/Dhaka: ${input}`);
  }
  return d;
}

/**
 * Extracts exact calendar date and clock time in Asia/Dhaka
 * @param input Date object or ISO timestamp string
 */
export function getDhakaAttendanceInfo(input: Date | string): DhakaAttendanceInfo {
  const dateObj = normalizePunchTimestamp(input);

  // Format date parts in Asia/Dhaka using standard Intl API
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: DHAKA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = dtf.formatToParts(dateObj);
  let year = '';
  let month = '';
  let day = '';
  let hour = '';
  let minute = '';
  let second = '';

  for (const p of parts) {
    if (p.type === 'year') year = p.value;
    else if (p.type === 'month') month = p.value;
    else if (p.type === 'day') day = p.value;
    else if (p.type === 'hour') hour = p.value;
    else if (p.type === 'minute') minute = p.value;
    else if (p.type === 'second') second = p.value;
  }

  // Enforce zero-padded ISO date in Dhaka
  const dateOnlyStr = `${year}-${month}-${day}`;
  const startOfDay = new Date(`${dateOnlyStr}T00:00:00.000Z`);

  const dhakaHour = parseInt(hour, 10);
  const dhakaMinute = parseInt(minute, 10);
  const dhakaSecond = parseInt(second, 10);

  // Deterministic 12-hour format: "hh:mm AM/PM"
  const period = dhakaHour >= 12 ? 'PM' : 'AM';
  const hour12 = dhakaHour % 12 || 12;
  const padHour = String(hour12).padStart(2, '0');
  const padMin = String(dhakaMinute).padStart(2, '0');
  const formattedTime12h = `${padHour}:${padMin} ${period}`;

  return {
    dateOnlyStr,
    startOfDay,
    dhakaHour,
    dhakaMinute,
    dhakaSecond,
    formattedTime12h,
  };
}

/**
 * Formats a Date or timestamp string to 12h format in Asia/Dhaka.
 * Returns '-' if null or invalid.
 */
export function formatDhakaTime12h(dateInput?: Date | string | null): string {
  if (!dateInput) return '-';
  try {
    const info = getDhakaAttendanceInfo(dateInput);
    return info.formattedTime12h;
  } catch {
    return '-';
  }
}

/**
 * Parses Shift start time string (e.g. "08:00 AM", "08:30 AM", "08:00")
 * Default cutoff is 08:30 AM if no shift is configured.
 */
export function parseShiftCutoff(startTimeStr?: string | null): { cutoffHour: number; cutoffMinute: number } {
  if (!startTimeStr || typeof startTimeStr !== 'string') {
    return { cutoffHour: 8, cutoffMinute: 30 }; // Default 8:30 AM
  }

  const trimmed = startTimeStr.trim().toUpperCase();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);
  if (!match) {
    return { cutoffHour: 8, cutoffMinute: 30 };
  }

  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const mer = match[3];

  if (mer === 'PM' && h < 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;

  return { cutoffHour: h, cutoffMinute: m };
}

/**
 * Evaluates whether punch is PRESENT or LATE in Asia/Dhaka
 * Rules:
 *  - On or before cutoff (e.g. <= 08:30) => PRESENT
 *  - After cutoff (e.g. >= 08:31) => LATE
 */
export function evaluateLateness(
  dhakaHour: number,
  dhakaMinute: number,
  cutoffHour = 8,
  cutoffMinute = 30
): 'PRESENT' | 'LATE' {
  if (dhakaHour > cutoffHour) {
    return 'LATE';
  }
  if (dhakaHour === cutoffHour && dhakaMinute > cutoffMinute) {
    return 'LATE';
  }
  return 'PRESENT';
}

/**
 * Known test / setup IDs that must never be mapped to active staff
 */
export const KNOWN_TEST_DEVICE_IDS = new Set(['2']);

export function isKnownTestId(deviceUserId: string | number): boolean {
  return KNOWN_TEST_DEVICE_IDS.has(String(deviceUserId).trim());
}

