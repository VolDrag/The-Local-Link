# The Local Link

A local services marketplace that connects people who need help in their neighbourhood (plumbers, tutors, technicians, photographers and more) with the people who provide it.

Built as a CSE470 (Software Engineering) team project at BRAC University using the MERN stack.

## Features

- **Three roles:** seekers find and book services, providers list services and manage bookings, and admins run the platform
- **Location-aware search:** browse by category and filter by distance on a map (Leaflet)
- **Booking flow:** date and time picking, booking threads, accept / complete / cancel, booking history
- **Trust:** reviews after completed bookings, automatic verification badges, public provider profiles, and user reports
- **Provider tools:** availability toggle, dynamic pricing, portfolio uploads
- **Admin dashboard:** stats, category management, promotional events with discounts, report moderation
- **Accounts:** JWT auth, optional email verification, password reset

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, React-Leaflet |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT, bcrypt |
| Other | Nodemailer, Multer, Docker Compose |

## Getting started

```bash
# Backend (runs on port 5001)
cd server
npm install
npm run dev

# Frontend (runs on port 3000, proxies /api to the server)
cd client
npm install
npm run dev
```

You need a MongoDB connection string and a JWT secret in the server's environment file. A `docker-compose.yml` is also included to run the client, server and MongoDB together.

## Documentation

- [PROJECT.md](PROJECT.md): full description of roles, features and API
- [IMPLEMENTATION.md](IMPLEMENTATION.md): implementation notes

## Team

[@VolDrag](https://github.com/VolDrag) · [@azrafi](https://github.com/azrafi) · [@debashishchowdhury](https://github.com/debashishchowdhury) · [@sagorsenanupam](https://github.com/sagorsenanupam)
