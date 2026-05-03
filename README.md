# Project 2 Salon

Full-stack salon booking application with OTP-based user onboarding, booking/payment tracking, and admin management.

## Architecture

- Frontend: React 19 + Vite
- Backend: Node.js + Express 5 REST API
- Database: SQLite via better-sqlite3
- Mail/OTP delivery: Nodemailer (SMTP)

## New Premium Features (v2.0)

This project has been enhanced with high-end salon features to provide a professional user experience:

1.  **AI Virtual Makeover**: A floating AI tool that allows users to upload photos and see simulated hair/skin transformations before booking.
2.  **Luxe Loyalty Rewards**: Automated points system (10 pts per booking) with redeemable milestones and progress tracking in the user portal.
3.  **Specialist Selection**: Integrated booking flow allowing customers to choose their preferred stylist/expert based on real-time availability.
4.  **Digital Gift Cards**: Secure redemption system for digital vouchers and balance management.
5.  **Branded Success Dashboard**: Redesigned payment confirmation screen with Salon Luxe branding and detailed transaction summaries.
6.  **Advanced Admin Analytics**: Enhanced dashboard showing revenue growth, service performance, and user retention metrics.
7.  **Smart SMS/WhatsApp Formats**: Transactional notifications optimized for mobile readability and social sharing.

## What backend type is used?

This project uses a monolithic REST backend:

- Single Express server in `server/index.js`
- Business/data access in `server/db.js`
- SQLite file database in `server/data/salon.sqlite`
- JSON over HTTP API (`/api/*` routes)

## Frontend to backend connection

- Frontend base API URL is `http://localhost:4000/api` (in `src/context/AuthContext.jsx`).
- Backend runs on port `4000`.
- Frontend runs on Vite dev port (typically `5173+`).
- CORS allows localhost/127.0.0.1 origins on any port for dev.

## Tech stack

### Runtime

- react
- react-dom
- react-router-dom
- express
- cors
- dotenv
- better-sqlite3
- nodemailer
- framer-motion
- lucide-react

### Development

- vite
- @vitejs/plugin-react
- nodemon
- eslint and related plugins
- postcss + tailwindcss pipeline

## Project structure

```text
project2_salon/
├── package.json
├── README.md
├── .env                  # root env (loaded first)
├── server/
│   ├── .env              # server env (overrides root env)
│   ├── index.js
│   ├── db.js
│   └── data/
│       └── salon.sqlite
└── src/
		├── App.jsx
		├── main.jsx
		├── context/
		│   └── AuthContext.jsx
		├── pages/
		├── components/
		└── data/
```

## API keys and environment variables

This project does not use third-party API keys in source code. It uses environment secrets for SMTP and optional Twilio SMS.

### Required for email OTP and booking email

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `FROM_EMAIL`

### Optional

- `SMTP_SECURE` (`true` for 465, `false` for 587)
- `PORT` (default: `4000`)
- `DEFAULT_COUNTRY_CODE` (default: `+91`)

### Optional SMS (Twilio)

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

If Twilio values are missing, SMS flow runs in dev mode (logs OTP).

### Example `server/.env`

```env
PORT=4000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
FROM_EMAIL="Salon Luxe <your-email@gmail.com>"

DEFAULT_COUNTRY_CODE=+91
```

Security note: never commit real credentials to git.

## NPM scripts (tools/commands)

```json
{
	"start": "concurrently \"npm run dev:server\" \"npm run dev\"",
	"dev": "vite",
	"dev:server": "nodemon server/index.js",
	"start:server": "node server/index.js",
	"build": "vite build",
	"preview": "vite preview",
	"lint": "eslint ."
}
```

## Run frontend and backend (full flow)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

- Add SMTP values in `server/.env`.
- If both `.env` and `server/.env` exist, `server/.env` overrides root values for backend.

### 3) Start both frontend and backend

```bash
npm start
```

### 4) Access app

- Frontend: check terminal URL (for example `http://localhost:5176`)
- Backend health: `http://localhost:4000/api/health`

## REST API reference

### System

- `GET /` - backend status overview
- `GET /api/health` - health check
- `POST /api/smtp/test` - verify SMTP login/send

### OTP and auth

- `POST /api/otp/send`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/users/register` (legacy compatibility route)

### Admin

- `POST /api/admin/register`
- `POST /api/admin/login`
- `GET /api/admin/summary`
- `PATCH /api/admin/bookings/:id/status`
- `PATCH /api/admin/payments/:id/status`
- `DELETE /api/admin/bookings/:id`
- `DELETE /api/admin/payments/:id`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/export`

### Booking

- `POST /api/bookings`
- `GET /api/bookings`

## Detailed API examples

### Send OTP

Endpoint: `POST /api/otp/send`

Request body:

```json
{
	"email": "user@example.com",
	"purpose": "register"
}
```

Success response:

```json
{
	"message": "OTP sent successfully to email."
}
```

Error response examples:

```json
{
	"message": "Email address is required."
}
```

```json
{
	"message": "Please wait 18 seconds before requesting another OTP."
}
```

### Register user with OTP

Endpoint: `POST /api/auth/register`

Request body:

```json
{
	"name": "Vishnu",
	"email": "user@example.com",
	"phone": "9876543210",
	"password": "secret123",
	"otp": "123456"
}
```

Success response:

```json
{
	"id": "USR-1714689826000",
	"name": "Vishnu",
	"email": "user@example.com",
	"phone": "9876543210",
	"emailVerified": true
}
```

### User login

Endpoint: `POST /api/auth/login`

Request body:

```json
{
	"identifier": "user@example.com",
	"password": "secret123"
}
```

### Forgot password

Endpoint: `POST /api/auth/forgot-password`

Request body:

```json
{
	"email": "user@example.com"
}
```

### Reset password

Endpoint: `POST /api/auth/reset-password`

Request body:

```json
{
	"email": "user@example.com",
	"otp": "654321",
	"password": "newSecret123"
}
```

### Create booking

Endpoint: `POST /api/bookings`

Request body example:

```json
{
	"booking": {
		"id": "BK-1714689827000",
		"customer": "Vishnu",
		"email": "user@example.com",
		"phone": "9876543210",
		"service": "Hair Spa",
		"date": "2026-05-10",
		"slot": "14:00",
		"specialist": "Any",
		"status": "Pending",
		"createdAt": "2026-05-02T16:00:00.000Z"
	},
	"payment": {
		"id": "PAY-1714689827001",
		"customer": "Vishnu",
		"service": "Hair Spa",
		"amount": 799,
		"method": "UPI",
		"status": "Paid",
		"date": "2026-05-10",
		"createdAt": "2026-05-02T16:00:00.000Z"
	}
}
```

## Data model summary

SQLite tables used by backend:

- `users`: registered users, hashed passwords, verification state
- `admins`: admin accounts and roles
- `bookings`: booking records and status
- `payments`: payment status and amounts
- `password_resets`: OTP lifecycle for password reset

Database location:

- `server/data/salon.sqlite`

## Internal backend behavior

- OTPs are generated in-memory and hashed with SHA-256.
- OTP cooldown: 30 seconds between resend attempts per target/purpose.
- OTP daily limit: 10 sends per day per target/purpose.
- OTP expiry: 10 minutes.
- Registration and password reset validate OTP before mutating user data.
- Booking creation writes booking and payment in a single SQLite transaction.

## Development tools and flow

- `npm start` runs frontend + backend together via concurrently.
- Backend auto-reload: nodemon watches `server/*`.
- Frontend hot reload: Vite HMR.
- Linting: ESLint config from `eslint.config.js`.

Useful direct commands:

```bash
npm run dev:server
npm run dev
npm run start:server
npm run build
npm run preview
npm run lint
```

## Quick testing commands

### SMTP test

```bash
node -e "fetch('http://localhost:4000/api/smtp/test',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'your-email@gmail.com'})}).then(r=>r.text().then(t=>console.log(r.status,t))).catch(console.error)"
```

### OTP send test

```bash
node -e "fetch('http://localhost:4000/api/otp/send',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'your-email@gmail.com'})}).then(r=>r.text().then(t=>console.log(r.status,t))).catch(console.error)"
```

## Common issues

### `Failed to fetch` in frontend

- Ensure backend is running on `4000`.
- Ensure frontend is using `http://localhost:4000/api`.
- CORS already allows localhost ports; restart backend after config changes.

### Gmail `535 Username and Password not accepted`

- Enable Google 2-Step Verification.
- Generate a Gmail app password.
- Use app password as `SMTP_PASS`.
- Restart backend.

### OTP shown in backend logs only

- SMTP credentials are missing/invalid, so app may fall back to dev mode.
- Set valid SMTP env values in `server/.env`.
