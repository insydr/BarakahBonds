# Phase 1: Foundation & Trust - Research Summary

**Research Date:** 2026-03-28
**Target:** Planning Phase 1 implementation
**Question:** What do I need to know to PLAN this phase well?

---

## Executive Summary

Phase 1 establishes the security, privacy, and authentication foundation that all subsequent features depend upon. Users must trust the platform with sensitive marital/relationship data from their first interaction. This research covers the technical implementation patterns for Supabase Auth, Row-Level Security, couple linking, and discrete branding.

**Critical Success Factors:**
1. Privacy-by-design architecture (HIPAA foundation)
2. Solo mode value from Day 1
3. Discrete branding that passes the "in-law test"
4. Clear data ownership model (individual vs. couple)

---

## 1. Supabase Auth Setup

### 1.1 Project Configuration

**Initial Setup Steps:**
```
1. Create Supabase project (Pro tier for BAA)
2. Enable email auth provider
3. Configure email templates (discrete branding)
4. Set JWT expiry: 1 hour (access), 7 days (refresh)
5. Enable email verification (required)
6. Disable social providers for MVP
```

**Key Configuration (Dashboard):**
```yaml
Authentication > Providers:
  - Email: ENABLED
  - Enable email confirmations: TRUE
  - Secure email change: TRUE
  - Secure password change: TRUE

Authentication > URL Configuration:
  - Site URL: https://barakah.app (or Vercel preview URL)
  - Redirect URLs: 
    - https://barakah.app/auth/callback
    - https://barakah.app/auth/verify

Authentication > Policies:
  - Minimum password length: 12 characters
  - Password requirements: uppercase, lowercase, numbers, symbols
  - Password breach detection: ENABLED (haveibeenpwned)
```

### 1.2 Auth Helper Integration (Next.js 15)

**Required Dependencies:**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Server-Side Client Pattern (App Router):**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component - cookies are read-only
          }
        },
      },
    }
  )
}
```

**Browser Client Pattern:**
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 1.3 Middleware for Auth State

**Required Pattern (Next.js 15):**
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  // Protect routes
  const protectedPaths = ['/dashboard', '/settings', '/assessment', '/journal']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !session) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ['/auth/login', '/auth/register']
  if (authPaths.includes(request.nextUrl.pathname) && session) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 1.4 Session Management

**Token Configuration:**
```sql
-- In Supabase SQL Editor
ALTER DATABASE postgres SET "jwt_expiry" TO "3600";       -- 1 hour
ALTER DATABASE postgres SET "refresh_token_expiry" TO "604800"; -- 7 days
```

**Session Persistence Gotcha:**
- Supabase SSR handles refresh token rotation automatically
- Server Components should use `createClient()` for each request
- Do NOT cache Supabase clients in global variables

---

## 2. Row-Level Security Policies

### 2.1 Database Schema

**Core Tables for Phase 1:**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  privacy_settings JSONB DEFAULT '{
    "burn_after_reading": false,
    "retention_days": null
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Couples table
CREATE TABLE public.couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_code TEXT UNIQUE NOT NULL,
  invitation_expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_invitation_code CHECK (LENGTH(invitation_code) = 8)
);

-- Audit log (immutable)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for RLS performance
CREATE INDEX idx_couples_partner_1 ON couples(partner_1_id);
CREATE INDEX idx_couples_partner_2 ON couples(partner_2_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

### 2.2 RLS Policies

**Enable RLS on all tables:**
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
```

**Profiles Policies:**
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Partner can view profile (when couple is active)
CREATE POLICY "Partners can view each other's profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE status = 'active'
      AND (
        (partner_1_id = auth.uid() AND partner_2_id = profiles.id)
        OR
        (partner_2_id = auth.uid() AND partner_1_id = profiles.id)
      )
    )
  );
```

**Couples Policies:**
```sql
-- Users can view their own couple record
CREATE POLICY "Users can view own couple"
  ON public.couples FOR SELECT
  USING (
    auth.uid() = partner_1_id 
    OR auth.uid() = partner_2_id
  );

-- Only partner_1 can create (generate invitation)
CREATE POLICY "Only partner_1 can create couple"
  ON public.couples FOR INSERT
  WITH CHECK (auth.uid() = partner_1_id);

-- Both partners can update (status changes)
CREATE POLICY "Partners can update couple"
  ON public.couples FOR UPDATE
  USING (
    auth.uid() = partner_1_id 
    OR auth.uid() = partner_2_id
  );

-- Both partners can delete (disconnect)
CREATE POLICY "Partners can delete couple"
  ON public.couples FOR DELETE
  USING (
    auth.uid() = partner_1_id 
    OR auth.uid() = partner_2_id
  );
```

**Audit Log Policies:**
```sql
-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Only system can insert (via service role or trigger)
CREATE POLICY "System only can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (false); -- Application uses service role key
```

### 2.3 Helper Functions for RLS

```sql
-- Get current user's partner ID (if any)
CREATE OR REPLACE FUNCTION get_partner_id()
RETURNS UUID AS $$
DECLARE
  partner_uuid UUID;
BEGIN
  SELECT 
    CASE 
      WHEN partner_1_id = auth.uid() THEN partner_2_id
      WHEN partner_2_id = auth.uid() THEN partner_1_id
      ELSE NULL
    END INTO partner_uuid
  FROM public.couples
  WHERE status = 'active'
  AND (partner_1_id = auth.uid() OR partner_2_id = auth.uid());
  
  RETURN partner_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has active couple
CREATE OR REPLACE FUNCTION has_active_couple()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.couples
    WHERE status = 'active'
    AND (partner_1_id = auth.uid() OR partner_2_id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

---

## 3. Next.js Auth Flow Implementation

### 3.1 File Structure

```
app/
├── (auth)/
│   ├── layout.tsx              # Minimal layout for auth pages
│   ├── login/
│   │   └── page.tsx            # Login form
│   ├── register/
│   │   └── page.tsx            # Registration form
│   ├── verify/
│   │   └── page.tsx            # Email verification pending
│   ├── callback/
│   │   └── route.ts            # OAuth callback (future)
│   └── forgot-password/
│       └── page.tsx            # Password reset
├── (protected)/
│   ├── layout.tsx              # Auth guard wrapper
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard
│   └── settings/
│       ├── page.tsx            # Settings hub
│       ├── account/
│       │   └── page.tsx        # Account settings
│       └── partner/
│           └── page.tsx        # Couple linking
└── api/
    └── auth/
        └── route.ts            # Auth API routes (if needed)
```

### 3.2 Login Flow

**Server Component (page.tsx):**
```typescript
// app/(auth)/login/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from './login-form'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    redirect('/dashboard')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </div>
  )
}
```

**Client Component (form):**
```typescript
// app/(auth)/login/login-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      // Generic message to prevent enumeration
      setError('Invalid credentials. Please try again.')
      setLoading(false)
      return
    }
    
    router.push('/dashboard')
    router.refresh()
  }
  
  return (
    <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
      <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <a href="/register" className="text-primary hover:underline">
          Sign up
        </a>
      </p>
    </form>
  )
}
```

### 3.3 Registration Flow

**Key Considerations:**
1. Email verification required before account activation
2. Minimal profile creation (display name, timezone optional)
3. Generic error messages to prevent enumeration
4. Rate limiting on registration endpoint

**Server Action Pattern:**
```typescript
// actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('displayName') as string
  
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        display_name: displayName,
      },
    },
  })
  
  if (error) {
    return { error: 'Unable to create account. Please try again.' }
  }
  
  // Profile created via trigger (see below)
  
  redirect('/auth/verify?email=' + encodeURIComponent(email))
}
```

### 3.4 Auto-Create Profile on Signup

**Database Trigger:**
```sql
-- Function to create profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3.5 Protected Route Pattern

**Layout with Auth Guard:**
```typescript
// app/(protected)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }
  
  return (
    <div className="min-h-screen">
      <nav>{/* Navigation */}</nav>
      <main>{children}</main>
    </div>
  )
}
```

---

## 4. Couple Linking Data Model & Flow

### 4.1 Data Model

**Couple Status States:**
```
pending   → Invitation created, waiting for partner to accept
active    → Both partners linked and can share data
inactive  → Couple disconnected (either party can disconnect)
```

**Invitation Code Generation:**
```typescript
// utils/invitation-code.ts
import { randomBytes } from 'crypto'

export function generateInvitationCode(): string {
  // 8-character alphanumeric, uppercase, no ambiguous chars
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(8)
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length]
  }
  return code
}
```

### 4.2 Linking Flow (Asymmetric Approval)

```
┌─────────────────────────────────────────────────────────────────┐
│                    COUPLE LINKING FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PARTNER A (Initiator)                                          │
│  ────────────────────────                                       │
│  1. Navigates to Settings > Partner                             │
│  2. Clicks "Generate Invitation Code"                           │
│  3. System creates:                                             │
│     - couples record (status: 'pending')                        │
│     - invitation_code: 'B7K3M9R2'                               │
│     - invitation_expires_at: NOW + 7 days                       │
│  4. Partner A shares code with Partner B                        │
│                                                                  │
│  PARTNER B (Recipient)                                          │
│  ────────────────────────                                       │
│  5. Navigates to Settings > Partner                             │
│  6. Enters invitation code: 'B7K3M9R2'                          │
│  7. System validates:                                           │
│     - Code exists and not expired                               │
│     - Partner B is not already linked                           │
│  8. Partner B confirms link request                             │
│                                                                  │
│  PARTNER A (Approval)                                           │
│  ────────────────────────                                       │
│  9. Receives notification "Partner B wants to connect"          │
│  10. Reviews Partner B's display name                           │
│  11. Approves or Rejects                                        │
│     IF APPROVED:                                                │
│       - couples.status → 'active'                               │
│       - partner_2_id set to Partner B's user_id                 │
│       - Both users receive confirmation                         │
│     IF REJECTED:                                                │
│       - couples record deleted                                  │
│       - Partner B notified (generic message)                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Server Actions for Couple Linking

```typescript
// actions/couple.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { generateInvitationCode } from '@/utils/invitation-code'

export async function generateInvite() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }
  
  // Check if already linked
  const { data: existingCouple } = await supabase
    .from('couples')
    .select('*')
    .or(`partner_1_id.eq.${user.id},partner_2_id.eq.${user.id}`)
    .eq('status', 'active')
    .single()
  
  if (existingCouple) {
    return { error: 'You are already linked to a partner' }
  }
  
  const code = generateInvitationCode()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  
  const { data, error } = await supabase
    .from('couples')
    .insert({
      partner_1_id: user.id,
      invitation_code: code,
      invitation_expires_at: expiresAt.toISOString(),
      status: 'pending',
    })
    .select()
    .single()
  
  if (error) return { error: 'Failed to generate invitation' }
  
  return { code, expiresAt: expiresAt.toISOString() }
}

export async function acceptInvite(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }
  
  // Find pending invitation
  const { data: couple, error: findError } = await supabase
    .from('couples')
    .select('*')
    .eq('invitation_code', code.toUpperCase())
    .eq('status', 'pending')
    .gt('invitation_expires_at', new Date().toISOString())
    .single()
  
  if (findError || !couple) {
    return { error: 'Invalid or expired invitation code' }
  }
  
  // Can't link to yourself
  if (couple.partner_1_id === user.id) {
    return { error: 'You cannot use your own invitation code' }
  }
  
  // Update with partner_2_id (pending approval from partner_1)
  const { error } = await supabase
    .from('couples')
    .update({ partner_2_id: user.id })
    .eq('id', couple.id)
  
  if (error) return { error: 'Failed to accept invitation' }
  
  return { success: true, coupleId: couple.id }
}

export async function approveLink(coupleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }
  
  const { error } = await supabase
    .from('couples')
    .update({ status: 'active' })
    .eq('id', coupleId)
    .eq('partner_1_id', user.id) // Only initiator can approve
  
  if (error) return { error: 'Failed to approve link' }
  
  return { success: true }
}

export async function disconnectPartner() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }
  
  // Set status to inactive (soft delete for audit trail)
  const { error } = await supabase
    .from('couples')
    .update({ status: 'inactive' })
    .or(`partner_1_id.eq.${user.id},partner_2_id.eq.${user.id}`)
    .eq('status', 'active')
  
  if (error) return { error: 'Failed to disconnect' }
  
  return { success: true }
}
```

### 4.4 Solo Mode Considerations

**Key Principle:** The app must provide full value without a partner.

**Features that work solo:**
- Personal journaling (private entries)
- Assessment (individual results)
- Content library (articles, courses)
- Prayer time integration
- Personal settings

**Features that require couple:**
- Shared decision log
- Couple's report
- Real-time messaging
- Partner-specific assessments

**UI Pattern:**
```typescript
// components/partner-required.tsx
export function PartnerRequired({ children }: { children: React.ReactNode }) {
  const { hasPartner } = useCoupleStatus()
  
  if (!hasPartner) {
    return (
      <div className="text-center p-8">
        <h2>Partner Feature</h2>
        <p>This feature requires you to be linked with your partner.</p>
        <Button asChild>
          <a href="/settings/partner">Link Partner</a>
        </Button>
      </div>
    )
  }
  
  return children
}
```

---

## 5. Discrete Branding Implementation

### 5.1 App Naming Strategy

**Primary Choice: "Barakah"**
- Arabic word meaning "blessing"
- Positive connotation in Muslim community
- Could be a finance app, productivity tool, or prayer app
- Passes the "in-law test"

**Alternative: "BB Connect"**
- Sounds like business/productivity app
- Neutral, professional appearance
- "BB" could mean anything

**Implementation:**
```json
// package.json
{
  "name": "barakah",
  "version": "1.0.0"
}

// public/manifest.json (PWA)
{
  "name": "Barakah",
  "short_name": "Barakah",
  "description": "Personal growth and reflection",
  "start_url": "/dashboard"
}
```

### 5.2 App Icon Design

**Design Principles:**
- Abstract/geometric (no hearts, rings, couples)
- Could pass as productivity, finance, or prayer app
- Simple, professional appearance
- Consider subtle Islamic geometric patterns

**Icon Options:**
1. Geometric pattern (8-pointed star variant)
2. Abstract letter "B" with modern styling
3. Simple leaf or water drop (growth metaphor)

### 5.3 Push Notification Text

**Generic Message Templates:**
```typescript
// lib/notifications/templates.ts
export const notificationTemplates = {
  daily_tip: {
    title: "Your daily reflection is ready",
    body: "Take a moment to read today's insight."
  },
  partner_message: {
    title: "You have a new message",
    body: "Check your inbox when you have a moment."
  },
  assessment_reminder: {
    title: "Continuing your journey",
    body: "Your reflection is waiting for you."
  },
  prayer_time: {
    title: "Time for reflection",
    body: "A moment of peace awaits."
  },
  link_request: {
    title: "Connection request",
    body: "Someone wants to connect with you."
  }
}

// NEVER use:
// ❌ "Your partner sent a message"
// ❌ "Marriage tip of the day"
// ❌ "Assessment results ready"
// ❌ "Counseling reminder"
```

### 5.4 Email Templates

**Email Sender Name:**
- Display name: "Barakah" (not "Barakah Bonds")
- Sender: "noreply@barakah.app"

**Subject Lines (Generic):**
```
✅ "Welcome to Barakah"
✅ "Verify your email"
✅ "Your account update"
✅ "Weekly summary"
✅ "New activity in your account"

❌ "Welcome to Barakah Bonds Marriage App"
❌ "Complete your relationship assessment"
❌ "Your partner is waiting"
```

### 5.5 Browser Tab Title

**Pattern:**
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'Barakah',
    template: '%s | Barakah'
  },
  description: 'Personal growth and reflection platform',
  // ... other metadata
}

// Page-specific titles (discrete)
// ❌ "Assessment | Barakah"
// ✅ "Journey | Barakah"
// ❌ "Couple Counseling | Barakah"
// ✅ "Connect | Barakah"
```

---

## 6. Key Dependencies and Gotchas

### 6.1 Required Dependencies

```json
{
  "dependencies": {
    // Core
    "next": "15.x",
    "react": "19.x",
    "typescript": "5.x",
    
    // Supabase
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.4.x",
    
    // UI Components
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-dropdown-menu": "^2.x",
    "@radix-ui/react-label": "^2.x",
    "@radix-ui/react-slot": "^1.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    
    // Forms
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    
    // Encryption (for client-side sensitive data)
    "@noble/ciphers": "^0.5.x",
    
    // Utilities
    "date-fns": "^3.x"
  },
  "devDependencies": {
    "tailwindcss": "^4.x",
    "@types/node": "^20.x",
    "@types/react": "^19.x",
    "eslint": "^9.x",
    "prettier": "^3.x"
  }
}
```

### 6.2 Critical Gotchas

**1. Supabase SSR Cookie Handling**
```typescript
// ❌ WRONG - won't persist sessions
const supabase = createClient() // cached globally

// ✅ CORRECT - fresh client per request
export async function createClient() {
  return createServerClient(...)
}
```

**2. Middleware Refresh Pattern**
```typescript
// Middleware MUST call getSession() to refresh tokens
// Even if you don't use the session object
const { data: { session } } = await supabase.auth.getSession()
```

**3. RLS Performance**
```sql
-- ❌ WRONG - function called for every row
CREATE POLICY "..." USING (get_partner_id() = user_id)

-- ✅ CORRECT - indexed join
CREATE POLICY "..." USING (
  EXISTS (SELECT 1 FROM couples WHERE ...)
)
```

**4. Environment Variables**
```bash
# Required in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Server-only (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

**5. Email Verification Flow**
```
User signs up → Email sent → User clicks link → 
Supabase verifies → Redirects to /auth/callback → 
Session created → Redirect to /dashboard

GOTCHA: The callback route must handle the token exchange
```

**6. Invitation Code Collision**
```typescript
// Always check for uniqueness before insert
const { data: existing } = await supabase
  .from('couples')
  .select('invitation_code')
  .eq('invitation_code', code)
  .single()

if (existing) {
  // Regenerate and retry
}
```

**7. Timezone Handling**
```typescript
// Store user timezone for notification timing
// Use date-fns-tz for consistent timezone handling
import { formatInTimeZone } from 'date-fns-tz'

// Never assume server timezone matches user
```

### 6.3 Security Checklist

```
Phase 1 Security Requirements:
□ HTTPS only (enforced by Vercel)
□ Secure cookies (httpOnly, secure, sameSite)
□ CSRF protection (built into Supabase)
□ Rate limiting on auth endpoints
□ Password strength requirements (12+ chars)
□ Email verification required
□ Generic error messages (no enumeration)
□ RLS enabled on all tables
□ Audit logging for sensitive operations
□ No PHI in URLs or query strings
□ Client-side encryption for sensitive content (future)
```

---

## 7. File Structure Recommendations

### 7.1 Complete Phase 1 Structure

```
barakah-bonds/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   ├── page.tsx
│   │   │   └── register-form.tsx
│   │   ├── verify/
│   │   │   └── page.tsx
│   │   ├── callback/
│   │   │   └── route.ts
│   │   └── forgot-password/
│   │       └── page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   ├── account/
│   │   │   │   └── page.tsx
│   │   │   └── partner/
│   │   │       ├── page.tsx
│   │   │       └── _components/
│   │   │           ├── generate-invite.tsx
│   │   │           ├── accept-invite.tsx
│   │   │           └── pending-approval.tsx
│   │   └── journal/          # Solo mode feature
│   │       └── page.tsx
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page (marketing)
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── nav.tsx
│   │   └── footer.tsx
│   └── providers/
│       └── supabase-provider.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   └── utils.ts
├── actions/
│   ├── auth.ts
│   └── couple.ts
├── hooks/
│   ├── use-user.ts
│   └── use-couple.ts
├── types/
│   └── database.ts           # Generated from Supabase
├── utils/
│   ├── invitation-code.ts
│   └── encryption.ts         # Client-side encryption helpers
├── public/
│   ├── favicon.ico           # Discrete icon
│   ├── icon-192.png
│   ├── icon-512.png
│   └── manifest.json
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 7.2 Database Migration File

```sql
-- supabase/migrations/001_initial_schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  privacy_settings JSONB DEFAULT '{
    "burn_after_reading": false,
    "retention_days": null
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Couples table
CREATE TABLE public.couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_code TEXT UNIQUE NOT NULL,
  invitation_expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_invitation_code CHECK (LENGTH(invitation_code) = 8)
);

-- Audit log
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_couples_partner_1 ON couples(partner_1_id);
CREATE INDEX idx_couples_partner_2 ON couples(partner_2_id);
CREATE INDEX idx_couples_status ON couples(status);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- [Insert RLS policies from Section 2.2]

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_couples_updated_at
  BEFORE UPDATE ON public.couples
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

---

## 8. Pre-Implementation Checklist

### Before Starting Phase 1 Development:

**Supabase Setup:**
- [ ] Create Supabase project (Pro tier)
- [ ] Execute BAA with Supabase
- [ ] Configure auth providers (email only)
- [ ] Set up email templates (discrete branding)
- [ ] Run initial migration
- [ ] Verify RLS policies work

**Development Environment:**
- [ ] Initialize Next.js 15 project
- [ ] Configure TypeScript strict mode
- [ ] Set up Tailwind CSS 4
- [ ] Install shadcn/ui components
- [ ] Configure environment variables
- [ ] Set up ESLint + Prettier

**Security Foundation:**
- [ ] Implement middleware auth guard
- [ ] Test RLS policies with multiple users
- [ ] Verify cookie security settings
- [ ] Test invitation code flow
- [ ] Confirm generic error messages

**Design Assets:**
- [ ] Create discrete app icon
- [ ] Design generic notification templates
- [ ] Prepare email templates (discrete)
- [ ] Create landing page (minimal, professional)

**Documentation:**
- [ ] Document all environment variables
- [ ] Create development setup guide
- [ ] Document API patterns for team

---

## Summary

**Phase 1 delivers:**
1. Secure email/password authentication with Supabase
2. Row-Level Security for complete data isolation
3. Couple linking via invitation codes (asymmetric approval)
4. Solo mode functionality from Day 1
5. Discrete branding throughout the application

**Key Technical Decisions:**
- Supabase Auth + SSR for session management
- RLS on all tables for defense in depth
- Asymmetric couple linking for consent clarity
- Generic branding for privacy protection

**Next Step:** Proceed to `/gsd:plan-phase 1` for detailed task breakdown.

---

*Research completed: 2026-03-28*
*Ready for: Phase 1 Planning*
