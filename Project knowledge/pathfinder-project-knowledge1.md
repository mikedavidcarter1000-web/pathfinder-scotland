# Pathfinder Scotland - Project Knowledge Document

**Document Created:** 29 January 2026  
**Session Focus:** Market research, competitive analysis, and development environment setup

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Decisions Made & Rationale](#2-decisions-made--rationale)
3. [Workstream Status](#3-workstream-status)
4. [Technical Specifications](#4-technical-specifications)
5. [Competitive Intelligence](#5-competitive-intelligence)
6. [Outstanding Questions](#6-outstanding-questions)
7. [Next Steps](#7-next-steps)
8. [Appendices](#appendices)

---

## 1. Project Overview

### Mission
Pathfinder Scotland is a B2C SaaS platform helping Scottish secondary school students navigate subject choices and university pathways, with emphasis on widening access programmes for disadvantaged students.

### Core Value Proposition
> "We connect your subject choices today to your opportunities tomorrow."

This differentiates Pathfinder from existing tools (like TOOLS) which collect choices but don't provide guidance.

### Technical Foundation
| Component | Technology |
|-----------|------------|
| Database/Auth | Supabase (PostgreSQL) |
| Frontend | Next.js |
| Payments | Stripe |
| Email | Resend |
| Hosting | Vercel |
| Domain | pathfinder-scotland.vercel.app (deployed) |

### Project Location
```
C:\Users\marmu\pathfinder-scotland
```

### Supabase Project Reference
```
qexfszbhmducszupyzi
```

---

## 2. Decisions Made & Rationale

### 2.1 Market Positioning

| Decision | Rationale |
|----------|-----------|
| **Complement TOOLS, don't compete** | TOOLS is entrenched as the transactional system for recording choices. Pathfinder's value is the guidance layer BEFORE students enter choices. Schools won't replace TOOLS but will welcome tools that help students arrive at better decisions. |
| **Focus on guidance gap** | TOOLS asks "what do you want?" - Pathfinder asks "what do you want to DO, and what gets you there?" This is a fundamental value gap no timetabling software can fill. |
| **Use Royal High School as model** | Their materials are well-structured and representative of Edinburgh schools. Genericise their approach for Pathfinder's content templates. |

### 2.2 Content Strategy

| Decision | Rationale |
|----------|-----------|
| **Adopt Academy Descriptors format** | Royal High School's "Content + Why Choose" structure is proven and student-friendly. Use as template for all course descriptions. |
| **Use five curricular areas as taxonomy** | Modern Languages, Expressive Arts, Sciences, Social Studies, Technologies - this is the standard Scottish framework students already understand. |
| **Add career-focused tagging** | Layer career/university pathway tags on top of curricular areas for Pathfinder's unique value. |

### 2.3 Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Database has real data - never reset** | Supabase contains production data. Use `migration repair --status applied` for schema sync, never `db reset`. |
| **Create CLAUDE_CONTEXT.md** | Claude Code sessions don't persist memory. A context file in the project root enables faster session resumption. |
| **Mark migration 20240101000000 as applied** | Schema already exists in database; migration tracking was out of sync. |

### 2.4 Feature Priorities

| Decision | Rationale |
|----------|-----------|
| **Promo code system - HIGH priority** | Revenue enabler for launch; supports marketing and partnerships |
| **GDPR features - HIGH priority** | Legal requirement for handling student data; builds trust |
| **Cross-school visibility - MEDIUM priority** | High-value differentiator but requires data gathering first |

---

## 3. Workstream Status

### 3.1 Core Platform Development

| Feature | Status | Notes |
|---------|--------|-------|
| User authentication | ✅ Complete | Email auth via Resend configured |
| Database schema | ✅ Complete | Core tables deployed to Supabase |
| Scottish postcode data | ✅ Complete | 227,066 records imported for SIMD lookup |
| Protected routes | ✅ Complete | Dashboard, saved items, comparisons, grades, profile, onboarding |
| Progressive onboarding | ✅ Designed | Three-tier system to reduce friction |
| Stripe integration | ✅ Complete | Payment processing configured |

### 3.2 Pending Features (NOT IMPLEMENTED)

| Feature | Priority | Description |
|---------|----------|-------------|
| Promo code system | HIGH | Create codes, track usage, expiry dates, usage limits |
| `delete_user_data()` function | HIGH | GDPR: fully delete user and associated data |
| `audit_log` table | HIGH | GDPR: track data access and changes |
| `export_user_data()` function | HIGH | GDPR: generate data export for subject access requests |

### 3.3 Research & Content

| Item | Status | Notes |
|------|--------|-------|
| TOOLS system analysis | ✅ Complete | Documented capabilities and gaps |
| Royal High School materials review | ✅ Complete | Course choice sheets, Academy Descriptors analysed |
| YouTube video content | ⏳ Pending | Need to extract transcripts manually (see Section 6) |
| Generic school case study | ✅ Complete | Documented in pathfinder-school-analysis.md |

### 3.4 Environment & Tooling

| Issue | Status | Resolution |
|-------|--------|------------|
| Claude Code path confusion | ✅ Resolved | Project at `C:\Users\marmu\pathfinder-scotland` |
| Supabase CLI authentication | ✅ Resolved | Logged in via browser |
| Supabase project linking | ✅ Resolved | Linked to ref `qexfszbhmducszupyzi` |
| Migration sync issue | 🔄 In Progress | Use `npx supabase migration repair --status applied 20240101000000` |
| Browser scam notification | ✅ Resolved | Remove notification permission from Edge settings |

---

## 4. Technical Specifications

### 4.1 Data Models (Proposed for Pathfinder)

#### Subject Model
```typescript
interface Subject {
  id: string;
  name: string;
  curricular_area: 'ModernLanguages' | 'ExpressiveArts' | 'Sciences' | 'SocialStudies' | 'Technologies';
  available_from: 'S3' | 'S4' | 'S5' | 'S6';
  available_levels: ('N4' | 'N5' | 'Higher' | 'AdvancedHigher')[];
  delivery_modes: ('InPerson' | 'Hybrid' | 'CrossSchool')[];
  prerequisites: string[];  // Subject IDs
  leads_to: string[];       // Subject IDs
  career_links: string[];   // Career IDs
  description_content: string;
  description_why_choose: string;
}
```

#### Academy/Enrichment Model
```typescript
interface Academy {
  id: string;
  name: string;
  description: string;
  skills_developed: string[];
  progression_to: string[];  // Subject IDs
  career_links: string[];    // Career IDs
  external_award: boolean;
  award_body?: string;       // 'SQA' | 'DofE' | etc.
}
```

#### Course Choice Rules
```typescript
interface CourseChoiceRules {
  year_group: 'S2-S3' | 'S3-S4' | 'S4-S5' | 'S5-S6';
  compulsory_subjects: string[];
  choice_count: number;
  reserve_count: number;
  special_rules?: string[];  // e.g., "Foundation Apprenticeship counts as 2"
}

// Example: S2 → S3
const s2_s3_rules: CourseChoiceRules = {
  year_group: 'S2-S3',
  compulsory_subjects: ['English', 'Mathematics'],
  choice_count: 6,
  reserve_count: 1,
  special_rules: ['Choose from diverse curricular areas']
};
```

### 4.2 GDPR Functions (To Be Implemented)

#### delete_user_data()
```sql
-- Pseudocode - actual implementation TBD
CREATE OR REPLACE FUNCTION delete_user_data(user_id UUID)
RETURNS void AS $$
BEGIN
  -- Delete from all user-related tables
  DELETE FROM user_preferences WHERE user_id = $1;
  DELETE FROM saved_courses WHERE user_id = $1;
  DELETE FROM user_grades WHERE user_id = $1;
  -- ... other tables
  DELETE FROM auth.users WHERE id = $1;
  
  -- Log deletion
  INSERT INTO audit_log (action, target_user, performed_at)
  VALUES ('USER_DELETED', $1, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### audit_log Table
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_user UUID,
  performed_by UUID,
  details JSONB,
  ip_address INET,
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_audit_log_user ON audit_log(target_user);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_date ON audit_log(performed_at);
```

#### export_user_data()
```sql
CREATE OR REPLACE FUNCTION export_user_data(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user', (SELECT row_to_json(u) FROM auth.users u WHERE id = $1),
    'preferences', (SELECT jsonb_agg(row_to_json(p)) FROM user_preferences p WHERE user_id = $1),
    'saved_courses', (SELECT jsonb_agg(row_to_json(s)) FROM saved_courses s WHERE user_id = $1),
    'grades', (SELECT jsonb_agg(row_to_json(g)) FROM user_grades g WHERE user_id = $1),
    'exported_at', NOW()
  ) INTO result;
  
  -- Log export
  INSERT INTO audit_log (action, target_user, performed_at)
  VALUES ('DATA_EXPORTED', $1, NOW());
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.3 Promo Code System (To Be Implemented)

```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE promo_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID REFERENCES promo_codes(id),
  user_id UUID REFERENCES auth.users(id),
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  order_id TEXT,  -- Stripe payment intent or similar
  UNIQUE(promo_code_id, user_id)  -- One use per user
);
```

---

## 5. Competitive Intelligence

### 5.1 TOOLS System (TimeTabler Options On-Line System)

**What it is:** Commercial software from MIST Services / October ReSolutions Ltd for collecting student subject choices online.

**Pricing:** £74.95/year for hosted version (up to 3 sites)

**What TOOLS does:**
- Online choice entry via school-provided login
- Subject selection from school-defined list
- Data export to Options software for timetabling
- Reserve choice capture
- Confirmation emails to parents

**What TOOLS does NOT do:**
- Career/pathway guidance
- University requirement matching
- Subject description hosting
- Cross-school visibility
- Progression mapping
- Personalised recommendations
- Mobile-first experience

**Key insight:** TOOLS exists to reduce administrative burden for timetablers, not to help students make informed decisions. It's purely transactional.

### 5.2 Pathfinder's Competitive Advantages

| Advantage | Why TOOLS Can't Compete |
|-----------|------------------------|
| University entry requirement database | Outside their scope - they're timetabling software |
| Career pathway mapping | Not their market |
| AI-powered recommendations | No ML/AI capability |
| Widening access integration | Not in their data model |
| Cross-school subject availability | Each school is a silo |
| Long-term progression visualisation | Year-by-year only |
| Mobile-first student experience | Admin-focused desktop tool |

### 5.3 Schools Doing Their Own Guidance

Royal High School Edinburgh creates:
- Video explainers for course choice process
- Detailed Academy Descriptors documents
- Paper course choice sheets with instructions

**Implication:** Schools recognise the guidance gap but lack resources for comprehensive solutions. Pathfinder fills this gap at scale.

---

## 6. Outstanding Questions

### 6.1 Content Questions

| Question | Impact | Suggested Action |
|----------|--------|------------------|
| What's in the Royal High School YouTube videos? | May contain valuable guidance content/approaches | Extract transcripts using youtubetranscript.com or YouTube's transcript feature |
| What subjects are available at cross-school level in Edinburgh? | Needed for "subjects near you" feature | Research Craigmount, Queensferry, Digital Consortia offerings |
| What Edinburgh College SCP courses are available? | Valuable for comprehensive pathway data | Fetch from edinburghcollege.ac.uk/courses/for-school-pupils |

### 6.2 Technical Questions

| Question | Impact | Suggested Action |
|----------|--------|------------------|
| What's the exact current schema state? | Need to confirm before adding new migrations | Run `npx supabase db diff` after fixing migration sync |
| How should promo codes interact with Stripe? | Architecture decision | Research Stripe Coupons API vs. custom implementation |

### 6.3 Business Questions

| Question | Impact | Suggested Action |
|----------|--------|------------------|
| Would Royal High School partner for pilot? | Validation + case study | Consider outreach once MVP ready |
| What's the timeline for Entrepreneurial Education Fund? | July application, October delivery start | Ensure pilot evidence ready by June |

---

## 7. Next Steps

### Immediate (Today/Tomorrow)

1. **Fix migration sync in Claude Code:**
   ```
   npx supabase migration repair --status applied 20240101000000
   ```

2. **Verify database state:**
   ```
   npx supabase db diff
   ```

3. **Implement promo code system** (if schema confirmed)

4. **Implement GDPR functions:**
   - audit_log table
   - delete_user_data()
   - export_user_data()

### This Week

5. **Extract YouTube video transcripts** from Royal High School videos:
   - https://www.youtube.com/watch?v=xf8LuZmVNBs
   - https://www.youtube.com/watch?v=-HSueJD6FQU
   - https://www.youtube.com/watch?v=R6LYeCOmBnc

6. **Save CLAUDE_CONTEXT.md to project folder** for future session continuity

### Before Funding Application (by June)

7. Build subject/pathway database using curricular area taxonomy
8. Implement Academy → National progression mapping
9. Create "What to Expect" timeline feature
10. Secure at least one pilot school partnership
11. Gather usage/satisfaction data for funding evidence

---

## Appendices

### Appendix A: Files Created This Session

| File | Location | Purpose |
|------|----------|---------|
| pathfinder-school-analysis.md | /mnt/user-data/outputs/ | Detailed analysis of Royal High School materials and TOOLS system |
| CLAUDE_CONTEXT.md | /mnt/user-data/outputs/ | Session continuity file for Claude Code |
| This document | /mnt/user-data/outputs/ | Comprehensive project knowledge |

### Appendix B: Key URLs

| Resource | URL |
|----------|-----|
| Supabase Dashboard | https://supabase.com/dashboard |
| TOOLS System | http://www.studentoptions.co/ |
| Edinburgh College SCP | https://www.edinburghcollege.ac.uk/courses/for-school-pupils |
| Royal High School Video 1 | https://www.youtube.com/watch?v=xf8LuZmVNBs |
| Royal High School Video 2 | https://www.youtube.com/watch?v=-HSueJD6FQU |
| Royal High School Video 3 | https://www.youtube.com/watch?v=R6LYeCOmBnc |

### Appendix C: Claude Code Quick Reference

```bash
# Navigate to project
cd C:\Users\marmu\pathfinder-scotland

# Link to Supabase (if needed)
npx supabase link --project-ref qexfszbhmducszupyzi

# Check schema differences
npx supabase db diff

# Mark migration as applied
npx supabase migration repair --status applied [migration_name]

# Push new migrations (careful!)
npx supabase db push

# Login to Supabase CLI
npx supabase login
```

### Appendix D: Browser Scam Popup Fix

If fake McAfee/security popups appear (from downsub.com misclick):

**Microsoft Edge:**
1. Settings → Cookies and site permissions → Notifications
2. Remove suspicious sites from "Allow" list
3. Clear cookies and cache (Ctrl+Shift+Delete)

**This is NOT a virus** - just malicious browser notifications. Bitdefender/Windows Defender confirming clean is correct.

---

*Document ends.*
