# Barakah Bonds — Roadmap

**Version:** 1.0  
**Created:** 2026-03-28  
**Granularity:** Standard (5-8 phases)

---

## Overview

This roadmap defines the phased delivery plan for Barakah Bonds v1 (MVP). Each phase delivers observable user value while building toward the complete platform. Phases are derived from requirement dependencies and user value delivery.

**Guiding Principles:**
- Privacy/trust is the foundation — must be Phase 1
- Assessment engine is core value proposition — Phase 2
- Prayer integration differentiates the platform — integrated early
- Solo mode must work from Day 1 — no spouse dependency for core value

---

## Phase 1: Foundation & Trust

**Duration:** Weeks 1-4  
**Theme:** Secure, private, discrete — users trust the platform with sensitive data

### Requirements Mapped

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01 | User can create account with email/password | P0 |
| AUTH-02 | User can log in and stay logged in across sessions | P0 |
| AUTH-03 | User can log out from any page | P0 |
| AUTH-04 | Couple accounts can be linked with invitation code | P0 |
| AUTH-05 | User data is encrypted at rest (AES-256-GCM) | P0 |
| AUTH-06 | User can enable "burn after reading" for sensitive content | P0 |
| AUTH-07 | App branding is discrete (no visible "marriage help" references) | P0 |

### Success Criteria

1. **User can create account and trust their data is secure** — New users complete registration and understand privacy protections
2. **User stays logged in across sessions without re-authentication friction** — Returning users access their data seamlessly
3. **User can disconnect from partner without data exposure** — Couple linking is reversible without compromising individual privacy
4. **App passes visual discretion test** — App icon, home screen, and notifications reveal nothing about relationship/marriage help
5. **Solo mode works immediately** — User gains value without requiring partner invitation

### Technical Deliverables

- PostgreSQL database with Row-Level Security and encryption at rest
- Supabase Auth integration (JWT-based, MFA-ready)
- User profile management API
- Couple linking mechanism with invitation codes
- Discrete UI/UX implementation
- HIPAA audit logging infrastructure

### Dependencies

- None (foundation phase)

---

## Phase 2: Assessment Engine

**Duration:** Weeks 5-8  
**Theme:** Core value delivery — the 360° compatibility assessment

### Requirements Mapped

| ID | Requirement | Priority |
|----|-------------|----------|
| ASSESS-01 | User can complete 360-degree compatibility assessment | P0 |
| ASSESS-02 | Assessment covers Deen (Faith) section with scholarly citations | P0 |
| ASSESS-03 | Assessment covers Dunya (Finances/Career) section | P0 |
| ASSESS-04 | Assessment covers Aila (Family/In-laws) section | P0 |
| ASSESS-05 | Assessment covers Nafs (Personality/Mental Health) section | P0 |
| ASSESS-06 | System detects and flags high-risk areas for discussion | P0 |
| ASSESS-07 | Each question cites relevant Quranic verse or Hadith | P0 |
| ASSESS-08 | User can generate Couple's Report for Imam/mentor review | P1 |
| ASSESS-09 | Assessment can be completed individually (solo mode) | P0 |

### Success Criteria

1. **User completes full assessment in 45-60 minutes** — Progress saves automatically, resume capability works
2. **User sees their individual results immediately upon completion** — No waiting for partner
3. **User receives flagged areas with Islamic scholarly context** — Red flags include Quranic/Hadith guidance
4. **User can download professional PDF report for Imam review** — Report is Imam-ready, no formatting required
5. **User understands their results without partner participation** — Solo mode delivers standalone value

### Technical Deliverables

- Question Bank CMS with scholarly citation structure
- Assessment Service (response collection, progress tracking)
- Scoring algorithm (compatibility + red flag detection)
- PDF Report generation service
- Save-and-resume functionality
- Couple comparison view (when both complete)

### Dependencies

- Phase 1 complete (user accounts, couple linking, secure infrastructure)

---

## Phase 3: Communication Studio

**Duration:** Weeks 9-12  
**Theme:** Tools for difficult conversations — Shura in practice

### Requirements Mapped

| ID | Requirement | Priority |
|----|-------------|----------|
| COMM-01 | Couple can send messages to each other through platform | P0 |
| COMM-02 | "Pause & Pray" button triggers calm-down timer | P0 |
| COMM-03 | Pause & Pray suggests relevant Dua for conflict situations | P0 |
| COMM-04 | Pause & Pray includes breathing exercise guidance | P0 |
| COMM-05 | Couple can create structured agenda for difficult conversations | P1 |
| COMM-06 | Agenda builder provides "I" statement templates | P1 |
| COMM-07 | Agenda builder includes active listening prompts | P1 |
| COMM-08 | Couple can record decisions in shared Decision Log | P1 |
| COMM-09 | Decision Log entries are timestamped and searchable | P1 |
| PRAYER-01 | App syncs with local prayer times | P0 |
| PRAYER-02 | During logged conflict, app suggests prayer break at appropriate time | P0 |
| PRAYER-03 | Prayer time notifications can be customized | P1 |

### Success Criteria

1. **Couple can communicate through encrypted channel** — Messages are private, real-time, E2E encrypted
2. **User triggers Pause & Pray and feels calmer** — Panic button is accessible, Dua/breathing guidance is helpful
3. **Couple uses Agenda Builder to prepare for difficult conversation** — Template reduces conflict escalation
4. **Couple references Decision Log to recall past agreements** — Searchable, timestamped entries prevent re-litigation
5. **Prayer times naturally interrupt conflicts** — Integration feels supportive, not intrusive

### Technical Deliverables

- WebSocket infrastructure (Supabase Realtime)
- Chat Service with E2E encryption
- Pause & Pray feature (timer, Dua library, breathing UI)
- Prayer Time integration (Aladhan API with fallback)
- Agenda Builder with templates
- Decision Log with search
- Prayer time notification system

### Dependencies

- Phase 1 complete (couple linking for messaging)
- Phase 2 complete (assessment provides context for conversations)

---

## Phase 4: Content & Education

**Duration:** Weeks 13-16  
**Theme:** Knowledge for growth — scholarly content library

### Requirements Mapped

| ID | Requirement | Priority |
|----|-------------|----------|
| CONT-01 | User can browse article library | P1 |
| CONT-02 | User receives daily relationship tips | P1 |
| CONT-03 | User can access Dua library for relationship situations | P1 |
| CONT-04 | Content includes scholarly citations from mainstream sources | P1 |

### Success Criteria

1. **User finds relevant article within 3 clicks** — Categorized, searchable content library
2. **User engages with daily tip and finds it actionable** — Tips are practical, not preachy
3. **User accesses appropriate Dua for their situation** — Dua library is categorized by relationship context
4. **User trusts content authenticity** — Scholarly citations are visible and verifiable

### Technical Deliverables

- Content Service (articles, tips, Duas)
- Content CMS for admin management
- Daily tip notification system
- Dua library with Arabic, transliteration, translation
- Citation display system
- Content categorization and search

### Dependencies

- Phase 1 complete (user authentication for personalization)

---

## Phase 5: Polish & Launch

**Duration:** Weeks 17-20  
**Theme:** Production-ready — secure, tested, mobile

### Requirements Mapped

No new v1 requirements — this phase ensures quality delivery of all previous phases.

### Success Criteria

1. **User can complete full assessment on mobile device** — iOS and Android apps function identically to web
2. **Platform passes HIPAA compliance review** — Third-party audit confirms compliance
3. **User experiences no critical bugs in core flows** — Assessment, messaging, and Pause & Pray work reliably
4. **Platform handles 100 concurrent users without degradation** — Load testing validates scalability
5. **User data survives security penetration testing** — No critical vulnerabilities found

### Technical Deliverables

- Mobile apps (iOS + Android via Expo)
- Security penetration testing
- HIPAA compliance audit
- Performance optimization
- Load testing and scalability fixes
- Bug fixes and polish
- Production deployment and monitoring

### Dependencies

- All previous phases complete

---

## Requirement Coverage Matrix

| Category | Requirements | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|----------|-------------|---------|---------|---------|---------|---------|
| AUTH | 7 | ✅ 7 | — | — | — | — |
| ASSESS | 9 | — | ✅ 9 | — | — | — |
| COMM | 9 | — | — | ✅ 9 | — | — |
| PRAYER | 3 | — | — | ✅ 3 | — | — |
| CONT | 4 | — | — | — | ✅ 4 | — |
| **Total** | **32** | **7** | **9** | **12** | **4** | **0** |

**Coverage:** 32/32 v1 requirements mapped (100%)

---

## Phase Dependencies

```
Phase 1: Foundation & Trust
    │
    ▼
Phase 2: Assessment Engine
    │
    ▼
Phase 3: Communication Studio
    │
    ▼
Phase 4: Content & Education
    │
    ▼
Phase 5: Polish & Launch
```

---

## Risk Mitigation by Phase

| Phase | Key Risks | Mitigations |
|-------|-----------|-------------|
| 1 | Privacy breach destroys trust | HIPAA-compliant infrastructure, discrete branding from Day 1 |
| 2 | Assessment feels un-Islamic | Scholar review before launch, only Sahih/Hasan hadith |
| 3 | Spouse non-participation | Solo mode delivers value independently |
| 4 | Content drift from Islamic values | Scholar board oversight, citation requirements |
| 5 | Launch vulnerabilities | Security audit, penetration testing before go-live |

---

## Out of Scope for v1

The following are deferred to v2+:

- FAM-01 through FAM-03 (Family Dynamics Module)
- PARENT-01 through PARENT-03 (Parenting Module)
- LANG-01 through LANG-04 (Multi-language Support)
- ACCESS-01 through ACCESS-03 (Accessibility Features)

---

## Evolution

This roadmap evolves at phase transitions. Update when:
- Requirements are added, removed, or reprioritized
- Phase scope changes based on learnings
- Timeline adjustments are needed

---
*Last updated: 2026-03-28*
