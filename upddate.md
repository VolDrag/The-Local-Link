The Local Link — Next-Phase Build Prompt (for Cursor)
Context (paste this block first)

The Local Link is a MERN two-sided local-services marketplace (React 18/Vite/React Router frontend, Node/Express backend, MongoDB, JWT auth stored in localStorage, Leaflet for maps). Seekers search/book/review/favorite services; providers list services, manage bookings and pricing, and showcase a portfolio; admins manage users, categories, events/discounts, and reports. Verification badges are earned automatically from booking/review activity, not manually granted.

Not built yet: any payment flow, provider background/identity verification, cancellation or no-show policy, in-app messaging, commission/payout logic, and booking-specific dispute resolution. Booking status currently jumps straight from pending/confirmed to completed with no transaction step.

Work one module at a time, write a short MODULE<name>_LOG.md after each (files touched, endpoints added, decisions made), match existing code style (functional components, controller/service split, Mongoose schemas), and don't change existing routes/contracts without flagging it. Add new env vars to .env.example, never commit real credentials.

Module A — Payments & Payouts

(fits naturally with Rafi's existing ownership of pricing)

A.1 bKash Checkout integration backend/services/bkash.service.js: grant token → create payment → customer authorizes → execute → callback verify. Env: BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD, BKASH_BASE_URL (sandbox first). New Payment model: seeker, provider, booking, amount, status (initiated | executed | completed | failed | refunded).

A.2 Hold-until-completion Charge at booking confirmation, hold the funds against the Booking, release to the provider's payout balance when status flips to completed. Full refund path if a booking is cancelled before the service happens.

A.3 Commission model Platform take-rate (flat % to start) deducted at release; provider payout balance visible on their profile; simple POST /api/payouts/request + admin approval to actually send money out (can be manual/logged for now — a real payout rail is a stretch goal, not a requirement).

Module B — Trust & Provider Verification

(fits naturally with Debashish's existing ownership of auth/verification)

B.1 Manual identity verification, separate from the automatic activity badge Provider uploads a government ID / trade license at signup; status pending | approved | rejected on the User/Profile doc. A provider cannot accept bookings until this is approved — the current activity-based badge stays as a separate "experienced" signal, not a safety gate.

B.2 Admin verification queue /admin/providers/pending — list, view documents, approve/reject with a reason.

B.3 Booking-specific disputes New Dispute model tied to a Booking (not the generic Report): raised by either party, evidence attachments, status (open | under_review | resolved), admin resolution action (refund / release payout / no action). This is different from the existing user/service report flow — keep both, they serve different purposes.

Module C — Booking Lifecycle Hardening

(fits naturally with Anupam's existing ownership of bookings)

C.1 Cancellation policy Seeker-cancel and provider-cancel windows (e.g., free >24h out, fee or penalty inside that window). Store cancelledBy, cancellationReason, cancelledAt on Booking.

C.2 No-show handling Either party can flag a no-show; three no-shows within a rolling period suspends a provider's ability to accept new bookings pending admin review.

C.3 Reschedule flow Let either party propose a new time on a pending/confirmed booking; the other side accepts or declines, instead of forcing a cancel-and-rebook.

C.4 Real slot-conflict prevention Booking creation should check the provider's existing confirmed bookings for the requested window and reject overlaps server-side — right now availability is a boolean toggle, not a calendar.

Module D — Communication

D.1 In-app messaging per booking A simple thread scoped to a Booking (not open DMs) — logistics like gate codes and exact arrival time need somewhere to live that isn't the notes field.

D.2 SMS for time-sensitive events Booking confirmed, provider en route, cancellation — via a local SMS gateway (SSL Wireless / Alpha SMS). Email-only misses people who don't check email between booking and appointment time.

D.3 Provider "en route" status (stretch) A manual toggle (not full GPS tracking) so the seeker knows the provider is on the way — most of the trust value of live tracking for a fraction of the engineering cost.

Module E — Security Hardening

Do this before Module A touches real money.

E.1 Move the JWT out of localStorage into an httpOnly, Secure, SameSite cookie with refresh-token rotation — this is exploitable via any injected script today.

E.2 Rate limiting (express-rate-limit) on /auth, booking creation, and review submission.

E.3 Centralized input validation (zod or celebrate) — audit which controllers currently skip it.

E.4 Upload hardening on the Multer routes (profile pictures, portfolio images) — MIME/extension allow-list and size caps.

E.5 Admin action audit log — every category/event/report/provider-verification decision an admin makes should be attributable and timestamped.

Module F — Monetization & Growth (stretch)

F.1 Activate the existing featured flag on Service as a real paid placement tier, instead of an unused field.

F.2 Recurring bookings (weekly cleaning, etc.) — a lightweight repeat-on-cadence option rather than full subscription billing.

F.3 Referral or repeat-booking incentive tied to the existing Events/discount system.

Suggested order
Module E (security) — before any money moves
Module A + B (payments, trust/verification) — these two are what actually separate this from a course-project toy: no money and no identity check means nothing that happens on the platform is real yet
Module C (booking lifecycle) — needed once real money is at stake in a cancellation
Module D (communication)
Module F — polish, time-permitting
Constraints
BDT everywhere; bKash/Nagad as primary rails
Don't touch existing route contracts silently
One module per Cursor session — feeding all six at once produces shallow output across all of them instead of solid output on one