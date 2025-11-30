# The Local Link

A MERN stack application connecting service providers with service seekers in local communities.

## Project Structure

This project follows a monorepo structure with separate client and server directories.

```
The-Local-Link/
├── client/                # React Frontend (Vite)
├── server/                # Node/Express Backend
├── .gitignore             # Ignored files
├── README.md              # Project documentation
└── package.json           # Root scripts
```

## Team Structure

- **Teammate 1 (Gatekeeper)**: Authentication & User Management
- **Teammate 2 (Architect)**: Service Provider Features
- **Teammate 3 (Explorer)**: Service Search & Discovery
- **Teammate 4 (Interaction)**: Booking & Reviews
- **Teammate 5 (Admin)**: Admin Dashboard & Management

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd CSE470
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

4. Configure environment variables
- Create `.env` files in both `client/` and `server/` directories
- See `.env.example` files for required variables

### Running the Application

#### Development Mode

Run backend:
```bash
cd server
npm run dev
```

Run frontend:
```bash
cd client
npm run dev
```

Or run both concurrently from root:
```bash
npm run dev
```

## Tech Stack

- **Frontend**: React, Vite, React Router, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT
- **File Upload**: Multer

## License

MIT
