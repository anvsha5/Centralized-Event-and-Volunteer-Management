# UI.md — Visual Polish Prompts for AI IDE
## (Design Document v3 alignment pass — visual only, no logic changes)

---

## 0. How to Use This File

Feed the AI IDE **one section at a time**, in order (or any order, since screen groups are independent of each other — unlike the Implementation plan's Blocks, these don't have dependencies). After each section, visually review the affected screens before moving to the next. Never paste more than one section into a single prompt — a single massive all-screens prompt tends to get skimmed past the first few screens.

Every prompt below assumes the AI IDE has access to `@docs/02-Design-Document.md` and `@docs/03-TRD.md` in the project.

---

## Shared Rules (included at the top of every prompt below — do not skip when pasting)

```
Do a visual-only polish pass on the existing frontend. Do NOT create new pages, new routes,
new components with new logic, new API calls, or touch any backend file. Do NOT rename or
move existing files. Do NOT change any component's props, state, or behavior — only className/
style/CSS changes within the components that already exist. Every screen must keep its current
functionality exactly as-is; only the look changes.

Source of truth: @docs/02-Design-Document.md sections 2-4 for the token system (colors,
typography, glass/clay material specs) and @docs/03-TRD.md section 7 for the exact Tailwind
config those tokens should already be using. If tailwind.config.js is missing any token from
the TRD, add it — otherwise don't touch the config beyond that.

General fixes that apply across every screen in this pass:
- BACKGROUND: replace any flat solid navy background with the ambient gradient (base-ink to
  base-violet) plus soft blurred low-opacity teal/violet blobs behind content.
- BUTTONS: every button must use ClayButton with the real dual-shadow claymorphism spec —
  light shadow top-left, dark shadow bottom-right, 18px radius (not a full pill unless the
  Design Document specifically calls for a pill), pressed/inset state on click.
- TYPOGRAPHY: Cabinet Grotesk for headings/display (with tightened letter-spacing at large
  sizes), General Sans for body copy, JetBrains Mono specifically for numeric/data values
  (IDs, timestamps, scores, OTP codes, counts).
- INPUTS: glass-style — translucent fill, blurred backdrop, soft border — not plain bordered boxes.
- ELEVATION DISCIPLINE: no decorative shadows/gradients/borders beyond what the Design
  Document specifies. Elevation comes only from the glass/clay material distinction and the
  Stat Dome pulse animation.

After finishing this section's screens, list what you changed per screen so it's reviewable.
Do not touch any screen not named in this section.
```

---

## 1. Auth

```
[paste Shared Rules above, then:]

Screens in scope for this pass: Login.jsx only.

Specific fixes:
- Rebuild the top nav bar as a GlassPanel-based strip (backdrop blur, translucent fill, soft
  border) — currently plain unstyled text on transparent background.
- The central login panel should be a proper GlassPanel (blur + translucent fill + soft glow),
  not a flat solid card.
- Email input: glass style per the shared rules.
- Role-selection chips (Attendee/Volunteer/Organizer) should be ClayChip components with a
  clearly distinct "selected" visual state (teal fill/border shift on the selected chip, clay
  dual-shadow on all of them) — not just a flat color swap between selected/unselected.
- "Send OTP Code" button: full ClayButton treatment.
- Heading "Portal Login": Cabinet Grotesk, page-title scale, tightened letter-spacing.
- Subtext "Sign in with email verification OTP": General Sans, caption scale, muted tone.
```

---

## 2. Organizer — Dashboard Home + Nav

```
[paste Shared Rules above, then:]

Screens in scope for this pass: organizer top nav (shared across all organizer screens),
Dashboard Home (Stat Domes + Vitals Strip + venue occupancy panel).

Specific fixes:
- Organizer nav bar: same GlassPanel treatment as the auth nav, persistent across all
  organizer routes, current-section indicator should use teal accent, not a generic highlight.
- Stat Domes (Registered/Checked-in/Inside/Left): must match the actual "glass dome on a clay
  base" signature element from Design Document section 3 — this is the one place visual
  boldness is allowed, make sure it doesn't look like a generic stat card.
- Vitals Strip (Capacity/Occupancy%/Active Volunteers/Event Status): a slim glass bar below
  the domes, mono type for numbers, status shown as a small colored dot + word, deliberately
  lower visual weight than the domes.
- Venue occupancy bars panel: glass panel, teal gradient fill bars, amber highlight above 90%.
```

---

## 3. Organizer — Volunteers + Trust Card

```
[paste Shared Rules above, then:]

Screens in scope for this pass: Volunteers.jsx (list + task board), TrustCard.jsx.

Specific fixes:
- Volunteer list rows: skill tags as ClayChip, not plain text badges.
- Task board columns (Unassigned/Assigned/Completed): glass-toned panels; task cards inside
  are clay, draggable-looking (visual affordance even if drag isn't the focus of this pass).
- "Suggest volunteers" ranked list: each suggested volunteer shown with a teal score bar, not
  just a number — this is specified as faster to scan than reading percentages.
- Trust Card panel: must slide in as a glass panel (not a modal popup or new page look).
  Reliability score as a circular progress ring in teal, percentage in mono type. Both AI text
  blocks (reliability summary + skill-match paragraph) grouped inside one amber-glowing glass
  sub-panel with a single "AI" label chip — must be visually distinguishable from human-entered
  data at a glance, never blended in as if organizer-written.
```

---

## 4. Organizer — Resources + Issues + Timeline

```
[paste Shared Rules above, then:]

Screens in scope for this pass: ResourceInventory.jsx, Issues.jsx, EventTimeline.jsx (organizer view).

Specific fixes:
- Resource checklist items: clay rows with a toggle switch. Delivered items should visually
  recede (reduced opacity, checkmark) — pending items should be what draws the eye, not
  completed ones.
- Issue triage board: three glass-toned columns (New/In Progress/Resolved). Cards are clay with
  a coral left-edge priority stripe whose thickness scales with priority. Team Tag Chip
  (top-left of card) must use the correct team color (technical=teal, hospitality=violet,
  stage=gold, general=neutral clay) — not a generic single color for all tags. Photo
  thumbnail (if present) top-right of the card, clay-framed, tappable to expand.
- Team filter row above the board: ClayChip row (All/Technical/Hospitality/Stage/General).
- Timeline: vertical teal rail with clay dot markers at each session/shift point, clay entry
  cards branching off each dot. This is a shared component — only restyle it once here, don't
  duplicate styling logic elsewhere.
```

---

## 5. Organizer — Analytics + Announcements

```
[paste Shared Rules above, then:]

Screens in scope for this pass: Analytics.jsx, Announcements.jsx.

Specific fixes:
- Funnel chart: glass panel, teal gradient bars.
- New metrics row (Peak Entry/Exit, Most Crowded Hall, Avg Stay Time): compact glass stat
  cards in mono type, visually secondary to the funnel chart above (smaller, less prominent).
- Volunteer performance + issue count panel: small glass panel, small horizontal bars per team
  for issue counts.
- AI-generated summary paragraph: distinct amber-bordered glass panel, visually separated
  from the raw numbers/charts above it — never blended together.
- "Copy report" button: ClayButton.
- Announcements compose form: glass panel, message textarea + target selector as ClayChip
  row (All / specific session).
```

---

## 6. Volunteer — My Tasks + Notification Feed + Scanner

```
[paste Shared Rules above, then:]

Screens in scope for this pass: MyTasks.jsx, NotificationFeed.jsx, Scanner.jsx, ReportIssue.jsx.

Specific fixes:
- Notification Feed panel (above the task list): compact glass rows, unread items marked with
  a small teal dot, icon + one-line message + relative timestamp.
- Task cards: clay, with a checkbox-style status toggle that visibly depresses on tap.
  "Open scanner" CTA: large ClayButton, generous size for one-handed mobile use.
- Scanner screen: glass-framed viewfinder square over the camera feed, thin scan-line only
  while actively searching. Result state: full-screen tint (teal-green success / coral
  failure), attendee name in large Cabinet Grotesk, one-line specific reason on failure.
  Manual-override search icon: small glass icon, always one tap away, never buried in a menu.
  "Report an issue" clay button pinned at the bottom of this screen at all times.
- ReportIssue form: photo capture/upload step and team tag selector as a ClayChip row,
  matching the same visual pattern as the category selector on event creation.
```

---

## 7. Attendee — Register/Ticket + Feedback/Certificate + Timeline

```
[paste Shared Rules above, then:]

Screens in scope for this pass: EventPage.jsx, RegisterForm.jsx, MyTicket.jsx, Feedback.jsx,
Certificate.jsx, attendee EventTimeline wrapper.

Specific fixes:
- Public event page: single glass panel over the ambient background, event title/venue/date
  in Cabinet Grotesk, category badge visible near the top.
- Registration success: transitions in place to show the QR on a clean, separate clay-white
  card (not just embedded in the glass panel) so it photographs/screenshots well.
- My Ticket: identical QR card layout, reachable from one nav tab.
- Feedback form: glass panel, 5-point rating as clay circular buttons in a row (not a slider).
- Certificate button: must show ONE of two distinct disabled states depending on why it's
  locked — "Certificate available for attendees who checked in" vs "Download certificate —
  share your feedback first" — never a single generic locked/disabled look for both cases.
- Timeline (attendee view): same shared TimelineRail component as the organizer/volunteer
  views, with the attendee's own registered session highlighted with a teal outline.
```

---

## Notes for Whoever Runs This

- Sections are independent — run them in any order, or split across team members, one section per person.
- If a screen file referenced above doesn't exist yet in the codebase (not all phases may be finished), skip that specific bullet and note it rather than letting the AI invent the missing file.
- This file only fixes visual styling. If a screen's actual layout/structure doesn't match the Design Document (e.g. missing sections, wrong information architecture), that's a separate, larger task — flag it instead of letting a "UI polish" prompt silently restructure a page.
