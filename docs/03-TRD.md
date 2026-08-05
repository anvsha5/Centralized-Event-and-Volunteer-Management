# TRD — Centralized Event & Volunteer Management Portal
## (Detailed Specification — v3, aligned to final PRD)

---

## 1. Architecture Overview (unchanged)

```
React (JS) + Tailwind frontend
        |  REST calls (fetch/axios) + polling for live data
        v
Node.js/Express backend (single monolith service)
        |
        +-- MongoDB (Mongoose ODM) -- all collections below
        +-- AI service module -- Anthropic API calls
        +-- QR service module -- token + image generation
        +-- Email service module -- confirmation/notification mail
        +-- File storage -- local /uploads folder for issue photos (MVP, no cloud storage)
```

Still one backend service, one database. Photo storage for issues is added as local disk storage served statically — no S3/cloud bucket setup needed for a hackathon MVP.

---

## 2. Final Stack (unchanged)
React (JS) + Tailwind + React Router · Node.js/Express · MongoDB + Mongoose · Email OTP auth · Anthropic API for AI calls · `qrcode` + `html5-qrcode` for QR · polling for realtime · **new: `multer` for photo upload handling, serving `/uploads` as a static Express route**

---

## 3. Project Structure (additions marked NEW)

```
/frontend
  /src
    /routes
      /organizer   (..., ResourceInventory.jsx [NEW], EventTimeline.jsx [NEW])
      /volunteer   (..., NotificationFeed.jsx [NEW, or embedded in MyTasks.jsx])
      /attendee    (..., EventTimeline.jsx [shared with organizer/volunteer])
    /components
      /glass
      /clay        (..., ResourceChecklistItem.jsx [NEW], TeamTagChip.jsx [NEW],
                     PhotoThumbnail.jsx [NEW], TimelineRail.jsx [NEW])
    /api           (..., resources.js [NEW], notifications.js [NEW])

/backend
  /models          (..., Notification.js [NEW])
  /routes          (..., notifications.js [NEW])
  /uploads         (NEW — static folder for issue photos)
  /services        (..., uploadService.js [NEW])
```

---

## 4. MongoDB Schemas — Updates & Additions

### 4.1 `users` (unchanged)

### 4.2 `events` (UPDATED — category, resources, sessions gain `room`)
```js
{
  _id: ObjectId,
  organizerId: { type: ObjectId, ref: 'User', index: true },
  title: String,
  description: String,
  venue: String,
  capacity: Number,
  startTime: Date,
  endTime: Date,
  registrationDeadline: Date,
  category: { type: String, enum: ['hackathon','workshop','seminar','concert','tedx','sports','other'] },
  status: { type: String, enum: ['draft', 'live', 'closed', 'cancelled'], default: 'draft' },
  sessions: [{
    _id: ObjectId,
    title: String,
    topic: String,
    room: String,          // NEW
    startTime: Date,
    endTime: Date
  }],
  resources: [{            // NEW — embedded, always accessed with the event
    _id: ObjectId,
    name: String,
    quantityNeeded: Number,
    status: { type: String, enum: ['pending', 'delivered'], default: 'pending' }
  }],
  createdAt: Date
}
```
Resources are embedded (not a separate collection) — they're always read/written in the context of one event, never queried independently across events, so embedding avoids an unnecessary collection + join.

### 4.3 `registrations` (unchanged)

### 4.4 `volunteerProfiles` (unchanged)

### 4.5 `tasks` (unchanged)

### 4.6 `taskAssignments` (unchanged)

### 4.7 `checkins` (unchanged — still the source for peak entry/exit and avg stay time calculations, see section 6.4)

### 4.8 `issues` (UPDATED — photo + team tag)
```js
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event', index: true },
  reportedBy: { type: ObjectId, ref: 'User' },
  type: String,
  location: String,
  priority: { type: String, enum: ['low', 'medium', 'high'] },
  photoUrl: { type: String, default: null },        // NEW
  teamTag: { type: String, enum: ['technical','hospitality','stage','general'], default: 'general' }, // NEW
  status: { type: String, enum: ['new', 'in_progress', 'resolved'], default: 'new' },
  createdAt: Date,
  resolvedAt: Date
}
```
New compound index: `{ eventId: 1, teamTag: 1, status: 1 }` — supports the team-filtered triage board view directly at the query level rather than filtering client-side.

### 4.9 `feedback` (unchanged)

### 4.10 `certificates` (unchanged schema — generation logic now requires a `checkins` doc to exist, see section 6.6)

### 4.11 `announcements` (unchanged)

### 4.12 `notifications` (NEW)
```js
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', index: true },   // the volunteer receiving it
  eventId: { type: ObjectId, ref: 'Event' },
  type: { type: String, enum: ['task_assigned','task_updated','shift_changed','event_reminder','issue_assigned'] },
  message: String,
  relatedId: ObjectId,     // taskId or issueId, depending on type
  read: { type: Boolean, default: false },
  createdAt: Date
}
```
Index: `{ userId: 1, read: 1, createdAt: -1 }` — supports "unread notifications for this volunteer, newest first" as a single indexed query.

---

## 5. Frontend Route -> API -> MongoDB Map (v3 additions only — see v2 doc for unchanged routes)

### 5.1 Organizer — new routes
| Route | Calls | Backend endpoint | Collections touched |
|---|---|---|---|
| `/organizer/events/:id/resources` | on load | `GET /api/events/:id` (resources are embedded, no separate fetch) | `events` |
| `/organizer/events/:id/resources` | toggle delivered | `PATCH /api/events/:id/resources/:resourceId` | `events` (updates one embedded subdocument) |
| `/organizer/events/:id/issues` | team filter click | `GET /api/events/:id/issues?teamTag=technical` | `issues` |
| `/organizer/events/:id/issues` | submit with photo | (unchanged endpoint) `POST /api/events/:id/issues` — now `multipart/form-data` | `issues`, writes to `/uploads` |
| `/organizer/events/:id/timeline` | on load | `GET /api/events/:id/timeline` | `events` (sessions), `taskAssignments` joined with `tasks` |
| `/organizer/events/:id/analytics` | on load | `GET /api/events/:id/analytics/extended` | `checkins`, `registrations`, `taskAssignments`, `issues` (aggregation) |

### 5.2 Volunteer — new routes
| Route | Calls | Backend endpoint | Collections touched |
|---|---|---|---|
| `/volunteer/tasks` (feed section) | on load + polled | `GET /api/notifications/me?unread=true` | `notifications` |
| `/volunteer/tasks` (feed section) | mark read | `PATCH /api/notifications/:id/read` | `notifications` |
| `/volunteer/issues/new` | submit with photo | `POST /api/events/:id/issues` (multipart, includes `teamTag`) | `issues`, `/uploads` |
| `/volunteer/timeline` | on load | `GET /api/events/:id/timeline` (shared endpoint, highlights own shifts client-side) | same as organizer timeline |

### 5.3 Attendee — new routes
| Route | Calls | Backend endpoint | Collections touched |
|---|---|---|---|
| `/attendee/timeline` | on load | `GET /api/events/:id/timeline` (shared endpoint, highlights registered session client-side) | `events` |

---

## 6. Data Flow — New/Updated Worked Examples

### 6.1 Resource Inventory
1. Organizer adds resources during event creation (`resources: [{name, quantityNeeded}]`, `status` defaults `pending`) — `POST /api/events` writes these as part of the event doc
2. `ResourceInventory.jsx` renders each as a `ResourceChecklistItem`, toggling calls `PATCH /api/events/:id/resources/:resourceId { status: 'delivered' }`
3. Backend updates the specific embedded subdocument via Mongoose's array positional update (`events.updateOne({ _id, 'resources._id': resourceId }, { $set: { 'resources.$.status': 'delivered' } })`)
4. No polling needed here — this list changes rarely and only via direct user action, unlike check-ins

### 6.2 Issue Reporting with Photo + Team Routing
1. Volunteer fills `ReportIssue.jsx`, attaches a photo, selects a team tag
2. Frontend sends `multipart/form-data` to `POST /api/events/:id/issues`
3. Backend: `multer` middleware saves the photo to `/uploads/issues/`, sets `photoUrl` to the served static path; inserts the `issues` doc with `teamTag`
4. If a routing rule exists (e.g. all `technical`-tagged issues should notify a designated technical-lead volunteer), backend inserts a `notifications` doc with `type: 'issue_assigned'` for that user — this routing target can be as simple as "the organizer" for MVP if no dedicated per-team lead accounts exist yet; team-tag filtering on the triage board (section 6.3) is the primary MVP mechanism, direct routing is a bonus if time allows
5. Organizer's `Issues.jsx` (filtered by team) picks it up on next poll, photo thumbnail renders from the static `/uploads` URL

### 6.3 Team-Filtered Triage Board Query
```js
// GET /api/events/:id/issues?teamTag=technical
Issue.find({ eventId: id, teamTag: 'technical' }).sort({ createdAt: -1 })
```
Uses the compound index from section 4.8 directly — no client-side filtering needed even as issue volume grows during a live event.

### 6.4 Notification Feed
1. Any of these actions inserts a `notifications` doc: task assignment (`POST /api/tasks/:taskId/assign`), task status update (`PUT /api/task-assignments/:id/status`), shift time change (`PUT /api/tasks/:id`), issue routing (section 6.2)
2. A lightweight scheduled check (simple `setInterval` in the backend, not a full cron system) runs every minute, comparing `events.startTime` to current time; when an event is 30 minutes out, inserts an `event_reminder` notification for every volunteer with an active `taskAssignment` on that event
3. `NotificationFeed.jsx` polls `GET /api/notifications/me?unread=true` alongside the existing task-list poll (same interval, one extra lightweight call)
4. Tapping an item calls `PATCH /api/notifications/:id/read` and navigates to the related task/issue

### 6.5 Event Timeline Rendering
1. `GET /api/events/:id/timeline` backend handler merges two sources: `event.sessions` (embedded, already sorted-by-time-capable) and `taskAssignments` joined through `tasks` filtered by `eventId`, both mapped into a single sorted array: `{ time, type: 'session'|'shift', title, location }`
2. Same endpoint serves all three roles — the frontend `TimelineRail.jsx` component receives the full array plus the current user's `id`/`registrationId`, and applies highlighting client-side (volunteer: highlight entries where `assignedTo === currentUserId`; attendee: highlight the session matching their `registration.sessionId`) rather than building three different backend endpoints

### 6.6 Certificate Gate (updated: Registration -> Check-in -> Feedback -> Certificate)
1. `GET /api/registrations/:id/certificate` now runs two checks in order:
   - `Checkin.findOne({ registrationId: id, type: 'checkin' })` — if none exists, return 403 with message `"attendance_required"`
   - `Feedback.findOne({ registrationId: id })` — if none exists, return 403 with message `"feedback_required"`
2. Frontend (`Certificate.jsx`) reads the specific 403 reason and shows the correct copy per the Design Document (Section 5.12) — never a generic locked message
3. Only if both checks pass does the existing generate-or-return `certificates` logic run

### 6.7 Expanded Analytics Aggregation
`GET /api/events/:id/analytics/extended` computes, all via MongoDB aggregation pipelines against existing collections (no new schema needed):
- **Peak Entry Time:** `$match checkins where type=checkin`, `$group by minute-bucket`, `$sort count desc`, take top
- **Peak Exit Time:** same pipeline, `type=checkout`
- **Most Crowded Hall:** requires venue on checkins — if venue isn't directly stored on `checkins`, join through `registrations.sessionId` -> `event.sessions.room`; compute peak simultaneous occupancy per room using a running-count-over-time approach, take the max
- **Average Stay Time:** for registrations with both a `checkin` and `checkout` doc, average `(checkoutTime - checkinTime)`
- **Volunteer Performance:** average `volunteerProfiles.reliabilityScore` across all volunteers with a `taskAssignment` for this event
- **Issue Count:** `Issue.aggregate([{ $match: { eventId } }, { $group: { _id: '$teamTag', count: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status','resolved'] }, 1, 0] } } } }])`

All six feed into the existing `summarizeAnalytics()` AI function (aiService.js) as additional fields in the same JSON payload — no new AI function needed, just a richer input to the existing one.

---

## 7. Tailwind Configuration Additions

```js
// tailwind.config.js — additions to the v2 config
colors: {
  // ...existing tokens unchanged...
  'violet-hospitality': '#C9A0F5',
  'gold-stage': '#F5C86B',
},
```
Only two new color tokens added, matching the Design Document's deliberate restraint on palette growth (Section 2.1 of the Design Document).

---

## 8. Non-Functional Requirements (v2 rules unchanged, additions below)
- **Photo upload size limit:** cap at 5MB per issue photo via `multer` config, reject larger files with a clear error — prevents a single bad upload from bloating `/uploads`
- **Photo storage is local disk for MVP** — acceptable for a hackathon demo; note for the team that this does not persist across redeploys on most free hosting tiers, so re-seed/re-upload before a live demo if the host was restarted
- **Notification polling should share the existing poll cycle** with `MyTasks.jsx` rather than opening a second independent interval — one combined fetch or two calls on the same timer, not two separate timers
- **Timeline endpoint should be cached per request cycle**, not recomputed on every keystroke/interaction — it only needs to refresh on page load, not polled

## 9. Explicit Non-Goals (MVP) — unchanged from v2, plus:
- No cloud file storage (S3, Cloudinary, etc.) — local disk only
- No dedicated per-team-lead login/role for issue routing — team-tag filtering on the existing organizer board is the MVP mechanism; direct routing to a specific person is a stretch goal only
- No push notifications — in-app feed only, as locked in the PRD
