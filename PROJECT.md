# The Local Link

A local services marketplace that connects **service seekers** with **local providers**. Seekers can search, book, review, and favorite services. Providers can list services, manage bookings, set pricing, and showcase a portfolio. Admins run the platform: users, categories, events, discounts, and reports.

This is a CSE470 team project (MERN stack).

---

## What the app does

Someone in a neighborhood needs a plumber, tutor, photographer, or similar local help. They sign up as a **seeker**, browse categories, filter by location (including a map + radius), book a time, and later leave a review.

Someone who offers that help signs up as a **provider**, creates a profile, lists services with photos and rates, toggles availability, manages incoming bookings, and uploads a portfolio of past work.

An **admin** signs in on a separate login, sees dashboard stats, manages categories and promotional events (which apply discounts to matching service categories), and handles user reports.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router 6, Axios, Leaflet / React-Leaflet, React Icons |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT (Bearer token, 30-day expiry), bcrypt password hashing |
| Email | Nodemailer (Gmail) for verification / password reset codes |
| Uploads | Multer (profile pictures, portfolio images) |
| Deploy / local containers | Docker + docker-compose (client, server, MongoDB) |

- **Client** runs on port **3000** (Vite) and proxies `/api` to the server on **5001**.
- **Server** runs on port **5001** (5000 is used by Sponsor Metrics).
- Uploaded files are served at `/uploads`.

---

## User roles

| Role | Who they are | What they can do |
| --- | --- | --- |
| **Seeker** | Customer looking for local help | Register, search/book services, favorites, reviews (after a completed booking), reports, booking history, notifications |
| **Provider** | Person or business offering a service | Everything a seeker can do for discovery, plus create/edit/delete services, set availability and dynamic pricing, accept/complete/cancel bookings, provider booking history, portfolio |
| **Admin** | Platform operator | Separate admin login, dashboard stats, user/service/booking lists, category CRUD, event/discount CRUD, report moderation |

Registration asks whether the user provides services. If yes, they become a **provider** (optional business name). Otherwise they are a **seeker**.

Admins have an extra `adminLevel` of `super_admin` or `moderator`. Admin routes use `role === 'admin'`.

---

## Features

### Auth and accounts

- Register / login with username, email, password, name, phone (`+880` + 10 digits), location
- Password rules: at least 8 characters, one number, one special character
- JWT stored in `localStorage`; Axios attaches `Authorization: Bearer <token>`
- Optional **email verification** (6-digit code, 10 minutes) when `EMAIL_VERIFICATION_ENABLED=true`
- **Forgot password** flow (code + reset); can be disabled in the controller
- Separate **admin login** at `/admin/login`
- Account deletion

### Profiles

- Each user can create/update a **Profile** (name, age, phone, location, image)
- Providers also store business name, verification badge, availability
- **Public profile** at `/profile/:id` so others can view a provider
- Home page nudges users who have not created a profile yet

### Automatic verification badges

Verification is not a manual admin click. It updates from activity:

- **Seeker:** verified after **3 bookings** and **3 reviews given**
- **Provider:** verified after **5 completed bookings** and **5 reviews received**

User and Profile documents stay in sync.

### Services and discovery

- Providers create services: title, description, category, images, location (city / area / country), coordinates
- **Search** by keyword (MongoDB text index), category, city/area/country, minimum rating
- Sort by relevance, rating, or newest; paginated
- Location dropdowns: countries → cities → areas (cached 30 minutes on the client)
- **Map discovery (Feature 11):** Leaflet map, pin a location, filter by radius using MongoDB `$near` + `2dsphere` index; list/map view toggle
- **Edit / delete service (Feature 15)** — owner (or admin for delete)
- **Availability toggle (Feature 16)** — provider sets a service online/offline
- **Dynamic pricing (Feature 21)** — hourly, weekly, monthly, project, and fixed rates
- Optional special offers on a service (description + expiry)
- Denormalized `averageRating` and `totalReviews` on each service (updated by review hooks)

### Categories

- Public category list with icons
- Dedicated **Categories** page (`/categories`) as the main browse entry
- Admins create, update, and delete categories

### Bookings (Feature 19)

Lifecycle: `pending` → `confirmed` → `completed`, or `cancelled`.

- Seeker picks date/time and optional notes
- Provider updates status
- Seeker **booking history** with status and date filters, plus stats
- Provider **service history** with the same idea
- Booking details page
- Completing a booking records `completedAt` and can trigger verification + notifications

### Reviews and ratings

- One review per user per service (unique index)
- Only after a **completed** booking for that service
- 1–5 stars + comment; admin can moderate (`isApproved`)
- Saving/deleting a review recalculates the service average
- Provider can respond to a review
- Dedicated reviews page per service

### Favorites / wishlist (Feature 20)

- Separate `Favorite` collection (user + service, unique pair)
- Heart button on service cards, toggle add/remove
- Favorites page and favorites count

### Notifications

Types: `booking_created`, `booking_confirmed`, `booking_cancelled`, `booking_completed`, `review_received`, `system`, `event_published`.

- Bell on the home header with unread state
- Full notifications page: mark one/all read, delete
- Linked to related booking/service when relevant

### Events and discounts

- Admins create time-bounded events (title, description, category, discount string like `20%`, audience, color)
- Public **Events** page for logged-in users
- Active events whose category matches a service category attach a **discount** to those services in search results

### Reports / moderation

- Users report a user or a service (reason + details)
- Status: `pending_review` or `resolved`
- Admin reports page: filter, respond, notify the reporter
- Users can view their own reports

### Portfolio showcase (Feature 25)

- Providers upload images and add items (title, description, up to 3 images per item)
- Manage from the provider profile; shown on public profiles
- Endpoints to upload, update, delete one item, or clear the whole portfolio

### Maps

- **LocationPicker** when adding/editing a service (click map to set lat/lng)
- **ServiceMap** on search for nearby results
- Leaflet CSS loaded in `index.html`

---

## Frontend pages and routes

| Path | Page | Notes |
| --- | --- | --- |
| `/` | Home | Hero, role-aware shortcuts, profile nudge |
| `/login` | Login | Seeker/provider |
| `/register` | Register | Choose seeker vs provider |
| `/admin/login` | Admin login | Separate from user login |
| `/verify-email` | Email verification | 6-digit code |
| `/forgot-password` | Password reset | |
| `/admin/dashboard` | Admin dashboard | Stats, users, services, bookings, categories, events |
| `/admin/reports` | Admin reports | Moderation |
| `/profile` | Own profile | Services, pricing, portfolio (providers) |
| `/profile/edit` | Edit profile | |
| `/profile/:id` | Public profile | Portfolio display |
| `/notifications` | Notifications | |
| `/events` | Events | Active promotions |
| `/bookings/history` | Seeker history | Filters + stats |
| `/bookings/provider-history` | Provider history | |
| `/bookings/:id` | Booking details | |
| `/favorites` | Favorites | |
| `/services` | Service search | Filters, map, sort |
| `/categories` | Categories | Browse by type |
| `/services/add` | Add service | Provider only |
| `/services/:id/edit` | Edit service | Provider only |
| `/services/:id` | Service details | Book, favorite, report |
| `/services/:id/reviews` | Service reviews | |
| `*` | 404 | Simple not-found page |

---

## Frontend structure (`client/src`)

```
src/
  App.jsx                 # All routes
  main.jsx                # AuthProvider + React root
  context/AuthContext.jsx # Global auth state (user, login, logout)
  hooks/                  # useAuth, useFetch
  services/               # Axios API wrappers (auth, services, bookings, …)
  pages/
    auth/                 # Login, Register, AdminLogin, VerifyEmail, ForgotPassword
    home/
    admin/                # Dashboard, Reports
    dashboard/            # Profile, EditProfile, booking history/details
    services/             # Search, details, add/edit, categories, reviews
    events/
    favorites/
    notifications/
    profile/              # PublicProfile
  components/
    layout/               # Navbar, Footer, Sidebar
    common/               # Button, Input, Modal, Loader, Breadcrumb, ReportModal
    services/             # ServiceCard, ServiceList, CategoryCard, PricingManager
    booking/              # BookingForm, DatePicker, TimePicker
    reviews/              # ReviewForm, ReviewList
    favorites/            # FavoriteButton
    map/                  # LocationPicker, ServiceMap
    notifications/        # NotificationBell, NotificationDropdown
    portfolio/            # PortfolioManager, PortfolioDisplay
    admin/                # AdminTable, Charts
  utils/                  # helpers, iconMapping
```

Auth state lives in `AuthContext`. API calls go through `services/api.js` (same-origin `/api` via the Vite proxy to port 5001).

---

## Backend structure (`server`)

```
server/
  server.js               # Express app, CORS, routes, static /uploads
  config/db.js            # MongoDB connection (MONGO_URI)
  models/                 # User, Profile, Service, Category, Booking, Review,
                          # Notification, Event, Report, Favorite
  routes/                 # One file per resource
  controllers/            # Business logic
  middleware/
    authMiddleware.js     # protect — JWT
    roleMiddleware.js     # authorize, adminOnly, providerOnly, seekerOnly
    uploadMiddleware.js   # Multer
    errorMiddleware.js
  utils/
    generateToken.js / tokenHelper.js
    sendEmail.js
    verificationHelper.js
  createAdmin.js          # Seed an admin user
  createTestUsers.js      # Seed test accounts
```

---

## Data models (MongoDB)

**User** — email, hashed password, username, name, phone, location, role (`seeker` | `provider` | `admin`), business name, verification, availability, portfolio items, favoriteProviders, adminLevel, email/password-reset codes.

**Profile** — one-to-one with User: image, name, age, phone, location, provider fields, linked services.

**Service** — title, description, category, provider, pricing + pricingType/rates, images, location (city/area/country + GeoJSON Point), ratings, isActive, featured, availability, offers.

**Category** — name, description, icon, isActive.

**Booking** — seeker, service, provider, scheduledTime, status, userNotes, completedAt.

**Review** — service, user, rating, comment, isApproved. Unique `(service, user)`. Hooks update service ratings.

**Favorite** — user, service. Unique pair.

**Notification** — recipient, sender, type, title, message, related booking/service, isRead, link.

**Event** — title, description, category, discount, start/end dates, targetAudience (`all` | `seeker` | `provider`), isActive, createdBy, color.

**Report** — reporter, reportedUser and/or reportedService, reason, details, status, adminResponse.

---

## API overview

All JSON. Protected routes need `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method | Path | Access |
| --- | --- | --- |
| POST | `/register` | Public |
| POST | `/login` | Public |
| GET | `/me` | Logged in |
| POST | `/verify-email` | Public |
| POST | `/forgot-password` | Public |
| POST | `/verify-reset-code` | Public |
| POST | `/reset-password` | Public |
| POST | `/admin/login` | Public |
| GET | `/admin/me` | Admin |

### Services — `/api/services`

| Method | Path | Access |
| --- | --- | --- |
| GET | `/` | Public (filters: keyword, city, area, country, category, minRating, sort, page, limit, lat, lng, radius) |
| GET | `/:id` | Public |
| GET | `/:serviceId/reviews` | Public |
| GET | `/locations/countries` | Public |
| GET | `/locations/cities/:country` | Public |
| GET | `/locations/areas/:country/:city` | Public |
| POST | `/` | Provider |
| PUT | `/:id` | Provider |
| DELETE | `/:id` | Provider or admin |
| PATCH | `/:id/availability` | Provider |
| PATCH | `/:id/pricing` | Provider |

### Bookings — `/api/bookings` (all authenticated)

| Method | Path | Access |
| --- | --- | --- |
| POST | `/` | Logged in |
| GET | `/my-bookings` | Logged in |
| GET | `/history` | Seeker history + filters |
| GET | `/provider-bookings` | Provider |
| GET | `/provider-history` | Provider |
| PATCH | `/:id/status` | Provider |
| GET | `/:id` | Owner / provider |

### Categories — `/api/categories`

| Method | Path | Access |
| --- | --- | --- |
| GET | `/` | Public |
| GET | `/:id` | Public |

### Reviews — `/api/reviews`

| Method | Path | Access |
| --- | --- | --- |
| GET | `/service/:serviceId` | Public |
| POST | `/` | Logged in (completed booking required) |
| PUT | `/:id/response` | Logged in (provider response) |

### Users / profile / portfolio — `/api/users`

| Method | Path | Access |
| --- | --- | --- |
| GET | `/:userId` | Public |
| PUT | `/profile` | Logged in (multipart image) |
| DELETE | `/:userId` | Logged in |
| POST | `/portfolio/upload` | Logged in |
| GET | `/portfolio/:userId` | Public |
| PUT | `/portfolio/:itemIndex` | Logged in |
| DELETE | `/portfolio/:itemIndex` | Logged in |
| DELETE | `/portfolio` | Logged in |

### Notifications — `/api/notifications` (all authenticated)

`GET /` · `PUT /mark-all-read` · `PUT /:id/read` · `DELETE /:id`

### Favorites — `/api/favorites` (all authenticated)

`GET /` · `GET /count` · `GET /check/:serviceId` · `PUT /:serviceId` (toggle) · `POST /:serviceId` · `DELETE /:serviceId`

### Events — `/api/events` and `/api/admin/events`

| Method | Path | Access |
| --- | --- | --- |
| GET | `/api/events` | Logged in (active events) |
| GET | `/api/events/:id` | Public |
| GET/POST | `/api/admin/events` | Admin |
| PUT/DELETE | `/api/admin/events/:id` | Admin |

### Reports — `/api/reports` (authenticated)

`POST /` · `GET /my-reports` · `GET /:id`

### Admin — `/api/admin` (admin only)

| Method | Path |
| --- | --- |
| GET | `/dashboard/stats` |
| GET | `/users` |
| GET | `/services` |
| GET | `/bookings` |
| GET/POST | `/categories` |
| PUT/DELETE | `/categories/:id` |
| GET | `/reports` and `/reports/:id` |
| PUT/DELETE | `/reports/:id` |

Root `GET /` returns `Welcome to The Local Link`.

---

## How the pieces talk

```
Browser (React, :3000)
    │  Axios + JWT
    ▼
Express API (:5001)
    │  Mongoose
    ▼
MongoDB
```

1. User logs in → server returns JWT → client stores token + user in `localStorage`.
2. Every later request sends the token. `protect` middleware loads `req.user`. Role middleware gates provider/admin routes.
3. Booking/review/event actions create **notifications**.
4. Review save hooks update **service ratings**. Booking/review counts can flip **verification**.
5. Admin events with a discount string are matched (case-insensitive category name) onto service search results.

---

## How to run locally

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm

### 1. Server

```bash
cd server
npm install
```

Create a `.env` in `server/` (not committed):

```
PORT=5001
MONGO_URI=mongodb://localhost:27017/locallink
JWT_SECRET=your-secret-key
EMAIL_VERIFICATION_ENABLED=false
EMAIL_USERNAME=you@gmail.com
EMAIL_PASSWORD=your-app-password
```

```bash
npm run dev
```

Optional seed scripts in `server/`: `createAdmin.js`, `createTestUsers.js`.

### 2. Client

```bash
cd client
npm install
npm run dev
```

Opens at `http://localhost:3000`. Vite proxies `/api` and `/uploads` to `http://localhost:5001`.

### Docker

From the repo root:

```bash
docker-compose up --build
```

This starts MongoDB (`27017`), the API (`5000`), and the client (`5173` in compose). Compose sets `MONGO_URI` and a JWT secret for the server container.

---

## Team (from code ownership comments)

| Area | Primarily |
| --- | --- |
| Auth, User/Profile, email, verification | Debashish |
| Services search, maps, favorites, frontend shell | ifty |
| Add/edit/delete service, availability, categories, dynamic pricing | Rafi |
| Bookings, reviews, notifications, booking history | Anupam |

---

## Notable implementation details

- Passwords are hashed with bcrypt on User `save` if the password field changed.
- Service text search uses a MongoDB text index on title + description.
- Geospatial queries need coordinates stored as `[longitude, latitude]` (GeoJSON).
- Favorites are a **separate collection**, not only the `favoriteProviders` array on User.
- Location lists are cached 30 minutes in the Axios layer.
- Map components are lazy-loaded on add/edit/search pages.
- If a request returns 401, the client clears the token and redirects to `/login`.
