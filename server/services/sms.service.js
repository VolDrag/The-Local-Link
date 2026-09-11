const mockMode = () => process.env.SMS_MOCK !== 'false';

export const sendSms = async ({ to, message }) => {
  if (!to || !message) return { sent: false, reason: 'missing_to_or_message' };

  if (mockMode() || !process.env.SMS_API_URL) {
    console.log(`[SMS MOCK] to=${to} :: ${message}`);
    return { sent: true, mock: true, to, message };
  }

  try {
    const res = await fetch(process.env.SMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SMS_API_TOKEN || ''}`,
      },
      body: JSON.stringify({
        api_token: process.env.SMS_API_TOKEN,
        sid: process.env.SMS_SID,
        msisdn: to.replace('+', ''),
        sms: message,
        csms_id: `tll_${Date.now()}`,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return { sent: res.ok, data };
  } catch (error) {
    console.error('SMS send failed:', error.message);
    return { sent: false, error: error.message };
  }
};

export const smsTemplates = {
  bookingConfirmed: (serviceTitle, when) =>
    `The Local Link: Your booking for "${serviceTitle}" is confirmed for ${when}. Pay to hold the slot.`,
  providerEnRoute: (serviceTitle) =>
    `The Local Link: Your provider for "${serviceTitle}" is on the way.`,
  bookingCancelled: (serviceTitle) =>
    `The Local Link: Booking for "${serviceTitle}" was cancelled. Check the app for refund details.`,
};
