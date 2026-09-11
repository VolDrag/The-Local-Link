# What was implemented

This document explains the work done from `upddate.md`: Modules E → A → B → C → D → F, plus a tighter frontend. Existing auth/booking/service routes still return the same JSON shapes (`token` is still in the login body). New endpoints were added beside them.

The Local Link API uses port **5001** so it does not collide with Sponsor Metrics on 5000. No Docker is required.

Start with `cd server && npm run dev` then `cd client && npm run dev`.

---

## Module E — Security

**Files:** `middleware/authMiddleware.js`, `utils/cookies.js`, `utils/tokens.js`, `models/RefreshToken.js`, `middleware/rateLimiter.js`, `middleware/validate.js`, `validators/*`, `middleware/uploadMiddleware.js`, `models/AuditLog.js`, `utils/audit.js`, `controllers/authController.js`, `controllers/auditController.js`, `routes/authRoutes.js`, `server.js`, `client/src/services/api.js`, `client/src/services/authService.js`, `client/src/context/AuthContext.jsx`

- Access JWT is 15 minutes, stored in an **httpOnly / SameSite cookie**. A rotating refresh token lives in a second cookie and in Mongo (hashed). Login/register/admin-login still also return `token` so older clients keep working. `Authorization: Bearer` is still accepted.
- New routes: `POST /api/auth/refresh`, `POST /api/auth/logout`.
- Axios uses `withCredentials` and the Vite proxy so cookies stay same-origin. On 401 the client tries refresh before sending the user to login. Guest calls to `/auth/me` do **not** force a redirect.
- Rate limits on auth, booking create, and review create; a general limiter on the app.
- Zod validation on register, login, password reset, booking create/cancel/reschedule, reviews, disputes, messages, payouts.
- Uploads: MIME + extension allow-list, random filenames, 2MB profile / 5MB portfolio / 5MB ID & evidence. PDF allowed only for identity and dispute evidence.
- Admin audit log for category, event, report, identity, payout, and dispute decisions. UI at `/admin/audit`. `GET /api/admin/audit-logs`.

Env additions are listed in `server/.env.example` (`JWT_REFRESH_SECRET`, cookie-related client URL, etc.).

---

## Module A — Payments & payouts

**Files:** `models/Payment.js`, `models/Payout.js`, `services/bkash.service.js`, `controllers/paymentController.js`, `controllers/payoutController.js`, `utils/money.js`, `routes/paymentRoutes.js`, `routes/payoutRoutes.js`, booking confirm/complete/cancel hooks, `/payments/sandbox/:id`, `/payouts`

- bKash Checkout flow: grant token → create payment → payer authorizes → execute → callback verify. If `BKASH_MOCK=true` (default in the example env), the app uses a pink sandbox page instead of live bKash.
- Amounts are **BDT**. Default take-rate is **10%** (`COMMISSION_RATE`).
- Confirming a booking creates a payment and asks the seeker to pay. Execute marks funds **held**. Completing the booking **releases** `providerAmount` onto `User.payoutBalance`. Cancel refunds (minus a late fee when inside the window).
- `POST /api/payouts/request` + admin approve/reject at `/admin/payouts`. Approval is a logged manual send (real bKash/Nagad payout rail was called out as a stretch goal).

---

## Module B — Trust & verification

**Files:** `User.identityVerification`, `controllers/identityController.js`, `routes/identityRoutes.js`, `models/Dispute.js`, `controllers/disputeController.js`, `pages/verification`, `pages/admin/AdminVerification.jsx`, `pages/admin/AdminDisputes.jsx`

- Identity is separate from the activity badge. Providers upload NID / passport / trade license. Status: `unsubmitted | pending | approved | rejected`.
- A provider cannot **confirm** bookings until identity is `approved` (or `IDENTITY_GATE=false` for local demos). Suspended accounts (no-shows) are also blocked.
- Admin queue: `GET /api/admin/providers/pending`, `PUT /api/admin/providers/:id/verify`, unsuspend route, UI at `/admin/providers`.
- Booking **disputes** are a different model from reports. Either party can open one with evidence. Admin resolution: refund / release payout / no action.

---

## Module C — Booking lifecycle

**Files:** `models/Booking.js`, `controllers/bookingController.js`, `utils/slots.js`, `BookingDetails.jsx`, `BookingForm.jsx`

- Cancel stores `cancelledBy`, `cancellationReason`, `cancelledAt`, `cancellationFee`. Free if more than 24h out; 20% fee inside that window (`CANCELLATION_FREE_HOURS`, `CANCELLATION_FEE_PERCENT`).
- Either party can flag a **no-show**. Three against a provider in 90 days sets `bookingSuspended`.
- Either party can **propose a reschedule**; the other accepts or declines. Overlaps are rejected.
- Create/confirm checks the provider’s pending+confirmed bookings for overlapping windows (`durationMinutes`, default 60).

---

## Module D — Communication

**Files:** `models/Message.js`, `controllers/messageController.js`, `services/sms.service.js`, `BookingThread.jsx`, en-route on Booking

- Thread scoped to a booking: `GET/POST /api/bookings/:id/messages`. Not open DMs.
- SMS helper (SSL Wireless / Alpha-style POST, or console mock when `SMS_MOCK=true`) on confirm, cancel, and en route.
- Provider **en route** toggle: `POST /api/bookings/:id/en-route` — in-app notification + SMS, no GPS.

---

## Module F — Monetization & growth

- `POST /api/services/:id/feature` turns the existing `featured` flag into a 7-day paid placement (sandbox charge `FEATURED_PRICE_BDT`, default ৳500). Search sorts featured first. Cards show a Featured badge.
- Booking form **recurrence**: weekly / biweekly / monthly. Completing a recurring job creates the next pending booking if the slot is free.
- Users get a `referralCode`. Register accepts an optional code. The referrer gets `REFERRAL_CREDIT_BDT` (default ৳100) on the referred user’s **first completed** booking; the new user gets booking credit.

---

## Frontend

- Shared **Navbar + Footer + Layout** using the existing cream / terracotta / olive tokens.
- Home no longer duplicates a second header. Copy talks about held payments and identity checks.
- Booking details is the hub: pay, cancel, no-show, reschedule, en route, complete, chat, dispute.
- New pages: verification, payouts, bKash sandbox, payment result, admin verify / disputes / payouts / audit.
- Register has a referral field. Profile shows the user’s code and a Feature listing button.

---

## New / extended API (existing routes unchanged)

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/refresh` | Rotate refresh cookie |
| POST | `/api/auth/logout` | Clear cookies |
| POST | `/api/payments/bookings/:bookingId` | Start bKash hold |
| POST | `/api/payments/execute` | Execute + hold |
| GET/POST | `/api/payments/bkash/callback` | bKash callback |
| GET | `/api/payouts` | Provider balance + history |
| POST | `/api/payouts/request` | Withdrawal request |
| GET/POST | `/api/identity` | Submit / read ID docs |
| GET/POST | `/api/disputes` | Booking disputes |
| PATCH | `/api/bookings/:id/cancel` | Policy-aware cancel |
| POST | `/api/bookings/:id/no-show` | Flag no-show |
| POST | `/api/bookings/:id/reschedule` | Propose time |
| POST | `/api/bookings/:id/reschedule/respond` | Accept/decline |
| POST | `/api/bookings/:id/en-route` | Provider on the way |
| GET/POST | `/api/bookings/:id/messages` | Booking chat |
| POST | `/api/services/:id/feature` | Paid placement |
| GET | `/api/admin/providers/pending` | Identity queue |
| PUT | `/api/admin/providers/:id/verify` | Approve/reject |
| GET/PUT | `/api/admin/disputes` | Resolve disputes |
| GET/PUT | `/api/admin/payouts` | Approve payouts |
| GET | `/api/admin/audit-logs` | Audit trail |

---

## Testing

Ran:

- `node --check` on server entry and core controllers
- `node scripts/offlineChecks.js` — commission split, cancel fees, slot overlap, Zod payloads, mock bKash create/execute (all passed)
- `npx vite build` in `client` — 250 modules, success

Could not run:

- Full HTTP flow against Mongo (Atlas DNS failed; Docker engine not running)
- Browser click-through (no browser tools in this session; port 5000 was not serving this API)

After you start Mongo and the API:

1. Register a seeker and a provider.
2. Provider: `/verification` → upload a file. Admin: `/admin/providers` → approve.
3. Seeker books a time. Overlapping time should 409.
4. Provider confirms → seeker pays on the sandbox page → status `held`.
5. Provider marks en route, then completed → payout balance increases by 90%.
6. Cancel a booking inside 24h → fee applied. Open a dispute and resolve it from `/admin/disputes`.
7. Feature a listing; it should sort first. Use a referral code on a second register.

---

## Env you may need

See `server/.env.example`. Important new keys: `JWT_REFRESH_SECRET`, `CLIENT_URL`, `BKASH_*`, `BKASH_MOCK`, `SMS_MOCK`, `COMMISSION_RATE`, `IDENTITY_GATE`, `FEATURED_PRICE_BDT`, `REFERRAL_CREDIT_BDT`.
