# Barakah Bonds: System Architecture

---

## 1. High-Level System Architecture

### Architecture Style: Hybrid Mobile + Cloud-Native Backend

Barakah Bonds employs a **mobile-first, cloud-native architecture** with the following characteristics:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                       │
├─────────────────────┬─────────────────────┬─────────────────────────────────┤
│   iOS App (Swift)   │  Android App (Kotlin)│    Web App (Next.js/React)     │
│   - Native UI       │   - Native UI        │    - SSR/SSG                    │
│   - Offline SQLite  │   - Offline SQLite   │    - Service Worker             │
│   - Push Notifs     │   - Push Notifs      │    - PWA Support                │
└─────────────────────┴─────────────────────┴─────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                                  │
│  - Authentication/Authorization (JWT + MFA)                                 │
│  - Rate Limiting & DDoS Protection                                          │
│  - Request Routing & Load Balancing                                         │
│  - API Versioning                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER (Microservices)                      │
├────────────────┬────────────────┬────────────────┬─────────────────────────┤
│  User Service  │ Assessment Svc │ Communication  │    Content Service      │
│  - Profile Mgmt│ - Question Bank│   Service      │    - Course Mgmt        │
│  - Couple Link │ - Scoring Eng. │ - Chat/RTC     │    - Article Mgmt       │
│  - Preferences │ - Report Gen.  │ - Conflict Det.│    - Media Delivery     │
├────────────────┼────────────────┼────────────────┼─────────────────────────┤
│ Prayer Service │  Journal Svc   │ Notification   │    Analytics Service    │
│ - Time Calc.   │ - Decision Log │   Service      │    - PHQ-9/GAD-7        │
│ - Location API │ - Shared Entry │ - Push/Email   │    - KPI Tracking       │
│ - Conflict Int │ - Private Mode │ - In-App       │    - Anonymized Data    │
└────────────────┴────────────────┴────────────────┴─────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                         │
├────────────────────────┬─────────────────────┬──────────────────────────────┤
│   Primary Database     │    Redis Cache      │     Object Storage           │
│   (PostgreSQL)         │    - Session Store  │     (S3-compatible)          │
│   - Encrypted at Rest  │    - Real-time      │     - Course Media           │
│   - Row-Level Security │    - Prayer Cache   │     - User Uploads           │
│   - Audit Logging      │    - Rate Limits    │     - Reports (PDF)          │
├────────────────────────┴─────────────────────┴──────────────────────────────┤
│                        Search Engine (Elasticsearch/OpenSearch)              │
│                        - Content Search                                      │
│                        - Journal Search (encrypted indices)                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL INTEGRATIONS                              │
├────────────────────┬─────────────────────┬──────────────────────────────────┤
│ Prayer Time APIs   │ Payment Processing  │  Translation Services           │
│ - Aladhan API      │ - Stripe            │  - i18next                      │
│ - Muslim Salat     │ - Apple Pay         │  - Professional Translation     │
│ - Fallback Logic   │ - Google Pay        │  - RTL Support                  │
├────────────────────┼─────────────────────┼──────────────────────────────────┤
│ Analytics (Opt-in) │  Future: Telehealth │  Future: Marriage Platforms     │
│ - PostHog (self-   │  - Video SDK        │  - Muzmatch/Salams API          │
│   hosted)          │  - Therapist Dir.   │  - Pre-marital Certification    │
└────────────────────┴─────────────────────┴──────────────────────────────────┘
```

---

## 2. Core Components/Modules

### 2.1 User Service (Identity & Relationship Management)

**Purpose:** Manages user identity, authentication, and couple pairing.

| Component | Responsibility | Data Sensitivity |
|-----------|---------------|------------------|
| Auth Module | JWT tokens, MFA, session management | High |
| Profile Module | Demographics, preferences, language settings | Medium |
| Couple Linking | Partner invitation, shared data scope, revocation | High |
| Privacy Controls | Data visibility, burn-after-reading settings | Critical |

**Key Features:**
- Discrete branding support (subtle app icon/name options)
- Partner linking without exposing personal data until both consent
- Granular data sharing controls (what partner can see)
- Anonymous mode for sensitive content

**Data Flow:**
```
User Registration → Profile Creation → Partner Invitation →
Partner Accepts → Couple Profile Created → Shared Data Scope Defined
```

---

### 2.2 Assessment Service (Pre-Marital Engine)

**Purpose:** Powers the 360-degree compatibility assessment with Islamic scholarly endorsement.

| Component | Responsibility | HIPAA Classification |
|-----------|---------------|---------------------|
| Question Bank | Deen, Dunya, Aila, Nafs sections with scholarly citations | Low |
| Response Engine | Secure answer collection, progress tracking | Medium |
| Scoring Algorithm | Red flag detection, compatibility scoring | High |
| Report Generator | Couple's Report PDF generation | High |

**Assessment Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│                   QUESTION BANK                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │
│  │  Deen   │ │  Dunya  │ │  Aila   │ │    Nafs     │   │
│  │ 40 Qs   │ │ 35 Qs   │ │ 30 Qs   │ │   45 Qs     │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └──────┬──────┘   │
│       │           │           │             │           │
│       └───────────┴─────┬─────┴─────────────┘           │
│                         ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              SCORING ENGINE                       │   │
│  │  - Compatibility Matrix (partner comparison)      │   │
│  │  - Red Flag Detection (risk indicators)           │   │
│  │  - Strength Identification                        │   │
│  │  - Growth Area Highlighting                       │   │
│  └──────────────────────┬──────────────────────────┘   │
│                         ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              REPORT GENERATOR                     │   │
│  │  - Individual Summary (private)                   │   │
│  │  - Couple's Report (shared, printable)            │   │
│  │  - Imam Review Format (structured for counseling) │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Red Flag Detection Logic:**
- Hard flags: Abuse indicators, untreated severe mental health, fundamental incompatibilities
- Soft flags: Different communication styles, varying religious practices, financial disagreements
- Scholarly context: Each flag includes relevant Quranic/Hadith guidance

---

### 2.3 Communication Service (Shura Studio)

**Purpose:** Real-time communication tools for conflict de-escalation and decision-making.

| Component | Responsibility | Real-time Requirement |
|-----------|---------------|----------------------|
| Chat Engine | Couple messaging, end-to-end encryption | WebSocket |
| Pause & Pray | Panic button, conflict timer, dua suggestions | Push + In-app |
| Agenda Builder | Structured conversation templates | REST + WebSocket |
| Decision Log | Shared journal, agreement tracking | REST + Sync |
| Conflict Detector | Sentiment analysis, escalation alerts | ML Service |

**Real-Time Architecture:**

```
┌──────────────────────────────────────────────────────────────┐
│                    WEBSOCKET GATEWAY                          │
│  - Socket.io / SignalR for real-time bi-directional comm     │
│  - Room-based isolation (per-couple channels)                │
│  - Presence indicators (typing, online status)               │
└────────────────────────┬─────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────────┐
│ Chat Service│  │Alert Service│  │  Sync Service   │
│ - E2E Enc.  │  │ - Push/In-  │  │ - Decision Log  │
│ - Reactions │  │   App Alert │  │ - Agenda Items  │
│ - History   │  │ - Prayer    │  │ - State Reconc. │
│             │  │   Intervals │  │                 │
└─────────────┘  └─────────────┘  └─────────────────┘
```

**"Pause & Pray" Flow:**
```
Conflict Detected/User Triggers →
  └─> Start Countdown Timer (configurable)
  └─> Pause Chat (both parties notified)
  └─> Display Calming Dua (randomized selection)
  └─> Breathing Exercise UI (haptic feedback)
  └─> Prayer Time Check → Suggest Wudu/Salah if applicable
  └─> Timer Complete → Option to Resume or Extend
  └─> Log De-escalation Event (for analytics)
```

---

### 2.4 Prayer Integration Service

**Purpose:** Syncs with Islamic prayer times for conflict intervention and spiritual reminders.

| Component | Responsibility | External Dependencies |
|-----------|---------------|----------------------|
| Location Service | GPS-based location, manual override | Device GPS |
| Prayer Calculator | Calculate 5 daily prayer times | Aladhan API (primary) |
| Conflict Matcher | Cross-reference active conflicts with prayer times | Communication Service |
| Reminder Engine | Pre-prayer reminders, post-prayer check-ins | Notification Service |

**Prayer Time Data Flow:**
```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ User Location │────▶│ Prayer Time API  │────▶│ Prayer Schedule │
│ (GPS/Manual)  │     │ (Aladhan/Muslim  │     │ (Daily Cache)   │
│               │     │  Salat fallback) │     │                 │
└──────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                         ┌─────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    CONFLICT INTERVENTION                      │
│  IF active_conflict AND next_prayer < 30 min:                │
│    → Suggest: "Prepare for {Prayer Name}. Take Wudu break."  │
│  IF active_conflict AND prayer_time NOW:                     │
│    → Auto-pause chat, display prayer reminder                │
│  IF conflict_paused AND prayer_completed:                    │
│    → Prompt: "Resume conversation with fresh perspective?"   │
└──────────────────────────────────────────────────────────────┘
```

---

### 2.5 Content Service (Courses & Articles)

**Purpose:** Delivers educational content for family dynamics, parenting, and relationship guidance.

| Component | Responsibility | Content Types |
|-----------|---------------|---------------|
| Course Manager | Video courses, progress tracking | Unity First Course, Prophetic Parenting |
| Article Engine | Blog-style content, categorization | Generation Gap Bridge, Boundary Scripts |
| Media Delivery | CDN-backed video/audio delivery | Video lessons, audio alternatives |
| Localization | Multi-language content serving | EN, AR, UR, FR |

**Content Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                     CONTENT MANAGEMENT                       │
├─────────────────┬───────────────────┬───────────────────────┤
│  Course Module  │  Article Module   │   Scripts Library     │
│  - Video Lessons│  - Educational    │   - Boundary Scripts  │
│  - Quizzes      │    Articles       │   - Conversation      │
│  - Progress     │  - Hadith/Quran   │     Templates         │
│    Tracking     │    References     │   - "I" Statement     │
│  - Certificates │  - Tags/Categories│     Builders          │
├─────────────────┴───────────────────┴───────────────────────┤
│                     MEDIA PIPELINE                           │
│  Original Upload → Transcoding (HLS/DASH) → CDN Distribution│
│  - Low-bandwidth option (audio-only, low-res)               │
│  - Offline download support (premium)                        │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.6 Journal Service (Decision Log & Private Notes)

**Purpose:** Secure shared journaling for agreements and private reflection.

| Component | Responsibility | Privacy Level |
|-----------|---------------|---------------|
| Decision Log | Shared agreements, both parties sign | Shared (Couple) |
| Private Journal | Personal reflection, burn-after-reading | Private (User Only) |
| Search Index | Encrypted search across entries | User-encrypted |

**Data Isolation Model:**
```
┌─────────────────────────────────────────────────────────────┐
│                    JOURNAL DATA MODEL                        │
├─────────────────────────────────────────────────────────────┤
│  USER_PRIVATE_JOURNAL                                       │
│  ├── user_id (encrypted reference)                         │
│  ├── entries[] (client-side encrypted)                      │
│  ├── burn_after_reading: boolean                            │
│  └── retention_days: number | null                          │
├─────────────────────────────────────────────────────────────┤
│  COUPLE_DECISION_LOG                                        │
│  ├── couple_id                                              │
│  ├── entries[]                                              │
│  │   ├── content                                            │
│  │   ├── created_by                                         │
│  │   ├── acknowledged_by_partner: boolean                   │
│  │   └── timestamp                                          │
│  └── both_parties_can_delete: true                          │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.7 Analytics Service (Clinical Outcomes)

**Purpose:** Track mental health outcomes and platform KPIs while preserving privacy.

| Component | Responsibility | Data Classification |
|-----------|---------------|---------------------|
| PHQ-9/GAD-7 Engine | Depression/anxiety screening | PHI (High) |
| KPI Tracker | Completion rates, retention | Anonymized |
| De-escalation Metrics | Pause & Pray success tracking | Anonymized |
| Research Export | Anonymized data for research | De-identified |

**Privacy-Preserving Analytics:**
```
┌─────────────────────────────────────────────────────────────┐
│                  ANALYTICS PIPELINE                          │
├─────────────────────────────────────────────────────────────┤
│  Raw Event → PII Stripping → Hashing → Aggregation          │
│                                                              │
│  PHI Data (PHQ-9, GAD-7):                                   │
│  ├── Stored encrypted, user-specific                        │
│  ├── Never shared with partner without explicit consent     │
│  └── Aggregated trends only (no individual export)          │
│                                                              │
│  Behavioral Data (Feature Usage):                           │
│  ├── User ID hashed                                         │
│  ├── Session-level aggregation                              │
│  └── Used for product improvement                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Data Models

### 3.1 Core Entity Relationships

```
┌─────────────┐       ┌─────────────┐       ┌─────────────────┐
│    USER     │       │   COUPLE    │       │    ASSESSMENT   │
├─────────────┤       ├─────────────┤       ├─────────────────┤
│ id          │──┐    │ id          │──┐    │ id              │
│ email       │  │    │ partner_1_id│◀─┼────│ couple_id       │
│ password_h  │  │    │ partner_2_id│◀─┘    │ status          │
│ locale      │  │    │ created_at  │       │ started_at      │
│ created_at  │  │    │ is_active   │       │ completed_at    │
│ mfa_enabled │  │    └─────────────┘       └─────────────────┘
└─────────────┘  │              │                    │
                 │              │                    ▼
                 │              │       ┌─────────────────────┐
                 │              │       │ ASSESSMENT_RESPONSE │
                 │              │       ├─────────────────────┤
                 │              │       │ assessment_id       │
                 │              │       │ user_id             │
                 │              │       │ question_id         │
                 │              │       │ response_value      │
                 │              │       │ responded_at        │
                 │              │       └─────────────────────┘
                 │              │
                 │              ▼
                 │    ┌─────────────────┐
                 │    │  DECISION_LOG   │
                 │    ├─────────────────┤
                 │    │ couple_id       │
                 │    │ entries[]       │
                 │    │ created_at      │
                 │    └─────────────────┘
                 │
                 ▼
       ┌─────────────────┐
       │  USER_PROFILE   │
       ├─────────────────┤
       │ user_id         │
       │ display_name    │
       │ avatar_url      │
       │ preferences{}   │
       │ privacy_settings│
       └─────────────────┘
```

### 3.2 Key Schema Definitions

```typescript
// User Schema (Simplified)
interface User {
  id: string;                    // UUID
  email: string;                 // Encrypted at rest
  password_hash: string;         // Argon2id
  locale: 'en' | 'ar' | 'ur' | 'fr';
  created_at: timestamp;
  mfa_enabled: boolean;
  mfa_secret: string | null;     // Encrypted
}

// Couple Schema
interface Couple {
  id: string;
  partner_1_id: string;
  partner_2_id: string | null;   // Null until invitation accepted
  invitation_token: string;      // For partner invitation
  invitation_expires: timestamp;
  created_at: timestamp;
  is_active: boolean;
}

// Assessment Schema
interface Assessment {
  id: string;
  couple_id: string;
  type: 'pre_marital' | 'check_in' | 'conflict_review';
  status: 'pending' | 'in_progress' | 'completed';
  partner_1_progress: number;
  partner_2_progress: number;
  started_at: timestamp;
  completed_at: timestamp | null;
  report_generated: boolean;
}

// Journal Entry Schema
interface JournalEntry {
  id: string;
  couple_id: string;
  content: string;               // Encrypted
  created_by: string;
  acknowledged_by_partner: boolean;
  created_at: timestamp;
  entry_type: 'decision' | 'agenda_item' | 'private_note';
}

// Prayer Configuration
interface PrayerConfig {
  user_id: string;
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: 'MWL' | 'ISNA' | 'Egyptian' | 'Umm al-Qura';
  };
  notifications_enabled: boolean;
  conflict_intervention_enabled: boolean;
}
```

---

## 4. API Structure

### 4.1 API Design Principles

- **RESTful Design:** Resources are nouns, actions are HTTP verbs
- **Versioning:** URL-based versioning (`/api/v1/...`)
- **Authentication:** JWT Bearer tokens, refresh token rotation
- **Rate Limiting:** Per-user and per-endpoint limits
- **Pagination:** Cursor-based for large collections

### 4.2 Core API Endpoints

```
/api/v1/
├── auth/
│   ├── POST   /register              # Create account
│   ├── POST   /login                 # Authenticate
│   ├── POST   /logout                # Invalidate session
│   ├── POST   /refresh               # Refresh access token
│   └── POST   /mfa/enable            # Enable MFA
│
├── users/
│   ├── GET    /me                    # Current user profile
│   ├── PATCH  /me                    # Update profile
│   ├── GET    /me/preferences        # User preferences
│   └── PATCH  /me/preferences        # Update preferences
│
├── couples/
│   ├── POST   /                      # Initiate couple creation
│   ├── GET    /:id                   # Couple details
│   ├── POST   /:id/invite            # Generate invitation link
│   ├── POST   /:id/accept            # Accept invitation
│   └── DELETE /:id                   # Disconnect couple
│
├── assessments/
│   ├── GET    /                      # List assessments
│   ├── POST   /                      # Start new assessment
│   ├── GET    /:id                   # Assessment details
│   ├── GET    /:id/questions         # Get questions (paginated)
│   ├── POST   /:id/responses         # Submit response
│   ├── GET    /:id/report            # Get couple's report
│   └── GET    /:id/report/pdf        # Download PDF report
│
├── communication/
│   ├── WebSocket /ws                 # Real-time messaging
│   ├── GET    /history               # Chat history
│   ├── POST   /pause-and-pray        # Trigger panic button
│   └── GET    /agenda                # Get agenda items
│
├── journal/
│   ├── GET    /decisions             # List decision log
│   ├── POST   /decisions             # Add decision entry
│   ├── GET    /private               # List private entries
│   └── POST   /private               # Create private entry
│
├── content/
│   ├── GET    /courses               # List courses
│   ├── GET    /courses/:id           # Course details
│   ├── GET    /courses/:id/lessons   # Course lessons
│   ├── GET    /articles              # List articles
│   └── GET    /articles/:id          # Article details
│
├── prayer/
│   ├── GET    /times                 # Today's prayer times
│   ├── GET    /times/:date           # Specific date
│   ├── PUT    /config                # Update prayer config
│   └── GET    /config                # Get prayer config
│
└── analytics/
    ├── POST   /phq9                  # Submit PHQ-9
    ├── POST   /gad7                  # Submit GAD-7
    ├── GET    /me/trends             # Personal trends
    └── GET    /me/summary            # Summary for user
```

### 4.3 WebSocket Events

```typescript
// Client → Server Events
interface ClientEvents {
  'message:send': { couple_id: string; content: string };
  'typing:start': { couple_id: string };
  'typing:stop': { couple_id: string };
  'presence:online': {};
  'conflict:pause': { couple_id: string; reason: string };
  'conflict:resume': { couple_id: string };
}

// Server → Client Events
interface ServerEvents {
  'message:receive': { from: string; content: string; timestamp: number };
  'typing:indicator': { user_id: string; is_typing: boolean };
  'presence:update': { user_id: string; status: 'online' | 'offline' };
  'prayer:reminder': { prayer_name: string; time_remaining: number };
  'conflict:suggest-pause': { reason: string };
  'decision:sync': { entry: JournalEntry };
}
```

---

## 5. Security & Privacy Architecture

### 5.1 HIPAA Compliance Framework

```
┌─────────────────────────────────────────────────────────────────┐
│                    HIPAA COMPLIANCE LAYERS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ADMINISTRATIVE SAFEGUARDS                                      │
│  ├── Security Officer designated                                │
│  ├── Workforce training on PHI handling                         │
│  ├── Access control procedures                                  │
│  ├── Incident response plan                                     │
│  └── Business Associate Agreements (BAA) with all vendors       │
│                                                                  │
│  PHYSICAL SAFEGUARDS                                            │
│  ├── Cloud hosting (AWS/GCP HIPAA-eligible regions)            │
│  ├── No on-premise infrastructure                               │
│  └── Vendor compliance verification                             │
│                                                                  │
│  TECHNICAL SAFEGUARDS                                           │
│  ├── Access Control                                             │
│  │   ├── Unique user identification                            │
│  │   ├── Emergency access procedure                            │
│  │   ├── Automatic logoff                                      │
│  │   └── Encryption & decryption                               │
│  ├── Audit Controls                                             │
│  │   ├── Comprehensive audit logging                           │
│  │   ├── Log integrity protection                              │
│  │   └── Regular audit review                                  │
│  ├── Integrity Controls                                         │
│  │   ├── Data integrity verification                           │
│  │   └── Tamper detection                                      │
│  └── Transmission Security                                      │
│      ├── TLS 1.3 for all communications                        │
│      └── Certificate pinning (mobile)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Data Encryption Strategy

| Data State | Encryption Method | Key Management |
|------------|------------------|----------------|
| At Rest | AES-256-GCM | AWS KMS / HashiCorp Vault |
| In Transit | TLS 1.3 | Certificate Manager |
| Application-Level | Client-side encryption for journals | User-derived keys |
| Database | PostgreSQL pgcrypto + TDE | HSM-backed |

### 5.3 Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Registration:                                                   │
│  Email → Password (Argon2id hash) → Email Verification →       │
│  Optional: MFA Setup (TOTP)                                     │
│                                                                  │
│  Login:                                                          │
│  Email + Password → Rate Limited (5 attempts) →                │
│  MFA Challenge (if enabled) → JWT Access Token (15 min) +      │
│  Refresh Token (7 days, rotated on use)                         │
│                                                                  │
│  Session Management:                                            │
│  - One active session per device                                │
│  - Session listing for user                                     │
│  - Remote session termination                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    AUTHORIZATION MODEL                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Role-Based Access Control (RBAC):                              │
│  ├── USER: Own data, couple-shared data                        │
│  ├── PREMIUM_USER: Extended features                           │
│  ├── IMAM: View invited couple reports (Phase 3)               │
│  └── ADMIN: System administration (no PHI access)              │
│                                                                  │
│  Resource-Based Permissions:                                    │
│  ├── Couple data requires active couple relationship           │
│  ├── Journal entries scoped to couple_id                       │
│  ├── Private entries scoped to user_id only                    │
│  └── Reports generated per-couple, not individually            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4 Privacy-First Design Principles

1. **Data Minimization:** Collect only what's necessary for functionality
2. **Purpose Limitation:** Data used only for stated purposes
3. **Storage Limitation:** Automatic deletion policies for sensitive data
4. **User Control:** Granular privacy settings, export, and deletion
5. **Burn After Reading:** Option for ephemeral sensitive content
6. **Discrete Branding:** App appearance doesn't reveal mental health nature

### 5.5 Audit Logging Architecture

```typescript
interface AuditLog {
  id: string;
  timestamp: timestamp;
  user_id: string;
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  old_value: any | null;      // Encrypted
  new_value: any | null;      // Encrypted
  outcome: 'success' | 'failure';
}

type AuditAction = 
  | 'auth.login'
  | 'auth.logout'
  | 'auth.mfa_enable'
  | 'assessment.start'
  | 'assessment.complete'
  | 'report.generate'
  | 'journal.create'
  | 'journal.delete'
  | 'couple.create'
  | 'couple.accept_invite'
  | 'privacy.burn_after_reading'
  | 'data.export'
  | 'data.delete';
```

---

## 6. Suggested Build Phases

### Phase 1: Foundation (Weeks 1-4)

**Goal:** Establish secure infrastructure and core user management.

| Component | Priority | Dependencies |
|-----------|----------|--------------|
| Database setup (PostgreSQL + encryption) | P0 | None |
| User Service (auth, profiles) | P0 | Database |
| API Gateway + authentication | P0 | User Service |
| Basic web app shell | P0 | API Gateway |
| HIPAA audit logging | P0 | Database |

**Deliverables:**
- Users can register, login, and manage profiles
- Secure infrastructure with encryption at rest
- Audit logging in place

---

### Phase 2: Assessment Engine (Weeks 5-8)

**Goal:** Core pre-marital assessment functionality.

| Component | Priority | Dependencies |
|-----------|----------|--------------|
| Question Bank CMS | P0 | User Service |
| Assessment Service | P0 | Question Bank |
| Response collection API | P0 | Assessment Service |
| Scoring algorithm | P0 | Assessment Service |
| PDF Report generation | P1 | Scoring algorithm |
| Couple linking flow | P0 | User Service |

**Deliverables:**
- Complete assessment flow for individuals
- Couple pairing functionality
- Basic couple's report (text-based initially)

---

### Phase 3: Communication Studio (Weeks 9-12)

**Goal:** Real-time communication and conflict tools.

| Component | Priority | Dependencies |
|-----------|----------|--------------|
| WebSocket infrastructure | P0 | API Gateway |
| Chat Service (basic) | P0 | WebSocket |
| Pause & Pray feature | P0 | Chat Service |
| Prayer Time integration | P0 | User Service |
| Decision Log | P1 | Couple linking |
| Agenda Builder | P1 | Decision Log |

**Deliverables:**
- Real-time messaging between partners
- Panic button with prayer integration
- Shared decision journal

---

### Phase 4: Content & Polish (Weeks 13-16)

**Goal:** Content delivery and offline support.

| Component | Priority | Dependencies |
|-----------|----------|--------------|
| Content Service | P0 | None |
| Media pipeline (CDN) | P1 | Content Service |
| Course progress tracking | P1 | Content Service |
| Offline mode (mobile) | P1 | Content Service |
| Multi-language support | P1 | All services |
| Mobile apps (iOS/Android) | P0 | All services |

**Deliverables:**
- Full course/article delivery
- Offline-capable mobile apps
- Multi-language support

---

### Phase 5: Analytics & Optimization (Weeks 17-20)

**Goal:** Clinical outcome tracking and performance optimization.

| Component | Priority | Dependencies |
|-----------|----------|--------------|
| PHQ-9/GAD-7 integration | P0 | User Service |
| Analytics Service | P1 | All services |
| Performance optimization | P1 | All services |
| Security audit | P0 | All services |
| HIPAA compliance review | P0 | All services |

**Deliverables:**
- Mental health screening tools
- Anonymized analytics dashboard
- Security compliance certification

---

## 7. Infrastructure Recommendations

### 7.1 Cloud Provider: AWS (HIPAA-eligible)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AWS ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  COMPUTE                                                         │
│  ├── EKS (Kubernetes) for microservices                        │
│  ├── Lambda for async processing                                │
│  └── ECS Fargate for background workers                        │
│                                                                  │
│  DATABASE                                                        │
│  ├── RDS PostgreSQL (Multi-AZ, encrypted)                      │
│  ├── ElastiCache Redis (cluster mode)                          │
│  └── OpenSearch (encrypted indices)                            │
│                                                                  │
│  STORAGE                                                         │
│  ├── S3 (encrypted, versioned) for media                        │
│  ├── CloudFront CDN for content delivery                       │
│  └── EFS for shared storage (if needed)                        │
│                                                                  │
│  SECURITY                                                        │
│  ├── WAF + Shield for DDoS protection                          │
│  ├── AWS KMS for key management                                │
│  ├── Secrets Manager for credentials                           │
│  └── CloudTrail for audit logging                              │
│                                                                  │
│  MONITORING                                                      │
│  ├── CloudWatch for metrics/alarms                             │
│  ├── X-Ray for distributed tracing                             │
│  └── Custom dashboards                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Alternative: Google Cloud Platform

- Cloud Run for serverless microservices
- Cloud SQL (PostgreSQL) with encryption
- Firebase for real-time features (chat)
- Cloud CDN for media delivery

---

## 8. Technology Stack Recommendations

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Backend** | Node.js (NestJS) or Go | Type safety, rapid development |
| **Database** | PostgreSQL + Prisma ORM | ACID compliance, encryption support |
| **Cache** | Redis | Session store, rate limiting, real-time |
| **Search** | OpenSearch | Encrypted search indices |
| **Web Frontend** | Next.js 14+ (React) | SSR/SSG, PWA support |
| **Mobile** | React Native or Flutter | Cross-platform, shared code |
| **Real-time** | Socket.io or Ably | WebSocket abstraction |
| **API Docs** | OpenAPI 3.0 / Swagger | Auto-generated documentation |
| **Monitoring** | Datadog or Grafana Cloud | Full observability stack |
| **CI/CD** | GitHub Actions | Integrated with repository |
| **IaC** | Terraform or Pulumi | Infrastructure as code |

---

## 9. Risk Considerations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Data breach** | Critical | Encryption at rest/transit, access controls, audit logging |
| **HIPAA violation** | Critical | Legal review, BAAs, staff training, regular audits |
| **Prayer time API failure** | Medium | Multiple API providers, local calculation fallback |
| **Scalability bottleneck** | Medium | Horizontal scaling, caching strategy, CDN |
| **Third-party dependency risk** | Medium | Dependency pinning, security scanning, fallback providers |
| **Cultural insensitivity** | High | Scholar advisory board, content review process |
| **User trust erosion** | High | Transparent privacy policy, user control, discrete branding |

---

## 10. Future Architecture Considerations

### Phase 3: Imam Gateway

- Separate dashboard application for Imams
- Role-based access for viewing couple reports
- Secure document sharing
- B2B billing infrastructure

### Phase 4: Telehealth Integration

- HIPAA-compliant video conferencing (Twilio or Zoom SDK)
- Therapist directory and matching
- Appointment scheduling
- Session notes (clinical documentation)

### Scaling Considerations

- Multi-region deployment for global users
- Read replicas for database scaling
- Event-driven architecture for async processing
- ML pipeline for conflict detection improvements

---

*Document Version: 1.0*
*Last Updated: Initial creation*
*Next Review: After Phase 1 completion*
