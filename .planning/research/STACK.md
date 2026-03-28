# Barakah Bonds Technology Stack Recommendations

**Research Date:** 2025-03-28
**Target Launch:** 2025-2026
**Confidence Level Key:** 🟢 High | 🟡 Medium | 🔴 Low

---

## Executive Summary

This document prescribes the optimal technology stack for Barakah Bonds, a HIPAA-compliant Muslim mental health and relationship platform requiring web and mobile applications, real-time communication, multi-language support (including RTL), prayer time integration, and offline capability.

### Core Philosophy

1. **HIPAA-First Architecture:** Every component must support BAA (Business Associate Agreement) execution
2. **Type Safety:** End-to-end type safety reduces bugs in sensitive mental health data handling
3. **Cross-Platform Efficiency:** Single codebase for web + mobile reduces maintenance burden
4. **Offline-First:** Low-bandwidth users must have core functionality available offline

---

## 1. Frontend (Web)

### Recommended Stack

| Component | Choice | Version | Confidence |
|-----------|--------|---------|------------|
| Framework | **Next.js** | 15.x (App Router) | 🟢 High |
| Language | **TypeScript** | 5.x | 🟢 High |
| Styling | **Tailwind CSS** | 4.x | 🟢 High |
| Component Library | **shadcn/ui** | Latest | 🟢 High |
| State Management | **Zustand** | 5.x | 🟡 Medium |
| Forms | **React Hook Form** | 7.x + Zod | 🟢 High |
| Data Fetching | **TanStack Query** | 5.x | 🟢 High |

### Rationale

**Next.js 15 (App Router)** is the optimal choice for several reasons:
- **Server Components** reduce client-side JavaScript, improving performance for low-bandwidth users
- **Built-in i18n routing** supports Arabic/Urdu RTL layouts natively
- **API Routes** provide backend-for-frontend pattern, keeping sensitive operations server-side
- **ISR (Incremental Static Regeneration)** allows pre-rendering content pages (courses, articles) while keeping dynamic parts fresh
- **Vercel deployment** offers HIPAA-compliant hosting with BAA (Enterprise tier)

**Tailwind CSS 4** with **shadcn/ui** provides:
- Accessible components out of the box (critical for mental health app)
- RTL support via `dir="rtl"` integration
- Consistent design system without runtime overhead
- Full customization for "discrete branding" requirement

### What NOT to Use

| Avoid | Reason |
|-------|--------|
| Create React App | Deprecated, no SSR support |
| Material UI | Large bundle size, RTL support is additive not native |
| Redux | Overkill for this use case, Zustand is simpler and lighter |
| Emotion/styled-components | Runtime overhead, Tailwind is more performant for this use case |

---

## 2. Frontend (Mobile)

### Recommended Stack

| Component | Choice | Version | Confidence |
|-----------|--------|---------|------------|
| Framework | **Expo (React Native)** | SDK 52+ | 🟢 High |
| Router | **Expo Router** | 4.x | 🟢 High |
| Language | **TypeScript** | 5.x | 🟢 High |
| Styling | **NativeWind** | 4.x | 🟡 Medium |
| Offline Storage | **WatermelonDB** | Latest | 🟢 High |
| Notifications | **Expo Notifications** | Built-in | 🟢 High |

### Rationale

**Expo SDK 52+ with Expo Router** is the clear winner for 2025-2026:

- **Shared Codebase:** ~80% code reuse with Next.js web app (business logic, types, API clients)
- **Expo Router** provides file-based routing matching Next.js patterns, reducing cognitive load
- **OTA Updates** via Expo Updates allows pushing fixes without App Store review (critical for mental health app)
- **Expo EAS** provides HIPAA-compliant build infrastructure with SOC 2 Type II certification
- **Development Speed:** No native code management required
- **New Architecture:** Expo now supports React Native's New Architecture (Fabric, TurboModules) by default

**NativeWind 4** allows:
- Same Tailwind classes as web (shared design tokens)
- Better performance than react-native-web for styling
- RTL support matches web implementation

**WatermelonDB** for offline-first:
- Lazy-loaded SQLite backend
- Observable queries for reactive UI
- Sync protocol built-in for eventual consistency
- Better performance than AsyncStorage for complex data

### Alternative Considered: Flutter

Flutter was considered but rejected because:
- No code sharing with web (Next.js)
- Dart ecosystem smaller than TypeScript/JavaScript
- Team would need to maintain two codebases
- Expo has closed the performance gap significantly

### What NOT to Use

| Avoid | Reason |
|-------|--------|
| React Native CLI (bare) | Increases complexity, loses OTA updates |
| Flutter | No web code sharing, different language |
| Ionic/Capacitor | Native performance is inferior to React Native |
| PWA-only | Push notifications on iOS unreliable, app store presence builds trust |

---

## 3. Backend/API

### Recommended Stack

| Component | Choice | Version | Confidence |
|-----------|--------|---------|------------|
| Runtime | **Node.js** | 22.x LTS | 🟢 High |
| Framework | **Hono** | 4.x | 🟡 Medium |
| Language | **TypeScript** | 5.x | 🟢 High |
| Validation | **Zod** | 3.x | 🟢 High |
| ORM | **Drizzle ORM** | Latest | 🟡 Medium |
| API Style | **tRPC** | 11.x | 🟡 Medium |

### Rationale

**Hono 4.x** over Express/Fastify:
- **Edge-ready:** Deploys to Cloudflare Workers, Vercel Edge, Node.js
- **TypeScript-first:** Types flow through entire stack
- **Lightweight:** ~12KB vs Express ~200KB
- **OpenAPI support:** Auto-generates docs for Imam Gateway B2B API

**Drizzle ORM** over Prisma:
- **No runtime overhead:** SQL-like syntax compiles to prepared statements
- **Better performance:** No query engine process
- **Migrations as code:** Version-controlled schema
- **HIPAA audit logging:** Easier to implement at query level

**tRPC 11** for type safety:
- End-to-end type inference from backend to frontend
- No schema definition needed (uses TypeScript types)
- Perfect for Next.js + Expo shared types

### Alternative: Supabase

Supabase is a strong alternative if team prefers managed backend:
- Postgres database with Row Level Security
- Built-in auth, storage, real-time
- **BAA available on Pro tier ($25/mo)**
- Reduces backend code significantly

**Recommendation:** Start with Supabase for MVP speed, migrate to custom Hono backend if scaling requires it.

### What NOT to Use

| Avoid | Reason |
|-------|--------|
| Express | No native TypeScript, larger attack surface |
| NestJS | Over-engineered for this scope |
| GraphQL | Unnecessary complexity for CRUD-heavy app |
| Prisma | Heavy query engine, slower for read-heavy workloads |
| Python/FastAPI | Team should use single language (TypeScript) |

---

## 4. Database

### Recommended Stack

| Component | Choice | Version | Confidence |
|-----------|--------|---------|------------|
| Primary DB | **PostgreSQL** | 16.x | 🟢 High |
| Hosting | **Neon** or **Supabase** | Managed | 🟢 High |
| Cache | **Upstash Redis** | Managed | 🟢 High |
| Search | **PostgreSQL Full-Text** | Built-in | 🟡 Medium |
| File Storage | **Supabase Storage** | Managed | 🟢 High |

### Rationale

**PostgreSQL 16** is the gold standard for HIPAA-compliant applications:
- **Row-Level Security (RLS):** Database-level access control
- **Native encryption:** pgcrypto extension
- **Audit logging:** pgaudit extension for HIPAA compliance
- **Full-text search:** No need for separate search engine at MVP scale
- **ACID compliance:** Critical for assessment data integrity

**Neon** or **Supabase** for hosting:
- Both offer **BAA execution** on paid tiers
- Branching for development (Neon)
- Point-in-time recovery
- Automatic scaling
- Connection pooling built-in

**Upstash Redis** for:
- Rate limiting (prevent abuse)
- Session caching
- Real-time presence indicators
- **HIPAA BAA available**

### Schema Considerations for HIPAA

```
Required tables:
- users (PHI - encrypted at rest)
- assessments (PHI - encrypted at rest)
- assessment_responses (PHI - encrypted at rest)
- couple_reports (PHI - encrypted at rest)
- decision_logs (PHI - encrypted at rest)
- audit_logs (immutable, retained 6 years minimum)
- prayer_times_cache (non-PHI)
- content (courses, articles - non-PHI)
```

### What NOT to Use

| Avoid | Reason |
|-------|--------|
| MongoDB | HIPAA compliance is harder, no native encryption |
| PlanetScale | No BAA available as of 2025 |
| Firebase Realtime DB | HIPAA BAA requires Blaze tier + additional config |
| SQLite | Not suitable for multi-user production |

---

## 5. Authentication

### Recommended Stack

| Component | Choice | Version | Confidence |
|-----------|--------|---------|------------|
| Provider | **Clerk** | Latest | 🟡 Medium |
| Alternative | **Supabase Auth** | Built-in | 🟢 High |

### Rationale

**Clerk** is the modern choice for React/React Native:
- **Pre-built UI components** for sign-in/sign-up
- **Multi-factor authentication** built-in
- **Session management** across web and mobile
- **Organizations** feature for couple accounts
- **SOC 2 Type II** certified
- **HIPAA BAA available** on Enterprise tier

However, Clerk's HIPAA BAA requires Enterprise tier (expensive at early stage).

**Supabase Auth** as alternative:
- **BAA available on Pro tier ($25/mo)**
- Built-in RLS integration
- JWT-based, works with any backend
- Supports anonymous users for privacy
- Row-Level Security integration

### Recommendation

**Use Supabase Auth** for MVP (cost-effective HIPAA compliance):
- Start at $25/mo with BAA
- Migrate to Clerk Enterprise when scaling
- Both use JWT, migration path is clear

### Authentication Flow

```
1. Email/password with MFA (TOTP)
2. Anonymous mode for privacy-sensitive users
3. Couple linking via invite codes
4. Session timeout: 30 minutes inactive
5. Forced re-auth for sensitive operations (assessment results)
```

### What NOT to Use

| Avoid | Reason |
|-------|--------|
| Auth0 | Expensive at scale, complex pricing |
| AWS Cognito | Poor DX, complex setup |
| Custom JWT | Don't roll your own auth |
| Firebase Auth | Limited HIPAA support |

---

## 6. Real-time Communication

### Recommended Stack

| Component | Choice | Version | Confidence |
|-----------|--------|---------|------------|
| WebSockets | **Pusher Channels** | Latest | 🟢 High |
| Alternative | **Supabase Realtime** | Built-in | 🟢 High |
| Presence | Same as above | - | 🟢 High |

### Rationale

**Pusher Channels** for real-time features:
- **BAA available** on Enterprise tier
- Battle-tested WebSocket infrastructure
- Presence channels for couple activity
- Private channels for encrypted messaging
- React Native SDK available

**Features enabled:**
- Couple's shared Decision Log sync
- Real-time typing indicators during Shura sessions
- "Partner is online" presence
- Push notifications for new messages

**Supabase Realtime** as alternative:
- Included with Supabase (BAA covered)
- Postgres-based (LISTEN/NOTIFY)
- Simpler if already using Supabase

### Video/Voice (Phase 4)

For telehealth integration (Phase 4), consider:
- **Daily.co** - HIPAA BAA available, WebRTC infrastructure
- **Twilio Video** - HIPAA compliant, but expensive
- **LiveKit** - Open source option, self-host for HIPAA

### What NOT to Use

| Avoid | Reason |
|-------|--------|
| Socket.io | Self-hosting required for HIPAA |
| SignalR | Microsoft ecosystem lock-in |
| Custom WebSockets | Infrastructure burden |

---

## 7. Content Management

### Recommended Stack

| Component | Choice | Version | Confidence |
|-----------|--------|---------|------------|
| Headless CMS | **Payload CMS** | 3.x | 🟡 Medium |
| Alternative | **Sanity** | Latest | 🟢 High |
| Video Hosting | **Mux** | Latest | 🟢 High |

### Rationale

**Payload CMS 3.x**:
- **Self-hosted** - full data control for HIPAA
- **TypeScript-native** - types flow to frontend
- **PostgreSQL backend** - same DB as application
- **Rich text editor** for course content
- **Localized content** built-in
- **Open source** with commercial support

**Sanity** as managed alternative:
- **HIPAA BAA available** on Enterprise
- Excellent content localization
- Real-time collaboration for content team
- Better DX for non-technical content editors
- Higher cost but less infrastructure

**Mux** for video:
- HIPAA BAA available
- Adaptive bitrate streaming
- Automatic transcription (for accessibility)
- Low-latency streaming for live content

### Content Structure

```
content/
├── courses/
│   ├── unity-first/
│   │   ├── en/
│   │   ├── ar/
│   │   ├── ur/
│   │   └── fr/
│   └── prophetic-parenting/
├── articles/
│   └── generation-gap/
├── duas/
│   └── conflict-resolution/
└── assessment-questions/
    └── pre-marital/
```

### What NOT to Use

| Avoid | Reason |
|-------|--------|
| WordPress | PHP, security concerns |
| Contentful | Expensive at scale |
| Strapi | Less mature TypeScript support |
| Notion as CMS | Not suitable for production |

---

## 8. Infrastructure/DevOps

### Recommended Stack

| Component | Choice | Version | Confidence |
|-----------|--------|---------|------------|
| Web Hosting | **Vercel** | Enterprise | 🟢 High |
| Mobile Builds | **Expo EAS** | Latest | 🟢 High |
| Database | **Neon** or **Supabase** | Managed | 🟢 High |
| CI/CD | **GitHub Actions** | Latest | 🟢 High |
| Monitoring | **Sentry** | Latest | 🟢 High |
| Logging | **Axiom** | Latest | 🟡 Medium |
| Secrets | **Infisical** | Latest | 🟢 High |

### Rationale

**Vercel Enterprise**:
- **HIPAA BAA available**
- SOC 2 Type II certified
- Edge functions for low-latency
- Preview deployments for testing
- Integrated analytics

**Expo EAS**:
- **SOC 2 Type II** certified
- Managed build infrastructure
- Automatic updates (OTA)
- Store submission automation
- HIPAA-compliant with proper configuration

**GitHub Actions**:
- Workflow automation
- Secret management (with Infisical integration)
- Free for public repos, affordable for private

**Sentry**:
- Error tracking
- Performance monitoring
- **HIPAA BAA available** on Business tier
- Source map upload for debugging

**Axiom**:
- Serverless log management
- HIPAA compliant
- Better pricing than Datadog for early stage

### Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                 │
├─────────────────────────────────────────────────────────────┤
│  Web App (Next.js)    │    Mobile App (Expo)                │
│  ─────────────────     │    ──────────────────               │
│  Vercel Edge          │    App Store / Play Store           │
└─────────────┬─────────┴────────────┬────────────────────────┘
              │                      │
              ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                 │
│  ────────────────────────────                                │
│  Hono API (Vercel Edge)  │  tRPC Procedures                  │
│  - Authentication        │  - Type-safe client               │
│  - Rate limiting         │  - Auto-generated docs            │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  ──────────────────                                         │
│  PostgreSQL (Neon/Supabase)                                 │
│  - Row-Level Security                                       │
│  - Encrypted at rest                                        │
│  - Point-in-time recovery                                   │
├─────────────────────────────────────────────────────────────┤
│  Redis (Upstash)           │  Storage (Supabase)            │
│  - Session cache           │  - User uploads                │
│  - Rate limits             │  - Encrypted files             │
└─────────────────────────────────────────────────────────────┘
```

### HIPAA Compliance Checklist

```
✅ BAA with Vercel (Enterprise)
✅ BAA with Neon or Supabase (Pro)
✅ BAA with Upstash (Enterprise)
✅ BAA with Sentry (Business)
✅ BAA with Pusher (Enterprise) OR Supabase Realtime
✅ Encryption at rest (all providers)
✅ Encryption in transit (TLS 1.3)
✅ Access controls (RLS + application)
✅ Audit logging (pgaudit + application)
✅ Data backup and recovery
✅ Incident response plan
✅ Employee training documentation
```

### What NOT to Use

| Avoid | Reason |
|-------|--------|
| AWS (raw) | Complexity overhead, steep learning curve |
| DigitalOcean | No HIPAA BAA as of 2025 |
| Heroku | HIPAA only on Private Spaces (expensive) |
| Self-hosted K8s | Maintenance burden, compliance risk |

---

## 9. Third-party Integrations

### Prayer Times API

| Component | Choice | Version | Confidence |
|-----------|--------|---------|------------|
| Prayer Times | **Aladhan API** | v1 | 🟢 High |
| Alternative | **Muslim Salat API** | v1 | 🟡 Medium |

**Aladhan API:**
- Free tier: 1,000 requests/day
- Paid tier: $9.99/month for 100,000 requests
- Methods: Muslim World League, ISNA, Umm al-Qura, etc.
- Hijri calendar included
- No authentication required for basic usage

**Implementation:**
```typescript
// Cache prayer times daily per location
// 1. Fetch from Aladhan
// 2. Store in Redis (key: `prayer:${lat}:${lng}:${date}`)
// 3. Serve from cache

// Integration with "Pause & Pray"
const prayerIntervention = async (userId: string) => {
  const nextPrayer = await getNextPrayer(userId);
  if (isConflictActive(userId) && nextPrayer.time < 30min) {
    return {
      message: `It is time for ${nextPrayer.name}. Take a break, make Wudu, and resume after prayer.`,
      dua: getDuaForConflict(nextPrayer.name)
    };
  }
};
```

### Islamic Content APIs

| Resource | Source | Notes |
|----------|--------|-------|
| Quran verses | **Al-Quran Cloud API** | Free, multiple translations |
| Hadith | **Sunnah.com API** | Free, authenticated collections |
| Duas | **Self-hosted database** | Curated, verified content |

### Assessment Engine

| Component | Choice | Notes |
|-----------|--------|-------|
| PHQ-9/GAD-7 | **Self-hosted questions** | Public domain, no API needed |
| Scoring logic | **Custom implementation** | Simple algorithms, no external dependency |

### Analytics (Privacy-Pocused)

| Component | Choice | Confidence |
|-----------|--------|------------|
| Analytics | **PostHog** | 🟢 High |
| Alternative | **Plausible** | 🟢 High |

**PostHog:**
- Self-hosted option for full HIPAA compliance
- Event-based analytics
- Session recording (opt-in)
- Feature flags included

### Push Notifications

| Platform | Choice | Notes |
|----------|--------|-------|
| iOS/Android | **Expo Notifications** | Built into Expo |
| Web | **Web Push API** | Via VAPID keys |
| Provider | **Expo Push Service** | Free, unlimited |

---

## 10. Internationalization (i18n)

### Recommended Stack

| Component | Choice | Version | Confidence |
|-----------|--------|---------|------------|
| i18n Framework | **next-intl** | 3.x | 🟢 High |
| Mobile i18n | **expo-localization** | Built-in | 🟢 High |
| Translation Files | **JSON** | - | 🟢 High |

### Rationale

**next-intl 3.x:**
- Server Components support (Next.js 15)
- Automatic locale detection
- ICU message format (plural forms, gender)
- RTL support built-in
- Shared locale files between web and mobile

**Language Support:**
```
locales/
├── en/
│   ├── common.json
│   ├── assessment.json
│   └── courses/
├── ar/           # RTL
│   ├── common.json
│   └── ...
├── ur/           # RTL
│   └── ...
└── fr/
    └── ...
```

**RTL Handling:**
```typescript
// Tailwind config
export default {
  theme: {
    extend: {
      // Automatic RTL support
    }
  }
}

// Next.js middleware
const locale = negotiateLanguage(request);
const dir = ['ar', 'ur'].includes(locale) ? 'rtl' : 'ltr';
```

---

## 11. Offline Capability

### Recommended Stack

| Component | Choice | Version | Confidence |
|-----------|--------|---------|------------|
| Mobile DB | **WatermelonDB** | Latest | 🟢 High |
| Web Storage | **IndexedDB + Dexie.js** | 4.x | 🟢 High |
| Sync Engine | **Custom + TanStack Query** | - | 🟡 Medium |

### Rationale

**WatermelonDB (Mobile):**
- Lazy-loaded collections
- Observable queries
- Built-in sync protocol
- SQLite backend
- Works offline-first

**Dexie.js (Web):**
- Promise-based IndexedDB wrapper
- Live queries
- Sync helpers
- Export/import for backup

**Offline Strategy:**
```
1. Core content (courses, duas) → Pre-download on first launch
2. Assessment questions → Cached locally
3. User data (decision logs, notes) → Local-first with sync
4. Prayer times → Cached for 7 days
5. User settings → Always local
```

---

## Summary: Recommended Stack at a Glance

| Layer | Technology | Cost (Monthly) | HIPAA |
|-------|------------|----------------|-------|
| **Web** | Next.js 15 + Tailwind 4 | $0 | Via Vercel BAA |
| **Mobile** | Expo SDK 52 | $0 | Via EAS |
| **API** | Hono 4 + tRPC 11 | $0 | Via hosting BAA |
| **Database** | PostgreSQL (Supabase Pro) | $25 | ✅ BAA included |
| **Auth** | Supabase Auth | Included | ✅ BAA included |
| **Real-time** | Supabase Realtime | Included | ✅ BAA included |
| **Storage** | Supabase Storage | Included | ✅ BAA included |
| **Hosting** | Vercel Enterprise | ~$1,500 | ✅ BAA available |
| **CMS** | Payload CMS (self-hosted) | $0 | ✅ Self-managed |
| **Video** | Mux | ~$100 | ✅ BAA available |
| **Monitoring** | Sentry Business | $26 | ✅ BAA available |
| **Analytics** | PostHog (self-hosted) | $0 | ✅ Self-managed |
| **Notifications** | Expo Push | $0 | ✅ Built-in |
| **Prayer Times** | Aladhan | $10 | N/A (no PHI) |

**Estimated Monthly Infrastructure Cost (MVP):** ~$1,700-2,000
**Estimated Monthly Infrastructure Cost (Scale):** ~$3,000-5,000

---

## Risk Assessment

| Risk | Mitigation | Priority |
|------|------------|----------|
| HIPAA violation | Use providers with BAA, implement RLS, audit logging | Critical |
| Data breach | Encrypt at rest/transit, minimal data collection, anon mode | Critical |
| Single point of failure | Multi-region DB, CDN, health checks | High |
| Third-party API downtime (prayer times) | Cache aggressively, fallback to calculation | Medium |
| RTL layout issues | Test with native Arabic/Urdu speakers | Medium |
| Offline sync conflicts | Last-write-wins with manual resolution | Low |

---

## Next Steps

1. **Set up Supabase project** with Pro tier (BAA)
2. **Initialize Next.js 15** project with next-intl
3. **Initialize Expo** project with shared TypeScript config
4. **Implement auth flow** with Supabase Auth
5. **Build assessment engine** prototype
6. **Test prayer time integration** with Aladhan
7. **Conduct HIPAA audit** before storing any PHI

---

*Document version: 1.0*
*Last updated: 2025-03-28*
*Author: Stack Research Agent*
