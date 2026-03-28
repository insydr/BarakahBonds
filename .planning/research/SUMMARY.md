# Barakah Bonds: Research Summary

> **Purpose:** Executive synthesis for roadmap planning
> **Updated:** 2025-03-28

---

## 1. Stack Summary

### High Confidence (🟢) — Core Platform

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Web** | Next.js 15 + Tailwind 4 + shadcn/ui | SSR, i18n routing, RTL native, HIPAA via Vercel BAA |
| **Mobile** | Expo SDK 52 + Expo Router | ~80% code reuse with web, OTA updates, HIPAA-compliant builds |
| **Language** | TypeScript 5.x | End-to-end type safety across all layers |
| **Database** | PostgreSQL (Supabase Pro) | Row-Level Security, encryption at rest, BAA at $25/mo |
| **Auth** | Supabase Auth (MVP) | BAA included, JWT-based, anonymous mode for privacy |
| **Real-time** | Supabase Realtime | Included with Supabase, BAA-covered |
| **Hosting** | Vercel Enterprise | HIPAA BAA, SOC 2 Type II, edge functions |
| **Monitoring** | Sentry Business | HIPAA BAA, error tracking, performance |

### Medium Confidence (🟡) — May Need Adjustment

| Layer | Technology | Risk |
|-------|------------|------|
| **Backend** | Hono 4 + tRPC 11 | Could pivot to Supabase-only if simpler |
| **ORM** | Drizzle ORM | Less mature than Prisma; migration tooling newer |
| **State** | Zustand 5 | TanStack Query handles most state; Zustand for UI state |
| **Mobile Styling** | NativeWind 4 | Newer, less ecosystem than NativeBase |
| **CMS** | Payload CMS 3.x | Could use Sanity Enterprise if team prefers managed |
| **Sync** | Custom + TanStack Query | Complex offline sync; may need dedicated library |

### Estimated Monthly Cost

- **MVP:** ~$1,700-2,000/mo
- **Scale:** ~$3,000-5,000/mo

---

## 2. Table Stakes — Must Have

*Absence causes user churn. Build first.*

### Privacy & Trust (Critical)
- **Secure Account Creation** — Email-based, optional phone, MFA, HIPAA-compliant
- **Discrete Branding** — Neutral app icon, generic name, no revealing notifications
- **Data Anonymization** — "Burn after reading" option, permanent deletion, no data selling
- **Couple Account Linking** — Invite-link mechanism, granular sharing controls

### Core Functionality
- **360-Degree Assessment** — Deen/Dunya/Aila/Nafs sections, 45-60 min, save-and-resume
- **Couple's Report (PDF)** — Professional report for Imam/mentor review
- **Decision Log** — Shared journal for agreements, category tagging, search
- **Agenda Builder** — Conversation templates for difficult discussions
- **In-App Messaging** — End-to-end encrypted, integrates with Pause & Pray

### Content & Accessibility
- **Article Library** — Curated, searchable, multi-language
- **Duas Library** — Arabic + transliteration + translation, audio recitation
- **Daily Tips** — Discrete notifications, actionable advice
- **Multi-language Support** — EN, AR (RTL), UR (RTL), FR
- **Low-Bandwidth Mode** — Audio-only, text transcripts, offline downloads
- **Accessibility (WCAG 2.1)** — Screen readers, adjustable text, high contrast

---

## 3. Differentiators — Competitive Advantage

*Users choose us for these. Build to stand out.*

### Islamic Integration
- **Scholarly Endorsement** — Each assessment question cites Quranic verse/Hadith
- **Prayer Time Integration** — Syncs with local prayer times for conflict intervention
- **Pause & Pray** — Panic button with Duas, breathing exercises, Wudu reminder
- **Prophetic Parenting Guide** — Seerah-based parenting techniques

### Clinical + Islamic Bridge
- **Red Flag Detection** — Algorithm identifying high-risk compatibility areas
- **Generation Gap Bridge** — Content for immigrant parents with Western-raised children
- **Boundary Scripts Library** — Pre-written scripts for in-law/extended family scenarios
- **Extended Family Dynamics Module** — Joint family system, in-law relationships

### Education Platform
- **Video Course Platform** — Structured courses (Unity First, Shura Workshop)
- **Islamic Calendar Integration** — Occasion-specific content for Ramadan, Eid

---

## 4. Watch Out For — Top Pitfalls

*Address proactively or risk platform failure.*

### Critical (Must Solve in Phase 1)

| Pitfall | Risk | Mitigation |
|---------|------|------------|
| **Community Privacy Breach** | Platform death — Muslim communities are small, interconnected | "Burn after reading," zero-knowledge encryption, explicit subpoena policy |
| **Scholarly Misalignment** | Trust destruction, community rejection | Fiqh Review Board before publication, only Sahih/Hasan hadith |
| **Spouse Data Asymmetry** | Harm to users, trust destruction | Individual accounts + couple connection (not shared), private journal never syncs |
| **Discrete Branding Failure** | Non-adoption due to privacy fears | Generic icon/name, stealth mode option, vague notifications |

### High (Solve Early)

| Pitfall | Risk | Mitigation |
|---------|------|------------|
| **Stigmatizing Tone** | Opposite of mission, non-adoption | Normalize struggle, "seeking tools is sunnah," user test tone extensively |
| **Over/Under-Medicalizing** | Harm or missed crises | Clear criteria for "normal challenge" vs. "clinical concern," PHQ-9/GAD-7 screening |
| **Cultural Tourist Trap** | Content feels inauthentic | Diverse advisory board, culturally adaptive content, test across cultures |

### Medium (Monitor)

| Pitfall | Risk | Mitigation |
|---------|------|------------|
| **Spouse Non-Participation** | Reduced value, churn | "Solo mode" value from Day 1, partner invitation is enhancement not requirement |
| **Multi-Language Content Drift** | Outdated/incorrect translations | Translation management system, native speaker review, "last updated" dates visible |
| **Notification Timing Insensitivity** | Disruption during prayer | Integrate prayer times, avoid Salah times, user-configurable quiet hours |

---

## 5. Build Order — Recommended Phases

### Phase 1: Foundation (Weeks 1-4)
- Database setup (PostgreSQL + encryption)
- User Service (auth, profiles, couple linking)
- API Gateway + authentication (JWT, MFA)
- Basic web app shell
- HIPAA audit logging

### Phase 2: Assessment Engine (Weeks 5-8)
- Question Bank CMS with scholarly citations
- Assessment Service (response collection, progress)
- Scoring algorithm (compatibility + red flags)
- PDF Report generation
- Couple linking flow completion

### Phase 3: Communication Studio (Weeks 9-12)
- WebSocket infrastructure (Supabase Realtime)
- Chat Service (basic, E2E encrypted)
- Pause & Pray feature
- Prayer Time integration
- Decision Log + Agenda Builder

### Phase 4: Content & Polish (Weeks 13-16)
- Content Service (courses, articles)
- Media pipeline (CDN, Mux)
- Course progress tracking
- Offline mode (WatermelonDB for mobile)
- Multi-language support (full i18n)
- Mobile apps (iOS + Android via Expo)

### Phase 5: Analytics & Optimization (Weeks 17-20)
- PHQ-9/GAD-7 integration
- Analytics Service (privacy-preserving)
- Performance optimization
- Security audit
- HIPAA compliance review

---

## 6. Key Decisions — Critical for Roadmap

### Architecture Decisions

| Decision | Choice Made | Implication |
|----------|-------------|-------------|
| **Supabase-first vs Custom Backend** | Supabase for MVP | Faster launch, may need Hono backend at scale |
| **Expo vs Flutter vs Bare React Native** | Expo SDK 52 | 80% web code reuse, OTA updates, but React Native ecosystem |
| **Shared Account vs Linked Accounts** | Linked individual accounts | More complex but protects privacy (critical for trust) |
| **Client-side vs Server-side Encryption** | Both (hybrid) | Client-side for journals, server-side for assessments |

### Content Decisions

| Decision | Choice Made | Implication |
|----------|-------------|-------------|
| **Madhab Position** | Present multiple mainstream views | More content work, but avoids sectarian conflict |
| **Scholar Review Requirement** | Required before publication | Slower content velocity, but protects trust |
| **Interfaith Marriage Content** | Practical guidance, no prescriptive stance | Broader reach, avoids controversy |

### Business Decisions

| Decision | Choice Made | Implication |
|----------|-------------|-------------|
| **Revenue Model** | B2C freemium primary, B2B secondary | B2B is enhancement, not dependency |
| **Third-party Ads** | None (ever) | Protects privacy trust, limits revenue options |
| **Data Monetization** | None (ever) | Core trust differentiator, no AI training on user data |

### Product Decisions

| Decision | Choice Made | Implication |
|----------|-------------|-------------|
| **Solo Mode** | Full value without partner | Essential for adoption when spouse won't participate |
| **Anonymous Mode** | Supported | Reduces friction, increases trust |
| **Video/Voice Calls** | Not in Phase 1-3 | Privacy concerns, requires licensed professionals |

---

## Action Items for Roadmapper

1. **Phase 1 scope** must include: HIPAA infrastructure, discrete branding, private journal, couple linking with privacy controls
2. **Assessment algorithm** requires clinical + Islamic review before launch
3. **Content pipeline** needs scholar vetting process from Day 1
4. **Mobile apps** start in Phase 4 but architecture must support from Phase 1
5. **Multi-language** begins in Phase 1 (partial), full in Phase 4 — plan for RTL from start
6. **Crisis escalation** path required in Phase 1 even without telehealth integration

---

*This summary synthesized from: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md*
