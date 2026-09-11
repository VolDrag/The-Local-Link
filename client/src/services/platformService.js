import api from './api';

export const paymentService = {
  start: async (bookingId) => {
    const { data } = await api.post(`/payments/bookings/${bookingId}`);
    return data;
  },
  execute: async (paymentID) => {
    const { data } = await api.post('/payments/execute', { paymentID });
    return data;
  },
  get: async (id) => {
    const { data } = await api.get(`/payments/${id}`);
    return data;
  },
};

export const identityService = {
  me: async () => {
    const { data } = await api.get('/identity');
    return data;
  },
  submit: async (file, documentType) => {
    const form = new FormData();
    form.append('document', file);
    form.append('documentType', documentType);
    const { data } = await api.post('/identity', form);
    return data;
  },
};

export const payoutService = {
  mine: async () => {
    const { data } = await api.get('/payouts');
    return data;
  },
  request: async (payload) => {
    const { data } = await api.post('/payouts/request', payload);
    return data;
  },
};

export const disputeService = {
  mine: async () => {
    const { data } = await api.get('/disputes');
    return data;
  },
  create: async ({ bookingId, reason, details, files = [] }) => {
    const form = new FormData();
    form.append('bookingId', bookingId);
    form.append('reason', reason);
    form.append('details', details);
    files.forEach((f) => form.append('evidence', f));
    const { data } = await api.post('/disputes', form);
    return data;
  },
};

export const featureService = {
  purchase: async (serviceId, days = 7) => {
    const { data } = await api.post(`/services/${serviceId}/feature`, { days });
    return data;
  },
};
