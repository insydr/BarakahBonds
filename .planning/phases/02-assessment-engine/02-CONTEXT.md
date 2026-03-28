# Phase 2: Assessment Engine - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning
**Mode:** Auto (recommended defaults selected)

<domain>
## Phase Boundary

This phase delivers the core value proposition of Barakah Bonds: the 360-degree compatibility assessment. Users complete a comprehensive evaluation covering Deen (Faith), Dunya (Finances/Career), Aila (Family/In-laws), and Nafs (Personality/Mental Health). The assessment provides immediate individual results, red flag detection with Islamic scholarly context, and generates professional PDF reports for Imam/mentor review. Solo mode ensures users receive standalone value without requiring partner participation.

**What this phase delivers:**
- Question Bank with scholarly citations (Quranic verses, Hadith)
- Assessment intake flow with progress tracking (45-60 minutes)
- Category-based scoring across four domains
- Red flag detection algorithm with Islamic guidance
- Individual results view (immediate upon completion)
- Couple's Report generation (PDF format for Imam review)
- Save-and-resume functionality
- Solo mode with standalone value

**What this phase does NOT deliver:**
- Real-time messaging (Phase 3)
- Pause & Pray feature (Phase 3)
- Prayer time integration (Phase 3)
- Content library (Phase 4)

**Dependencies from Phase 1:**
- User authentication and session management
- Couple linking mechanism (for partner comparison)
- Privacy controls and discrete branding
- Database with RLS and encryption

</domain>

<decisions>
## Implementation Decisions

### Assessment Architecture

- **D-01:** Store questions in database with versioning support
  - Rationale: Allows updates without breaking in-progress assessments, enables A/B testing
  - Schema: `questions` table with `version`, `section`, `order_index`, `active` fields
  - From architecture: Question Bank CMS with scholarly citation structure

- **D-02:** Assessment progress persisted after each response
  - Auto-save every answer to prevent data loss
  - Support offline-first with sync on reconnection
  - Rationale: 45-60 minute assessment requires robust resume capability

- **D-03:** Four-section assessment structure matching Islamic framework
  - Deen (Faith): ~40 questions covering religious practice, values, goals
  - Dunya (Finances/Career): ~35 questions covering financial habits, career aspirations
  - Aila (Family/In-laws): ~30 questions covering family dynamics, boundaries, in-law relations
  - Nafs (Personality/Mental Health): ~45 questions covering communication, emotional health, conflict style
  - Rationale: Aligns with Islamic worldview categorization (Deen/Dunya/Aila/Nafs)

- **D-04:** Question format: Primarily Likert scale with some multiple-choice
  - Likert 1-5 for agreement/frequency questions
  - Multiple choice for categorical questions (e.g., "Which best describes your prayer routine?")
  - Open-text optional for "anything else to share" sections
  - Rationale: Quantifiable for scoring algorithm, efficient for users

### Scholarly Citation System

- **D-05:** Every question includes visible citation reference
  - Quranic verses: Surah name, verse number, Arabic excerpt, English translation
  - Hadith: Source (Bukhari, Muslim, etc.), hadith number, Arabic, English translation
  - Only Sahih (authentic) or Hasan (good) hadith accepted
  - Rationale: ASSESS-07 requirement; builds trust through Islamic authenticity

- **D-06:** Citation storage in structured format
  - `citations` table linked to questions
  - Fields: `type` (quran/hadith), `source`, `reference`, `arabic_text`, `translation`, `scholar_verified`
  - Rationale: Enables display flexibility, supports multiple languages, audit trail for scholarly review

- **D-07:** Scholar review workflow for all content
  - Questions marked `scholar_verified: false` until reviewed
  - Fiqh Review Board approval required before production use
  - Rationale: Critical trust requirement; prevents scholarly misalignment pitfall

### Scoring Algorithm

- **D-08:** Category scores calculated as weighted averages
  - Each section produces individual score (0-100)
  - Overall compatibility score weighted: Deen (30%), Dunya (25%), Aila (20%), Nafs (25%)
  - Rationale: Reflects relative importance in Islamic marriage framework

- **D-09:** Red flag detection with two severity levels
  - **Hard flags:** Abuse indicators, untreated severe mental health, fundamental religious incompatibilities
    - Display: Immediate alert with recommendation to seek professional help
    - Include relevant Islamic guidance on the specific issue
  - **Soft flags:** Different communication styles, varying religious practices, financial disagreements
    - Display: Highlighted in results with discussion prompts
    - Include relevant Quranic/Hadith guidance
  - Rationale: ASSESS-06 requirement; differentiates critical issues from growth areas

- **D-10:** Compatibility scoring for couples
  - When both partners complete: Calculate alignment score per category
  - Identify "discussion areas" where responses differ significantly
  - Generate couple-specific discussion prompts
  - Rationale: Couples use assessment for pre-marital counseling; need actionable insights

### Solo Mode Design

- **D-11:** Individual results view as primary experience
  - User sees their own results immediately upon completion
  - No waiting for partner, no "incomplete" messaging
  - Individual insights: Personal reflection prompts, self-awareness highlights
  - Rationale: ASSESS-09 requirement; solo mode delivers standalone value

- **D-12:** Partner invitation as enhancement, not requirement
  - After individual completion: "Invite your partner to compare results"
  - Partner comparison adds value but doesn't gate individual insights
  - Rationale: Addresses spouse non-participation pitfall

### Report Generation

- **D-13:** PDF Couple's Report for Imam/mentor review
  - Professional layout with couple's names, assessment date
  - Category scores with visual charts
  - Red flags highlighted with Islamic context
  - Discussion prompts for each category
  - No raw question-by-question answers (privacy)
  - Rationale: ASSESS-08 requirement; Imam-ready format

- **D-14:** Report generation triggered on-demand
  - User clicks "Generate Report" after both complete
  - PDF stored temporarily (24 hours) then auto-deleted
  - User can regenerate at any time
  - Rationale: Privacy-first; reports not stored permanently

- **D-15:** Report accessible only to couple and invited Imam
  - Future: Imam Gateway (Phase 3) allows sharing with verified religious leaders
  - MVP: Download PDF, user shares manually
  - Rationale: Maintains privacy control until formal sharing mechanism exists

### User Experience

- **D-16:** Assessment progress visualization
  - Progress bar showing completion percentage
  - Section indicators (Deen: ✓, Dunya: in progress, Aila: pending, Nafs: pending)
  - Estimated time remaining based on pace
  - Rationale: Reduces drop-off during 45-60 minute assessment

- **D-17:** Save-and-resume with clear notifications
  - "Your progress is saved" indicator after each section
  - Dashboard shows "Continue Assessment" card when incomplete
  - Email reminder after 3 days of inactivity
  - Rationale: Supports multi-session completion

- **D-18:** Skip functionality with later-reminder
  - User can skip any question with "I'd rather not answer"
  - Skipped questions flagged for optional completion at end
  - Skip doesn't affect scoring unless >20% skipped in a section
  - Rationale: Respects user boundaries while encouraging completion

### Technical Implementation

- **D-19:** Assessment state stored in database
  - `assessments` table: `user_id`, `status`, `current_section`, `started_at`, `completed_at`
  - `assessment_responses` table: `assessment_id`, `question_id`, `response_value`, `responded_at`
  - Rationale: Supports progress tracking, resume capability, analytics

- **D-20:** PDF generation via server-side library
  - Use `@react-pdf/renderer` or `Puppeteer` for HTML-to-PDF
  - Template-based generation for consistent formatting
  - Rationale: Professional quality PDFs without external service dependency

- **D-21:** Scoring algorithm implemented as pure functions
  - Separate scoring logic from data layer
  - Unit testable with mock responses
  - Version-controlled algorithm for reproducibility
  - Rationale: Algorithm is core IP; needs rigorous testing and audit trail

### Privacy & Security

- **D-22:** Assessment responses encrypted at rest
  - Application-level encryption for response values
  - Partner cannot see individual question responses
  - Only aggregate scores and flag categories shared
  - Rationale: HIPAA compliance; sensitive mental health data

- **D-23:** Anonymous mode for assessment
  - User can choose to not display name on report
  - Report shows "Partner A" and "Partner B" instead of names
  - Rationale: Reduces stigma for sharing with Imam/mentor

### Claude's Discretion

The following areas are delegated to planner/researcher judgment:
- Exact UI component structure for assessment flow
- Animation and transition specifics
- Question wording (provided scholarly citations are accurate)
- Specific color schemes for progress visualization
- PDF template design specifics
- Scoring algorithm exact weights (within framework)

### Folded Todos

None — no pending todos matched this phase's scope.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Research & Architecture
- `.planning/research/ARCHITECTURE.md` — Assessment Service architecture, scoring engine, report generator
- `.planning/research/SUMMARY.md` — Table stakes and differentiators for assessment
- `.planning/research/PITFALLS.md` — Critical pitfalls (scholarly misalignment, spouse data asymmetry)

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — Detailed requirements ASSESS-01 through ASSESS-09
- `.planning/ROADMAP.md` — Phase 2 definition with success criteria

### Phase 1 Context (Dependencies)
- `.planning/phases/01-foundation-trust/01-CONTEXT.md` — Authentication, couple linking, privacy decisions
- `.planning/phases/01-foundation-trust/01-VERIFICATION.md` — Phase 1 completion verification

</canonical_refs>

<code_context>
## Existing Code Insights

### Current Codebase (Phase 1 Complete)
- **Authentication:** Supabase Auth with RLS, protected routes
- **Database:** PostgreSQL with encryption, RLS policies
- **Couple Linking:** Invitation codes, approval flow, `couple_status` table
- **UI Framework:** Next.js 15, Tailwind 4, shadcn/ui components
- **Discrete Branding:** "Barakah" naming, neutral icon

### Database Tables (Existing)
```sql
-- From Phase 1
users, profiles, couple_invitations, couple_status, privacy_settings

-- Phase 2 additions needed
questions, citations, assessments, assessment_responses, reports
```

### Integration Points
- Assessment flow starts from dashboard (post-login)
- Couple comparison requires `couple_status.is_linked = true`
- PDF reports respect privacy settings from Phase 1
- Assessment status shown in navigation

</code_context>

<specifics>
## Specific Ideas

From PRD, Research, and Architecture Analysis:

1. **Question count target:** ~150 questions total (Deen: 40, Dunya: 35, Aila: 30, Nafs: 45)
   - Estimated time: 45-60 minutes at 20-30 seconds per question

2. **Progress saving:** Auto-save after each response, not just sections
   - Prevents frustration from accidental navigation/closure

3. **Section completion rewards:** Gentle positive messaging after each section
   - "Deen section complete! You're making great progress."

4. **Red flag categories:**
   - **Spiritual incompatibility:** Fundamental differences in religious practice/interpretation
   - **Financial red flags:** Debt secrecy, spending philosophy mismatch, zakat disagreements
   - **Family boundaries:** In-law interference patterns, living arrangement conflicts
   - **Mental health concerns:** Untreated conditions, unwillingness to seek help, trauma indicators

5. **PDF Report sections:**
   - Cover page with couple names (or anonymous IDs)
   - Executive summary (overall compatibility)
   - Category breakdowns with scores and discussion prompts
   - Red flag summary (if any) with Islamic context
   - Strengths to build upon
   - Recommended next steps

</specifics>

<deferred>
## Deferred Ideas

The following were discussed but deferred for later phases:

1. **Imam Gateway sharing (Phase 3):** Direct sharing with verified Imams
   - MVP: User downloads PDF and shares manually

2. **Video explanations for questions:** Scholar video clips explaining context
   - Deferred: Content production intensive, can add incrementally

3. **Assessment retakes:** Re-assessment scheduling (ASSESS-05 in future iteration)
   - This phase: Single assessment per user; retakes in Phase 3 or 4

4. **AI-powered discussion prompts:** Generate personalized conversation starters
   - Deferred: Requires clinical review, can add later

5. **Multi-language assessment:** Translations to Arabic, Urdu, French
   - Planned for v2; English-only for MVP

</deferred>

---

*Phase: 02-assessment-engine*
*Context gathered: 2026-03-28*
