# Barakah Bonds — Project Context

> This file provides context for AI assistants working on the Barakah Bonds project. Read this first.

---

## Project Overview

**Barakah Bonds** is a mobile and web application providing preventative mental health support for Muslim families. The platform bridges Islamic wisdom with clinical psychology, offering a private, stigma-free space for couples and parents to strengthen their relationships.

**Core Value:** Faith-Fortified Relationships — couples must be able to communicate effectively and resolve conflicts constructively using tools that respect their Islamic values.

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Web | Next.js 15 + Tailwind 4 + shadcn/ui | Server Components, native RTL, HIPAA-ready |
| Mobile | Expo SDK 52 + Expo Router | 80% code reuse with web, OTA updates |
| Database | PostgreSQL (Supabase Pro) | BAA included, RLS, encryption |
| Auth | Supabase Auth | BAA on Pro tier, cost-effective HIPAA |
| Real-time | Supabase Realtime | Included with Supabase, BAA-covered |
| Prayer API | Aladhan API | Free tier, multiple calculation methods |

---

## Project Structure

```
BarakahBonds/
├── .claude/                    # GSD framework (AI workflows)
├── .planning/                  # Project planning documents
│   ├── PROJECT.md              # Project context and evolution
│   ├── REQUIREMENTS.md         # Detailed requirements with traceability
│   ├── ROADMAP.md              # Phase definitions and success criteria
│   ├── STATE.md                # Current project status
│   ├── config.json             # Project configuration
│   └── research/               # Research outputs
│       ├── SUMMARY.md          # Research synthesis
│       ├── STACK.md            # Technology stack decisions
│       ├── FEATURES.md         # Feature breakdown
│       ├── ARCHITECTURE.md     # System architecture
│       └── PITFALLS.md         # Common pitfalls to avoid
├── docs/                       # Documentation
└── src/                        # Source code (to be created)
```

---

## Development Phases

| Phase | Theme | Requirements | Duration |
|-------|-------|--------------|----------|
| 1 | Foundation & Trust | AUTH-01 to AUTH-07 | Weeks 1-4 |
| 2 | Assessment Engine | ASSESS-01 to ASSESS-09 | Weeks 5-8 |
| 3 | Communication Studio | COMM-01 to COMM-09, PRAYER-01 to PRAYER-03 | Weeks 9-12 |
| 4 | Content & Education | CONT-01 to CONT-04 | Weeks 13-16 |
| 5 | Polish & Launch | Quality assurance | Weeks 17-20 |

---

## Critical Constraints

### Privacy & Trust (Existential)
- **HIPAA compliance required** — mental health data
- **Discrete branding** — app must not reveal "marriage help" to casual observers
- **Data anonymization** — users fear community gossip
- **Solo mode** — must deliver value without spouse participation

### Cultural Sensitivity
- **Scholarly alignment** — all religious content must cite mainstream sources (Sahih/Hasan)
- **Extended family dynamics** — solutions must account for in-laws
- **Multi-generational gap** — immigrant parents vs Western-raised children

### Technical Constraints
- **Multi-language from architecture** — Arabic/Urdu RTL support from Phase 1
- **Low-bandwidth support** — offline capability for users with poor connectivity
- **Mobile-first** — primary users are on mobile devices

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Preventative orientation | Crisis services exist; gap is in prevention | Users seek help before problems escalate |
| Faith-integrated approach | Bridges gap between Imams and therapists | Neither alone serves Muslim families well |
| Supabase-first MVP | Faster launch, $25/mo BAA | Pivot to custom backend only if scaling requires |
| Solo mode essential | Spouse non-participation is common risk | Individual value from Day 1 |

---

## Pitfalls to Avoid

| Pitfall | Severity | Prevention |
|---------|----------|------------|
| Privacy breach (community gossip) | Critical | HIPAA infrastructure, discrete branding from Day 1 |
| Scholarly misalignment | Critical | Fiqh Review Board, Sahih/Hasan hadith only |
| Spouse data asymmetry | Critical | Client-side encryption for journals |
| Stigmatizing tone | High | User testing, normalizing messaging |
| Over/under-medicalizing | High | Balance normalizing struggle AND detecting crises |

---

## GSD Workflow Commands

This project uses GSD (Get Shit Done) framework for structured development:

| Command | Purpose |
|---------|---------|
| `/gsd:progress` | Check current status |
| `/gsd:discuss-phase N` | Gather context for phase implementation |
| `/gsd:plan-phase N` | Research + create task plans |
| `/gsd:execute-phase N` | Execute plans in parallel waves |
| `/gsd:verify-work N` | User acceptance testing |
| `/gsd:ship N` | Create PR from verified work |
| `/gsd:next` | Auto-detect next step |

---

## Quick Reference

**Current State:** Pre-Phase 1 (Initialization complete)  
**Next Step:** `/gsd:discuss-phase 1` — Foundation & Trust  
**Total Requirements:** 32 v1 requirements across 5 phases

---

*Last updated: 2026-03-28*
