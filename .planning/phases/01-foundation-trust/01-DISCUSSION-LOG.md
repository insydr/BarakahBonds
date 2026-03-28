# Phase 1: Foundation & Trust - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in 01-CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 01-foundation-trust
**Mode:** Auto (recommended defaults selected without user interaction)
**Areas discussed:** Authentication, Couple Linking, Discrete Branding, Data Security, UI/UX Patterns

---

## Authentication Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase Auth | JWT-based, BAA included on Pro tier, built-in RLS | ✓ |
| Clerk | Better DX, but Enterprise pricing for BAA | |
| Custom JWT | Full control, more maintenance overhead | |
| Auth0 | Enterprise features, expensive at scale | |

**Auto-selected:** Supabase Auth (recommended)
**Rationale:** Cost-effective HIPAA compliance at $25/mo, integrates with Supabase database, MFA-ready for future.

---

## Email Verification

| Option | Description | Selected |
|--------|-------------|----------|
| Required before activation | Standard security practice, prevents spam | ✓ |
| Optional | Lower friction, more spam accounts | |
| Post-onboarding | Users start immediately, verify later | |

**Auto-selected:** Required before activation (recommended)
**Rationale:** Platform handles sensitive relationship data — email verification is a baseline security measure.

---

## Session Duration

| Option | Description | Selected |
|--------|-------------|----------|
| 7-day refresh / 1-hour access | Balance of security and UX | ✓ |
| 30-day refresh / 24-hour access | Longer sessions, less security | |
| 1-day refresh / 15-minute access | High security, poor UX | |

**Auto-selected:** 7-day refresh / 1-hour access (recommended)
**Rationale:** Users in crisis may not access daily — 7-day window provides flexibility without compromising security.

---

## Couple Linking Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Invitation code + approval | Both parties consent, clear audit trail | ✓ |
| QR code scanning | Fast, but requires in-person or screen sharing | |
| Email invitation | Requires knowing partner's email | |
| Auto-link by email domain | Privacy risk, assumes same organization | |

**Auto-selected:** Invitation code + approval (recommended)
**Rationale:** Clear consent from both parties, works asynchronously, doesn't require sharing email addresses.

---

## Discrete Branding - App Name

| Option | Description | Selected |
|--------|-------------|----------|
| "Barakah" or "BB Connect" | Generic, could be any app | ✓ |
| "Muslim Marriage Help" | Clear purpose, no discretion | |
| "Relationship Growth" | Still reveals relationship focus | |
| "Personal Journal" | Misleading, may confuse users | |

**Auto-selected:** "Barakah" or "BB Connect" (recommended)
**Rationale:** Protects users from family members seeing screen; "Barakah" has positive Islamic meaning without revealing purpose.

---

## Discrete Branding - Notifications

| Option | Description | Selected |
|--------|-------------|----------|
| Generic messages | "You have a new message" | ✓ |
| Descriptive messages | "Your partner shared a reflection" | |
| No notifications | Users must open app | |
| Customizable by user | Most flexible, more complexity | |

**Auto-selected:** Generic messages (recommended)
**Rationale:** Critical for users in shared living situations — plausible deniability is essential for adoption.

---

## Data Encryption Level

| Option | Description | Selected |
|--------|-------------|----------|
| Database + Application level | Defense in depth | ✓ |
| Database level only | Simpler, relies on provider | |
| Application level only | More control, complex key management | |
| End-to-end encrypted | Maximum privacy, complex key recovery | |

**Auto-selected:** Database + Application level (recommended)
**Rationale:** HIPAA requires encryption at rest; application-level encryption adds protection for sensitive journals and conversations.

---

## Solo Mode Default

| Option | Description | Selected |
|--------|-------------|----------|
| Solo by default, linking optional | App works without partner | ✓ |
| Require partner invitation during signup | Forces coupling | |
| Prompt for partner after assessment | Encourages but doesn't require | |

**Auto-selected:** Solo by default, linking optional (recommended)
**Rationale:** Research identified spouse non-participation as a medium-risk pitfall; solo mode must deliver value from Day 1.

---

## Profile Information Required

| Option | Description | Selected |
|--------|-------------|----------|
| Email + password + display name | Minimal, respects privacy | ✓ |
| Full name + phone + email | More verification, less privacy | |
| Social media authentication only | Convenient, no password management | |
| Anonymous (no email) | Maximum privacy, no account recovery | |

**Auto-selected:** Email + password + display name (recommended)
**Rationale:** Low friction signup while maintaining account security; display name can be pseudonym for additional privacy.

---

## Claude's Discretion Areas

The following were delegated to planner/researcher judgment:
- Exact UI component structure for auth flows
- Animation and transition specifics
- Form validation message wording
- Loading state implementations
- Specific shadcn/ui component selection

---

## Deferred Ideas

None — all discussed items were within Phase 1 scope.

---

*Log generated: 2026-03-28*
*Mode: Auto (no user interaction required)*
