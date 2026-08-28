import axios from 'axios';
import prisma from './prisma';

const GREENWEB_API_KEY = process.env.GREENWEB_SMS_API_KEY || '111011917361717593456b895ee80a4411b796ccf667c2296edd8';
const GREENWEB_SENDER_ID = process.env.GREENWEB_SMS_SENDER_ID || '8801894734773';
const GREENWEB_BASE_URL = process.env.GREENWEB_SMS_BASE_URL || 'http://api.greenweb.com.bd/api.php?json';

export interface SendSmsParams {
  numbers: string[];
  message: string;
  type?: 'ATTENDANCE_ENTRY' | 'ATTENDANCE_EXIT' | 'ATTENDANCE_ABSENT' | 'ATTENDANCE_LATE' | 'NOTICE' | 'BULK' | 'SYSTEM';
  recipientName?: string;
}

export async function sendSms({ numbers, message, type = 'NOTICE', recipientName }: SendSmsParams) {
  if (!numbers || numbers.length === 0) {
    return { success: false, message: 'No phone numbers provided.' };
  }

  // Format and clean BD phone numbers
  const cleanedNumbers = numbers
    .map((num) => {
      let n = num.trim().replace(/[^0-9+]/g, '');
      if (n.startsWith('+88')) n = n.slice(3);
      if (n.startsWith('88')) n = n.slice(2);
      if (n.startsWith('01') && n.length === 11) return '88' + n;
      return n;
    })
    .filter((num) => num.length === 13 && num.startsWith('8801'));

  if (cleanedNumbers.length === 0) {
    return { success: false, message: 'No valid Bangladeshi phone numbers provided.' };
  }

  try {
    const params = new URLSearchParams();
    params.append('token', GREENWEB_API_KEY);
    params.append('to', cleanedNumbers.join(','));
    params.append('message', message);
    if (GREENWEB_SENDER_ID) {
      params.append('from', GREENWEB_SENDER_ID);
    }

    const response = await axios.post(GREENWEB_BASE_URL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 15000,
    });

    const responseData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

    // Save to SmsLog
    await prisma.smsLog.create({
      data: {
        recipientPhone: cleanedNumbers.join(','),
        recipientName: recipientName || null,
        message,
        type,
        status: response.status === 200 ? 'SENT' : 'FAILED',
        responsePayload: responseData,
      },
    });

    return {
      success: true,
      message: 'SMS sent successfully',
      data: response.data,
    };
  } catch (error: any) {
    const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;

    // Log failure
    try {
      await prisma.smsLog.create({
        data: {
          recipientPhone: cleanedNumbers.join(','),
          recipientName: recipientName || null,
          message,
          type,
          status: 'FAILED',
          responsePayload: errorMsg,
        },
      });
    } catch {
      // ignore log error
    }

    return {
      success: false,
      message: error.message || 'Failed to send SMS',
      error: errorMsg,
    };
  }
}

export async function getSmsBalance(): Promise<{ success: boolean; totalSent?: string; balance?: string; error?: string }> {
  try {
    const totalUrl = `http://api.greenweb.com.bd/g_api.php?token=${GREENWEB_API_KEY}&totalsms=true`;
    const balanceUrl = `http://api.greenweb.com.bd/g_api.php?token=${GREENWEB_API_KEY}&balance=true`;

    const [totalRes, balanceRes] = await Promise.allSettled([
      axios.get(totalUrl, { timeout: 8000 }),
      axios.get(balanceUrl, { timeout: 8000 }),
    ]);

    const totalSent = totalRes.status === 'fulfilled' ? String(totalRes.value.data).replace(/<[^>]*>?/gm, '').trim() : 'N/A';
    const balance = balanceRes.status === 'fulfilled' ? String(balanceRes.value.data).replace(/<[^>]*>?/gm, '').trim() : 'N/A';

    return {
      success: true,
      totalSent,
      balance,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

