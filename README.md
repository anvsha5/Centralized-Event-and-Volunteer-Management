# Centralized Event & Volunteer Management Portal

A full-stack event operations platform for organizers, volunteers, and attendees — live check-ins, task assignment, issue triage, analytics, and AI-assisted summaries.

## Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a remote `MONGO_URI`)

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs at `http://localhost:5000`. Health check: `GET /health`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 3. Seed demo data (optional)

```bash
cd backend
npm run seed        # volunteers, tasks, trust-card history
npm run seed:demo   # above + sample attendees, check-ins, issues
```

## Environment variables

| Variable | Location | Required | Notes |
|---|---|---|---|
| `MONGO_URI` | backend `.env` | Yes | MongoDB connection string |
| `PORT` | backend `.env` | No | Default `5000` |
| `ANTHROPIC_API_KEY` | backend `.env` | No | Enables Claude AI summaries; without it, template fallbacks are used |
| `ANTHROPIC_MODEL` | backend `.env` | No | Default `claude-3-5-sonnet-20241022` |
| `VITE_API_URL` | frontend `.env` | No | Default `http://localhost:5000/api` |

## Auth (dev/demo)

Login uses email OTP. In development, OTP is always **`123456`** (logged to the backend console on request).

Use `?intent=organizer|volunteer|attendee` on first login to set role for new users.

### Seed accounts (after `npm run seed`)

| Role | Email |
|---|---|
| Organizer | `organizer.seed@example.com` |
| Volunteer | `volunteer.seed1@example.com` … `volunteer.seed10@example.com` |

## Demo walkthrough

1. **Organizer** — log in as `organizer.seed@example.com`, OTP `123456`
   - **Events** — view TechRush Demo Event
   - **Resources** — toggle delivery status on inventory items
   - **Live Dashboard** — see registered / checked-in / inside / left counts
   - **Volunteers & Tasks** — create tasks, view AI-ranked suggestions, open Trust Cards
   - **Issue Triage** — review seeded issues by team tag
   - **Timeline** — sessions + volunteer shifts on one rail
   - **Analytics** — funnel, extended metrics, AI event summary

2. **Volunteer** — log in as `volunteer.seed1@example.com`
   - **My Tasks** — assigned shifts + notification feed
   - **Scanner** — QR check-in (use a ticket from a registered attendee)
   - **Report Issue** — submit with photo + team tag
   - **Trust Card** — reliability score + AI notes

3. **Attendee** — register at `/events/:id/public` or log in as attendee
   - Register → receive QR ticket → check in → feedback → certificate

## Project docs

- [PRD](docs/01-PRD.md)
- [Design Document](docs/02-Design-Document.md)
- [TRD](docs/03-TRD.md)
- [Implementation Plan](docs/04-Implementation.md)

## AI summaries

Analytics and Trust Card “AI” blocks call Anthropic Claude when `ANTHROPIC_API_KEY` is set. Without a key, the app silently uses **template-based fallback text** built from real metrics — the UI still works for demos.
