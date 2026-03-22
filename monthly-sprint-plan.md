# Home Health Software -- Monthly Sprint Plan
## Feb 19 - Mar 20, 2026 | Product-Ready in 2-3 Months

---

## Lean Mindset and Principles

This plan follows lean startup methodology. Every task, every week, every output must pass through these filters:

### Core Principles

1. **Build-Measure-Learn** -- Do not build features in a vacuum. Build the smallest testable version, measure if agencies actually want it, learn from their feedback, repeat. Every week must include a feedback loop.
2. **Validated Learning Over Opinions** -- Aishwarya's discovery calls are not optional extras. They are the primary source of truth for what to build next. If 5 agencies say "we do not care about scheduling, we need OASIS to stop crashing," we pivot immediately.
3. **Minimum Viable Product (MVP)** -- Ship the ugliest working prototype over the most beautiful wireframe. Nurses do not care about gradient buttons. They care about: does OASIS save correctly offline? Does EVV capture my GPS without draining my battery?
4. **Eliminate Waste** -- Every task that does not directly move toward (a) a working product, (b) a signed pilot agency, or (c) validated market knowledge is waste. Cut it.
5. **Pivot or Persevere Checkpoints** -- End of every week, the team asks: "Based on what we learned this week, should we change direction on any feature, target market, or messaging?" If yes, pivot. If no, persevere.
6. **One Metric That Matters (OMTM)** -- For Month 1, the single metric is: **"Can a nurse complete an OASIS assessment and clock an EVV visit on our platform by March 20?"** Everything serves this.
7. **Small Batches** -- Ship features in 1-2 day increments, not 2-week blocks. Demo to the team daily. Get feedback hourly, not weekly.
8. **Hypothesis-Driven Development** -- Every feature starts as a hypothesis: "We believe [target user] will [take action] because [reason]. We will know this is true when [measurable outcome]."

### Daily Standup (15 min, every morning)

Every team member answers three questions:
- What did I complete yesterday?
- What am I working on today?
- What is blocking me?

This happens on a shared Slack/Discord channel or a quick call. No written standup reports -- keep it verbal and fast.

---

## Team

| Role | Person | Focus |
|------|--------|-------|
| **Product Lead / Developer** | Nithin | Architecture, core modules, technical decisions, product direction |
| **Developer** | Shreyas | Feature implementation, mobile app, integrations, testing |
| **Business Strategist** | Aishwarya | Lead gen, outreach, market validation, content, social media, tracking |

---

## Tech Stack

### Web Application (Admin Dashboard, OASIS Forms, Billing)

| Category | Technology | Why |
|----------|------------|-----|
| **Monorepo** | Turborepo + Bun | Parallel builds, caching, dependency graph orchestration |
| **Framework** | Next.js 16 (App Router, RSC, React 19) | Server rendering, file-based routing, streaming, server actions |
| **Language** | TypeScript (strict mode, ESNext) | Type safety, catch bugs at compile time |
| **Styling** | Tailwind CSS v4 + tw-animate-css | Utility-first, rapid UI development |
| **UI Components** | shadcn/ui + Radix UI + Lucide icons | Accessible, composable, customizable primitives |
| **Forms** | TanStack Form + @hookform/resolvers | Type-safe form state, validation integration |
| **Validation** | Zod v4 + drizzle-zod | Schema validation, DB-to-form type safety |
| **Data Tables** | TanStack Table | Sorting, filtering, pagination, column control |
| **Server State** | TanStack Query + next-safe-action | Caching, deduplication, type-safe server mutations |
| **Client State** | Zustand | Lightweight, minimal boilerplate |
| **URL State** | nuqs | Type-safe search params state management |
| **Animation** | Framer Motion | Declarative animations, layout transitions |
| **Database** | Supabase (PostgreSQL + Auth + Realtime + Storage) | Managed Postgres, row-level security, real-time subscriptions, file storage |
| **ORM** | Drizzle ORM + drizzle-zod | Type-safe queries, migrations, schema-first design |
| **Auth** | Better-Auth (organizations, admin, RBAC plugins) | TypeScript-first, session management, MFA-ready, HIPAA-compliant |
| **Error Handling** | better-result (Rust-style Result types) | No try/catch spaghetti, typed error chains |
| **AI Integration** | Vercel AI SDK v6 | LLM provider abstraction, streaming, tool calling (AI-assisted OASIS) |
| **Cloud** | AWS (S3, Lambda, CloudWatch, SES) | HIPAA-eligible services, PHI storage, audit logging |
| **Deployment** | Vercel (web) | Zero-config Next.js deploys, edge functions, preview deployments |
| **Linting** | Oxlint | Fast, zero-config |
| **Formatting** | Oxfmt | Fast, deterministic |
| **Testing** | Vitest (unit/integration) + Playwright (E2E) | Fast, native ESM, browser-based E2E |
| **Env Validation** | envin | Type-safe environment variable validation |

### Monorepo Package Structure

```
apps/
  web/           -- Next.js admin dashboard + OASIS forms + billing UI
  docs/          -- Product documentation (FumaDocs)
packages/
  db/            -- Drizzle schemas, migrations, queries, zod validations
  auth/          -- Better-Auth config, RBAC, session management
  ui/            -- Shared shadcn/ui components, design tokens, hooks
  email/         -- Transactional email templates (Resend)
  storage/       -- File upload (Supabase Storage / AWS S3)
  utils/         -- Shared utilities, constants, type helpers
  shared/        -- Cross-package shared types and configs
```

### Coding Conventions

- Server Components by default; `'use client'` only when hooks/interactivity needed
- Feature-based folder structure inside `src/features/`
- Server actions in `src/actions/` with `next-safe-action` wrappers
- Drizzle schemas use `createInsertSchema` / `createUpdateSchema` from `drizzle-zod`
- All schemas export Insert/Update types via `z.infer<typeof schema>`
- Database enums defined with `pgEnum()`, exported with corresponding Zod select schemas
- Shared base fields (`id`, `createdAt`, `updatedAt`, `organizationId`) extracted into `baseFields`
- Environment configs validated with `envin` per-package
- Imports always use `@repo/package-name` workspace paths, never relative `../../`
- Component variants use `class-variance-authority` (CVA)
- `tailwind-merge` for className conflict resolution
- Route groups use `(groupName)` convention in App Router

---

### Mobile Application (Nurse Field App -- EVV, OASIS, Clinical Notes)

| Category | Technology | Why |
|----------|------------|-----|
| **Framework** | React Native + Expo SDK 53 (New Architecture) | OTA updates, EAS builds, native module access |
| **Routing** | Expo Router v4 (file-based) | Mirrors Next.js App Router pattern, deep linking |
| **Styling** | NativeWind v4 (Tailwind CSS for RN) | Same utility classes as web |
| **UI Components** | gluestack-ui v2 | Pre-built accessible components optimized for Expo |
| **Forms** | React Hook Form + @hookform/resolvers | Lightweight, performant |
| **Validation** | Zod v4 (shared with web) | Same validation schemas across platforms |
| **Server State** | TanStack Query v5 | Caching, offline persistence, background refetch |
| **Client State** | Zustand | Same state patterns as web |
| **Offline Storage** | expo-sqlite + WatermelonDB | SQLite for structured data, sync-ready |
| **Key-Value Store** | react-native-mmkv | 30x faster than AsyncStorage, encrypted |
| **Animations** | React Native Reanimated v3 | 60fps native thread animations |
| **Gestures** | React Native Gesture Handler | Swipe, pinch, long-press |
| **Maps/GPS** | expo-location + expo-maps | EVV GPS capture, patient navigation |
| **Camera** | expo-camera | Wound photography for clinical docs |
| **Push Notifications** | expo-notifications | Visit reminders, schedule changes |
| **Background Sync** | expo-background-task | Sync EVV/OASIS data when backgrounded |
| **Network Detection** | @react-native-community/netinfo | Offline mode toggle, sync queue |
| **OTA Updates** | expo-updates + EAS Update | Push JS fixes without App Store review |
| **Builds** | EAS Build (cloud) | iOS + Android builds without local Xcode/Studio |
| **Testing** | Jest + React Native Testing Library + Detox | Unit + integration + device E2E |

### Mobile Project Structure

```
apps/
  mobile/
    app/                 -- Expo Router file-based routes
      (auth)/            -- Login, forgot password
      (tabs)/            -- Main tab navigator
        schedule/        -- Daily visit schedule
        patients/        -- Patient list + detail
        evv/             -- Clock in/out, GPS capture
        notes/           -- Clinical note entry
      oasis/
        [patientId]/     -- Dynamic route per patient
    src/
      components/        -- Shared mobile UI components
      hooks/             -- useOfflineSync, useEVV, etc.
      stores/            -- Zustand stores (shared patterns with web)
      services/          -- API clients, sync engine
      utils/             -- Formatters, validators, constants
```

### Shared Code (Web + Mobile via Monorepo)

| Package | Shared Content |
|---------|---------------|
| `@repo/shared` | TypeScript types, constants, enums |
| `@repo/utils` | Date formatters, OASIS calculators, PDGM grouper logic |
| Zod schemas | Validation for all forms (patient, OASIS, EVV, billing) |
| API contracts | Request/response types, endpoint paths |

---

## Month 1 Goal (Feb 19 - Mar 20)

Build the core platform foundation + start generating market presence. By end of this month:
- Core architecture scaffolded (monorepo, Supabase, AWS, Vercel, auth)
- OASIS-E1 module in progress (the number 1 feature)
- EVV mobile app prototype working (GPS + clock-in/out)
- Landing page live with lead capture
- First 10-20 agency contacts made
- Social media presence established
- All progress tracked in shared Google Sheets

---

## NITHIN (Product Lead / Developer) -- Daily Tasks

> Focus: Architecture, OASIS module, technical leadership, product decisions

| Day | Date | Tasks (4-5 hrs) |
|-----|------|-----------------|
| Wed | Feb 19 | Initialize Turborepo monorepo with Bun. Scaffold `apps/web` (Next.js 16), `packages/db`, `packages/auth`, `packages/ui`, `packages/utils`, `packages/shared`. Configure `turbo.json`, `tsconfig.base.json`, workspace catalog. Set up Git repo in `fills` org with branching strategy. |
| Thu | Feb 20 | Set up Supabase project (PostgreSQL + Auth + Storage). Configure AWS account (S3 bucket for PHI, IAM roles). Set up Vercel project linked to Git repo. Configure CI/CD with GitHub Actions (`turbo run build --affected`). |
| Fri | Feb 21 | Design database schema in `packages/db/src/schema/` -- patients, users, visits, OASIS assessments, EVV records, care plans, billing. Use Drizzle `pgTable` with `baseFields` pattern. Define `pgEnum` for visit types, claim statuses. Create `drizzle-zod` insert/update schemas. Push to Supabase with `drizzle-kit push`. |
| Mon | Feb 23 | Set up Better-Auth with organizations plugin, admin plugin, RBAC. Roles: Admin, Nurse, Aide, Billing, Manager. Configure Supabase as database adapter. Set up `@repo/auth` package with middleware for route protection. |
| Tue | Feb 24 | Build Patient module -- CRUD with `next-safe-action` server actions. Drizzle queries in `packages/db/src/queries.ts`. Patient demographics, diagnoses (ICD-10), insurance info, care plan summary. TanStack Query for data fetching. |
| Wed | Feb 25 | Continue Patient module -- patient list with TanStack Table (search, filter by status/payer, sort, pagination). Patient detail page with tabbed layout. Zod validation on all forms. |
| Thu | Feb 26 | Begin OASIS-E1 module -- research CMS OASIS-E1 item set (120+ items). Map items to Drizzle schema fields. Design form flow (section-by-section with Zod skip logic). Store in `packages/db/src/schema/oasis.ts`. |
| Fri | Feb 27 | OASIS-E1 continued -- build first 3 sections (M0010-M0150: administrative/demographic items, timing, homebound status). TanStack Form with per-section Zod schemas. Auto-save with server actions. |
| Mon | Mar 2 | OASIS-E1 -- build functional status sections (GG0130 self-care, GG0170 mobility). These directly affect PDGM payment grouping. Implement PDGM grouper logic in `packages/utils`. |
| Tue | Mar 3 | OASIS-E1 -- build clinical items (wounds M1340, medications M2020, pain M1370). Cross-field validation with Zod refinements (homebound vs. ambulation consistency). |
| Wed | Mar 4 | OASIS-E1 -- build remaining sections. Data locking after finalization with `better-result` error handling. Audit trail via Drizzle hooks. |
| Thu | Mar 5 | OASIS-E1 validation engine -- implement CMS validation rules. Flag contradictions. PDGM grouper calculator in shared utils. |
| Fri | Mar 6 | Review week's progress with Shreyas. Integration check -- Patient + OASIS via Drizzle relations. Fix bugs. Plan next week. Share validated learnings with Aishwarya for outreach messaging. |
| Mon | Mar 9 | Clinical Notes module -- structured visit note templates (vitals, interventions, narrative). Link to patient + visit records. `next-safe-action` server actions. |
| Tue | Mar 10 | Clinical Notes continued -- OASIS context window during note entry. eSignature/attestation via Better-Auth session. |
| Wed | Mar 11 | Scheduling module backend -- visit types as `pgEnum` (SN, PT, OT, SLP, HHA), frequency rules, nurse assignment logic. Calendar data model. Supabase Realtime for live updates. |
| Thu | Mar 12 | Scheduling -- visit tracking (completed/missed/rescheduled), missed visit alerts, care plan compliance tracking. |
| Fri | Mar 13 | Billing module (phase 1) -- claims data model, visit-to-billing code mapping (HCPCS), claims status tracking as `pgEnum`. |
| Mon | Mar 16 | Billing continued -- OASIS-to-PDGM payment calculation, claims aging, denial categorization, EVV-to-claims matching in shared utils. |
| Tue | Mar 17 | Integration day -- connect all modules end-to-end: Patient > OASIS > Visits > Notes > Billing. Vitest integration tests. |
| Wed | Mar 18 | Testing and hardening -- Vitest tests for critical paths. Playwright E2E for key workflows. |
| Thu | Mar 19 | HIPAA compliance -- encryption at rest (Supabase + AWS S3 encryption), TLS 1.2+, audit logging via Drizzle hooks, RBAC enforced, Supabase backup configured. |
| Fri | Mar 20 | Month-end review. Demo all modules. Document status. Plan Month 2. Review Aishwarya's pipeline and adjust product priorities based on discovery call insights. |

---

## SHREYAS (Developer) -- Daily Tasks

> Focus: Mobile app, frontend, EVV module, UI/UX, API endpoints

| Day | Date | Tasks (4-5 hrs) |
|-----|------|-----------------|
| Wed | Feb 19 | Set up `packages/ui` -- install shadcn/ui, configure Tailwind CSS v4 with `@tailwindcss/postcss`, design tokens. Initialize Expo project in `apps/mobile` with SDK 53, Expo Router. |
| Thu | Feb 20 | Build web dashboard shell -- login page with Better-Auth UI, sidebar navigation (shadcn Sheet/NavigationMenu), role-based views. Configure `next-themes` for light/dark mode. |
| Fri | Feb 21 | Dashboard -- patient list page (TanStack Table, search, filter), patient detail skeleton. Connect to backend via TanStack Query. `nuqs` for URL filter state. |
| Mon | Feb 23 | Mobile setup -- configure Expo Router (`app/(auth)/`, `app/(tabs)/`). Set up NativeWind v4. Configure `react-native-mmkv` for tokens. `expo-notifications` setup. |
| Tue | Feb 24 | EVV module (mobile) -- "Start Visit" / "End Visit" flow. GPS capture via `expo-location`. Timestamp recording. Patient address + native maps link. |
| Wed | Feb 25 | EVV offline mode -- `expo-sqlite` for local cache, sync on connectivity via `@react-native-community/netinfo`. "Synced" indicator. Battery-efficient GPS polling. |
| Thu | Feb 26 | EVV -- visit summary screen (who, when, where, service). Dashboard showing EVV compliance status per visit. Zustand store for EVV state. |
| Fri | Feb 27 | EVV-to-billing matching UI -- reconciliation dashboard (shadcn Badge/Alert: red/yellow/green for mismatches). |
| Mon | Mar 2 | OASIS form UI (web) -- dynamic form renderer with TanStack Form. Dropdowns, radio buttons, conditional skip logic. Zod validation per section. |
| Tue | Mar 3 | OASIS form UI continued -- validation indicators, progress bar, auto-save via server actions. |
| Wed | Mar 4 | OASIS form (mobile) -- adapt for tablet/phone in Expo. Large touch targets, offline via `expo-sqlite`, Reanimated transitions. |
| Thu | Mar 5 | Clinical Notes UI -- visit note form (vitals, interventions, narrative). Explore speech-to-text via `expo-speech` or native APIs. |
| Fri | Mar 6 | Weekly sync with Nithin. Fix integration issues. Coordinate on Drizzle schema changes and TanStack Query keys. |
| Mon | Mar 9 | Scheduling UI (web) -- calendar view (daily/weekly), drag-and-drop with `@dnd-kit/sortable`, color-coded visit types. |
| Tue | Mar 10 | Scheduling UI (mobile) -- nurse daily schedule in Expo. Next visits, patient info, GPS nav link, care plan preview. Push notifications via `expo-notifications`. |
| Wed | Mar 11 | Patient communication -- Twilio SMS integration. Visit confirmation messages. Server action + background job. |
| Thu | Mar 12 | Billing UI -- claims list with aging buckets (TanStack Table), denial chart (Recharts), claim detail with linked OASIS + EVV. |
| Fri | Mar 13 | Admin dashboard -- KPI tiles (shadcn Card), charts (Recharts): patients, visits, EVV %, OASIS completion, claims pending. |
| Mon | Mar 16 | Landing page -- Next.js in `apps/web` or separate `apps/landing`. Hero, Features, Pricing, About, Contact. Framer Motion animations. |
| Tue | Mar 17 | Landing page polish -- responsive, SEO via `generateMetadata`, contact form via `@repo/email` (Resend). Deploy to Vercel. |
| Wed | Mar 18 | E2E testing -- full user flows on web (Playwright) and mobile (Detox). Log bugs in GitHub Issues. |
| Thu | Mar 19 | Bug fixes + polish -- loading states (shadcn Skeleton), error handling (better-result), empty states. |
| Fri | Mar 20 | Month-end review. Demo mobile + web. Document known issues. Plan Month 2. |

---

## AISHWARYA (Business Strategist) -- Daily Tasks

> Focus: Market validation, lead generation, content, social media, partnerships, progress tracking
>
> **IMPORTANT:** Aishwarya must update the Daily Progress Tracker (Google Sheet) at the end of every work session. No exceptions. This is the team's primary visibility into business development progress.

### Tools Aishwarya Will Use Daily

| Tool | Purpose |
|------|---------|
| **Google Sheets** | Daily progress tracker, lead database, outreach CRM, metrics dashboard, hypothesis tracker |
| **Google Docs** | Blog drafts, outreach templates, discovery call notes, case studies, pitch deck scripts |
| **Canva** | Social media graphics, infographics, pitch deck design, brand assets, blog header images |
| **ChatGPT / Claude** | Draft blog posts, generate email variations, research competitors, create social copy, summarize discovery calls |
| **GitHub** | Issues for feature requests from agencies, project board for business tasks, tracking in fills org repo |
| **GitHub Actions** | Automated weekly report generation from Google Sheet data (optional, set up in Week 3) |
| **LinkedIn** (linkedin.com) | Primary B2B outreach platform, content publishing, group engagement |
| **Twitter/X** (x.com) | Industry commentary, product updates, nurse community engagement |
| **Facebook** (facebook.com) | Home health agency owner groups, local business communities |
| **Reddit** (reddit.com) | r/homehealth, r/nursing, r/healthIT -- value-first engagement, not selling |
| **YouTube** (youtube.com) | Short educational videos about EVV/OASIS pain points (Month 2+) |
| **Instagram** (instagram.com) | Behind-the-scenes, team culture, visual brand building |
| **TikTok** (tiktok.com) | Short-form nurse-relatable content (pain point humor, "day in the life" angles) |
| **Medium** (medium.com) | Long-form blog republishing for SEO backlinks |
| **Substack** (substack.com) | Optional newsletter for home health industry insights |
| **Apollo.io** | Lead enrichment, email finder, contact verification |
| **Instantly.ai or Lemlist** | Cold email automation, warm-up, sequence management |
| **Loom** (loom.com) | Personalized video messages for warm outreach |

### Social Media Platform Strategy

| Platform | Posting Frequency | Content Type | Target Audience |
|----------|-------------------|--------------|-----------------|
| **LinkedIn** | 4-5 posts/week | Industry insights, blog excerpts, polls, product teasers | Agency owners, Executive Directors, DONs |
| **Twitter/X** | 5-7 posts/week | Quick takes, stats, thread breakdowns, retweets of nurse complaints | Nurses, HH admins, healthcare tech community |
| **Facebook** | 2-3 posts/week | Group discussions, shared articles, community questions | Small agency owners, office managers |
| **Reddit** | 3-4 comments/week | Helpful answers in r/homehealth, r/nursing, r/healthIT | Nurses, agency staff, IT decision-makers |
| **Instagram** | 2-3 posts/week | Infographics, team updates, product previews | Brand awareness, younger nurses |
| **TikTok** | 1-2 videos/week | Short "pain point" skits, OASIS frustration humor, EVV fails | Nurses, HHAs, viral potential |
| **Medium** | 1 article/week | Republished blog posts with SEO optimization | SEO, industry professionals |

---

### Charts, Documents, and Trackers Aishwarya Must Create and Maintain

All documents live in a shared Google Drive folder and/or the fills GitHub repo. Updated daily or weekly as noted.

#### 1. Daily Progress Tracker (Google Sheet) -- Updated EVERY DAY

| Column | Description |
|--------|-------------|
| Date | Work date |
| Tasks Planned | What was planned for today |
| Tasks Completed | What was actually completed |
| Outreach Sent | Number of LinkedIn requests + cold emails + calls made today |
| Responses Received | Number of replies, acceptances, meetings booked |
| Content Created | What content was produced (blog draft, 3 social posts, etc.) |
| Key Learnings | Any insights from conversations, competitor research, or market signals |
| Blockers | Anything preventing progress |
| Tomorrow Plan | What is planned for next work day |
| Hours Worked | Actual hours logged |

#### 2. Lead Database and CRM (Google Sheet) -- Updated as new leads are added

| Column | Description |
|--------|-------------|
| Agency Name | Full legal name |
| State / City | Location |
| Patient Census | Estimated (50-300 target range) |
| Owner / ED Name | Primary contact |
| Email | Verified email |
| LinkedIn URL | Profile link |
| Phone | If available |
| Current Software | WellSky, HCHB, Axxess, Generations, paper, etc. |
| Pain Level (1-5) | Based on research/conversation |
| Status | New / Contacted / Responded / Call Scheduled / Call Done / Pilot Candidate / Not Interested |
| Last Touch Date | When was last outreach |
| Notes | Conversation summaries, objections, interest areas |
| Source | How we found them (LinkedIn, CMS database, referral, etc.) |

#### 3. Hypothesis Tracker (Google Sheet) -- Updated weekly

| Column | Description |
|--------|-------------|
| Hypothesis ID | H001, H002, etc. |
| Hypothesis | "We believe [user] will [action] because [reason]" |
| Experiment | What we will do to test this |
| Metric | How we measure success |
| Status | Not Started / In Progress / Validated / Invalidated |
| Result | What happened |
| Learning | What we learned |
| Action | What we changed as a result |

Example hypotheses:
- H001: "We believe independent agencies with 50-150 patients will respond to EVV compliance messaging at >15% rate because their Oct 2025 deadline is approaching"
- H002: "We believe DONs are the internal champion and will drive purchase decisions because they feel the OASIS burden most directly"
- H003: "We believe agencies currently on WellSky are the most likely to switch because post-acquisition support has collapsed"

#### 4. Content Calendar (Google Sheet) -- Planned weekly, updated daily

| Column | Description |
|--------|-------------|
| Date | Publish date |
| Platform | LinkedIn / Twitter / Facebook / Reddit / Instagram / TikTok / Medium |
| Content Type | Post / Blog / Infographic / Video / Comment / Poll |
| Topic | Specific topic |
| Copy | Draft text (or link to Google Doc) |
| Visual | Link to Canva design |
| Status | Drafted / Designed / Scheduled / Published |
| Engagement | Likes, comments, shares, clicks (filled in after 48hrs) |

#### 5. Competitor Intelligence Sheet (Google Sheet) -- Updated as new intel is gathered

| Column | Description |
|--------|-------------|
| Competitor | WellSky, HCHB, Axxess, Netsmart, etc. |
| Pricing | What they charge (from demo/research) |
| Strengths | What they do well |
| Weaknesses | User complaints, feature gaps, support issues |
| EVV Support | How they handle EVV compliance |
| OASIS Handling | Manual vs. assisted vs. AI |
| Contract Terms | Minimums, lock-in periods |
| Source | Where this info came from |
| Date Updated | Last verified |

#### 6. Discovery Call Notes (Google Docs) -- One doc per call

Template:
- Agency name, contact name, role, date
- Current software and biggest complaint about it
- Top 3 pain points (ranked)
- OASIS burden: how many hours per assessment?
- EVV status: compliant? what system?
- Budget range: what they pay now, what they would pay
- Switching barriers: data migration fears, training, contracts
- Interest level (1-5) in our product
- Follow-up actions
- Quotes worth using in marketing (with permission)

#### 7. Weekly Summary Report (Google Doc) -- Every Friday

Sections:
- Outreach metrics (sent, responded, calls done)
- Top 3 insights from the week
- Hypothesis validation updates
- Content performance (best/worst performing posts)
- Pipeline status (how many leads at each stage)
- Recommendations for product team based on market feedback
- Next week plan

#### 8. Pilot Candidate Ranking (Google Sheet) -- Starting Week 4

| Column | Description |
|--------|-------------|
| Agency Name | Name |
| Contact | Who we are talking to |
| Pain Score (1-10) | How badly they need this |
| Size Fit | Patient census in 50-300 range? |
| Tech Readiness | Do they have iPads/phones for nurses? |
| Responsiveness | How quickly they reply, how engaged |
| Geography | Preferred Tier 1/2 market? |
| Current Contract | Locked into existing vendor? When does it end? |
| Pilot Probability | Low / Medium / High |

---

### AISHWARYA -- Daily Task Schedule

> All tasks assume AI tools (ChatGPT, Canva AI, Apollo.io) are used to amplify output.
> LinkedIn daily limit: 15-20 connection requests/day (max 100/week).
> Cold email: start with 10-15/day, scale to 35-50/day/inbox after warm-up.

| Day | Date | Tasks (4-5 hrs) |
|-----|------|-----------------|
| Wed | Feb 19 | **SETUP DAY.** Create shared Google Drive folder with all tracker templates (Daily Progress, Lead DB, Content Calendar, Hypothesis Tracker, Competitor Intel). Set up brand guidelines in Canva (colors, fonts, logo placeholder). Register business accounts: LinkedIn company page, Twitter/X (@handle), Facebook business page, Instagram business account, Medium publication. Create content calendar template for the month. Update Daily Progress Sheet. |
| Thu | Feb 20 | **SETUP DAY 2.** Set up Apollo.io account for lead enrichment. Set up Instantly.ai or Lemlist account for cold email (begin domain warm-up -- this takes 14+ days, start NOW). Create GitHub repo in fills org for business tracking (issues board for feature requests from market). Write brand messaging doc in Google Docs: tagline, value proposition, 3 key differentiators, target persona descriptions. Create first 3 Canva templates (LinkedIn post, Twitter post, blog header). Update Daily Progress Sheet. |
| Fri | Feb 21 | **LEAD LIST BATCH 1.** Use Apollo.io + CMS Medicare provider database + state licensing databases to build first 50 agency contacts. Target: Phoenix, Austin, Nashville, Albuquerque, Raleigh (Tier 1 markets). Collect: agency name, ED/owner name, verified email, LinkedIn profile, estimated patient census, current software if discoverable. Enter all into Lead Database Sheet with status "New." Use ChatGPT to research each agency's public info. Update Daily Progress Sheet. |
| Mon | Feb 23 | **LEAD LIST BATCH 2.** Build 50 more agency contacts using same method. Add Charlotte, Columbus, Memphis, San Antonio, Jacksonville. Total target: 100 agencies by end of today. Begin populating Competitor Intelligence Sheet with WellSky, HCHB, Axxess data from G2, Capterra, Reddit complaints. Update Daily Progress Sheet. |
| Tue | Feb 24 | **OUTREACH TEMPLATES.** Write 3 cold email sequences in Google Docs (each is 3-touch: intro, value, ask). Angle 1: EVV compliance deadline. Angle 2: OASIS documentation burden. Angle 3: switching from WellSky. Use ChatGPT to generate 5 subject line variations per sequence. Write 2 LinkedIn connection message templates (personalization framework: [Name] + [their role] + [their agency's specific challenge]). Write 1 LinkedIn InMail template. Create Hypothesis Tracker with first 5 hypotheses. Update Daily Progress Sheet. |
| Wed | Feb 25 | **LINKEDIN OUTREACH WAVE 1.** Send 15-20 personalized LinkedIn connection requests to agency Executive Directors and DONs from Lead DB. Join 5 LinkedIn groups: Home Health Care Professionals, Home Health Agency Owners, OASIS Documentation, Home Health Nursing, Healthcare Technology. Engage in 3 group discussions with insightful comments (not pitching). Schedule first 5 cold emails via Instantly/Lemlist (warm-up permitting). Update Lead DB statuses. Update Daily Progress Sheet. |
| Thu | Feb 26 | **BLOG POST 1.** Write "EVV Compliance 2026: What Every Home Health Agency Needs to Know" using ChatGPT for first draft, then edit with real data from our research docs (state-by-state deadlines, penalty amounts, Cures Act requirements). Design blog header image in Canva. Publish on Medium. Create 4 social media snippets from the blog (2 LinkedIn, 1 Twitter thread, 1 Facebook). Design each visual in Canva. Update Content Calendar. Update Daily Progress Sheet. |
| Fri | Feb 27 | **CONTENT BATCH.** Use ChatGPT + Canva to create next week's social media content (batch creation): 5 LinkedIn posts (EVV stats, OASIS burden, nurse quote graphic, product teaser, industry poll), 5 Twitter posts, 2 Facebook posts, 1 Instagram infographic ("Why nurses leave home health -- by the numbers"), 2 Reddit comment drafts for r/homehealth and r/nursing threads. Schedule posts using Buffer or native scheduling. Update Content Calendar. Follow up on Wave 1 LinkedIn connections with value-add messages to anyone who accepted. Update Daily Progress Sheet. |
| Mon | Mar 2 | **LINKEDIN WAVE 2 + COLD EMAIL LAUNCH.** Send 15-20 more LinkedIn connection requests (new batch from Lead DB). Send first cold email campaign to 20 agencies (Angle 1: EVV compliance). Follow up on Wave 1 acceptances with conversation starters. Post blog 1 excerpt on LinkedIn with hook. Engage in 5 LinkedIn group discussions. Post 1 comment on r/homehealth thread about EVV challenges. Update Lead DB with all responses and status changes. Update Daily Progress Sheet. |
| Tue | Mar 3 | **INDUSTRY ASSOCIATIONS.** Research and contact 5 home health associations: NAHC (National Association for Home Care & Hospice), Texas Association for Home Care & Hospice, Arizona Home Health Association, Tennessee Home Care Association, Home Care Association of North Carolina. Draft partnership inquiry emails in Google Docs (using ChatGPT). Send outreach. Research their conferences, webinars, sponsorship opportunities. Add to Competitor Intel Sheet. Post 2 social media pieces. Update Daily Progress Sheet. |
| Wed | Mar 4 | **BLOG POST 2.** Write "Why Home Health Nurses Are Quitting -- And What Software Can Do About It" using ChatGPT for draft, edit with real stats (80% caregiver turnover, 8-12 hrs OASIS, 70% charting time). Design visuals in Canva. Publish on Medium. Create 4 social snippets. Start a Twitter thread with the key stats. Post 1 Instagram story with the infographic. Send 15 more cold emails (Angle 2: OASIS burden). Update Content Calendar. Update Daily Progress Sheet. |
| Thu | Mar 5 | **FIRST OUTREACH CALLS.** Make first 10 validation calls/emails to warmest leads from Lead DB (status: Responded or Call Scheduled). Use Pain Point Discovery questionnaire (10 questions -- create this in Google Docs today if not done). Record notes in Discovery Call Notes docs. These are VALIDATION calls, not sales: "We are building modern home health software -- what are your biggest frustrations with your current system?" Send follow-up emails within 2 hours of each call. Update Lead DB. Update Hypothesis Tracker based on call insights. Update Daily Progress Sheet. |
| Fri | Mar 6 | **WEEKLY SYNC + REPORT.** Write first Weekly Summary Report in Google Docs. Sync with Nithin: share outreach results (connections, responses, call insights). Present top 3 market insights. Recommend any product priority changes based on what agencies are actually saying. Update Hypothesis Tracker (validate/invalidate any hypotheses). Follow up on all pending cold emails (Touch 2). Post 2 social pieces. Update Daily Progress Sheet. |
| Mon | Mar 9 | **LINKEDIN WAVE 3 + SCALE.** Send 15-20 more LinkedIn requests (total ~60 sent). Post Blog 1 on LinkedIn as a long-form article (not just a link). Engage in all comments. Share in 3 LinkedIn groups. Send 20 more cold emails (Angle 3: switching from WellSky). Follow up on Angle 1 emails (Touch 2). Create 1 Loom video: personal intro to attach to warm email follow-ups ("Hi [Name], I am [Aishwarya], here is what we are building for agencies like yours"). Post on TikTok: first short video about OASIS frustrations (use trending format). Update Lead DB. Update Daily Progress Sheet. |
| Tue | Mar 10 | **COMPETITOR SECRET SHOP.** Request demos/pricing from WellSky and Axxess using a secondary email. Document their: sales pitch, pricing structure, demo flow, feature highlights, contract terms, weaknesses they avoid mentioning. Update Competitor Intelligence Sheet. Record observations in Google Doc. Create comparison table: Us vs. WellSky vs. Axxess vs. HCHB (for internal use and eventual marketing). Send 15 cold emails. Post 2 social pieces. Update Daily Progress Sheet. |
| Wed | Mar 11 | **DISCOVERY CALL PREP.** Finalize Pain Point Discovery Questionnaire (10 questions) in Google Docs. Questions must cover: current software name, monthly cost, biggest daily frustration, OASIS completion time, EVV compliance status, mobile app satisfaction, data migration fears, what would make them switch, budget for new software, timeline for decision. Schedule 3-5 discovery calls from warm leads this week. Create call scheduling link (Calendly or Cal.com). Send 10 more cold emails. Post 2 social pieces. Update Daily Progress Sheet. |
| Thu | Mar 12 | **DISCOVERY CALLS.** Conduct 3-5 discovery calls. Take detailed notes in Google Doc template. After each call: update Lead DB status, update Hypothesis Tracker, extract 1-2 quotable insights for marketing use (with permission), send thank-you email within 2 hours. Use ChatGPT to summarize call notes and extract key themes. Post 1 social piece. Update Daily Progress Sheet. |
| Fri | Mar 13 | **CASE STUDY + WEEKLY REPORT.** Write case study template in Google Docs (for future pilot customers). Write a "Day in the Life of Patricia" marketing story based on our ops research (the nurse who spends 70% of her day charting). Weekly Summary Report 2: outreach metrics, discovery call insights, hypothesis updates, content performance, pipeline status. Sync with Nithin. Post 2 social pieces. Update Daily Progress Sheet. |
| Mon | Mar 16 | **SOCIAL MEDIA PUSH.** Post Blog 2 on LinkedIn as long-form article. Create and post Twitter thread: "5 things home health agencies waste money on." Create Instagram Reel or TikTok: "What nurses actually do vs. what they should be doing" (charting stat graphic). Create 1 infographic in Canva: "Home Health EVV Compliance by State" (map graphic). Schedule 5 posts for the week. Send 20 cold emails (Follow-up Touch 3 for Angle 1). Engage in Reddit threads. Update Content Calendar. Update Daily Progress Sheet. |
| Tue | Mar 17 | **REDDIT + FORUM PRESENCE.** Post 1 helpful answer on r/homehealth, 1 on r/nursing, 1 on r/healthIT. Do NOT pitch product -- add genuine value by answering EVV/OASIS questions using our research knowledge. Comment on 3 existing threads. Join Home Health Care Manager Facebook groups and post discussion question. Repost blog excerpts on Medium with SEO keywords. Send 10 cold emails. Follow up on all outstanding responses. Update Lead DB. Update Daily Progress Sheet. |
| Wed | Mar 18 | **PILOT CANDIDATE RANKING.** From all outreach so far (100+ contacts, discovery calls done), identify top 5-10 agencies most likely to pilot. Create Pilot Candidate Ranking Sheet. Score each on: pain level, responsiveness, size fit, tech readiness, geography, contract status. Rank by Pilot Probability. Share ranking with Nithin for alignment. Send 10 cold emails. Post 2 social pieces. Update Daily Progress Sheet. |
| Thu | Mar 19 | **PITCH DECK.** Create 10-slide pilot pitch deck in Canva: (1) Problem -- OASIS/EVV burden with real stats, (2) Solution -- our platform overview, (3) Demo screenshots (use mockups if product not ready), (4) Key features -- OASIS, EVV, Scheduling, Billing, (5) How we are different -- comparison table, (6) Pilot terms -- free 2-week parallel run, (7) Pricing -- $5K-$9K/year all-inclusive, (8) ROI projection -- time saved per nurse per week, (9) Team credibility, (10) Next steps. Export to PDF. Share with team for review. Post 1 social piece. Update Daily Progress Sheet. |
| Fri | Mar 20 | **MONTH-END REVIEW.** Write final Monthly Summary Report in Google Docs. Include: total outreach numbers (target vs. actual), response rates, discovery calls completed, pilot candidates identified, content published (blog posts, social posts, videos), social following growth per platform, top 5 validated learnings, recommendations for Month 2. Present to team. Update all trackers. Update Daily Progress Sheet. |

---

## Weekly Milestones

| Week | Dates | Nithin | Shreyas | Aishwarya |
|------|-------|--------|---------|-----------|
| 1 | Feb 19-21 | Monorepo + Supabase + DB schema | Frontend setup + Expo init + dashboard shell | All trackers set up, 100 leads sourced, brand assets created |
| 2 | Feb 23-27 | Auth + Patient module + OASIS start | Mobile EVV module + OASIS form UI | Outreach templates, LinkedIn Wave 1 + 2, Blog 1 published, 20 cold emails sent |
| 3 | Mar 2-6 | OASIS functional status + validation | OASIS UI (web + mobile) + clinical notes | LinkedIn Wave 3, 50+ cold emails, 3-5 discovery calls, association outreach |
| 4 | Mar 9-13 | Clinical Notes + Scheduling + Billing | Scheduling UI + admin dashboard | Secret shop competitors, 3-5 more discovery calls, case study template |
| 5 | Mar 16-20 | Integration + testing + HIPAA | Landing page + E2E testing + polish | Social push, pilot candidates ranked, pitch deck, monthly report |

---

## Aishwarya -- Realistic Output Benchmarks (With AI Tools)

These are the validated, achievable targets for a focused 4-5 hour workday using AI amplification:

| Activity | Daily/Weekly Target | Rationale |
|----------|---------------------|-----------|
| LinkedIn connection requests | 15-20/day, max 100/week | LinkedIn enforced limit. Higher = account restriction. |
| LinkedIn posts/engagement | 4-5 posts/week, 3-5 comments/day | Builds visibility without appearing spammy. |
| Cold emails sent | 10-15/day (Week 1-2), scale to 35-50/day (Week 3+) | Domain warm-up takes 14 days. Cannot blast on Day 1. |
| Blog posts written | 1 per week (2hrs with ChatGPT draft + manual editing) | AI generates draft in 20min, editing/data-verification takes 1.5hrs. |
| Social media graphics | 5-8 per batch session (1hr with Canva AI) | Canva templates make this fast once brand kit is set up. |
| Discovery calls | 3-5 per week (starting Week 3) | Need 2 weeks of outreach before calls are possible. |
| Lead list building | 50 leads per session (2hrs with Apollo.io) | Apollo enrichment + CMS database makes this efficient. |
| Reddit/forum comments | 3-4 meaningful comments per week | Quality over quantity. Must not be perceived as marketing. |
| TikTok/Instagram Reels | 1-2 per week | Quick to produce with Canva video editor or CapCut. |
| Daily progress update | 10 min at end of day | Non-negotiable. Updates the Google Sheet. |

---

## Month 2-3 Preview

### Month 2 (Mar 23 - Apr 17): Pilot-Ready Product
- Complete OASIS-E1 full form + OASIS-E2 transition prep (April 2026 deadline)
- EVV state aggregator export (Sandata for CA, top 3 states)
- Data migration tooling (import from Kinnser/Generations CSV/XML)
- QuickBooks integration for billing
- UI/UX polish -- nurse-friendly (large buttons, offline-first, Reanimated transitions)
- Sign 3-5 pilot agencies from Aishwarya's pipeline

### Month 3 (Apr 20 - May 15): Pilot Launch
- Onboard first 3-5 pilot agencies (free 2-week parallel run)
- Daily support (Slack channel + phone)
- Collect feedback, fix critical bugs in real-time
- Generate case study + testimonials from pilot
- Begin paid conversions ($5K-$9K/year tier)
- CMS OASIS submission format tested + validated

---

## Success Metrics (End of Month 1)

| Metric | Target |
|--------|--------|
| Core modules built | Patient, OASIS (80%), EVV, Notes, Scheduling, Billing (basic) |
| Mobile app | EVV clock-in/out working, OASIS entry working, offline mode working |
| Landing page | Live with lead capture on Vercel |
| Agency contacts | 100+ in Lead DB, 60+ outreach sent, 10+ responses, 5+ discovery calls |
| Social media | LinkedIn + Twitter + Facebook + Instagram active, 2 blog posts, 25+ posts, TikTok started |
| Pilot candidates | 5-10 identified and ranked, 2-3 warm |
| Content published | 2 blog posts (Medium), 1 Twitter thread, 1 infographic, 1 video |
| Hypotheses tested | 5 hypotheses created, at least 2 validated or invalidated |
| Competitor intel | WellSky + Axxess + HCHB documented with pricing, strengths, weaknesses |
| Trackers maintained | Daily Progress Sheet updated every work day, Lead DB current, Content Calendar current |
