const mockMode = () =>
  process.env.BKASH_MOCK === 'true' || !process.env.BKASH_APP_KEY;

let cachedToken = { id_token: null, expiresAt: 0 };

const bkashHeaders = (idToken) => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  authorization: idToken,
  'x-app-key': process.env.BKASH_APP_KEY,
});

export const grantToken = async () => {
  if (mockMode()) {
    return { id_token: 'mock-bkash-token', token_type: 'Bearer', expires_in: 3600 };
  }

  if (cachedToken.id_token && Date.now() < cachedToken.expiresAt - 30_000) {
    return { id_token: cachedToken.id_token };
  }

  const res = await fetch(`${process.env.BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: process.env.BKASH_USERNAME,
      password: process.env.BKASH_PASSWORD,
    },
    body: JSON.stringify({
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    }),
  });

  const data = await res.json();
  if (!data.id_token) {
    throw new Error(data.statusMessage || 'Failed to grant bKash token');
  }
  cachedToken = {
    id_token: data.id_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };
  return data;
};

export const createBkashPayment = async ({ amount, invoice, payerReference, callbackURL }) => {
  if (mockMode()) {
    const paymentID = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const client = process.env.CLIENT_URL || 'http://localhost:3000';
    return {
      paymentID,
      bkashURL: `${client}/payments/sandbox/${paymentID}`,
      statusCode: '0000',
      statusMessage: 'Successful',
      mock: true,
    };
  }

  const { id_token } = await grantToken();
  const res = await fetch(`${process.env.BKASH_BASE_URL}/tokenized/checkout/create`, {
    method: 'POST',
    headers: bkashHeaders(id_token),
    body: JSON.stringify({
      mode: '0011',
      payerReference: payerReference || ' ',
      callbackURL,
      amount: String(amount),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: invoice,
    }),
  });
  const data = await res.json();
  if (!data.paymentID) {
    throw new Error(data.statusMessage || 'Failed to create bKash payment');
  }
  return data;
};

export const executeBkashPayment = async (paymentID) => {
  if (mockMode() || String(paymentID).startsWith('mock_')) {
    return {
      paymentID,
      trxID: `TRX${Date.now()}`,
      transactionStatus: 'Completed',
      amount: null,
      currency: 'BDT',
      statusCode: '0000',
      mock: true,
    };
  }

  const { id_token } = await grantToken();
  const res = await fetch(`${process.env.BKASH_BASE_URL}/tokenized/checkout/execute`, {
    method: 'POST',
    headers: bkashHeaders(id_token),
    body: JSON.stringify({ paymentID }),
  });
  return res.json();
};

export const queryBkashPayment = async (paymentID) => {
  if (mockMode() || String(paymentID).startsWith('mock_')) {
    return { paymentID, transactionStatus: 'Completed', mock: true };
  }
  const { id_token } = await grantToken();
  const res = await fetch(`${process.env.BKASH_BASE_URL}/tokenized/checkout/payment/status`, {
    method: 'POST',
    headers: bkashHeaders(id_token),
    body: JSON.stringify({ paymentID }),
  });
  return res.json();
};

export const isBkashMock = mockMode;
