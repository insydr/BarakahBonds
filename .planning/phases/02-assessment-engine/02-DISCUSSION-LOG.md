# Phase 2: Assessment Engine - Discussion Log

**Phase:** 02-assessment-engine
**Created:** 2026-03-28
**Status:** Discussion complete, ready for planning

---

## Discussion Timeline

### 2026-03-28 — Phase 2 Context Gathering

**Context:** Phase 1 completed successfully with all AUTH requirements verified. TypeScript build passes with 0 errors. Phase 2 context gathering initiated via `/gsd:discuss-phase 2` command.

**Key Decisions Made:**

| Decision ID | Topic | Choice | Rationale |
|-------------|-------|--------|-----------|
| D-01 | Question storage | Database with versioning | Supports updates, A/B testing, in-progress assessments |
| D-02 | Progress persistence | Auto-save each response | Prevents data loss in 45-60 minute assessment |
| D-03 | Assessment structure | Four sections (Deen/Dunya/Aila/Nafs) | Aligns with Islamic worldview framework |
| D-04 | Question format | Likert scale + multiple choice | Quantifiable for scoring, efficient for users |
| D-05 | Citation visibility | Every question shows Quranic/Hadith reference | ASSESS-07 requirement, builds trust |
| D-06 | Citation storage | Structured database table | Enables multi-language, display flexibility |
| D-07 | Scholar review | Required before production | Critical trust requirement |
| D-08 | Scoring method | Weighted averages per category | Reflects Islamic marriage priorities |
| D-09 | Red flag detection | Two severity levels (hard/soft) | Differentiates critical issues from growth areas |
| D-10 | Couple compatibility | Alignment score per category | Actionable insights for pre-marital counseling |
| D-11 | Solo mode priority | Individual results immediate | ASSESS-09 requirement, standalone value |
| D-12 | Partner invitation | Enhancement, not requirement | Addresses spouse non-participation pitfall |
| D-13 | PDF Report format | Professional layout with Islamic context | ASSESS-08 requirement, Imam-ready |
| D-14 | Report storage | 24-hour temporary, on-demand generation | Privacy-first approach |
| D-15 | Report access | Couple-only until Imam Gateway (Phase 3) | Maintains privacy control |
| D-16 | Progress visualization | Progress bar + section indicators | Reduces drop-off |
| D-17 | Save-and-resume | Auto-save + email reminders | Supports multi-session completion |
| D-18 | Skip functionality | Allowed with end reminder | Respects boundaries, encourages completion |
| D-19 | Assessment state storage | Database tables (assessments, responses) | Progress tracking, analytics support |
| D-20 | PDF generation | Server-side library | Professional quality without external dependency |
| D-21 | Scoring algorithm | Pure functions, unit testable | IP protection, audit trail |
| D-22 | Response encryption | Application-level encryption | HIPAA compliance |
| D-23 | Anonymous mode | Optional on reports | Reduces stigma for Imam sharing |

**Research References Consulted:**
- `.planning/research/ARCHITECTURE.md` — Assessment Service architecture
- `.planning/research/SUMMARY.md` — Table stakes (assessment, report, solo mode)
- `.planning/research/PITFALLS.md` — Scholarly misalignment, spouse data asymmetry
- `.planning/phases/01-foundation-trust/01-CONTEXT.md` — Phase 1 decisions to build upon

**Phase 1 Dependencies Verified:**
- [x] Authentication working (Supabase Auth, JWT)
- [x] Couple linking implemented (invitation codes, approval flow)
- [x] Privacy controls in place (RLS, encryption)
- [x] Discrete branding applied ("Barakah" naming)

---

## Decision Audit Trail

### D-01: Question Storage Strategy

**Options Considered:**
1. Hardcoded questions in code
2. JSON file storage
3. Database with versioning ✓

**Decision:** Database with versioning

**Reasoning:**
- Hardcoded prevents updates without code deployment
- JSON files lack transaction safety
- Database with versioning supports in-progress assessments continuing on old version while new users get updated questions
- Enables A/B testing different question phrasings
- Supports analytics on question-level response patterns

**Trade-offs Accepted:**
- More complex schema design
- Requires migration strategy for question updates

---

### D-03: Four-Section Structure

**Options Considered:**
1. Single continuous assessment
2. Multiple independent assessments
3. Four-section unified assessment ✓

**Decision:** Four-section unified assessment (Deen/Dunya/Aila/Nafs)

**Reasoning:**
- Aligns with Islamic worldview categorization
- Provides natural break points for progress saving
- Enables section-level scoring and analysis
- Matches user mental model (faith, finances, family, personality)

**Trade-offs Accepted:**
- More complex UI with section navigation
- Requires section-level progress tracking

---

### D-09: Red Flag Detection Levels

**Options Considered:**
1. Binary flag/no-flag
2. Severity levels (1-5 scale)
3. Two-tier system (hard/soft flags) ✓

**Decision:** Two-tier system (hard/soft flags)

**Reasoning:**
- Binary doesn't distinguish severity
- 1-5 scale adds complexity without clear actionability
- Two-tier maps to clear user actions:
  - Hard flags: Seek professional help immediately
  - Soft flags: Discuss with partner, use provided guidance

**Trade-offs Accepted:**
- Requires clinical input on categorization
- May need nuance for edge cases

---

### D-11: Solo Mode Priority

**Options Considered:**
1. Require partner for full results
2. Partner-first with solo fallback
3. Solo-first with partner enhancement ✓

**Decision:** Solo-first with partner enhancement

**Reasoning:**
- Addresses critical pitfall: spouse non-participation
- Research shows 40%+ of users may never have partner join
- Solo mode must deliver standalone value from Day 1
- Partner comparison is valuable but not required

**Trade-offs Accepted:**
- More complex individual insights generation
- Less dramatic "reveal" for couples who both complete

---

### D-14: Report Storage Duration

**Options Considered:**
1. Permanent storage
2. 7-day retention
3. 24-hour temporary ✓

**Decision:** 24-hour temporary storage

**Reasoning:**
- Reports contain sensitive compatibility analysis
- User can regenerate at any time
- Reduces data exposure risk
- Aligns with "burn after reading" privacy philosophy

**Trade-offs Accepted:**
- User must regenerate if they lose the download
- Cannot reference past reports without regeneration

---

## Open Questions (Resolved)

| Question | Resolution | Date |
|----------|------------|------|
| How to handle question updates mid-assessment? | Version system; in-progress uses old version | 2026-03-28 |
| Should partner see individual question responses? | No; only aggregate scores and flags | 2026-03-28 |
| What qualifies as "hard flag" vs "soft flag"? | Clinical criteria to be defined in scoring algorithm implementation | 2026-03-28 |
| PDF library choice? | Server-side (`@react-pdf/renderer` or Puppeteer); decide during planning | 2026-03-28 |

---

## Open Questions (Deferred to Planning)

| Question | Deferred Reason |
|----------|-----------------|
| Exact scoring weights per category? | Planner to determine based on Islamic counseling best practices |
| Question count per section? | Planner to finalize based on time estimates (45-60 min target) |
| Specific red flag triggers? | Planner to define with clinical input |
| PDF template design? | Planner to design; implementer executes |

---

## Next Steps

1. **Planning Phase:** Create execution plans for Assessment Engine
   - Plan 02-01: Question Bank Schema & CMS
   - Plan 02-02: Assessment Flow UI & State Management
   - Plan 02-03: Scoring Algorithm Implementation
   - Plan 02-04: PDF Report Generation
   - Plan 02-05: Solo Mode & Individual Results

2. **Research Needs:**
   - Clinical input on red flag criteria
   - Scholar review process for question bank
   - PDF template design guidelines

---

*This log will be updated as decisions evolve during planning and execution.*
