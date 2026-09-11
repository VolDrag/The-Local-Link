import { resolveServiceAmount, splitAmounts, computeCancellationFee } from '../utils/money.js';
import { windowsOverlap } from '../utils/slots.js';
import { registerSchema, loginSchema } from '../validators/authValidators.js';
import { createBookingSchema } from '../validators/bookingValidators.js';
import { createBkashPayment, executeBkashPayment } from '../services/bkash.service.js';

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
  console.log('ok', msg);
};

process.env.BKASH_MOCK = 'true';
process.env.COMMISSION_RATE = '0.10';
process.env.CANCELLATION_FREE_HOURS = '24';
process.env.CANCELLATION_FEE_PERCENT = '0.20';

const money = splitAmounts(1000);
assert(money.commissionAmount === 100, '10% commission on 1000 is 100');
assert(money.providerAmount === 900, 'provider net is 900');
assert(resolveServiceAmount({ pricing: 250 }) === 250, 'falls back to pricing');
assert(resolveServiceAmount({ pricingType: 'hourly', hourlyRate: 80, pricing: 1 }) === 80, 'hourly rate wins');

const far = computeCancellationFee(new Date(Date.now() + 48 * 3600 * 1000), 1000);
assert(far.withinFreeWindow === true && far.fee === 0 && far.refund === 1000, 'free cancel >24h');
const near = computeCancellationFee(new Date(Date.now() + 2 * 3600 * 1000), 1000);
assert(near.withinFreeWindow === false && near.fee === 200 && near.refund === 800, '20% fee inside 24h');

assert(windowsOverlap(new Date('2026-01-01T10:00:00Z'), 60, new Date('2026-01-01T10:30:00Z'), 60) === true, 'overlapping slots');
assert(windowsOverlap(new Date('2026-01-01T10:00:00Z'), 60, new Date('2026-01-01T11:00:00Z'), 60) === false, 'adjacent slots ok');

const badLogin = loginSchema.safeParse({ body: { email: 'nope', password: '' } });
assert(badLogin.success === false, 'login schema rejects bad email');
const goodLogin = loginSchema.safeParse({ body: { email: 'a@b.com', password: 'x' } });
assert(goodLogin.success === true, 'login schema accepts valid body');

const badReg = registerSchema.safeParse({
  body: { username: 'ab', email: 'x', password: 'short', firstName: 'A', phone: '123', location: 'Dhaka', role: 'seeker' },
});
assert(badReg.success === false, 'register schema rejects weak payload');

const booking = createBookingSchema.safeParse({
  body: { serviceId: 'abc', scheduledDate: '2026-01-01T10:00:00Z', recurrence: 'weekly' },
});
assert(booking.success === true, 'booking schema accepts recurrence');

const created = await createBkashPayment({ amount: 500, invoice: 'TLL-1', payerReference: 'seeker', callbackURL: 'http://localhost' });
assert(String(created.paymentID).startsWith('mock_'), 'bkash mock creates paymentID');
assert(created.bkashURL.includes('/payments/sandbox/'), 'bkash mock returns sandbox URL');
const executed = await executeBkashPayment(created.paymentID);
assert(executed.mock === true && executed.transactionStatus === 'Completed', 'bkash mock execute completes');

console.log('\nAll offline checks passed.');
