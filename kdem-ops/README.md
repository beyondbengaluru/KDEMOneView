# KDEM OneView — FY 2026-27

One live workspace for the whole mission: annual targets, shared cross-vertical
trackers, Beyond Bengaluru cluster ops, proposals with documents, meetings with
minutes that turn into tasks, and a shared calendar. Built on Next.js + Supabase,
deployed on Vercel. Free tier throughout for a 15–20 person team.

## How the data model thinks

Every tracker is a **shared dataset with one home**. A GCC added in Mangaluru is
stored once (home: IT/GCC) and *mirrored* live into Beyond Bengaluru's Mangaluru
section. Data Centres mirror to BB. Policy registrations are one dataset across
4 policies — each row lives with the vertical that owns the policy (IT & GCC →
IT/GCC, ESDM → ESDM, Startup → Startups) and BB sees all of them filtered by its
clusters. Pre-BTS cluster events appear in their cluster's section *and* in the
central Events tab and calendar. A tiny colored dot on mirrored rows shows which
vertical the entry originates from.

**Who can edit what** (enforced in the database, mirrored in the UI):
Master/CEO edit everything; vertical teams edit rows homed in their vertical;
the BB core team can edit any row belonging to a BB cluster; cluster heads edit
only their own cluster's rows, tasks and events.

**Beyond Bengaluru** is cluster-first: Overview (4 clusters combined + core team
tasks for the Bengaluru 4), then a full section per cluster — Mysuru, Mangaluru,
HDB, Kalaburagi — each mirroring companies, ESDM investments, data centres,
startups, policy registrations, events, cluster-head tasks and proposals.

**Proposals** replace fake percentages for non-numeric deliverables: card per
proposal with status (Drafting → Submitted to KITS → … → Delivered), a
next-steps table, and multiple document uploads (Supabase Storage).

**Meetings** are internal/external, in-person (venue) or online (join link),
with team + external participants, minutes, and next steps that become real
tasks (linked, and on the calendar when they have a due date). Tasks can be
multi-vertical and can be kept off the calendar.

## What's new in v5
- **Task visibility actually enforced**: if your DB was created before v4,
  run `supabase/migrate_v5.sql` once (no reset needed) — it swaps the old
  "everyone sees everything" policy for the real private/vertical/team/CEO
  scoping and adds the new time columns.
- **Q1 FY 2026-27 pre-loaded**: landed GCCs (Ebay, Pega, Netsmart, TRG
  Screens, DSP, Deep Watch), ESDM Q1 closures (Wipro ₹1,350 Cr, Lion
  Circuits, Avalon) + the ₹3,350 Cr hot pipeline, the full BB pipeline from
  the deck (BPL, AWSL, Quarcs, Consilio, Cycity, Airtel Nxtra…), 17 policy
  awareness sessions, NIPUNA partners, digital actuals (LinkedIn 36,332) and
  the six real Pre-BTS events with dates. Where the Q1 doc gave counts
  without names, entries are seeded as “(rename)” dummies you can edit.
- **Report = your Q1 format**: Sl No | Activities | Annual Targets &
  Measurable Outcomes | {Period} Progress — with Monthly / Quarterly /
  **Annual** options. Progress computes live.
- **Assignee suggestions** from the team roster everywhere; proper time
  pickers on meetings, events, tasks and reminders; **weekly calendar view**;
  balanced KPI grid; BB counter boxes open their own tracker; members get
  their vertical's tabs right in the sidebar.

## What's new in v4
- **Live numbers everywhere**: the KPI table is gone. Every dashboard number
  is computed from the trackers themselves — add a company and the counter
  moves. The Word report's "Achieved till date" column computes the same way.
- **Vertical privacy**: members see only their own vertical (nav, pages and
  database). Only Master & CEO see all verticals and the team list.
- **Task visibility**: each task chooses who sees it — Only me / My vertical /
  Whole team / CEO Office. Enforced in the database, not just the UI: even
  the CEO sees only their own tasks, whole-team tasks, and what's escalated.
- **Per-vertical Database**: the permanent companies & people directory now
  lives inside each vertical (Database tab) — scoped to that team.
- **Pipeline-honest BB**: cluster glance cards count landed companies & jobs,
  DC pipeline separately, and hide zeros. Cluster proposals (Mysuru AI City,
  Mangaluru DC Park…) live under Beyond Bengaluru with their cluster.
- **⌘K global search**: companies, tasks, meetings, events, proposals — scoped
  to what you're allowed to see. Plus a latest-activity feed on the CEO view.

## What's new in v3
- **FY switcher** (avatar menu, top right): flip between FY 2025-26 and FY 2026-27 —
  every tracker, KPI counter and event is year-scoped, and last year's ESDM +
  Beyond Bengaluru numbers are pre-loaded from your fact sheet & Excel tracker.
- **Pre-filled data** (`supabase/seed_data.sql`): the DC pipeline, BB company
  pipeline with contacts, ESDM 2025-26 investments + 2026-27 carry-forwards,
  planned roadshows, proposals (incl. reports) and the Database directory.
- **Database section**: the permanent companies & people directory — everyone
  can maintain it, and it never resets with the financial year.
- **My space** (`/me`): private reminders, personal documents (own bucket),
  and a combined "coming up" feed of your reminders + tasks + meetings + events.
- **MoM export**: open any meeting → *Download MoM* produces a Word file in the
  exact GC-minutes format (date/venue/chaired-by, P/T/V/A attendee table,
  minutes, action items from the linked tasks).
- **Whole-dashboard themes** (Admin): six presets that repaint canvas, sidebar
  and accents for the entire team. Numbers-only KPI boxes — no percentages,
  targets or pace judgements anywhere.
- **Events**: Internal (Pre-BTS, with agenda uploads + event tasks) vs External
  sub-tabs. **Policies**: Registrations | Incentives Awareness Drive (with
  photos) | Strategy sub-tabs. Six BB clusters incl. Tumakuru & Shivamogga.

## Setup (~20 minutes)

### 1. Supabase
1. Create a project at supabase.com (free).
2. SQL Editor → paste all of `supabase/schema.sql` → Run. This is a **fresh v2
   install** — if you ran the earlier v1 schema, use a new project or reset the
   database first.
3. SQL Editor → paste all of `supabase/seed_data.sql` → Run (pre-fills the
   pipelines, DC list, ESDM history, proposals and the Database).
4. Authentication → Users → *Add user* → your own email + password.
5. SQL Editor:
   `update profiles set role='master', name='Your Name' where email='you@kdem.in';`
6. **Rotate your old key**: the previous ops-center HTML had a publishable key
   hardcoded — revoke it in Settings → API and use fresh keys here.

### 2. The create-user function (so Master adds members in-app)
```bash
npm i -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase functions deploy create-user
```
After this, Admin → *Add member* creates accounts with a temporary password.
(Until it's deployed, you can still invite users from Supabase → Authentication.)

### 3. Run locally
```bash
cp .env.example .env.local   # fill in Project URL + anon/publishable key
npm install
npm run dev
```

### 4. GitHub + Vercel
Push the repo to GitHub, import it in Vercel, add the two environment variables
from `.env.local`, deploy. Every push to `main` redeploys automatically.

## Day-to-day
- **Admin (Master only)**: add members with proper designations (VP / Associate /
  Fellow / Intern per vertical; CEO, CAO, HR… for the CEO office), and switch
  the dashboard theme for the whole team.
- **Vertical pages**: live-number KPI boxes (click → tracker, pencil → update),
  shared trackers, tasks + events + meetings panels, policy hub, proposals.
- **Contacts**: company rows carry a contact person with tap-to-call, mail and
  LinkedIn icons right in the table.
- **Meeting report**: one button generates a Word report (KPIs vs targets,
  proposals with next steps, tasks, events) for MM/quarterly reviews.
- **CSV import/export** on every tracker for bulk moves.

## Fonts
The UI requests **Google Sans** (with Instrument Sans as an automatic fallback,
since Google Sans isn't officially distributed on Google Fonts). If your
organisation has the licensed Google Sans files, drop them in as `@font-face`
in `app/globals.css` and they'll take over everywhere.

## Structure
```
lib/schemas.js        ← the control panel: verticals, tabs, columns, mirrors
supabase/schema.sql   ← tables, row-level security, storage, FY26-27 seeds
supabase/functions/   ← create-user edge function (Master adds members)
components/           ← DataTable, ProposalsBoard, BBView, TasksPanel, …
app/(app)/            ← overview, verticals, tasks, meetings, calendar, admin
```
Adding a column or a whole tab is a few lines in `lib/schemas.js` — forms,
tables, CSV and reports follow automatically.
