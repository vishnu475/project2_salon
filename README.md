# Project 2 Salon

Salon booking and customer management app built with React, Vite, Express, and SQLite.

The project has two parts:

- Frontend: React app served by Vite at `http://localhost:5173`
- Backend: Express API server at `http://localhost:4000`

## What this app does

- Lets users register with email and mobile number.
- Lets authenticated users create salon bookings.
- Saves bookings and payment records in SQLite.
- Sends booking confirmation emails.
- Provides admin dashboard data, booking status updates, payment status updates, and export support.

## Main features

### Customer side

- User registration and login support.
- Booking form for service, date, and time slot.
- Booking confirmation data returned from the API.
- Account page and user session support.

### Booking and notification side

- Booking slot creation through the frontend booking flow.
- Booking persistence in SQLite.
- Payment record creation along with each booking.
- Email confirmation after booking is created.

### Admin side

- Admin registration and login.
- Admin summary dashboard.
- Booking status updates.
- Payment status updates.
- JSON export of app data.

## Technology stack

### Frontend tools

- React 19
- React Router
- Vite
- Framer Motion
- Lucide React icons
- Tailwind CSS 4 pipeline

### Backend tools

- Express 5
- CORS
- Better SQLite 3
- Nodemailer for email delivery

### Storage

- SQLite database file in `server/data/salon.sqlite`
- Local browser storage for some user/admin session data

## Project structure

```text
project2_salon/
├── README.md
├── package.json
├── vite.config.js
├── eslint.config.js
├── server/
│   ├── index.js
│   ├── db.js
│   └── data/
│       └── salon.sqlite
└── src/
	├── App.jsx
	├── App.css
	├── index.css
	├── main.jsx
	├── components/
	├── context/
	├── data/
	└── pages/
```

## How the flow works

### Registration flow

1. User enters name, email, and mobile number.
2. Frontend calls `POST /api/users/register` or the app's registration flow.
3. Server validates the details and creates the user.

### Login flow

1. User enters login credentials.
2. Frontend calls the login flow in the app.
3. Server returns the authenticated user profile.

### Booking flow

1. Authenticated user submits booking details.
2. Frontend calls `POST /api/bookings`.
3. Server creates booking and payment records in SQLite.
4. Server sends booking confirmation email if an email address is available.

## API endpoints

### Health and app info

- `GET /` - Basic backend status message.
- `GET /api/health` - Health check endpoint.

### Auth

- `POST /api/users/register` - Legacy direct register route kept for compatibility.

### Booking

- `POST /api/bookings` - Create booking and payment record.
- `GET /api/bookings` - Return all bookings.

### Admin

- `GET /api/admin/summary` - Dashboard summary and records.
- `PATCH /api/admin/bookings/:id/status` - Update booking status.
- `PATCH /api/admin/payments/:id/status` - Update payment status.
- `GET /api/admin/export` - Export app data as JSON.

## Installation

```bash
npm install
```

## Run commands

### Development

Start the backend:

```bash
npm run dev:server
```

Start the frontend:

```bash
npm run dev
```

### Production build

Build the frontend:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Environment variables

The app works in local development without SMTP credentials, but real email delivery needs environment variables.

### Email delivery

Set these for real booking confirmation emails:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE` - optional, set to `true` for secure SMTP
- `FROM_EMAIL` - optional sender address

If these are not set, the server falls back to Ethereal test email mode for development.

## Local testing notes

- Backend runs on port `4000`.
- Frontend runs on port `5173`.
- The frontend is configured to talk to `http://localhost:4000/api`.
- The SQLite database is created automatically when the backend starts.

## Available project tools and packages

### Runtime tools

- React for UI rendering
- React Router for navigation and protected routes
- Express for API routes
- SQLite for persistent booking and user data
- Nodemailer for booking email delivery

### UI and utility tools

- Framer Motion for motion effects
- Lucide React for icons
- Tailwind CSS/PostCSS pipeline for styling

### Development tools

- Vite for dev server and production builds
- ESLint for linting
- Nodemon for automatic backend restarts during development

## Notes

- `npm start` is not defined in `package.json`.
- Use `npm run dev:server` for the backend and `npm run dev` for the frontend.

## Quick start

```bash
npm install
npm run dev:server
npm run dev
```

Then open the app in your browser at `http://localhost:5173`.
