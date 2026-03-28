# Phase 1: Foundation & Trust - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning
**Mode:** Auto (recommended defaults selected)

<domain>
## Phase Boundary

This phase delivers the security, privacy, and authentication foundation for Barakah Bonds. Users must trust the platform with sensitive marital/relationship data from their first interaction. The phase establishes discrete branding, secure authentication, couple linking, and solo-mode functionality that all subsequent features depend upon.

**What this phase delivers:**
- User registration and authentication (email/password)
- Session management with secure persistence
- Couple account linking via invitation codes
- Data encryption at rest (AES-256-GCM)
- "Burn after reading" option for sensitive content
- Discrete app branding (no visible "marriage help" references)
- Solo mode functionality (value without partner participation)

**What this phase does NOT deliver:**
- Assessment engine (Phase 2)
- Communication tools (Phase 3)
- Content library (Phase 4)

</domain>

<decisions>
## Implementation Decisions

### Authentication Strategy

- **D-01:** Use Supabase Auth for authentication (JWT-based, MFA-ready)
  - Rationale: BAA included on Pro tier ($25/mo), cost-effective HIPAA compliance, built-in row-level security
  - From research: Supabase Pro includes BAA for Auth, Database, Realtime, and Storage

- **D-02:** Email/password authentication only for MVP
  - Rationale: Simplicity for Phase 1, OAuth/social login deferred to future iteration
  - Allows focus on core security and privacy requirements

- **D-03:** Session persistence: 7-day refresh tokens, 1-hour access tokens
  - Rationale: Balance between security and user experience
  - Users stay logged in across sessions without frequent re-authentication

- **D-04:** Email verification required before account activation
  - Rationale: Standard security practice, prevents spam accounts
  - Critical for a platform handling sensitive relationship data

### Couple Linking Mechanism

- **D-05:** Invitation code system for couple linking
  - User generates a unique 8-character code in settings
  - Partner enters code to request linking
  - Original user must approve the link
  - Rationale: Prevents accidental/malicious linking, gives users control

- **D-06:** Asymmetric linking approval flow
  - Partner A generates code → Partner B enters code → Partner A approves
  - Both users see confirmation when linked
  - Rationale: Clear consent from both parties, audit trail

- **D-07:** Solo mode is the default state
  - App is fully functional without partner
  - Assessment, content, and journal features work independently
  - "Link Partner" is an optional enhancement, not a barrier
  - Rationale: Critical for users whose spouse may never join

### Discrete Branding Strategy

- **D-08:** App name visible on device: "Barakah" or "BB Connect"
  - Avoids "marriage", "relationship", "counseling" in visible branding
  - Rationale: Protects users from family members seeing screen

- **D-09:** Notification text shows generic messages
  - Example: "You have a new message" instead of "Your partner sent a message"
  - No mention of "assessment", "counseling", or "therapy"
  - Rationale: Plausible deniability for users in shared living situations

- **D-10:** Icon design: Abstract/geometric (not heart, rings, or couple imagery)
  - Simple, professional appearance
  - Could pass as productivity or finance app
  - Rationale: Users need discretion from prying eyes

### Data Security Architecture

- **D-11:** All user data encrypted at rest using AES-256-GCM
  - Database-level encryption via Supabase (transparent)
  - Additional application-level encryption for journals/sensitive content
  - Rationale: Defense in depth for HIPAA compliance

- **D-12:** "Burn after reading" feature for sensitive content
  - Client-side deletion with server confirmation
  - Content marked as deleted, purged during maintenance window
  - Rationale: Users need control over sensitive conversation history

- **D-13:** Row-Level Security (RLS) on all database tables
  - Users can only access their own data
  - Partner-linked data accessible only when link is active
  - Rationale: Prevents data leakage even if API is compromised

### User Profile & Settings

- **D-14:** Minimal profile required at registration
  - Email, password, display name (can be pseudonym)
  - Optional: timezone (for prayer integration later)
  - Rationale: Low friction signup, respects privacy concerns

- **D-15:** Profile settings accessible from main navigation
  - Account security (password change, MFA when available)
  - Partner linking section
  - Privacy controls (burn settings, data export)
  - Rationale: Users need easy access to privacy controls

### UI/UX Patterns

- **D-16:** Clean, minimal interface using shadcn/ui components
  - Tailwind CSS for styling
  - RTL-ready layout structure (prepare for Arabic/Urdu)
  - Rationale: Consistent with research recommendations, professional appearance

- **D-17:** Progressive disclosure for sensitive features
  - Assessment prompts appear after account setup
  - Partner linking offered as optional enhancement
  - Rationale: Don't overwhelm new users, build trust gradually

### Error Handling & Communication

- **D-18:** Generic error messages for authentication failures
  - "Invalid credentials" rather than "User not found" vs "Wrong password"
  - Rationale: Prevents account enumeration attacks

- **D-19:** Clear success confirmations with next steps
  - After registration: "Account created. Check your email to verify."
  - After linking: "You're now connected with [partner name]."
  - Rationale: Reduces anxiety for users dealing with sensitive topics

### Claude's Discretion

The following areas are delegated to planner/researcher judgment:
- Exact UI component structure for auth flows
- Animation and transition specifics
- Form validation message wording
- Loading state implementations
- Specific shadcn/ui component selection

### Folded Todos

None — no pending todos matched this phase's scope.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Research & Architecture
- `.planning/research/STACK.md` — Technology stack decisions including Supabase Auth, database encryption
- `.planning/research/ARCHITECTURE.md` — System architecture, component boundaries, data models
- `.planning/research/PITFALLS.md` — Critical pitfalls to avoid (privacy breaches, scholarly misalignment)
- `.planning/research/FEATURES.md` — Feature breakdown with table stakes vs differentiators

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — Detailed requirements AUTH-01 through AUTH-07
- `.planning/ROADMAP.md` — Phase 1 definition with success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### New Project
This is a greenfield project — no existing codebase to integrate with.

### Planned Architecture (from research)
- **Web Framework:** Next.js 15 with App Router, Server Components
- **Database:** PostgreSQL via Supabase Pro
- **Auth:** Supabase Auth with Row-Level Security
- **UI Components:** shadcn/ui + Tailwind 4
- **Mobile:** Expo SDK 52 (code sharing with web)

### Integration Points
- Auth state will feed into all subsequent phases (assessment, messaging, content)
- User profile data structure must support couple linking
- Session management must support solo and coupled modes

</code_context>

<specifics>
## Specific Ideas

From PRD and Research Analysis:

1. **"Burn after reading" naming** — Feature name should be user-friendly, not technical. Consider "Disappearing Messages" or "Private Mode"

2. **Invitation code format** — 8 characters, alphanumeric, case-insensitive. Example: "B7K3M9R2"

3. **Discrete app name candidates** — "Barakah", "BB Connect", "Growth Path" (research recommendation: avoid relationship words)

4. **Solo mode messaging** — Clear language that partner features are optional. Example: "Invite your partner anytime, or continue on your own."

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation-trust*
*Context gathered: 2026-03-28*
