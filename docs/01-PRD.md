# PRD — Centralized Event & Volunteer Management Portal
## (FINAL — v3)

---

## 1. Problem Statement

College event organizing (hackathons, workshops, seminars, concerts, TEDx-style talks, sports events, placement drives) currently runs on scattered Google Forms, Excel sheets, and WhatsApp groups. This causes duplicated manual work, no real-time visibility during the event, no accountability trail for volunteers, no systematic issue handling, and no tracking of physical resources (projectors, mics, chairs, etc.) needed to actually run the event.

## 2. Objective

One connected platform covering the full event lifecycle — creation → registration → volunteer coordination → resource planning → live check-in → issue handling → feedback → certificates → post-event reporting — replacing every spreadsheet/WhatsApp step with one system.

## 3. Roles — Capability Matrix

Three roles for MVP: **Organizer (Admin)**, **Volunteer**, **Attendee**.

| Capability | Organizer | Volunteer | Attendee |
|---|:---:|:---:|:---:|
| Create/edit/publish/close event | Yes | No | No |
| Set event category, sessions, resource needs | Yes | No | No |
| Register for an event | Rare/edge case | No | Yes |
| View/export attendee list | Yes | No | No |
| Sign up as volunteer (skills/availability) | No | Yes (self) | No |
| Create tasks, view AI-suggested volunteers, assign | Yes | No | No |
| View own assigned tasks + notification feed | — | Yes (self) | — |
| View own Trust Card | — | Yes (self) | — |
| View any volunteer's Trust Card | Yes (any) | No | No |
| Operate QR scanner (check-in/out) | No (manual override only) | Yes | No |
| View live dashboard (all fields) | Yes | No | No |
| Mark resource as delivered/pending | Yes | Yes (assigned resource tasks) | No |
| Report an issue (with photo) | Yes (rare) | Yes (primary) | No |
| View/triage issue board | Yes | No | No |
| Send announcements | Yes | No | No |
| Receive announcements/notifications | — | Yes (task-relevant) | Yes (session-relevant) |
| Submit feedback | No | No | Yes |
| Download certificate (feedback-gated) | No | No | Yes |
| View analytics + AI report | Yes | No | No |
| View event timeline | Yes | Yes | Yes (own schedule) |

---

## 4. Feature Specifications

---

### 4.1 Authentication & Role Routing
Single login (email OTP), role resolved server-side, routes to the correct dashboard. No change from prior spec.

---

### 4.2 Event Creation & Management (updated)

**Fields now included:**
- Title, Description, Venue, Capacity, Date/Time, Registration Deadline
- **Category** — enum: Hackathon, Workshop, Seminar, Concert, TEDx, Sports, Other
- **Sessions** — each session now has: title, **room/venue**, start time, end time, topic (e.g. "AI in Healthcare — Room 204 — 10:00 AM" as a distinct entry from "Sustainable Cities — Room 105 — 11:30 AM" under the same TEDx event)
- **Resource requirements** — list of `{ resourceName, quantityNeeded }` e.g. Projector: 2, Camera: 2, Mic: 4, Laptop: 15, Extension Boards: 8

**Flow:** organizer fills all of the above in the event form, publishes, gets a shareable registration link — same mechanics as before, just a richer form.

**Acceptance criteria:** organizer can define category, multiple sessions with rooms, and a resource checklist, all in one event creation flow.

---

### 4.3 Attendee Registration + Waitlist
Unchanged from prior spec: registration checks capacity, over-capacity goes to waitlist, cancellations auto-promote the earliest waitlisted registration with a fresh notification + QR.

---

### 4.4 QR Ticket Generation
Unchanged: one unique, signed/UUID token per registration, not a guessable ID.

---

### 4.5 Volunteer Onboarding (Skills & Availability)
Unchanged: skill tags + availability, feeds AI-ranked assignment.

---

### 4.6 Task Creation & AI-Ranked Assignment
Unchanged: organizer creates tasks, gets a ranked volunteer shortlist scored on skill match + availability + reliability, assigns with one click.

---

### 4.7 Volunteer Trust Card (AI Summary + AI Feedback)

**Description:** Organizer (any volunteer) or volunteer (own profile) view showing reliability score, skill badges, and two AI-generated pieces of text:
1. A reliability summary (as before)
2. **A genuine performance report** — how well the volunteer's actual completed tasks matched their stated skills, generated from task-completion data, e.g. *"Assigned to 5 tech-support tasks, completed all 5 with no delays reported — strong match to stated skills."*

**Inputs:** volunteer stats (skills, task history, completion/no-show counts, any issues raised against tasks they owned)
**Outputs:** reliability %, skill-match summary, AI performance paragraph

**Edge cases:** zero-history volunteer shows "No task history yet," not a fabricated summary.

---

### 4.8 QR Check-in / Check-out (Volunteer-Operated)
Unchanged: volunteer scans, attendee never self-checks-in, manual override by name/phone search for damaged QR/no phone (acknowledged as a rare case, still built for robustness).

---

### 4.9 Live Attendance Dashboard (expanded fields)

**Now displays:**
- Registered
- Checked In
- Inside
- Left
- **Capacity**
- **Occupancy %** (Inside / Capacity)
- **Active Volunteers** (count of volunteers with an `assigned` or `in_progress` task right now)
- **Event Status** (Upcoming / Live / Closed / Cancelled)

**Flow:** same polling mechanism as before (3-5s), aggregation extended to compute the four new fields alongside the original four.

**Acceptance criteria:** all eight values update correctly and in sync during a live test run.

---

### 4.10 Resource Inventory Management (NEW)

**Description:** Tracks the physical resources an event needs (projectors, mics, cameras, chairs, extension boards, etc.) and whether each has arrived/been set up.

**Who:** Organizer manages the list; Volunteer (or organizer) marks items delivered.

**Flow:**
1. At event creation (4.2), organizer lists resources needed with quantities
2. Each resource item has a status: `pending` → `delivered`
3. Organizer or an assigned volunteer flips the status when the item physically arrives
4. Dashboard shows a simple checklist view: what's arrived, what's still pending, so nobody has to ask "where are the chairs?" manually

**Inputs:** resourceName, quantityNeeded, status
**Outputs:** resource checklist per event

**Depends on:** Event Creation
**Feeds into:** nothing downstream for MVP — standalone operational visibility feature

**Edge cases:** partial delivery (e.g. 6 of 8 extension boards arrived) — MVP tracks binary delivered/pending per line item, not partial-quantity tracking, to keep this simple; if partial tracking is needed, note quantity arrived vs needed as a stretch goal.

**Acceptance criteria:** organizer can see, at a glance, which requested resources have arrived and which haven't, without calling anyone.

---

### 4.11 Issue Reporting & Triage (expanded)

**Description:** Volunteers report on-ground problems with a structured form, now including a **photo** and a **team category tag**, so it doesn't just land generically on the organizer — it's visible with photo evidence and routed toward the right team.

**Flow:**
1. Volunteer opens "Report Issue": type (dropdown), location, priority, **photo (camera/upload)**, **team tag** (e.g. Technical, Hospitality, Stage, General)
2. Submits → creates `issues` row with photo URL and team tag, status = `new`
3. Organizer's triage board shows all issues; issues can be filtered/grouped by team tag so, for example, all Technical-tagged issues are visually grouped for the technical team to see without every issue funneling only through the organizer
4. Organizer (or whoever owns that team's issues) updates status: New → In Progress → Resolved
5. Resolution is reflected live on the board — no phone calls needed to confirm something is fixed

**Inputs:** event_id, type, location, priority, photo, team_tag, reported_by
**Outputs:** issue_id, status, photo_url

**Edge cases:** duplicate reports of the same physical issue are allowed (not auto-merged) for MVP; photo upload failure should not block the rest of the issue submission — text fields should still submit if the photo fails.

**Acceptance criteria:** an issue with a photo appears on the triage board within one poll cycle, correctly grouped/filterable by team tag, and its resolved status is visible without a phone call.

---

### 4.12 Volunteer Notification Feed (NEW)

**Description:** In-app feed (not push notifications for MVP) on the volunteer's dashboard showing relevant updates as they happen.

**Notification types:**
- New task assigned
- Task updated
- Shift changed
- Event starts in 30 minutes
- Issue assigned to you (if team-tag routing points an issue to a volunteer)

**Flow:** each of these events (task assignment, task update, shift change, a scheduled pre-event reminder, issue routing) writes a `notifications` entry tied to the volunteer; their dashboard polls/loads this list on open.

**Inputs:** volunteer_id, type, message, related_id (task/issue)
**Outputs:** notification feed items

**Depends on:** Task Assignment (4.6), Issue Reporting (4.11)
**Edge cases:** "Event starts in 30 minutes" requires a simple scheduled check (compare current time to event start) rather than a full notification/cron infrastructure — a lightweight periodic check is sufficient for MVP.

**Acceptance criteria:** assigning a task to a volunteer produces a visible feed entry on their dashboard without needing a page reload beyond the normal poll cycle.

---

### 4.13 Event Timeline (NEW)

**Description:** A visual schedule view combining sessions, shifts, and key milestones for an event, viewable by all three roles (scoped appropriately).

**Flow:** renders the event's `sessions` array plus any relevant task shift times as a chronological timeline. Organizer sees everything; volunteer sees their own shifts highlighted within it; attendee sees their registered session(s) highlighted.

**Inputs:** event_id
**Outputs:** ordered timeline of sessions/shifts

**Depends on:** Event Creation (sessions), Task Assignment (shifts)
**Acceptance criteria:** opening the timeline for a multi-session event (e.g. a TEDx with two parallel tracks) clearly shows what's happening, where, and when.

---

### 4.14 Announcements
Unchanged: organizer sends targeted messages (all attendees or a specific session).

---

### 4.15 Feedback Collection
Unchanged: post-event feedback form, required before certificate.

---

### 4.16 Analytics & AI-Generated Report (expanded)

**Now includes:**
- Registered → Checked-in → Stayed funnel (as before)
- **Peak Entry Time**
- **Peak Exit Time**
- **Most Crowded Hall** (venue with highest peak occupancy %)
- **Average Stay Time** (mean of checkout_time − checkin_time across attendees who did both)
- **Volunteer Performance** (aggregate view: average reliability score across the event's volunteers, top performers)
- **Issue Count** (total issues reported, broken down by team tag and resolved vs. unresolved)

**Flow:** same as before — aggregation queries over `registrations`, `checkins`, `taskAssignments`, and `issues`, fed into an AI prompt for a narrative summary organizers can paste into their post-event report.

**Acceptance criteria:** after a full test run-through, all six new metrics compute correctly alongside the original funnel data, and the AI summary reflects them accurately.

---

### 4.17 Certificate Generation

**Confirmed sequence (locked):** Registration → Check-in → Feedback → Certificate. A certificate is only issued to someone who (a) registered, (b) was actually checked in (attended), and (c) submitted feedback. This closes the loop the original spec left slightly open — attendance is now a hard requirement alongside feedback, not just registration.

**Acceptance criteria:** an attendee who registered but never checked in cannot get a certificate even after submitting feedback; the UI should explain this clearly if attempted.

---

## 5. Feature Dependency Map (updated)

```
Auth
 └─ enables → everything below

Event Creation (+ category, sessions/rooms, resource list)
 ├─ enables → Registration
 ├─ enables → Task Creation
 ├─ enables → Resource Inventory
 ├─ enables → Live Dashboard (scope)
 ├─ enables → Issue Board (scope)
 ├─ enables → Event Timeline
 └─ enables → Analytics (scope)

Registration ─ generates → QR Ticket ─ consumed by → Check-in
Check-in ─ requires attendance for → Certificate (with Feedback)
Check-in ─ feeds → Live Dashboard, Analytics

Volunteer Onboarding ─ feeds → Task Assignment (AI ranking input)
Task Assignment ─ feeds → Trust Card, Volunteer Notification Feed, Event Timeline

Issue Reporting (+ photo, + team tag) ─ feeds → Volunteer Notification Feed (routed issues),
  Analytics (issue count)

Resource Inventory ─ standalone, visible on Live Dashboard context

Feedback ─ hard-gates → Certificate (alongside Check-in requirement)

Analytics ─ terminal node, consumes Registration + Check-in + TaskAssignment + Issues
```

---

## 6. Success Metrics (Demo Context)
- Full pipeline runs live end to end with zero manual steps
- All AI-labeled features work with real/seeded data: Suggested Volunteers, Trust Card summary + performance report, Analytics narrative
- An issue with a photo, tagged to a team, appears on the triage board and can be resolved live
- Resource checklist visibly shows delivered vs. pending items
- Certificate correctly blocked for a registered-but-not-checked-in attendee, even with feedback submitted
- Volunteer sees a live notification the moment they're assigned a task

## 7. MVP Scope Boundary

**In scope (build this):** all 17 features above, 3 roles, event category + sessions-with-rooms, resource inventory (binary delivered/pending), issue photo + team tag, in-app volunteer notification feed, event timeline, expanded live dashboard and analytics fields, locked certificate sequence.

**Explicitly out of scope (future scope — mention in pitch only, do not build):**
- Lost & Found (photo-based item posting/matching) — a genuinely good idea, but a self-contained feature unrelated to the core pipeline; cut to protect build time
- Push notifications (SMS/mobile push) — MVP uses in-app feed only
- Partial-quantity resource tracking (e.g. "6 of 8 arrived") — MVP is binary delivered/pending per item
- Volunteer Lead role with scoped permissions
- Offline-first sync engine
- Paid/external volunteer handling
- Real ML-based anomaly detection or natural-language event setup parsing

## 8. Locked Decisions (from team discussion)
1. Volunteers are internal (club members) for this version — no payment handling.
2. Reliability score is scoped per-event-platform-wide (cumulative across all events on the platform), computed from `taskAssignments` history.
3. Manual QR-scan override is built (low cost, high robustness value, even though rare in practice).
4. Certificate requires Registration + Check-in + Feedback, in that order — not feedback alone.
