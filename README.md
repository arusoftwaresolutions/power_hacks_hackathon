# HerSafeSpace – Safety by Design Platform

HerSafeSpace is a full‑stack web application built for the **Power Learn Hackathon** under the theme **“Safety by Design”**. It provides a **safe digital space for African women and girls** to learn, connect and seek support.

Key pillars:
- **Safe community forums** with moderation and abuse reporting
- **Educational resources** on digital safety, literacy and policy awareness
- **AI‑assisted content safety** (keyword & sentiment checks, auto‑flagging)
- **Role‑based access control** for users, moderators and admins
- **Privacy & security best practices** (JWT auth, HTTP‑only cookies, validation, etc.)

---
## High‑Level Architecture

This repo contains a **backend API** and a **frontend web app**:

- **Backend** (`backend/`)
  - Node.js + TypeScript + Express
  - PostgreSQL via Prisma ORM (designed for DigitalOcean Managed PostgreSQL)
  - Authentication & authorization with JWTs (access + refresh tokens)
  - Content safety middleware (keyword blocklist + sentiment analysis)
  - REST API for:
    - Auth & users
    - Forums (categories, threads, posts)
    - Abuse reports & moderation tools
    - Educational resources
    - File upload signed URLs (DigitalOcean Spaces / S3‑compatible)

- **Frontend** (`frontend/`)
  - Next.js (App Router) + React + TypeScript
  - Tailwind CSS for responsive styling
  - Framer Motion for smooth, modern animations
  - SWR for client‑side data fetching
  - Pages:
    - Landing, auth (login/register), dashboard
    - Forums (list + threads), report abuse
    - Learning hub (resources), moderation console

---
## Core Features

### 1. Users & Roles
- Sign up, login, logout
- Password reset (token‑based; ready to integrate with email providers)
- Roles:
  - `USER` – regular community member
  - `MODERATOR` – reviews and resolves reports
  - `ADMIN` – platform owner; manages content and users

### 2. Forums & Community Safety
- Forum categories (e.g. “Safe Digital Spaces”) and threads
- Replies under threads
- **Safety middleware** checks thread bodies and replies for:
  - Harassment keywords (hard block)
  - Negative sentiment (block or warn)
- When content is *borderline* (warn):
  - Automatically creates a **Report** attached to the thread/post

### 3. Abuse Reporting & Moderation
- Any authenticated user can file a **manual report** (e.g. harassment, stalking, doxxing)
- Auto‑generated reports when the safety engine detects risk
- Moderators/Admins can:
  - View reports in a moderation console
  - Change status (`OPEN`, `IN_REVIEW`, `RESOLVED`)
  - Adjust severity (`LOW`, `MEDIUM`, `HIGH`)

### 4. Educational Resources
- Curated learning content around:
  - Digital literacy
  - Privacy and safety on social platforms
  - Policy awareness and reporting channels
- Resources have categories, difficulty levels, and tags
- Moderator/Admin can publish new resources (safety‑checked)

### 5. File Uploads (DigitalOcean Spaces)
- Backend exposes a **signed URL** endpoint for uploads
- Frontend (or other clients) can use the signed URL to upload directly to Spaces/S3
- Keeps the API stateless for large files and reduces attack surface

---
## Technology Stack

**Backend**
- Node.js, TypeScript, Express
- Prisma ORM, PostgreSQL
- JWT, bcrypt, Zod, helmet, cors, express‑rate‑limit
- Sentiment analysis library for basic AI‑like safety checks

**Frontend**
- Next.js (App Router), React, TypeScript
- Tailwind CSS, Framer Motion, SWR

**Infrastructure Targets**
- Backend: Dockerized for **DigitalOcean Droplets**
- Database: **DigitalOcean Managed PostgreSQL**
- File storage: **DigitalOcean Spaces** (S3‑compatible)
- Frontend: deployable to **Vercel**

---
## Getting Started (Local Development)

### Prerequisites
- Node.js (v18+ recommended)
- npm (or pnpm/yarn if you adapt commands)
- PostgreSQL instance (local or hosted)

### 1. Clone and explore

```bash
git clone <your-repo-url> hersafespace
cd hersafespace
```

You’ll see two main sub‑projects:
- `backend/` – API and business logic
- `frontend/` – Next.js UI

### 2. Backend Setup

1. Go to the backend:

   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` with **your values**:

   - `DATABASE_URL` – PostgreSQL connection string (if using DO Managed PG, include `sslmode=require`)
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` – long random secrets
   - `FRONTEND_ORIGIN` – `http://localhost:3000` for local dev
   - `COOKIE_DOMAIN` – `localhost` for local dev
   - (Optional) `SPACES_*` variables for DigitalOcean Spaces integration

3. Install dependencies, run migrations and seed sample data:

   ```bash
   npm install
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

4. Start the dev server:

   ```bash
   npm run dev
   # API will be available on http://localhost:4000
   ```

### 3. Frontend Setup

1. In another terminal, from the repo root:

   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `frontend/.env`:

   - `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`

3. Install dependencies and run dev server:

   ```bash
   npm install
   npm run dev
   # App will be available on http://localhost:3000
   ```

### 4. Test Users & Flows

After seeding, you can use the following test accounts:

- **Admin**
  - Email: `admin@safety.local`
  - Password: `ChangeMe123!`
- **Moderator**
  - Email: `mod@safety.local`
  - Password: `ChangeMe123!`
- **Learner/User**
  - Email: `learner@safety.local`
  - Password: `ChangeMe123!`

Example flows to verify:
- Register as a new user and log in
- Create a forum thread and replies
- Submit and view reports
- Log in as moderator/admin to see reports and learning content

---
## Running Tests

### Backend tests

From `backend/`:

```bash
npm test
```

Currently includes unit tests for the safety engine (content classification). You can add more tests under `tests/`.

### Frontend tests

Basic frontend tests are not yet implemented; you can integrate Jest/React Testing Library or Playwright if desired.

---
## Deployment Overview

### Backend (DigitalOcean Droplet)

1. Build the Docker image:

   ```bash
   cd backend
   docker build -t hersafespace-api .
   ```

2. Ensure `.env` in the Droplet contains production values:
   - `DATABASE_URL` for DO Managed PostgreSQL
   - `FRONTEND_ORIGIN` set to your Vercel/production URL
   - `COOKIE_DOMAIN` set to your domain (e.g. `.example.com`)
   - `SPACES_*` for DigitalOcean Spaces

3. Run the container:

   ```bash
   docker run -d --name hersafespace-api \
     --env-file .env \
     -p 4000:4000 \
     hersafespace-api
   ```

4. Run migrations against your production DB if not already done:

   ```bash
   docker exec -it hersafespace-api npx prisma migrate deploy
   ```

### Frontend (Vercel)

1. Push the repo to GitHub/GitLab/etc.
2. Import the `frontend/` folder into Vercel.
3. Configure environment variable:
   - `NEXT_PUBLIC_API_BASE_URL=https://your-api-domain` (where the backend is reachable)
4. Deploy. Vercel will build and host the Next.js app.

Make sure CORS and cookies work together:
- Backend `FRONTEND_ORIGIN` must match your Vercel URL.
- In production, use HTTPS and a proper `COOKIE_DOMAIN`.

---
## How Contributors Can Work on the Project

### Code Structure

- **Backend**
  - `src/` – Express app, routes, middleware, services
    - `routes/` – `auth`, `forum`, `resources`, `reports`, `uploads`
    - `middleware/` – auth, error handler, safety checks
    - `services/` – auth & safety logic
  - `prisma/` – Prisma schema and seed script

- **Frontend**
  - `app/` – Next.js App Router pages (landing, dashboard, auth, forum, resources, report, moderation)
  - `lib/` – API helper utilities
  - `styles/` & `tailwind.config.ts` – design system and global styles

### Suggested Contribution Workflow

1. **Pick an area**
   - Backend API improvements (new endpoints, better validation, logging)
   - Frontend UX/UI enhancements (accessibility, additional pages, more animations)
   - Content safety improvements (better rules, model integrations)

2. **Create a feature branch**

   ```bash
   git checkout -b feature/<short-description>
   ```

3. **Run locally and add tests**
   - Keep `npm run dev` running for both backend and frontend.
   - Add or update tests (especially for critical flows like auth and safety).

4. **Lint and format**
   - Backend: `npm run lint`
   - Frontend: `npm run lint`

5. **Open a Pull Request**
   - Clearly describe the change and which part of the system it affects.
   - If you change security or safety behavior, explain your reasoning and trade‑offs.

### Coding Guidelines

- Prefer **TypeScript** types and strict typing.
- Validate **all external input** (requests, env vars) with Zod or similar.
- Avoid logging sensitive data (passwords, tokens, PII).
- Design UI elements to be **accessible** (semantic HTML, focus states, contrast).
- Keep “Safety by Design” in mind: ask how each change affects user safety.

---
## Roadmap Ideas

Some possible future improvements for contributors:

- Integrate a stronger content moderation API or model
- Email/SMS notifications for critical reports
- Private group spaces or 1:1 chat with enhanced safety controls
- Localization for multiple African languages
- Rich media support (images, documents) with scanning
- Advanced analytics for moderators (report trends, response times)

---
## License & Credits

- License: MIT (or update to your chosen license)
- Built as part of the **Power Learn Hackathon** to empower African women and girls with safe digital spaces.

If you have questions or ideas, open an issue or start a discussion in the project tracker.