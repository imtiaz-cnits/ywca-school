import axios from 'axios';
import prisma from './prisma';

// SMS Gateway Configurations (Configured via .env)
const SMS_GATEWAY_USERNAME = process.env.MIM_SMS_USERNAME || 'info@codenextit.com';
const SMS_GATEWAY_API_KEY = process.env.MIM_SMS_API_KEY || '2TLHE115406U4ON';
const SMS_DEFAULT_SENDER_NAME = process.env.MIM_SMS_SENDER_NAME || '8809601004913';
const SMS_GATEWAY_SEND_URL = 'https://api.mimsms.com/api/V2/SMS';
const SMS_GATEWAY_BALANCE_URL = 'https://api.mimsms.com/api/V2/BalanceCheck';

export interface SendSmsParams {
  numbers: string[];
  message: string;
  type?: 'ATTENDANCE_ENTRY' | 'ATTENDANCE_EXIT' | 'ATTENDANCE_ABSENT' | 'ATTENDANCE_LATE' | 'NOTICE' | 'BULK' | 'SYSTEM';
  recipientName?: string;
}

export function normalizePhoneNumber(num: string): string {
  if (!num) return '';
  let n = num.trim().replace(/[^0-9+]/g, '');
  if (n.startsWith('+88')) n = n.slice(3);
  if (n.startsWith('88')) n = n.slice(2);
  if (n.startsWith('01') && n.length === 11) return '88' + n;
  return n;
}

export async function sendSms({ numbers, message, type = 'NOTICE', recipientName }: SendSmsParams) {
  if (!numbers || numbers.length === 0) {
    return { success: false, message: 'No phone numbers provided.' };
  }

  // Format and clean BD phone numbers to 8801XXXXXXXXX
  const cleanedNumbers = numbers
    .map(normalizePhoneNumber)
    .filter((num) => num.length === 13 && num.startsWith('8801'));

  if (cleanedNumbers.length === 0) {
    return { success: false, message: 'No valid Bangladeshi phone numbers provided.' };
  }

  // ---------------------------------------------------------------------------
  // OPERATION MODES: 'mock' (0-cost simulation) | 'test' (only to SMS_TEST_NUMBER) | 'live'
  // ---------------------------------------------------------------------------
  const rawMode = (process.env.SMS_MODE || process.env.SMS_TEST_MODE || 'live').toLowerCase().trim();
  const isMock = rawMode === 'mock';
  const isTest = rawMode === 'test' || rawMode === 'true';
  const testPhone = normalizePhoneNumber(process.env.SMS_TEST_NUMBER || '01326530330');

  // MODE 1: MOCK MODE (Zero-cost simulation, 0 balance deducted, 0 gateway calls)
  if (isMock) {
    for (const phone of cleanedNumbers) {
      await prisma.smsLog.create({
        data: {
          recipientPhone: phone,
          recipientName: recipientName || null,
          message,
          type,
          status: 'SENT',
          responsePayload: JSON.stringify({
            mode: 'MOCK',
            simulated: true,
            totalRecipients: cleanedNumbers.length,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    }

    return {
      success: true,
      message: `[MOCK MODE] Broadcast simulated successfully for ${cleanedNumbers.length} recipient(s). Zero balance deducted.`,
      provider: 'SIMULATOR',
      data: [{ mode: 'MOCK', simulated: true, count: cleanedNumbers.length }],
    };
  }

  // MODE 2: TEST MODE (Redirects broadcast exclusively to SMS_TEST_NUMBER)
  let targetNumbers = cleanedNumbers;
  let targetMessage = message;

  if (isTest) {
    if (!testPhone || testPhone.length !== 13) {
      return {
        success: false,
        message: 'Invalid SMS_TEST_NUMBER in .env. Please configure a valid BD number (e.g. 01326530330).',
      };
    }

    targetNumbers = [testPhone];
    targetMessage = `[TEST MODE - Total: ${cleanedNumbers.length} recipients] ${message}`;

    // Safely record intercepted recipients in logs
    for (const phone of cleanedNumbers) {
      if (phone !== testPhone) {
        await prisma.smsLog.create({
          data: {
            recipientPhone: phone,
            recipientName: recipientName || null,
            message,
            type,
            status: 'SENT',
            responsePayload: JSON.stringify({
              mode: 'TEST_REDIRECT',
              redirectedTo: testPhone,
              note: 'Safely intercepted in TEST MODE to protect students & balance.',
            }),
          },
        });
      }
    }
  }

  // DISPATCH VIA SMS GATEWAY
  const senderName = (process.env.MIM_SMS_SENDER_NAME || SMS_DEFAULT_SENDER_NAME || '8809601004913').trim();
  const userName = (process.env.MIM_SMS_USERNAME || SMS_GATEWAY_USERNAME || '').trim();
  const apiKey = (process.env.MIM_SMS_API_KEY || SMS_GATEWAY_API_KEY || '').trim();

  if (!senderName) {
    const missingSenderMsg = 'SMS Sender ID is required. Please set MIM_SMS_SENDER_NAME in .env.';
    for (const phone of targetNumbers) {
      try {
        await prisma.smsLog.create({
          data: {
            recipientPhone: phone,
            recipientName: recipientName || null,
            message: targetMessage,
            type,
            status: 'FAILED',
            responsePayload: JSON.stringify({ error: missingSenderMsg }),
          },
        });
      } catch {
        // ignore
      }
    }
    return {
      success: false,
      message: missingSenderMsg,
      error: 'Sender ID is empty',
    };
  }

  try {
    const results: any[] = [];
    let successCount = 0;
    let failedCount = 0;
    let lastErrorMessage = '';

    for (const phone of targetNumbers) {
      try {
        const payload = {
          userName,
          apiKey,
          mobileNumber: phone,
          campaignId: 'null',
          senderName,
          transactionType: 'T',
          message: targetMessage,
        };

        const response = await axios.post(SMS_GATEWAY_SEND_URL, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 12000,
        });

        const respData = response.data;
        const isSuccess =
          response.status === 200 &&
          (respData?.status === 'Success' ||
            respData?.statusCode === 200 ||
            respData?.statusCode === '200' ||
            respData?.status_code === 200);

        if (isSuccess) {
          successCount++;
        } else {
          failedCount++;
          lastErrorMessage =
            respData?.responseResult ||
            respData?.message ||
            respData?.error_Data?.[0]?.error ||
            `Gateway Error (${respData?.statusCode || 'Failed'})`;
        }

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
      } catch (singleErr: any) {
        failedCount++;
        const singleErrMsg =
          singleErr.response?.data?.errors?.SenderName?.[0] ||
          singleErr.response?.data?.title ||
          singleErr.response?.data?.message ||
          singleErr.message ||
          'Failed to dispatch SMS';
        lastErrorMessage = singleErrMsg;

        const errorPayload = singleErr.response?.data
          ? JSON.stringify(singleErr.response.data)
          : singleErr.message;

        await prisma.smsLog.create({
          data: {
            recipientPhone: phone,
            recipientName: recipientName || null,
            message,
            type,
            status: 'FAILED',
            responsePayload: errorPayload,
          },
        });

        results.push({ phone, error: singleErrMsg });
      }
    }

    if (successCount === 0 && failedCount > 0) {
      return {
        success: false,
        message: `SMS Dispatch Failed: ${lastErrorMessage}`,
        provider: 'SMS',
        data: results,
      };
    }

    return {
      success: true,
      message:
        failedCount > 0
          ? `SMS sent to ${successCount} numbers, ${failedCount} failed (${lastErrorMessage})`
          : `SMS sent successfully to ${successCount} recipient(s).`,
      provider: 'SMS',
      data: results,
    };
  } catch (error: any) {
    const errorMsg =
      error.response?.data?.errors?.SenderName?.[0] ||
      error.response?.data?.title ||
      (error.response?.data ? JSON.stringify(error.response.data) : error.message);

    return {
      success: false,
      message: `Failed to send SMS: ${errorMsg}`,
      error: errorMsg,
    };
  }
}

export async function getSmsBalance(): Promise<{
  success: boolean;
  totalSent?: string;
  balance?: string;
  rawTaka?: number;
  takaFormatted?: string;
  smsCount?: string;
  smsCountNumber?: number;
  provider?: string;
  expiryDate?: string;
  mode?: string;
  testNumber?: string;
  error?: string;
}> {
  const currentMode = (process.env.SMS_MODE || process.env.SMS_TEST_MODE || 'live').toLowerCase().trim();
  const currentTestNumber = process.env.SMS_TEST_NUMBER || '01326530330';

  const userName = (process.env.MIM_SMS_USERNAME || SMS_GATEWAY_USERNAME || '').trim();
  const apiKey = (process.env.MIM_SMS_API_KEY || SMS_GATEWAY_API_KEY || '').trim();

  if (userName && apiKey) {
    try {
      const url = `${SMS_GATEWAY_BALANCE_URL}?userName=${encodeURIComponent(userName)}&apiKey=${encodeURIComponent(apiKey)}`;
      const res = await axios.get(url, { timeout: 8000 });

      if (res.data?.status === 'Success' && Array.isArray(res.data?.data) && res.data.data.length > 0) {
        const item = res.data.data[0];
        const rawBal = item.balance !== undefined ? String(item.balance) : '0';
        const rawTaka = parseFloat(rawBal) || 0;
        // 0.33 Taka per SMS calculation: 1076.3 / 0.33 = ~3,261 SMS
        const smsCount = rawTaka > 0 ? Math.floor(rawTaka / 0.33) : 0;

        return {
          success: true,
          provider: 'SMS',
          rawTaka,
          takaFormatted: rawTaka.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
          smsCount: smsCount.toLocaleString('en-US'),
          smsCountNumber: smsCount,
          balance: smsCount.toLocaleString('en-US'),
          expiryDate: item.expair_Date || '',
          totalSent: 'Active',
          mode: currentMode,
          testNumber: currentTestNumber,
        };
      }
    } catch (e: any) {
      return {
        success: false,
        error: e.message,
        mode: currentMode,
        testNumber: currentTestNumber,
      };
    }
  }

  return {
    success: false,
    error: 'SMS Gateway credentials not configured',
    mode: currentMode,
    testNumber: currentTestNumber,
  };
}
