import axios from 'axios';
import prisma from './prisma';

// SMS Gateway Configurations (Configured via .env)
const SMS_PROVIDER = process.env.SMS_GATEWAY_PROVIDER || 'MIMSMS';

// MiMSMS API Config
const MIM_SMS_USERNAME = process.env.MIM_SMS_USERNAME || 'info@codenextit.com';
const MIM_SMS_API_KEY = process.env.MIM_SMS_API_KEY || '2TLHE115406U4ON';
const MIM_SMS_SENDER_NAME = process.env.MIM_SMS_SENDER_NAME || '';
const MIM_SMS_SEND_URL = 'https://api.mimsms.com/api/V2/SMS';
const MIM_SMS_BALANCE_URL = 'https://api.mimsms.com/api/V2/BalanceCheck';

// Greenweb API Config (Fallback)
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

  // Format and clean BD phone numbers to 8801XXXXXXXXX
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

  // PROVIDER 1: MiMSMS Gateway (Primary)
  if (SMS_PROVIDER === 'MIMSMS') {
    try {
      const results: any[] = [];
      for (const phone of cleanedNumbers) {
        const payload = {
          userName: MIM_SMS_USERNAME,
          apiKey: MIM_SMS_API_KEY,
          mobileNumber: phone,
          campaignId: 'null',
          senderName: MIM_SMS_SENDER_NAME,
          transactionType: 'T',
          message,
        };

        const response = await axios.post(MIM_SMS_SEND_URL, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 12000,
        });

        const respData = response.data;
        const isSuccess = response.status === 200 && (respData?.status === 'Success' || respData?.statusCode === 200 || respData?.status_code === 200);

        // Save to SmsLog
        await prisma.smsLog.create({
          data: {
            recipientPhone: phone,
            recipientName: recipientName || null,
            message,
            type,
            status: isSuccess ? 'SENT' : 'FAILED',
            responsePayload: typeof respData === 'string' ? respData : JSON.stringify(respData),
          },
        });

        results.push(respData);
      }

      return {
        success: true,
        message: 'SMS sent via MiMSMS successfully',
        provider: 'MiMSMS',
        data: results,
      };
    } catch (error: any) {
      const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;

      // Log failure
      for (const phone of cleanedNumbers) {
        try {
          await prisma.smsLog.create({
            data: {
              recipientPhone: phone,
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
      }

      return {
        success: false,
        message: error.message || 'Failed to send SMS via MiMSMS',
        error: errorMsg,
      };
    }
  }

  // PROVIDER 2: Greenweb SMS Gateway (Fallback)
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
      // ignore
    }

    return {
      success: false,
      message: error.message || 'Failed to send SMS',
      error: errorMsg,
    };
  }
}

export async function getSmsBalance(): Promise<{
  success: boolean;
  totalSent?: string;
  balance?: string;
  provider?: string;
  expiryDate?: string;
  error?: string;
}> {
  // Check MiMSMS Balance first if configured
  if (SMS_PROVIDER === 'MIMSMS' && MIM_SMS_USERNAME && MIM_SMS_API_KEY) {
    try {
      const url = `${MIM_SMS_BALANCE_URL}?userName=${encodeURIComponent(MIM_SMS_USERNAME)}&apiKey=${encodeURIComponent(MIM_SMS_API_KEY)}`;
      const res = await axios.get(url, { timeout: 8000 });

      if (res.data?.status === 'Success' && Array.isArray(res.data?.data) && res.data.data.length > 0) {
        const item = res.data.data[0];
        const rawBal = item.balance !== undefined ? String(item.balance) : '0';
        return {
          success: true,
          provider: 'MiMSMS',
          balance: Number(rawBal).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
          expiryDate: item.expair_Date || '',
          totalSent: 'Active',
        };
      }
    } catch (e: any) {
      // Fallback below
    }
  }

  // Fallback Greenweb check
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
      provider: 'Greenweb',
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
