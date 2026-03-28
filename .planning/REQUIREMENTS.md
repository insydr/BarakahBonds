# Barakah Bonds — Requirements

**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2026-03-28

---

## v1 Requirements (MVP)

### Authentication & Privacy

- [ ] **AUTH-01**: User can create account with email/password
- [ ] **AUTH-02**: User can log in and stay logged in across sessions
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: Couple accounts can be linked with invitation code
- [ ] **AUTH-05**: User data is encrypted at rest (AES-256-GCM)
- [ ] **AUTH-06**: User can enable "burn after reading" for sensitive content
- [ ] **AUTH-07**: App branding is discrete (no visible "marriage help" references on home screen)

### Pre-Marital Assessment ("The Foundation")

- [ ] **ASSESS-01**: User can complete 360-degree compatibility assessment
- [ ] **ASSESS-02**: Assessment covers Deen (Faith) section with scholarly citations
- [ ] **ASSESS-03**: Assessment covers Dunya (Finances/Career) section
- [ ] **ASSESS-04**: Assessment covers Aila (Family/In-laws) section
- [ ] **ASSESS-05**: Assessment covers Nafs (Personality/Mental Health) section
- [ ] **ASSESS-06**: System detects and flags high-risk areas for discussion
- [ ] **ASSESS-07**: Each question cites relevant Quranic verse or Hadith
- [ ] **ASSESS-08**: User can generate Couple's Report for Imam/mentor review
- [ ] **ASSESS-09**: Assessment can be completed individually (solo mode)

### Shura Communication Studio

- [ ] **COMM-01**: Couple can send messages to each other through platform
- [ ] **COMM-02**: "Pause & Pray" button triggers calm-down timer
- [ ] **COMM-03**: Pause & Pray suggests relevant Dua for conflict situations
- [ ] **COMM-04**: Pause & Pray includes breathing exercise guidance
- [ ] **COMM-05**: Couple can create structured agenda for difficult conversations
- [ ] **COMM-06**: Agenda builder provides "I" statement templates
- [ ] **COMM-07**: Agenda builder includes active listening prompts
- [ ] **COMM-08**: Couple can record decisions in shared Decision Log
- [ ] **COMM-09**: Decision Log entries are timestamped and searchable

### Content & Education

- [ ] **CONT-01**: User can browse article library
- [ ] **CONT-02**: User receives daily relationship tips
- [ ] **CONT-03**: User can access Dua library for relationship situations
- [ ] **CONT-04**: Content includes scholarly citations from mainstream sources

### Prayer Integration

- [ ] **PRAYER-01**: App syncs with local prayer times
- [ ] **PRAYER-02**: During logged conflict, app suggests prayer break at appropriate time
- [ ] **PRAYER-03**: Prayer time notifications can be customized

---

## v2 Requirements (Post-MVP)

### Family Dynamics Module

- [ ] **FAM-01**: User can access boundary scripts for common in-law scenarios
- [ ] **FAM-02**: Scripts include polite language for asserting boundaries
- [ ] **FAM-03**: User can access "Unity First" video course

### Parenting Module

- [ ] **PARENT-01**: User can access "Generation Gap Bridge" content
- [ ] **PARENT-02**: Content available in multiple languages (Arabic, Urdu, French)
- [ ] **PARENT-03**: User can access Prophetic Parenting Guide

### Multi-language Support

- [ ] **LANG-01**: Interface available in English
- [ ] **LANG-02**: Interface available in Arabic (with RTL support)
- [ ] **LANG-03**: Interface available in Urdu (with RTL support)
- [ ] **LANG-04**: Interface available in French

### Accessibility

- [ ] **ACCESS-01**: Low-bandwidth mode available for poor connectivity
- [ ] **ACCESS-02**: Audio-only option for video content
- [ ] **ACCESS-03**: Text content can be downloaded for offline use

---

## Out of Scope

| Exclusion | Reason |
|-----------|--------|
| Telehealth/therapist matching | Phase 4 feature; MVP focuses on self-help |
| Imam Gateway dashboard | Phase 3 B2B feature; requires MVP validation first |
| Muslim marriage platform integrations | Phase 3; partnership discussions needed |
| Community/social features | Privacy concerns; could harm adoption |
| User-generated content | Content moderation risk; religious accuracy concerns |
| Dating/matching features | Platform focuses on existing relationships only |
| Video courses (Phase 1) | Infrastructure cost; defer to Phase 2 |

---

## Traceability

### v1 Requirements (MVP) — Roadmap Coverage

| Requirement ID | Phase | Status | Success Criteria |
|----------------|-------|--------|------------------|
| AUTH-01 | Phase 1: Foundation & Trust | Pending | User can create account and trust their data is secure |
| AUTH-02 | Phase 1: Foundation & Trust | Pending | User stays logged in across sessions without re-authentication friction |
| AUTH-03 | Phase 1: Foundation & Trust | Pending | User can log out from any page |
| AUTH-04 | Phase 1: Foundation & Trust | Pending | User can disconnect from partner without data exposure |
| AUTH-05 | Phase 1: Foundation & Trust | Pending | User data is encrypted at rest (AES-256-GCM) |
| AUTH-06 | Phase 1: Foundation & Trust | Pending | User can enable "burn after reading" for sensitive content |
| AUTH-07 | Phase 1: Foundation & Trust | Pending | App passes visual discretion test |
| ASSESS-01 | Phase 2: Assessment Engine | Pending | User completes full assessment in 45-60 minutes |
| ASSESS-02 | Phase 2: Assessment Engine | Pending | Deen section with scholarly citations |
| ASSESS-03 | Phase 2: Assessment Engine | Pending | Dunya section complete |
| ASSESS-04 | Phase 2: Assessment Engine | Pending | Aila section complete |
| ASSESS-05 | Phase 2: Assessment Engine | Pending | Nafs section complete |
| ASSESS-06 | Phase 2: Assessment Engine | Pending | User receives flagged areas with Islamic scholarly context |
| ASSESS-07 | Phase 2: Assessment Engine | Pending | Each question cites relevant Quranic verse or Hadith |
| ASSESS-08 | Phase 2: Assessment Engine | Pending | User can download professional PDF report for Imam review |
| ASSESS-09 | Phase 2: Assessment Engine | Pending | User understands their results without partner participation |
| COMM-01 | Phase 3: Communication Studio | Pending | Couple can communicate through encrypted channel |
| COMM-02 | Phase 3: Communication Studio | Pending | User triggers Pause & Pray and feels calmer |
| COMM-03 | Phase 3: Communication Studio | Pending | Pause & Pray suggests relevant Dua for conflict situations |
| COMM-04 | Phase 3: Communication Studio | Pending | Pause & Pray includes breathing exercise guidance |
| COMM-05 | Phase 3: Communication Studio | Pending | Couple uses Agenda Builder to prepare for difficult conversation |
| COMM-06 | Phase 3: Communication Studio | Pending | Agenda builder provides "I" statement templates |
| COMM-07 | Phase 3: Communication Studio | Pending | Agenda builder includes active listening prompts |
| COMM-08 | Phase 3: Communication Studio | Pending | Couple references Decision Log to recall past agreements |
| COMM-09 | Phase 3: Communication Studio | Pending | Decision Log entries are timestamped and searchable |
| PRAYER-01 | Phase 3: Communication Studio | Pending | Prayer times naturally interrupt conflicts |
| PRAYER-02 | Phase 3: Communication Studio | Pending | During logged conflict, app suggests prayer break |
| PRAYER-03 | Phase 3: Communication Studio | Pending | Prayer time notifications can be customized |
| CONT-01 | Phase 4: Content & Education | Pending | User finds relevant article within 3 clicks |
| CONT-02 | Phase 4: Content & Education | Pending | User engages with daily tip and finds it actionable |
| CONT-03 | Phase 4: Content & Education | Pending | User accesses appropriate Dua for their situation |
| CONT-04 | Phase 4: Content & Education | Pending | User trusts content authenticity |

### v2 Requirements (Deferred)

| Requirement ID | Target | Status |
|----------------|--------|--------|
| FAM-01 through FAM-03 | v2 | Deferred |
| PARENT-01 through PARENT-03 | v2 | Deferred |
| LANG-01 through LANG-04 | v2 | Deferred |
| ACCESS-01 through ACCESS-03 | v2 | Deferred |

### Coverage Summary

- **v1 Requirements:** 32 total
- **Mapped to Phases:** 32 (100%)
- **Phase 1:** 7 requirements (AUTH)
- **Phase 2:** 9 requirements (ASSESS)
- **Phase 3:** 12 requirements (COMM + PRAYER)
- **Phase 4:** 4 requirements (CONT)
- **Phase 5:** 0 requirements (Quality assurance)

---

## Requirement Quality Criteria

All requirements follow these standards:

- **Specific and testable**: Clear success criteria
- **User-centric**: Describes what user can do
- **Atomic**: One capability per requirement
- **Independent**: Minimal dependencies on other requirements

---

## Changes Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-03-28 | Initial requirements created | Project initialization |
