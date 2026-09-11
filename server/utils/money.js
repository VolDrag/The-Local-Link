export const resolveServiceAmount = (service) => {
  if (!service) return 0;
  const type = service.pricingType || 'fixed';
  const map = {
    hourly: service.hourlyRate,
    weekly: service.weeklyRate,
    monthly: service.monthlyRate,
    project: service.projectRate,
    fixed: service.fixedRate,
  };
  const typed = map[type];
  if (typeof typed === 'number' && typed > 0) return typed;
  if (typeof service.pricing === 'number') return service.pricing;
  return 0;
};

export const commissionRate = () => {
  const n = parseFloat(process.env.COMMISSION_RATE || '0.10');
  return Number.isFinite(n) ? n : 0.10;
};

export const splitAmounts = (gross) => {
  const rate = commissionRate();
  const commissionAmount = Math.round(gross * rate * 100) / 100;
  const providerAmount = Math.round((gross - commissionAmount) * 100) / 100;
  return { commissionAmount, providerAmount, rate };
};

export const cancellationPolicy = () => ({
  freeHours: parseInt(process.env.CANCELLATION_FREE_HOURS || '24', 10),
  feePercent: parseFloat(process.env.CANCELLATION_FEE_PERCENT || '0.20'),
});

export const computeCancellationFee = (scheduledTime, amount) => {
  const { freeHours, feePercent } = cancellationPolicy();
  const msLeft = new Date(scheduledTime).getTime() - Date.now();
  const hoursLeft = msLeft / (1000 * 60 * 60);
  if (hoursLeft >= freeHours) {
    return { fee: 0, refund: amount, withinFreeWindow: true, hoursLeft };
  }
  const fee = Math.round(amount * feePercent * 100) / 100;
  return { fee, refund: Math.max(0, amount - fee), withinFreeWindow: false, hoursLeft };
};

export const defaultDuration = () =>
  parseInt(process.env.BOOKING_DEFAULT_DURATION_MINUTES || '60', 10);
