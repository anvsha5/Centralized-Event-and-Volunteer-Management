# Implementation Plan — Centralized Event & Volunteer Management Portal
## (Task-by-Task, Team-Splittable Build Guide — v3, FINAL)

---

## 0. How This Works

**Unit of work = a Task. Unit of ownership = a Block (3-4 tasks).** One team member claims one Block, works through its tasks in order feeding them to the AI IDE **one task at a time**, verifies each, then commits and merges the whole Block as one unit before the next dependent Block starts.

**Team workflow:**
1. Pick an unclaimed Block whose **Depends on** field is already merged to `main`.
2. Create a branch: `feature/<phase>-<block>-<shortname>` (e.g. `feature/p3-3a-registration-backend`).
3. Feed each task's prompt to the AI IDE **one at a time**, referencing `@docs/01-PRD.md`, `@docs/02-Design-Document.md`, `@docs/03-TRD.md` as needed.
4. Run the task's **Verify** step manually before starting the next task in the block.
5. After all tasks in the block pass verification, commit with message `[Block X.Y] <block name>` and open a PR.
6. Before merging, check the **Block PR Checklist** (Section 12).
7. Once merged, any Block that listed this one as a dependency can now start.

**Golden rules (apply to every single task below):**
- Never feed the AI IDE more than one task at a time.
- Paste each task's prompt **verbatim** — the "Do NOT" sentences are what prevent scope creep and hallucinated files/routes/fields.
- Always reference the exact doc + section named in the prompt, so the AI uses decided names, not invented ones.
- If the AI invents a file, field, or endpoint name not in the TRD, reject the output and re-run the task with an explicit correction.
- A Block is not "done" until every task in it is individually verified — don't commit partially-working blocks.

---

## 1. Block Dependency Map

```
Phase 0: Block 0.A (backend scaffold) -+
         Block 0.B (frontend scaffold)-+-> can run in parallel, both must merge before Phase 1

Phase 1: Block 1.A (auth backend) --+
         Block 1.B (auth frontend) -+-> 1.A must merge before 1.B starts

Phase 2: Block 2.A (event backend) --+
         Block 2.B (event frontend) -+-> 2.A before 2.B

Phase 3: Block 3.A (registration backend) --+
         Block 3.B (registration frontend) -+-> 3.A before 3.B; both need Phase 2 merged

Phase 4: Block 4.A (volunteer/task backend) --+
         Block 4.B (volunteer/task frontend) -+-> 4.A before 4.B; needs Phase 1 + Phase 2

Phase 5: Block 5.A (checkin/live backend) --+
         Block 5.B (checkin/live frontend) -+-> 5.A before 5.B; needs Phase 3 + Phase 4

Phase 6: Block 6.A (trust card backend) --+
         Block 6.B (trust card frontend) -+-> 6.A before 6.B; needs Phase 4

Phase 7: Block 7.A (resource inventory frontend) -> needs Phase 2 (endpoint already built there)

Phase 8: Block 8.A1 (issues backend) --+ (parallel, different collections)
         Block 8.A2 (notifications backend) -+
         Block 8.B (issues+notifications frontend) -> needs both 8.A1 and 8.A2 merged, + Phase 4

Phase 9: Block 9.A (timeline, backend+shared component) -> needs Phase 2 + Phase 4

Phase 10: Block 10.A (feedback/certificate backend) --+
          Block 10.B (feedback/certificate frontend) -+-> needs Phase 3 + Phase 5

Phase 11: Block 11.A (announcements backend) --+
          Block 11.B (announcements frontend) -+-> needs Phase 2

Phase 12: Block 12.A (analytics backend) --+
          Block 12.B (analytics frontend) -+-> needs Phase 3, 4, 8

Phase 13: Block 13.A (polish, whole team) -> last, needs everything merged
```

With 4 team members, a reasonable split once Phase 0/1/2 land: each person owns one backend-or-frontend Block per phase going forward, rotating so no one side (frontend/backend) becomes a bottleneck.

---

## Phase 0 — Foundation

### Block 0.A — Backend scaffold
**Depends on:** nothing (start here)

**Task 0.A.1 — Express + MongoDB boot**
Files: `/backend/server.js`, `/backend/package.json`, `/backend/.env.example`
```
Create a minimal Express.js backend in /backend. server.js connects to MongoDB via Mongoose
(MONGO_URI from env), exposes GET /health returning { status: "ok" }. package.json includes
express, mongoose, dotenv, cors, multer. Do NOT create models, routes, or business logic yet.
```
Verify: `npm start` boots, `/health` returns 200.

**Task 0.A.2 — All 12 Mongoose models**
Files: `/backend/models/*.js`
```
Using @docs/03-TRD.md section 4 EXACTLY, create one Mongoose model file per collection:
User.js, Event.js, Registration.js, VolunteerProfile.js, Task.js, TaskAssignment.js,
Checkin.js, Issue.js, Feedback.js, Certificate.js, Announcement.js, Notification.js.
Match every field name, type, enum, and index exactly as written -- including the new
category/sessions.room/resources fields on Event.js, and photoUrl/teamTag on Issue.js.
Do NOT add fields not listed. Do NOT create routes or controllers in this task.
```
Verify: all 12 files exist and match the TRD field-for-field; app still boots.

**Task 0.A.3 — Auth + role middleware**
Files: `/backend/middleware/auth.js`, `/backend/middleware/roleGuard.js`
```
Create auth.js (verifies a session token, attaches req.user) and roleGuard.js
(roleGuard(...roles) middleware factory). Do NOT implement OTP logic or wire these into any
routes yet -- that happens in Phase 1.
```
Verify: both files export correctly-shaped functions; nothing else references them yet.

**Task 0.A.4 — Static uploads route**
Files: `server.js` (add static middleware), `/backend/uploads/` (empty folder with `.gitkeep`)
```
In server.js, serve /backend/uploads as a static route at /uploads (for issue photos, per
@docs/03-TRD.md section 1). Only add the static middleware line and the folder -- no upload
logic yet, that's Phase 8.
```
Verify: a manually-placed test image in `/uploads` is reachable at `http://localhost:PORT/uploads/test.jpg`.

**Commit & merge Block 0.A** before starting any backend work in later phases.

---

### Block 0.B — Frontend scaffold
**Depends on:** nothing (can run parallel to 0.A)

**Task 0.B.1 — Vite React app + Tailwind tokens**
Files: `/frontend` (Vite React JS), `/frontend/tailwind.config.js`
```
Create a React (JavaScript) app in /frontend using Vite. Install and configure Tailwind CSS.
Set tailwind.config.js to EXACTLY match @docs/03-TRD.md section 7 plus the two additional
color tokens (violet-hospitality, gold-stage) from the v3 TRD. Do not invent additional
tokens. App.jsx renders only "App running" in the display font. No routing yet.
```
Verify: `npm run dev` shows correctly-styled placeholder text.

**Task 0.B.2 — Base Glass + Clay components**
Files: `/frontend/src/components/glass/GlassPanel.jsx`, `/frontend/src/components/clay/ClayButton.jsx`, `/frontend/src/components/clay/ClayChip.jsx`
```
Build three primitive components using the Tailwind tokens from Task 0.B.1, matching the
material specs in @docs/02-Design-Document.md section 2.3 exactly (blur, border-radius,
dual shadow for clay, pressed state). These are the base every other component composes
from. Do NOT build any page/route components yet.
```
Verify: a temporary test render in App.jsx shows correct visual styling (remove after confirming).

**Task 0.B.3 — Router + AuthContext skeleton**
Files: `/frontend/src/App.jsx`, `/frontend/src/context/AuthContext.jsx`
```
Set up React Router with placeholder empty routes for /login, /organizer, /volunteer,
/attendee. Create AuthContext.jsx storing { userId, role, token } with a Provider wrapping
the app. Do NOT implement actual login logic yet -- that's Phase 1.
```
Verify: navigating between the four placeholder routes works with no console errors.

**Commit & merge Block 0.B.**

---

## Phase 1 — Auth

### Block 1.A — Auth backend
**Depends on:** Block 0.A merged

**Task 1.A.1 — OTP request/verify**
Files: `/backend/routes/auth.js`, `/backend/controllers/authController.js`
```
Implement POST /api/auth/otp/request and POST /api/auth/otp/verify per @docs/03-TRD.md
section 5.1. On verify success, find-or-create a User doc, return a session token. Only
touch auth.js and authController.js.
```
Verify: request+verify flow creates a `users` doc and returns a valid token.

**Task 1.A.2 — GET /api/me + wire middleware**
Files: `/backend/routes/auth.js` (add route), `server.js` (mount middleware)
```
Add GET /api/me (protected by auth.js middleware) returning { id, name, email, role }.
Wire the auth middleware into server.js for all /api/* except /api/auth/*. Only these changes.
```
Verify: `/api/me` with a valid token returns the user; without, returns 401.

**Task 1.A.3 — Role assignment on first login**
Files: `/backend/controllers/authController.js`
```
Update the OTP verify logic so a brand-new user's role is set based on an `intent` query
param sent from the frontend (e.g. ?intent=volunteer), defaulting to 'attendee' if absent.
Only this logic change, no new endpoints.
```
Verify: verifying OTP with `?intent=volunteer` for a new email creates a user with role='volunteer'.

**Commit & merge Block 1.A.**

### Block 1.B — Auth frontend
**Depends on:** Block 1.A merged

**Task 1.B.1 — Login.jsx**
Files: `/frontend/src/routes/auth/Login.jsx`, `/frontend/src/api/auth.js`
```
Build Login.jsx per @docs/02-Design-Document.md section 5.1 using GlassPanel and ClayButton
from Block 0.B. Two-step: email input -> OTP input. Calls the endpoints from Block 1.A.
Only this screen.
```
Verify: full email->OTP->token flow works, token stored in AuthContext.

**Task 1.B.2 — Role-based redirect + protected routes**
Files: `/frontend/src/App.jsx`, `/frontend/src/components/ProtectedRoute.jsx`
```
On successful login, redirect to /organizer, /volunteer, or /attendee based on role from
GET /api/me. Build a ProtectedRoute wrapper that redirects to /login if no token exists.
Wrap the three placeholder role routes with it. Only these changes.
```
Verify: logging in as each role lands on the correct placeholder route; visiting a protected
route while logged out redirects to /login.

**Commit & merge Block 1.B.**

---

## Phase 2 — Event Creation (category, sessions+room, resources)

### Block 2.A — Event backend
**Depends on:** Block 1.A merged

**Task 2.A.1 — Create + get + list events**
Files: `/backend/routes/events.js`, `/backend/controllers/eventController.js`
```
Implement POST /api/events, GET /api/events/:id, GET /api/events?organizerId= using the
Event model exactly as defined (including category, sessions[] with room, resources[]).
Protect POST with roleGuard('organizer'). Only these three endpoints.
```
Verify: creating an event with a category, two sessions (each with a room), and two resource
line items persists correctly and is retrievable.

**Task 2.A.2 — Update event**
Files: `/backend/routes/events.js` (add route)
```
Implement PUT /api/events/:id, protected by roleGuard('organizer'), only allowing the
event's own organizerId to edit it. Only this endpoint.
```
Verify: editing capacity/sessions/resources on an existing event persists correctly.

**Task 2.A.3 — Resource status PATCH**
Files: `/backend/routes/events.js` (add route)
```
Implement PATCH /api/events/:id/resources/:resourceId { status } updating the specific
embedded resource subdocument via Mongoose's positional $ operator, per
@docs/03-TRD.md section 6.1. Only this endpoint.
```
Verify: toggling one resource's status to 'delivered' updates only that item, not others.

**Commit & merge Block 2.A.**

### Block 2.B — Event frontend
**Depends on:** Block 2.A merged

**Task 2.B.1 — Events list**
Files: `/frontend/src/routes/organizer/Events.jsx`, `/frontend/src/api/events.js`
```
Build Events.jsx: glass panel list of the organizer's own events with status badges.
Wire to GET /api/events?organizerId=me. Only this screen.
```
Verify: organizer sees their created events listed with correct status.

**Task 2.B.2 — Event creation/edit form**
Files: `/frontend/src/routes/organizer/EventForm.jsx`
```
Build EventForm.jsx per @docs/02-Design-Document.md section 5.3: four sub-sections
(Basics, Category as clay chip single-select, Sessions as repeatable clay cards with
title/room/start/end/topic, Resources as repeatable rows with name/quantity). Wire to
POST/PUT from Block 2.A. On publish, show the shareable registration link in a copyable box.
Only this screen.
```
Verify: creating an event with 2 sessions and 3 resources through the UI matches what's
stored in the database; editing works too.

**Commit & merge Block 2.B.**

---

## ✅ Phase 3 — Registration + QR

### 🟩 Block 3.A — Registration Backend
- [x] Task 3.A.1 — QR Service (`qrService.js`)
- [x] Task 3.A.2 — Registration Endpoint with MongoDB Transaction
- [x] Task 3.A.3 — Waitlist Auto-Promotion
- [x] All backend verification completed
- [x] Backend block completed

**Task 3.A.1 — QR service**
Files: `/backend/services/qrService.js`
```
Create qrService.js exporting generateQR(token) using the qrcode npm package, returning a
base64 QR image. Only this file, no route wiring yet.
```
Verify: calling the function directly with a test string returns a valid base64 image string.

**Task 3.A.2 — Registration endpoint with transaction**
Files: `/backend/routes/registrations.js`, `/backend/controllers/registrationController.js`
```
Implement POST /api/events/:id/register per @docs/03-TRD.md section 6.1. MUST use a MongoDB
transaction to atomically check capacity vs current 'registered' count and insert -- this is
explicitly a race-condition risk, do not use plain read-then-write. Generate qrToken via
crypto.randomUUID(), call qrService.generateQR(). Stub email sending with console.log.
Do NOT implement check-in yet.
```
Verify: two rapid concurrent registrations near capacity produce exactly one registered and
one waitlisted, never both registered past capacity.

**Task 3.A.3 — Waitlist auto-promotion**
Files: `/backend/controllers/registrationController.js` (add function), `/backend/routes/registrations.js` (add cancel route)
```
Implement PUT /api/registrations/:id/cancel: sets status to 'cancelled', then finds the
earliest 'waitlisted' registration for that event and promotes it to 'registered', generating
a fresh qrToken for them. Only this endpoint.
```
Verify: cancelling a registered attendee correctly promotes the oldest waitlisted one with a new QR.

**Commit & merge Block 3.A.**

### 🟩 Block 3.B — Registration Frontend
- [x] Task 3.B.1 — Public Event Page
- [x] Task 3.B.2 — Registration Form + QR Reveal
- [x] Task 3.B.3 — My Ticket Page
- [x] All frontend verification completed
- [x] Frontend block completed

**Task 3.B.1 — Public event page**
Files: `/frontend/src/routes/attendee/EventPage.jsx`
```
Build the public EventPage.jsx (no login required to view) showing event details including
category badge and session list, per @docs/02-Design-Document.md. Only this screen.
```
Verify: opening the public link shows correct event details without requiring login.

**Task 3.B.2 — Registration form + QR reveal**
Files: `/frontend/src/routes/attendee/RegisterForm.jsx`
```
Build RegisterForm.jsx, submitting to Block 3.A's endpoint. On success, transition in place
(no redirect) to show the returned QR image on a clean card, per section 5.8 of the Design
Document. Only this screen.
```
Verify: registering shows the QR immediately without a page reload.

**Task 3.B.3 — My Ticket page**
Files: `/frontend/src/routes/attendee/MyTicket.jsx`, `/frontend/src/api/registrations.js`
```
Build MyTicket.jsx fetching GET /api/registrations/:id and showing the same QR card layout,
reachable from the attendee's dashboard nav. Only this screen.
```
Verify: navigating to My Ticket after registering shows the same QR.

**Commit & merge Block 3.B.**

### ✅ Phase 3 Milestones
- [x] QR generation implemented
- [x] Registration endpoint with atomic capacity handling implemented
- [x] Waitlist auto-promotion working
- [x] Public event page completed
- [x] Registration flow completed
- [x] QR displayed immediately after successful registration
- [x] My Ticket page completed
- [x] Phase 3 marked as COMPLETE


---

## Phase 4 — Volunteer Onboarding + AI-Ranked Task Assignment

### Block 4.A — Volunteer/task backend
**Depends on:** Block 1.A + Block 2.A merged

**Task 4.A.1 — Volunteer profile + task creation**
Files: `/backend/routes/volunteers.js`, `/backend/routes/tasks.js`
```
Implement POST /api/volunteer-profiles (VolunteerProfile model) and POST /api/tasks
(Task model, roleGuard('organizer')). Only these two endpoints, no assignment logic yet.
```
Verify: both endpoints create correctly-shaped documents.

**Task 4.A.2 — Suggested-volunteers formula endpoint**
Files: `/backend/controllers/taskController.js`
```
Implement GET /api/tasks/:taskId/suggested-volunteers using the EXACT plain-JavaScript
weighted formula in @docs/03-TRD.md section 6.2: skillMatch*0.5 + availabilityMatch*0.3 +
(reliabilityScore||0.5)*0.2. This is NOT an LLM call -- do not add one. Return volunteers
sorted descending by score. Only this endpoint.
```
Verify: calling this for a task returns a correctly sorted list with visibly different scores
across volunteers with different skills/availability.

**Task 4.A.3 — Assign + status update**
Files: `/backend/routes/tasks.js` (add routes)
```
Implement POST /api/tasks/:taskId/assign (creates TaskAssignment, status 'assigned') and
PUT /api/task-assignments/:id/status (updates status to completed/no_show/cancelled).
Only these two endpoints.
```
Verify: assigning creates a doc; updating status persists correctly.

**Task 4.A.4 — My tasks endpoint**
Files: `/backend/routes/volunteers.js` (add route)
```
Implement GET /api/volunteers/me/tasks joining TaskAssignment with Task for the current
logged-in volunteer. Only this endpoint.
```
Verify: a volunteer with 2 assignments sees exactly those 2 tasks with correct details.

**Commit & merge Block 4.A.**

### Block 4.B — Volunteer/task frontend
**Depends on:** Block 4.A merged

**Task 4.B.1 — Onboarding form**
Files: `/frontend/src/routes/volunteer/Onboarding.jsx`
```
Build Onboarding.jsx: skill tag multi-select (ClayChip), availability picker, submits to
Block 4.A's volunteer-profiles endpoint. Only this screen.
```
Verify: completing onboarding creates a visible volunteerProfiles doc.

**Task 4.B.2 — Task board with AI-ranked suggestions**
Files: `/frontend/src/routes/organizer/Volunteers.jsx`
```
Build the task board per @docs/02-Design-Document.md section 5.5: create-task form, columns
Unassigned/Assigned/Completed, "Suggest volunteers" opening a glass dropdown with ranked
volunteers shown as teal score bars, click to assign. Only this screen.
```
Verify: creating a task, viewing suggestions, and assigning all work end to end through the UI.

**Task 4.B.3 — My Tasks page**
Files: `/frontend/src/routes/volunteer/MyTasks.jsx`
```
Build MyTasks.jsx per section 5.9 of the Design Document: clay task cards with title, time,
location, status toggle. "Open scanner" CTA links to a placeholder route for now (Scanner.jsx
is Phase 5). Only this screen.
```
Verify: a volunteer sees their assigned tasks correctly.

**Commit & merge Block 4.B.**

---

## Phase 5 — Check-in + Live Dashboard

### Block 5.A — Check-in/live backend
**Depends on:** Block 3.A + Block 4.A merged

**Task 5.A.1 — Check-in endpoint with duplicate detection**
Files: `/backend/routes/checkins.js`, `/backend/controllers/checkinController.js`
```
Implement POST /api/checkins per @docs/03-TRD.md section 6.1: validate token+event match,
check not already checked in/out appropriately, reject duplicate scans of the same
registrationId+type within 10 seconds with a specific error message. Only this endpoint.
```
Verify: a valid scan succeeds once; an immediate repeat scan is rejected with a clear reason,
not a generic 500.

**Task 5.A.2 — Manual override search**
Files: `/backend/routes/registrations.js` (add route)
```
Implement GET /api/registrations?eventId=&query= searching by partial name/phone. Only this endpoint.
```
Verify: searching a partial name returns the correct registration.

**Task 5.A.3 — Extended live aggregation**
Files: `/backend/routes/checkins.js` (add route)
```
Implement GET /api/events/:id/checkins/live returning ALL EIGHT fields from
@docs/01-PRD.md section 4.9: registered, checkedIn, inside, left, capacity, occupancyPercent,
activeVolunteers (count of TaskAssignments with status 'assigned' for this event, current
time within shift window), eventStatus (from the Event doc). Only this endpoint.
```
Verify: all eight fields return correct values matching manually-verified test data.

**Commit & merge Block 5.A.**

### Block 5.B — Check-in/live frontend
**Depends on:** Block 5.A merged

**Task 5.B.1 — Scanner screen**
Files: `/frontend/src/routes/volunteer/Scanner.jsx`
```
Build Scanner.jsx per @docs/02-Design-Document.md section 5.10: full-bleed camera via
html5-qrcode, glass viewfinder, calls POST /api/checkins, teal/coral result tint with name
and reason. Include manual-override search icon wired to Block 5.A's search endpoint.
Do NOT build the "Report an issue" button yet -- that's Phase 8.
```
Verify: scanning a real QR from Phase 3 shows a correct pass result.

**Task 5.B.2 — StatDome + VitalsStrip components**
Files: `/frontend/src/components/clay/StatDome.jsx`, `/frontend/src/components/glass/VitalsStrip.jsx`
```
Build StatDome.jsx (the signature glass+clay hybrid, pulse-on-change animation per
@docs/02-Design-Document.md section 3) and VitalsStrip.jsx (compact glass bar, mono values,
status dot per section 5.2). Only these two components, no page wiring yet.
```
Verify: both components render correctly with sample static props.

**Task 5.B.3 — Live dashboard page**
Files: `/frontend/src/routes/organizer/Live.jsx`, `/frontend/src/hooks/usePolling.js`
```
Build usePolling.js (generic 3-5s interval fetch hook) and Live.jsx using it to poll Block
5.A's live endpoint, rendering 4 StatDomes (Registered/Checked-in/Inside/Left) plus the
VitalsStrip (Capacity/Occupancy%/Active Volunteers/Status) below. Only this screen.
```
Verify: a check-in from Task 5.B.1 is reflected on this dashboard within one poll cycle,
with all 8 values correct.

**Commit & merge Block 5.B.**

---

## Phase 6 — Volunteer Trust Card

### Block 6.A — Trust card backend
**Depends on:** Block 4.A merged

**Task 6.A.1 — Reliability score service**
Files: `/backend/services/reliabilityService.js`
```
Create recalculateScore(volunteerId): aggregates that volunteer's TaskAssignments
(completed / (completed + no_show)), updates VolunteerProfile.reliabilityScore. Call it from
the existing PUT /api/task-assignments/:id/status endpoint after a status change. Only this
service + the one line wiring it into the existing endpoint.
```
Verify: marking an assignment 'no_show' lowers that volunteer's score correctly.

**Task 6.A.2 — AI service: volunteer summary + skill-match**
Files: `/backend/services/aiService.js`
```
Create aiService.js exporting summarizeVolunteer(stats) -- sends { skills, reliabilityScore,
completedCount, noShowCount, recentTaskTitles } to the Anthropic API for a 1-2 sentence
factual reliability summary -- and a second function summarizeSkillMatch(stats) for a
separate 1-2 sentence paragraph on how well completed tasks matched stated skills, per
@docs/01-PRD.md section 4.7. Both return "No task history yet" without an API call if
reliabilityScore is null. Only these two functions in this task.
```
Verify: both functions return coherent grounded text with sample seeded stats, and the
correct fallback with null data.

**Task 6.A.3 — Trust card endpoint**
Files: `/backend/routes/volunteers.js` (add route)
```
Implement GET /api/volunteers/:id/trust-card gathering stats and calling both AI functions
from Task 6.A.2, returning { skills, reliabilityScore, reliabilitySummary, skillMatchSummary,
recentTasks }. Only this endpoint.
```
Verify: the endpoint returns all fields correctly for a seeded volunteer.

**Commit & merge Block 6.A.**

### Block 6.B — Trust card frontend + seed
**Depends on:** Block 6.A merged

**Task 6.B.1 — TrustCard.jsx**
Files: `/frontend/src/routes/organizer/TrustCard.jsx`
```
Build TrustCard.jsx as a sliding glass panel per @docs/02-Design-Document.md section 5.5:
skill chips, circular reliability ring, both AI paragraphs grouped in one amber sub-panel
under a single "AI" label chip. Wire it to open from Volunteers.jsx (Task 4.B.2) when
clicking a volunteer's name. Only this component + the one-line wiring into Volunteers.jsx.
```
Verify: clicking a volunteer shows their real Trust Card data.

**Task 6.B.2 — Volunteer's own Trust Card view**
Files: `/frontend/src/routes/volunteer/MyTrustCard.jsx`
```
Build a read-only route reusing the TrustCard component from Task 6.B.1 for the volunteer's
own profile, reachable from their dashboard. Only this screen.
```
Verify: a volunteer sees their own correct Trust Card.

**Task 6.B.3 — Seed script**
Files: `/backend/seed/seedVolunteers.js`
```
Create a standalone script creating 8-10 fake VolunteerProfile docs with varied skills and
15-20 fake TaskAssignment docs with mixed completed/no_show statuses, running
recalculateScore for each afterward. Only this script.
```
Verify: running it populates realistic-looking Trust Cards without manual data entry.

**Commit & merge Block 6.B.**

---

## Phase 7 — Resource Inventory (frontend only — backend endpoint already exists from Block 2.A)

### Block 7.A — Resource inventory frontend
**Depends on:** Block 2.A merged

**Task 7.A.1 — ResourceChecklistItem component**
Files: `/frontend/src/components/clay/ResourceChecklistItem.jsx`
```
Build a clay checklist row component: resource name, quantity needed, toggle switch
(pending/delivered), delivered items visually recede per @docs/02-Design-Document.md
section 5.4. Only this component.
```
Verify: toggling the switch visually updates state correctly in isolation.

**Task 7.A.2 — ResourceInventory.jsx page**
Files: `/frontend/src/routes/organizer/ResourceInventory.jsx`
```
Build the page listing an event's resources using the component from Task 7.A.1, wired to
PATCH /api/events/:id/resources/:resourceId (already built in Block 2.A). Empty-pending
state shows "Everything's arrived." Only this screen.
```
Verify: toggling a resource persists after a page refresh.

**Commit & merge Block 7.A.**

---

## Phase 8 — Issue Reporting (photo + team tag) + Notifications

### Block 8.A1 — Issues backend
**Depends on:** Block 0.A.4 (uploads folder) merged

**Task 8.A1.1 — Upload service**
Files: `/backend/services/uploadService.js`
```
Configure multer to accept a single image field (max 5MB), saving to /backend/uploads/issues/
with a unique filename, exporting middleware ready to drop into a route. Only this file.
```
Verify: a manual test upload via Postman saves the file and returns a usable path.

**Task 8.A1.2 — Create + list issues**
Files: `/backend/routes/issues.js`, `/backend/controllers/issueController.js`
```
Implement POST /api/events/:id/issues (multipart/form-data, using Task 8.A1.1's upload
middleware, fields: type, location, priority, teamTag, photo) and
GET /api/events/:id/issues?teamTag= using the Issue model exactly, including the compound
index from @docs/03-TRD.md section 4.8. Only these two endpoints.
```
Verify: submitting with a photo creates a doc with a working photoUrl; filtering by teamTag
returns only matching issues.

**Task 8.A1.3 — Update issue status**
Files: `/backend/routes/issues.js` (add route)
```
Implement PUT /api/issues/:id updating status (and setting resolvedAt when status becomes
'resolved'). Only this endpoint.
```
Verify: status transitions persist correctly, resolvedAt is set only on resolution.

**Commit & merge Block 8.A1.**

### Block 8.A2 — Notifications backend
**Depends on:** Block 0.A.2 (Notification model) + Block 4.A merged

**Task 8.A2.1 — Notification triggers on task events**
Files: `/backend/controllers/taskController.js` (add notification inserts)
```
In the existing assign and status-update endpoints from Block 4.A, add a Notification insert
after each successful action: type 'task_assigned' on assign, type 'task_updated' or
'shift_changed' on relevant updates. Only add these insert calls, do not change existing
endpoint behavior otherwise.
```
Verify: assigning a task creates a matching notifications doc for that volunteer.

**Task 8.A2.2 — Notifications GET/PATCH**
Files: `/backend/routes/notifications.js`
```
Implement GET /api/notifications/me?unread=true and PATCH /api/notifications/:id/read.
Only these two endpoints.
```
Verify: both work correctly for the logged-in volunteer.

**Task 8.A2.3 — Event-reminder scheduled check**
Files: `/backend/services/reminderService.js`, `server.js` (start the interval)
```
Create a setInterval (every 60 seconds) that finds events starting in 25-35 minutes and
inserts an 'event_reminder' Notification for every volunteer with an active TaskAssignment
on that event, avoiding duplicate inserts for the same event (check if one was already sent).
Only this service + the one line starting it in server.js.
```
Verify: manually setting a test event's startTime to 30 minutes from now produces exactly
one reminder notification per relevant volunteer.

**Commit & merge Block 8.A2.**

### Block 8.B — Issues + notifications frontend
**Depends on:** Block 8.A1 + Block 8.A2 merged

**Task 8.B.1 — Report Issue form**
Files: `/frontend/src/routes/volunteer/ReportIssue.jsx`, add "Report an issue" button to Scanner.jsx from Block 5.B
```
Build ReportIssue.jsx: type dropdown, location, priority, photo capture/upload, team tag
selector (per @docs/02-Design-Document.md section 5.10). Add the pinned clay button on
Scanner.jsx opening this form. Only these changes.
```
Verify: submitting with a photo creates a correctly-tagged issue.

**Task 8.B.2 — Issue triage board with team filter + photos**
Files: `/frontend/src/routes/organizer/Issues.jsx`
```
Build the kanban board per section 5.6 of the Design Document: three columns, Team Tag Chip
+ Photo Thumbnail (tap to expand into a glass lightbox) on each card, filter row of team
chips above the board, polling every 3-5s. Only this screen.
```
Verify: an issue with a photo from a test volunteer device appears correctly, filterable by team.

**Task 8.B.3 — Notification feed**
Files: `/frontend/src/routes/volunteer/NotificationFeed.jsx`, wire into MyTasks.jsx from Block 4.B
```
Build NotificationFeed.jsx per section 5.9 of the Design Document: compact glass rows,
unread teal dot, tap to mark read + navigate to related item. Place it above the task list
on MyTasks.jsx, polling on the same interval as the task list. Only these changes.
```
Verify: assigning a task to a volunteer produces a visible feed entry without a manual refresh.

**Commit & merge Block 8.B.**

---

## Phase 9 — Event Timeline

### Block 9.A — Timeline backend + shared component
**Depends on:** Block 2.A + Block 4.A merged

**Task 9.A.1 — Timeline endpoint**
Files: `/backend/routes/events.js` (add route)
```
Implement GET /api/events/:id/timeline per @docs/03-TRD.md section 6.5: merge event.sessions
and TaskAssignment-joined-Task shifts into one sorted array of
{ time, type: 'session'|'shift', title, location, assignedTo (volunteerId, for shifts) }.
Only this endpoint.
```
Verify: the returned array is correctly time-sorted and includes both sessions and shifts.

**Task 9.A.2 — TimelineRail component + role-scoped pages**
Files: `/frontend/src/components/glass/TimelineRail.jsx`, `/frontend/src/routes/organizer/EventTimeline.jsx`, thin wrapper routes for volunteer/attendee
```
Build TimelineRail.jsx per @docs/02-Design-Document.md section 5.7: vertical teal rail, clay
dot markers, clay entry cards. Build one organizer page calling the endpoint from Task 9.A.1,
then thin wrapper routes for volunteer (/volunteer/timeline) and attendee (/attendee/timeline)
that reuse the SAME component, passing the current user's id/registrationId as a prop to
control highlighting client-side -- per the "one shared component" decision in the Design
Document. Do NOT build three separate timeline implementations.
```
Verify: the organizer view shows everything; the volunteer view highlights only their own
shifts; the attendee view highlights only their registered session.

**Commit & merge Block 9.A.**

---

## Phase 10 — Feedback + Certificate (locked gate: register -> checkin -> feedback -> certificate)

### Block 10.A — Feedback/certificate backend
**Depends on:** Block 3.A + Block 5.A merged

**Task 10.A.1 — Feedback endpoint**
Files: `/backend/routes/feedback.js`
```
Implement POST /api/registrations/:id/feedback using the Feedback model's unique index on
registrationId to naturally reject duplicates with a 409 -- do not add extra duplicate-check
logic beyond letting the DB constraint do its job. Only this endpoint.
```
Verify: submitting feedback twice for the same registration returns 409, not a duplicate doc.

**Task 10.A.2 — Certificate service + two-stage gate**
Files: `/backend/services/certificateService.js`, `/backend/routes/registrations.js` (add route)
```
Create generateCertificate(registration) producing a simple placeholder PDF/text (name +
event + date). Implement GET /api/registrations/:id/certificate per @docs/03-TRD.md
section 6.6: FIRST check a Checkin doc exists (type=checkin) for this registration -- if not,
return 403 with message "attendance_required". THEN check Feedback exists -- if not, return
403 with message "feedback_required". Only if both pass, generate-or-return the Certificate
doc. Only these changes.
```
Verify: a registered-but-never-checked-in attendee gets "attendance_required" even after
submitting feedback; a checked-in attendee without feedback gets "feedback_required"; both
conditions met returns the certificate.

**Commit & merge Block 10.A.**

### Block 10.B — Feedback/certificate frontend
**Depends on:** Block 10.A merged

**Task 10.B.1 — Feedback form**
Files: `/frontend/src/routes/attendee/Feedback.jsx`
```
Build Feedback.jsx: 5 clay circular rating buttons in a row, optional comment field, submits
to Block 10.A's endpoint. Only this screen.
```
Verify: submitting feedback works and a second attempt shows a clear "already submitted" message.

**Task 10.B.2 — Certificate page with two distinct disabled states**
Files: `/frontend/src/routes/attendee/Certificate.jsx`
```
Build Certificate.jsx per @docs/02-Design-Document.md section 5.12: reads the specific 403
reason from Block 10.A's endpoint and shows the matching message -- "Certificate available
for attendees who checked in" for attendance_required, "Download certificate -- share your
feedback first" for feedback_required. Never show a generic locked message. Only this screen.
```
Verify: both disabled states show the correct, distinct copy in the right scenario; the
button correctly enables once both conditions are met.

**Commit & merge Block 10.B.**

---

## Phase 11 — Announcements

### Block 11.A — Announcements backend
**Depends on:** Block 2.A merged

**Task 11.A.1 — Send + fetch announcements**
Files: `/backend/routes/announcements.js`
```
Implement POST /api/events/:id/announcements and GET /api/events/:id/announcements?sessionId=
using the Announcement model. If target.type is 'session' but the event has no sessions,
fall back to 'all' per @docs/01-PRD.md section 4.14 edge case. Only these two endpoints.
```
Verify: a session-targeted announcement is retrievable filtered by session, and falls back
correctly on a sessionless event.

**Commit & merge Block 11.A** (single-task block, no need to wait for a second task).

### Block 11.B — Announcements frontend
**Depends on:** Block 11.A merged

**Task 11.B.1 — Compose UI**
Files: `/frontend/src/routes/organizer/Announcements.jsx`
```
Build the compose form: message + target selector (all / specific session dropdown from the
event's sessions). Wire to Block 11.A. Only this screen.
```
Verify: sending works and the announcement is stored with the correct target.

**Task 11.B.2 — Attendee feed**
Files: small feed component embedded in the attendee dashboard
```
Build a compact announcement feed fetching GET from Block 11.A, scoped to the attendee's
own registration's sessionId (or 'all'). Only this component.
```
Verify: an attendee only sees announcements targeted at "all" or their own session, never others'.

**Commit & merge Block 11.B.**

---

## Phase 12 — Analytics (expanded) + AI Report

### Block 12.A — Analytics backend
**Depends on:** Block 3.A + Block 4.A + Block 8.A1 merged

**Task 12.A.1 — Funnel endpoint**
Files: `/backend/routes/analytics.js`
```
Implement GET /api/events/:id/analytics/funnel: registered count, checked-in count,
drop-off %. Only this endpoint.
```
Verify: returns accurate numbers against test data.

**Task 12.A.2 — Extended metrics aggregation**
Files: `/backend/routes/analytics.js` (add route)
```
Implement GET /api/events/:id/analytics/extended computing, per @docs/03-TRD.md section 6.7:
peakEntryTime, peakExitTime, mostCrowdedHall, averageStayTime, volunteerPerformance (average
reliabilityScore across the event's assigned volunteers), issueCount (grouped by teamTag with
resolved/unresolved breakdown). Only this endpoint.
```
Verify: each of the six values computes correctly against seeded/test data.

**Task 12.A.3 — AI narrative update**
Files: `/backend/services/aiService.js` (add function)
```
Add summarizeAnalytics(funnelData, extendedData) to aiService.js, sending BOTH payloads
combined to the Anthropic API for a 3-4 sentence grounded narrative covering the funnel plus
at least one of the new metrics. If checkedIn count is 0, return "Not enough data yet"
without an API call. Only this function + a route to expose it at
GET /api/events/:id/analytics/summary.
```
Verify: with real test data, the summary reads coherently and references real numbers; with
zero check-ins, returns the fallback.

**Commit & merge Block 12.A.**

### Block 12.B — Analytics frontend
**Depends on:** Block 12.A merged

**Task 12.B.1 — Analytics page**
Files: `/frontend/src/routes/organizer/Analytics.jsx`
```
Build Analytics.jsx per @docs/02-Design-Document.md section 5.8: funnel chart panel, new
metrics row (4 compact stat cards), volunteer performance + issue count panel, amber
AI-summary panel visually separated below, "Copy report" button. Only this screen.
```
Verify: all sections render correctly with real data from a full test run-through.

**Commit & merge Block 12.B.**

---

## Phase 13 — Polish Pass (whole team, only after every block above is merged)

### Block 13.A — Final polish
**Depends on:** every prior block merged

**Task 13.A.1 — Empty/error state audit**
```
Go through every screen listed in @docs/02-Design-Document.md sections 5.1-5.12. For each,
verify empty/error states match the specific copy given (not generic "No data"/"Error").
List mismatches, fix only those.
```

**Task 13.A.2 — Accessibility pass**
```
Apply @docs/02-Design-Document.md section 6 (contrast, focus rings, non-color-dependent cues,
640px breakpoint including the Vitals Strip and Analytics metrics row 2-column collapse)
across all built screens. Only accessibility-related adjustments, no layout/copy redesign.
```

**Task 13.A.3 — Demo data refresh**
```
Re-run the seed script from Block 6.B.3, create one full test event with sessions/resources,
run one attendee through register->QR->checkin->feedback->certificate, and one volunteer
through onboarding->assignment->task completion, so the demo has real, fresh data --
especially important if using local disk photo storage per @docs/03-TRD.md section 8, which
doesn't persist across redeploys.
```

**No commit needed beyond normal fixes** — this is a verification/cleanup pass, not new feature work.

---

## 12. Block PR Checklist (before merging any block)
- [ ] Every task in the block was fed to the AI IDE one at a time, not combined
- [ ] Every task's Verify step passed manually
- [ ] No files outside the block's listed scope were modified
- [ ] No invented field/route/file names — everything matches PRD/Design/TRD exactly
- [ ] Commit message references the Block ID (e.g. `[Block 5.A] Check-in/live backend`)
- [ ] If this block's dependency isn't merged yet, do not open the PR — rebase after it lands
