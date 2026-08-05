# Design Document — Centralized Event & Volunteer Management Portal
## (Detailed Specification — v3, aligned to final PRD)

---

## 1. Design Direction

**Subject framing:** a live operations tool, not a marketing site. Three roles look at this on a phone or laptop, often outdoors, often mid-crisis, making real-time decisions. Design has to read instantly and stay calm under pressure.

**Glass = read, clay = act.** Unchanged core rule from v2:
- **Glass** (translucent, blurred) = live/shifting information — dashboards, timelines, feeds
- **Clay** (solid, soft-shadowed, tactile) = things you press — buttons, checklist items, the scanner

**What's new in v3:** more surface area (resources, notifications, timeline, richer issues, richer analytics) means more discipline is needed to avoid visual clutter. The rule going forward: **every new field earns its place as either a glass reading-surface or a clay pressable — never a third material or a one-off styling exception.**

**Still avoiding:** cream+terracotta-serif, near-black+neon, flat broadsheet — the common AI-generated defaults.

---

## 2. Token System (unchanged from v2 — carried forward as-is)

### 2.1 Color
| Token | Hex | Usage |
|---|---|---|
| `base-ink` | `#161B33` | Background base |
| `base-violet` | `#3B2E6B` | Ambient gradient stop |
| `glass-white` | `#F4F6FF` @ 10-16% | Glass panel fill |
| `teal-live` | `#2FD0C4` | Dashboards, live data |
| `amber-ai` | `#F5A93F` | AI-assisted content only |
| `coral-alert` | `#FF6B6B` | Issues, errors, high priority |
| `clay-base` | `#EDEBFF` | Clay component fill |

**New semantic addition — team tag colors** (used only on issue team chips, nowhere else, to keep the palette from sprawling):
| Team | Color |
|---|---|
| Technical | `teal-live` (reuses existing token — technical issues relate to live systems) |
| Hospitality | `#C9A0F5` (soft violet, new token `violet-hospitality`) |
| Stage | `amber-ai`-adjacent but distinct: `#F5C86B` (new token `gold-stage`) |
| General | `clay-base` neutral, no special tint |

### 2.2 Typography (unchanged)
Display: Cabinet Grotesk · Body: General Sans · Data/mono: JetBrains Mono. Same type scale as v2.

### 2.3 Material Tokens (unchanged)
Glass panel and clay component specs carry forward exactly as defined in v2 — see prior spec for exact blur/shadow/radius values; no changes needed.

### 2.4 New Component-Specific Tokens
- **Photo thumbnail frame:** clay-style rounded rect (`border-radius: 12px`), fixed 80×80px in list contexts, tap to expand into a full glass-backed lightbox
- **Timeline rail:** a thin vertical teal line (2px) with clay dot markers at each session/shift point — the one place a "line" element appears in the whole system, reserved exclusively for the timeline

---

## 3. Signature Element (unchanged)

**The Glass-Clay Stat Dome** remains the one place the design spends its boldness — still only the four core counters (Registered/Checked-in/Inside/Left). The four new live-dashboard fields (Capacity, Occupancy%, Active Volunteers, Event Status) are **deliberately not** rendered as domes — see Section 5.2 for why and how they're shown instead. Diluting the signature moment across eight elements would weaken it; better to keep it exclusive to the four that matter most.

---

## 4. Core Component Library (v2 components + new additions)

| Component | Material | Where used |
|---|---|---|
| Glass Panel | Glass | Dashboards, Trust Card, Analytics, Timeline |
| Clay Button | Clay | Primary actions |
| Clay Chip/Badge | Clay | Skill tags, status labels, priority flags |
| Stat Dome | Glass+Clay hybrid | The four core live counters only |
| **Vitals Strip** *(new)* | Glass, compact | Secondary live-dashboard stats (Capacity, Occupancy%, Active Volunteers, Status) |
| Task Card | Clay | Volunteer task list |
| Trust Card | Glass | Volunteer profile, amber AI sub-panel |
| Issue Card | Clay, coral accent | Triage board |
| **Team Tag Chip** *(new)* | Clay, team-colored | Issue routing label |
| **Photo Thumbnail** *(new)* | Clay frame | Issue evidence photos |
| **Resource Checklist Item** *(new)* | Clay, toggle | Resource inventory list |
| **Notification Feed Item** *(new)* | Glass, compact row | Volunteer notification feed |
| **Timeline Rail** *(new)* | Glass line + clay dots | Event Timeline screen |
| Scanner Frame | Glass overlay | QR scanner |
| Form Input | Glass, minimal | All forms |

---

## 5. Screen-by-Screen Specification

### 5.1 Auth
Unchanged from v2 — single glass panel, email → OTP, no role selector, invisible routing post-verification.

---

### 5.2 Organizer — Dashboard Home (expanded)

**Layout:**
```
+-----------------------------------------------+
| [Nav: Events . Volunteers . Resources . Live . |
|  Issues . Timeline . Analytics . Announce]      |
|                                                  |
|  +----+  +----+  +----+  +----+   <- Stat Domes |
|  | 350|  | 201|  | 196|  |  5 |     (signature) |
|  |Reg |  |Chk |  |Ins |  |Left|                 |
|  +----+  +----+  +----+  +----+                 |
|                                                  |
|  [ Vitals Strip: Capacity 500 · Occupancy 39% ·  |
|     Active Volunteers 14 · ● LIVE ]              |
|                                                  |
|  [Glass panel: venue occupancy bars]             |
+-----------------------------------------------+
```

**Vitals Strip design:** a single slim glass bar beneath the domes, four values separated by thin dividers, mono type for the numbers, plain label above each in caption size. Event Status renders as a small colored dot + word (teal dot "LIVE", gray dot "UPCOMING", coral dot "CANCELLED", muted dot "CLOSED") — a status indicator, not a fifth dome, deliberately lower visual weight than the four primary counters since it changes rarely, unlike the counters which update constantly.

**Why this split:** the four Stat Domes are the ones a person's eyes go to first and that update live during the rush of check-ins — they deserve the signature treatment. Capacity/Occupancy/Active Volunteers/Status are context a person checks, not something they watch tick up in real time — a strip respects that difference instead of treating all eight numbers as equally dramatic.

---

### 5.3 Organizer — Event Creation (expanded)

**Layout:** single glass panel, now organized into four clearly labeled sub-sections stacked vertically instead of one long form, since the form has grown:
1. **Basics** — title, description, venue, capacity, date/time, registration deadline
2. **Category** — a horizontal row of clay chips (Hackathon / Workshop / Seminar / Concert / TEDx / Sports / Other), single-select, tapped not dropdown-selected — faster to scan and select than a dropdown for a short fixed list
3. **Sessions** — repeatable row: title, room, start time, end time, topic — "+ Add session" clay button appends another row; each row is a clay card so multiple sessions visually read as distinct tiles, not just form rows (important for TEDx-style multi-track events where two sessions can look easy to confuse if styled identically to a single field)
4. **Resources needed** — repeatable row: resource name (free text or a small preset dropdown: Projector/Camera/Mic/Laptop/Extension Board/Chairs), quantity needed — same "+ Add resource" pattern as sessions

**Copy:** "+ Add session" and "+ Add resource" rather than generic "+ Add row" — always name what's being added.

---

### 5.4 Organizer — Resource Inventory (NEW)

**Layout:** a simple glass-paneled checklist, one Resource Checklist Item per line: resource name, quantity needed, and a clay toggle switch (Pending → Delivered). Delivered items visually recede (reduced opacity, checkmark icon) so the eye is drawn to what's still pending, not what's already handled — the reverse of most checklists that highlight completed items, chosen deliberately because organizers scanning this mid-event care about "what's missing," not "what's done."

**Copy for empty pending state:** "Everything's arrived" — same reassuring, specific tone as the issue board's empty state.

---

### 5.5 Organizer — Volunteers Tab
Unchanged from v2: volunteer list with clay skill chips, sliding glass Trust Card panel, clay task board with AI-ranked suggestions.

**Trust Card addition:** now shows two AI-generated blocks instead of one — the reliability summary (as before) and a new **"Skill match" paragraph** (e.g. *"Assigned to 5 tech-support tasks, completed all 5 with no delays reported"*), both inside the same amber-glowing sub-panel, visually grouped as "AI notes" with one shared "AI" label chip rather than two separate labels — avoids visual repetition of the same badge twice on one card.

---

### 5.6 Organizer — Issue Triage Board (expanded)

**Layout:** same three-column kanban as v2 (New / In Progress / Resolved), cards now include:
- Team Tag Chip (top-left corner of the card, team-colored per Section 2.1)
- Photo Thumbnail (top-right, if attached — tap to expand into a glass lightbox overlay)
- Coral priority stripe on the left edge (unchanged from v2)

**New interaction:** a filter row above the board — clay chips for each team (All / Technical / Hospitality / Stage / General) — tapping one filters the board to just that team's issues, so the technical team (if they have their own login/view) sees only what's relevant to them without scrolling past hospitality issues.

**Copy:** unchanged empty state pattern, e.g. "Nothing reported — all clear."

---

### 5.7 Organizer — Event Timeline (NEW, shared component across roles)

**Layout:** a vertical Timeline Rail down the left side of a glass panel — thin teal line, clay dot at each entry point (session start, volunteer shift start/end, key milestones). Each entry is a small clay card branching off its dot: time, title, room/location.

**Role-scoped variants:**
- Organizer sees everything (all sessions + all shifts)
- Volunteer sees the full session list but their own shifts are highlighted with a teal outline, so their personal commitments stand out from the general schedule
- Attendee sees the full session list but only their registered session(s) highlighted the same way

**Why one shared component:** building this once and scoping the highlight logic per role (rather than three separate timeline designs) keeps it consistent and is significantly less build effort — worth calling out explicitly for the Implementation doc.

---

### 5.8 Organizer — Analytics (expanded)

**Layout:** now three stacked sections instead of two:
1. Funnel chart (unchanged, teal gradient bars)
2. **New metrics row** — four compact glass stat cards: Peak Entry Time, Peak Exit Time, Most Crowded Hall, Average Stay Time — small, mono-type values, single row, secondary visual weight to the funnel chart above (same "vitals strip" logic as the live dashboard: important context, not a headline number)
3. **Volunteer performance + issue count panel** — a small glass panel showing average volunteer reliability across the event and total issue count broken down by team tag (small horizontal bar per team)
4. AI-generated narrative (unchanged, amber-bordered glass panel, visually separated from the raw numbers above)

**Copy:** "Copy report" button unchanged.

---

### 5.9 Volunteer — My Tasks + Notification Feed (NEW addition)

**Layout:** My Tasks list unchanged (clay Task Cards) from v2, but the dashboard now opens with a **Notification Feed** glass panel above the task list — a short vertical list of Notification Feed Items (compact glass rows, icon + one-line message + relative timestamp): "New task assigned," "Shift changed," "Event starts in 30 minutes," "Issue assigned to you." Unread items have a small teal dot; tapping marks read and, where relevant, jumps to the related task/issue.

**Why above the task list, not a separate tab:** volunteers are the role most likely to miss something if it's buried in a menu — surfacing it as the first thing they see on open, rather than requiring a tab switch, matches how time-sensitive this information actually is.

---

### 5.10 Volunteer — Scanner
Unchanged from v2: full-bleed camera, glass viewfinder, teal/coral result tint, pinned "Report an issue" button.

**Report Issue form update:** now includes a photo capture/upload step (camera icon, clay button) and a Team Tag Chip selector (single-select row, same pattern as Event Category selection in 5.3) before submitting.

---

### 5.11 Attendee — Register & Ticket
Unchanged from v2.

---

### 5.12 Attendee — Feedback & Certificate (copy updated)

**Layout:** unchanged (glass feedback panel, clay rating buttons).

**Certificate button — updated logic and copy:** now reflects the locked sequence (Registration → Check-in → Feedback → Certificate). Two distinct disabled states instead of one:
- If never checked in: "Certificate available for attendees who checked in" — no feedback prompt shown at all, since feedback is irrelevant until this is true
- If checked in but no feedback yet: "Download certificate — share your feedback first" (same as v2)

This distinction matters: showing the wrong disabled-state message (asking a no-show for feedback) would be confusing and slightly embarrassing for the product — the UI should always tell the truth about which gate is actually blocking them.

---

## 6. Accessibility & Responsive Rules (unchanged, extended)
- All v2 rules (4.5:1 contrast, visible focus rings, non-color-dependent cues, 640px breakpoint, Stat Domes 2×2 on mobile) carry forward
- **New:** the Vitals Strip and new Analytics metrics row both collapse to a 2-column grid below 640px, matching the Stat Dome mobile pattern for visual consistency
- **New:** Team Tag Chips must remain distinguishable in grayscale/colorblind simulation — since we introduced new colors in Section 2.1, each team chip also carries a short text label (not color alone), consistent with the v2 rule already applied to check-in results

## 7. Design QA Checklist (updated)
- [ ] Glass = read, clay = act — still true for every new component added in v3?
- [ ] Is the Stat Dome treatment still exclusive to the original four counters, not diluted onto the new Vitals Strip fields?
- [ ] Is amber still reserved only for AI-generated content, including the new "skill match" paragraph?
- [ ] Do the new team tag colors stay within the existing palette logic (each has a clear reason, not decorative additions)?
- [ ] Does the certificate screen always show the *true* reason it's disabled, never a generic locked state?
- [ ] Would every new screen (Resources, Timeline, Notification Feed) still make sense with color removed?
