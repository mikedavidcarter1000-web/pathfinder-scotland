# Pathfinder Local Authority Portal -- Architecture and Data Model Specification

**Version:** 1.0
**Date:** 25 April 2026
**Status:** Design complete, approved for build
**Stack:** Next.js, Supabase, Vercel, Stripe, Resend
**Dependency:** Requires Pathfinder Schools Platform (school portal must be live with data flowing)

---

## 1. Product overview

### What this is

A cross-school analytics and reporting portal for Scottish local authority education teams. Aggregates data from all Pathfinder-connected schools within an LA area, providing real-time insight into subject choices, career exploration, pathway planning, equity metrics, and platform engagement.

### What this is not

This is not a replacement for Insight (Scottish Government's senior phase attainment benchmarking tool) or SEEMIS (school management information system). Pathfinder's LA portal covers the **journey** -- what students are choosing, exploring, and planning -- while Insight covers the **outcomes** -- what grades leavers achieved and where they went. The two are complementary.

### Market positioning

| Tool | What it covers | Data source | Update frequency |
|---|---|---|---|
| Insight | Senior phase attainment, leaver destinations, tariff scores, virtual comparators | SQA results + SDS destinations survey | Annual (post-results) |
| SEEMIS | Pupil records, attendance, timetabling, staffing | School admin input | Real-time but siloed per school |
| LGBF (Improvement Service) | Cross-service benchmarking (education is one of many) | National datasets | Annual |
| School Information Dashboard | Published school-level attainment | Insight data, public | Annual |
| **Pathfinder LA Portal** | **Subject choices, career exploration, pathway planning, equity engagement, curriculum breadth** | **Live platform data from schools** | **Real-time** |

### Value proposition

LAs currently have no real-time visibility into what subjects students are choosing until SEEMIS data is compiled months later, no visibility into career exploration patterns at all, and no standardised way to compare widening access engagement across schools. Pathfinder fills that gap with live data that supports NIF reporting, HGIOS4 evidence, elected member briefings, and strategic curriculum planning.

---

## 2. Roles and access model

### 2a. LA roles

Three roles, reflecting how Scottish LA education teams are structured.

| Role | Typical job title | Access scope | Key features |
|---|---|---|---|
| LA Admin | Education Director, Head of Education Services | All schools in LA + system config | Full dashboard, all reports, user management, export, API access, alert configuration |
| Quality Improvement Officer (QIO) | QIO, Senior Education Officer, Attainment Adviser | Assigned schools (configurable subset) | Dashboard filtered to assigned schools, reports, export, alerts for assigned schools |
| Data Analyst | Data Officer, Business Intelligence Analyst | All schools in LA (read-only) | Full dashboard (read-only), all reports, full export including raw data, API access |

### 2b. Access control rules

- LA staff see ONLY schools within their local authority area. Cross-LA data isolation enforced at RLS level
- LA staff NEVER see individual student records. All data is aggregated to cohort level (minimum cohort size of 5 to prevent identification)
- Sensitive flags (care-experienced, FSM, young carer) are visible only as aggregate percentages, never linked to individual students
- Where a cohort is fewer than 5 students, data is suppressed and shown as "fewer than 5" (consistent with Scottish Government statistical disclosure control)
- QIOs see only their assigned schools; LA Admins and Data Analysts see all schools
- School-level drill-down shows the same aggregate metrics, not individual student data
- LA staff cannot modify any school data -- read-only access to aggregated views
- All LA portal access is logged in the audit trail (who viewed what, when)

### 2c. Authentication and onboarding

1. LA registers via /authority/register (requires verification -- see 2d)
2. LA Admin creates account with official LA email domain (e.g. @edinburgh.gov.uk, @highland.gov.uk)
3. LA Admin invites QIOs and Data Analysts via email
4. Invited staff receive a join link, create accounts, and are assigned their role
5. LA Admin assigns schools to QIOs from the list of Pathfinder-connected schools in their area
6. All LA staff use standard Supabase auth (email + password, with option for SSO post-funding)

### 2d. LA verification

LAs are verified manually before access is granted. This prevents anyone from registering as "Highland Council" and seeing school data.

Verification process:
1. LA Admin submits registration with official email, LA name, and contact details
2. Pathfinder admin receives notification
3. Pathfinder admin verifies the email domain matches the LA and confirms the registrant's role (phone call or email to a known LA contact)
4. Pathfinder admin approves the LA entity, which activates the portal
5. Post-funding: replace manual verification with a shared secret / verification code issued directly to LA education directors

### 2e. School linkage

Schools are linked to LAs via the `local_authority` field already present on the `schools` table. When an LA is verified, all schools in their area that are on Pathfinder become visible in the LA portal. New schools joining Pathfinder in that LA area are automatically included.

Schools can opt out of LA visibility if they wish (independent schools, for example), controlled by a `visible_to_authority` boolean on the schools table.

---

## 3. Metrics dashboard

The dashboard is organised into six metric categories, mapped to the National Improvement Framework (NIF) priorities and HGIOS4 quality indicators.

### 3a. Subject choices and curriculum

| Metric | Description | Source | NIF priority | HGIOS4 QI |
|---|---|---|---|---|
| Subject uptake by year group | Count and % of students choosing each subject, per school and across LA | subject_choices table | Excellence through raising attainment | 3.3 |
| STEM uptake | % of students with at least one STEM subject, broken down by gender | subject_choices + student gender | Excellence through raising attainment | 3.3 |
| STEM gender balance | Male/female ratio in each STEM subject | subject_choices + student gender | Equity | 3.1 |
| Modern languages uptake | % of students continuing a modern language into senior phase | subject_choices | Excellence through raising attainment | 3.3 |
| Curriculum breadth index | Average number of distinct subject areas per student, per school | subject_choices | Excellence through raising attainment | 2.2 |
| Curriculum narrowing indicator | Number of subjects offered per school vs LA average and national benchmark | school subject offerings | Excellence through raising attainment | 2.2 |
| Subject availability heatmap | Which subjects are offered at which schools -- identifying gaps | school subjects_offered config | Excellence through raising attainment | 2.2 |
| N5-to-Higher progression by subject | % of students progressing from N5 to Higher in same subject | tracking_records | Excellence through raising attainment | 3.3 |
| Higher-to-Advanced Higher progression | % progressing to AH, by subject and school | tracking_records | Excellence through raising attainment | 3.3 |
| Foundation Apprenticeship uptake | Count and % of students undertaking FAs, by framework and school | subject_choices (FA flag) | Employability | 3.3 |

### 3b. Equity and widening access

| Metric | Description | Source | NIF priority | HGIOS4 QI |
|---|---|---|---|---|
| SIMD profile | Distribution of students across SIMD quintiles, per school and LA-wide | students.simd_decile | Equity | 3.1 |
| SIMD Q1 subject uptake | Subject choices of students in SIMD Q1 vs Q5, identifying aspiration gaps | subject_choices + simd_decile | Equity | 3.1 |
| SIMD Q1 career exploration | Career sectors explored by SIMD Q1 students vs Q5 | platform engagement logs | Equity | 3.1 |
| SIMD Q1 university page views | Are SIMD Q1 students viewing university pages at same rate as Q5? | platform engagement logs | Equity | 3.1 |
| Care-experienced student engagement | % of care-experienced students using platform, pathway plans created | student flags + engagement | Equity | 3.1 |
| ASN student engagement | Platform usage by students with ASN flags vs overall cohort | student flags + engagement | Inclusion | 3.1 |
| FSM-registered student metrics | Subject choice patterns and career exploration for FSM students | student flags + choices | Equity | 3.1 |
| EAL/ESOL student engagement | Platform usage and subject choices for EAL students | student flags + choices | Inclusion | 3.1 |
| Young carer engagement | Platform usage for students flagged as young carers | student flags + engagement | Inclusion | 3.1 |
| Widening access tool usage | Which schools' students are using the bursary finder, entitlements checker, WA info pages | platform engagement logs | Equity | 3.1 |
| Gender gap analysis | Subject choice differences by gender across all subjects, not just STEM | subject_choices + gender | Equity | 3.1 |

### 3c. Career exploration and destinations planning

| Metric | Description | Source | NIF priority | HGIOS4 QI |
|---|---|---|---|---|
| Career sectors explored | Which of the 18 career sectors students are exploring, by school | platform engagement logs | Employability | 3.3 |
| Career sector concentration | Are students clustering in a few sectors or exploring broadly? | platform engagement logs | Employability | 3.3 |
| University vs college vs apprenticeship interest | % of students exploring each pathway type | page views + saved courses | Employability | 3.3 |
| Pathway plans created | % of students who have created a pathway plan | pathway_plans table | Employability | 3.3 |
| Saved courses count | Average courses saved per student, by school | saved_courses table | Employability | 3.3 |
| Personal statement progress | % of students who have started/completed personal statement drafts | personal_statement_drafts | Employability | 3.3 |
| Results day tool usage | % of students using results day flow and clearing tools | platform engagement logs | Employability | 3.3 |
| DYW engagement | Employer engagement events, work experience placements logged | dyw_engagements table | Employability | 3.3 |
| College articulation interest | Students exploring HNC/HND-to-degree routes | page views on articulation content | Employability | 3.3 |

### 3d. Platform engagement

| Metric | Description | Source |
|---|---|---|
| Active students | Students who logged in within last 7/30/90 days, by school | auth.users + last_sign_in |
| Activation rate | % of registered students who completed onboarding | students.onboarding_completed |
| Feature adoption | Which platform features are being used (search, compare, grade tool, bursary finder) | platform engagement logs |
| Student retention | % of students returning month-on-month | session data |
| Teacher adoption | % of staff accounts active in school portal, by role | school_staff + last_active |
| Parent account activation | % of linked parents who have logged in | parent accounts |
| Time on platform | Average session duration per student (aggregate) | session data |

### 3e. School-level comparison

| Metric | Description | Source |
|---|---|---|
| School scorecard | Summary card per school: student count, activation %, top subjects, SIMD profile, engagement score | Composite |
| School ranking by engagement | Schools ranked by student activation and feature usage | Composite |
| School ranking by equity gap | Schools ranked by size of SIMD Q1-Q5 aspiration gap | Derived |
| Curriculum breadth comparison | Schools compared on number of subjects offered and uptake distribution | subject_choices + school config |
| Year-on-year trend by school | Any metric tracked over time at school level | All tables with timestamps |

### 3f. Home educated and non-mainstream

| Metric | Description | Source |
|---|---|---|
| Home educated students using platform | Count and % of home educated students registered in LA area | student type flag |
| Home educated pathway plans | Career sectors and pathways explored by home educated students | engagement logs |
| Non-mainstream learner engagement | Students flagged as part-time, flexible, or alternative provision | student type flags |

---

## 4. Benchmarking views

### 4a. Comparison dimensions

Every metric in section 3 can be viewed across four comparison levels:

| Level | Description | Data requirement |
|---|---|---|
| School vs school | Compare any two or more schools within the LA | Minimum 2 schools on platform |
| School vs LA average | Single school benchmarked against the LA-wide average | Minimum 3 schools for meaningful average |
| LA vs national | LA-wide metrics compared to all Pathfinder schools nationally | Requires opt-in from LAs to share anonymised aggregate data |
| Year-on-year | Any metric tracked over time (termly, annually) | Minimum 2 terms of data |

### 4b. SIMD comparisons

All metrics can be filtered and compared by SIMD quintile:
- Q1 (most deprived 20%) vs Q5 (least deprived 20%)
- Full quintile breakdown (Q1 through Q5)
- Decile-level granularity where cohort sizes permit (suppressed below 5)

### 4c. Demographic filters

Available filters on all views:
- Gender (male, female, other/prefer not to say)
- Year group (S1-S6)
- SIMD quintile or decile
- ASN (yes/no)
- Care-experienced (yes/no)
- FSM-registered (yes/no)
- EAL/ESOL (yes/no)
- Young carer (yes/no)
- Home educated (yes/no)
- School (single or multi-select)

### 4d. Virtual comparator concept

Borrowing from Insight's virtual comparator methodology: for any school, Pathfinder can generate a "virtual comparator" -- a composite of students from other schools with similar SIMD profiles, school size, and urban/rural classification. This allows fairer comparison than raw averages.

Implementation: weighted sampling from the national Pathfinder dataset where students match on SIMD decile distribution (+/- 5%), school roll size band, and urban/rural classification (6-fold Scottish Government classification).

---

## 5. Report templates

Pre-built report templates aligned to actual LA reporting requirements. Each report is available as interactive dashboard view, downloadable PDF, and exportable Excel workbook.

### 5a. Standard report templates

| Report | Audience | Frequency | Content |
|---|---|---|---|
| NIF Annual Return -- Pathfinder Supplement | Scottish Government / Education Scotland | Annual | Subject choice trends, equity metrics, career exploration patterns, curriculum breadth analysis. Structured to map directly to NIF priority headings |
| Elected Member Briefing | Council education committee | Termly or on request | Executive summary: headline metrics, equity gap trends, school comparison highlights, notable achievements. Max 4 pages |
| Education Scotland Visit Preparation | QIOs preparing for ES engagement visits | As needed | School-by-school breakdown of HGIOS4-mapped metrics, evidence of improvement, areas for development |
| PEF Impact Summary | Council, Scottish Government | Annual | Correlation between PEF spend categories and Pathfinder engagement/choice patterns for FSM-registered students |
| Attainment Gap Analysis | Education leadership, council | Termly | SIMD Q1 vs Q5 comparison across all metrics: subject choices, career exploration, pathway planning, feature usage |
| Curriculum Review | Education leadership | Annual or as needed | Subject availability across schools, uptake trends, curriculum narrowing indicators, Foundation Apprenticeship coverage |
| STEM Gender Report | Education leadership, SFC | Annual | Gender breakdown in STEM subjects across all schools, trend over time, comparison to national benchmarks |
| DYW Summary | DYW regional group, council | Termly | Employer engagement, work experience placements, career exploration patterns, apprenticeship interest |
| School Improvement Plan Evidence Pack | QIOs, head teachers | Annual | Per-school metrics mapped to SIP priorities, with trend data and benchmarking |
| Widening Access Report | Education leadership, universities | Annual | Engagement of SIMD Q1-Q2 students with university content, bursary tool usage, WA page views, comparison across schools |
| Care-Experienced Learners Report | Corporate parenting board | Annual | Anonymised aggregate data on care-experienced student engagement, subject choices, pathway planning. Minimum cohort size enforced |
| Home Educated Learners Overview | LA home education team | Annual | Count and engagement metrics for home educated students using the platform in the LA area |
| End-of-Year Summary | Education Director | Annual | Comprehensive overview of all metrics, year-on-year trends, school comparisons, strategic recommendations |

### 5b. Custom report builder

In addition to templates, LA Data Analysts can build custom reports by:
1. Selecting metrics from the full catalogue (section 3)
2. Choosing comparison dimensions (section 4)
3. Applying demographic filters
4. Setting date ranges
5. Adding narrative sections (free text)
6. Saving as a named template for reuse

Custom reports export to the same formats as standard templates (PDF, Excel).

---

## 6. Data export

### 6a. Export formats

| Format | Use case | Available to |
|---|---|---|
| CSV | Raw data for import into LA BI tools (Excel, Power BI, Tableau) | Data Analyst, LA Admin |
| Excel (.xlsx) | Formatted workbooks with multiple tabs, charts, and summary sheets | All roles |
| PDF | Formatted reports for distribution to elected members, committees | All roles |
| JSON | API responses for programmatic access | Data Analyst, LA Admin |

### 6b. Export scope and filters

All exports respect the same data rules:
- No individual student data -- always aggregated to cohort level
- Cohorts below 5 are suppressed
- Sensitive flags only as aggregate percentages
- Exports are logged in the audit trail (who exported what, when, which filters)

Configurable export filters:
- Date range (academic year, term, custom)
- Schools (all, selected, single)
- Year groups
- Demographic filters (SIMD, gender, ASN, care-experienced, FSM, EAL, young carer)
- Metrics (select which metrics to include)

### 6c. Raw data export

For LA data teams who want to work with the underlying numbers in their own BI tools:

- Aggregated student counts by school, year group, and demographic group
- Subject choice counts by school, subject, year group, and demographic group
- Career exploration event counts by school, sector, and demographic group
- Platform engagement metrics by school and time period
- All exported as flat CSV tables with consistent column naming

Column naming convention: `school_seed_code`, `school_name`, `academic_year`, `term`, `year_group`, `metric_name`, `metric_value`, `cohort_size`, `simd_quintile`, `gender`, etc.

### 6d. API access

RESTful API for LA data teams to pull data programmatically:

- Authentication via API key (issued per LA, rotatable)
- Rate-limited (100 requests per hour)
- Same aggregation and suppression rules as UI exports
- Endpoints mirror the metric categories in section 3
- Response format: JSON
- Documentation auto-generated from OpenAPI spec

Base URL: `https://pathfinderscot.co.uk/api/v1/authority/`

Key endpoints:
- `GET /metrics/subject-choices?school=all&year_group=S4&academic_year=2026-27`
- `GET /metrics/equity?metric=simd_q1_stem_uptake&school=all`
- `GET /metrics/engagement?school={seed_code}&period=last_30_days`
- `GET /reports/{template_id}?format=json`
- `GET /schools` (list all schools in the LA with summary stats)

### 6e. Scheduled exports

LAs can schedule recurring exports:
- Daily, weekly, monthly, or termly
- Delivered via email (as attachment) or stored in a secure download area
- Configurable content (which metrics, which schools, which filters)
- Format: CSV or Excel

---

## 7. Alerts and notifications

### 7a. Alert types

| Alert | Trigger | Default threshold | Configurable? |
|---|---|---|---|
| Engagement drop | School's active student rate falls below threshold | Below 50% of registered students active in 30 days | Yes -- threshold, time period, schools |
| Equity gap widening | SIMD Q1-Q5 gap on any metric increases by more than X percentage points term-on-term | 10 percentage points | Yes -- threshold, metrics, schools |
| Curriculum narrowing | School drops a subject or total subjects offered falls below threshold | Below 20 subjects at N5+ level | Yes -- threshold, schools |
| Low activation | School has registered students but fewer than X% have completed onboarding | Below 60% activation after 4 weeks | Yes -- threshold, time period |
| New school joined | A school in the LA area registers on Pathfinder | N/A | On/off |
| STEM gender imbalance | Gender ratio in any STEM subject exceeds threshold | Below 30% of either gender | Yes -- threshold, subjects |
| Low career exploration | Students in a school exploring fewer than X career sectors on average | Fewer than 3 sectors per student | Yes -- threshold, schools |
| Report ready | Scheduled report has been generated and is ready for download | N/A | On/off |

### 7b. Notification channels

- Email (individual or digest)
- In-platform notification centre (bell icon)
- Weekly or monthly digest email summarising all triggered alerts

### 7c. Alert configuration

LA Admins can:
- Enable/disable each alert type
- Set custom thresholds for each alert
- Choose which schools trigger which alerts (e.g., QIO only gets alerts for assigned schools)
- Choose notification frequency (immediate, daily digest, weekly digest)
- Set quiet periods (e.g., suppress alerts during school holidays)
- Assign alert recipients (which LA staff get which alerts)

---

## 8. Data model

### 8a. New tables

```sql
-- Local authority entity
CREATE TABLE local_authorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID REFERENCES territories(id) NOT NULL,
  name TEXT NOT NULL UNIQUE, -- 'City of Edinburgh', 'Highland', 'Glasgow City'
  code TEXT NOT NULL UNIQUE, -- Scottish Government LA code: '235', '275', '220'
  slug TEXT NOT NULL UNIQUE, -- 'edinburgh', 'highland', 'glasgow'

  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by TEXT, -- Pathfinder admin who verified

  -- Subscription
  subscription_tier TEXT DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'standard', 'premium')),
  subscription_status TEXT DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'expired', 'cancelled')),
  trial_started_at TIMESTAMPTZ,
  trial_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,

  -- Contact
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_role TEXT,

  -- Configuration
  alert_config JSONB DEFAULT '{}',
  report_schedule JSONB DEFAULT '{}',
  api_key_hash TEXT, -- hashed API key for programmatic access

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- LA staff accounts
CREATE TABLE authority_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  authority_id UUID REFERENCES local_authorities(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,

  role TEXT NOT NULL CHECK (role IN ('la_admin', 'qio', 'data_analyst')),

  -- QIO school assignments (null for la_admin and data_analyst who see all)
  assigned_school_ids JSONB, -- array of school UUIDs

  -- Permissions
  can_export_data BOOLEAN DEFAULT true,
  can_manage_staff BOOLEAN DEFAULT false, -- only la_admin
  can_configure_alerts BOOLEAN DEFAULT false, -- only la_admin
  can_access_api BOOLEAN DEFAULT false, -- la_admin and data_analyst
  can_build_custom_reports BOOLEAN DEFAULT false, -- la_admin and data_analyst

  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, authority_id)
);

-- Audit log for LA portal access
CREATE TABLE authority_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authority_id UUID REFERENCES local_authorities(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES authority_staff(id),
  action TEXT NOT NULL, -- 'view_dashboard', 'export_csv', 'export_pdf', 'view_report', 'api_request'
  resource TEXT, -- 'subject_choices', 'equity_metrics', 'school_scorecard'
  filters_applied JSONB, -- what filters were active
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Saved custom reports
CREATE TABLE authority_saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authority_id UUID REFERENCES local_authorities(id) ON DELETE CASCADE,
  created_by UUID REFERENCES authority_staff(id),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL, -- metrics selected, filters, comparison dimensions, date range
  schedule TEXT, -- 'none', 'weekly', 'monthly', 'termly'
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Alert instances (triggered alerts)
CREATE TABLE authority_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authority_id UUID REFERENCES local_authorities(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- matches alert types in section 7a
  school_id UUID REFERENCES schools(id),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  detail JSONB, -- metric values, thresholds, context
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES authority_staff(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Platform engagement log (aggregation source for LA metrics)
-- This table captures anonymised engagement events for aggregation
CREATE TABLE platform_engagement_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id),
  event_type TEXT NOT NULL, -- 'page_view', 'feature_use', 'career_explore', 'course_save', 'tool_use'
  event_category TEXT, -- 'career_sector', 'university', 'college', 'tool', 'support'
  event_detail TEXT, -- sector name, university slug, tool name
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Materialised views for performance (refreshed periodically)
-- These pre-aggregate data so LA dashboard queries are fast

CREATE MATERIALIZED VIEW mv_authority_subject_choices AS
SELECT
  s.local_authority,
  s.id AS school_id,
  s.name AS school_name,
  sc.academic_year,
  sc.year_group,
  sc.subject_id,
  sub.name AS subject_name,
  sub.category AS subject_category,
  st.gender,
  CASE
    WHEN st.simd_decile BETWEEN 1 AND 2 THEN 'Q1'
    WHEN st.simd_decile BETWEEN 3 AND 4 THEN 'Q2'
    WHEN st.simd_decile BETWEEN 5 AND 6 THEN 'Q3'
    WHEN st.simd_decile BETWEEN 7 AND 8 THEN 'Q4'
    WHEN st.simd_decile BETWEEN 9 AND 10 THEN 'Q5'
  END AS simd_quintile,
  st.is_care_experienced,
  st.has_asn,
  st.is_fsm_registered,
  st.is_eal,
  st.is_young_carer,
  st.is_home_educated,
  COUNT(*) AS student_count
FROM subject_choices sc
  JOIN schools s ON sc.school_id = s.id
  JOIN subjects sub ON sc.subject_id = sub.id
  JOIN students st ON sc.student_id = st.id
GROUP BY
  s.local_authority, s.id, s.name,
  sc.academic_year, sc.year_group,
  sc.subject_id, sub.name, sub.category,
  st.gender, simd_quintile,
  st.is_care_experienced, st.has_asn, st.is_fsm_registered,
  st.is_eal, st.is_young_carer, st.is_home_educated;

CREATE MATERIALIZED VIEW mv_authority_engagement AS
SELECT
  s.local_authority,
  s.id AS school_id,
  pel.event_type,
  pel.event_category,
  pel.event_detail,
  st.gender,
  CASE
    WHEN st.simd_decile BETWEEN 1 AND 2 THEN 'Q1'
    WHEN st.simd_decile BETWEEN 3 AND 4 THEN 'Q2'
    WHEN st.simd_decile BETWEEN 5 AND 6 THEN 'Q3'
    WHEN st.simd_decile BETWEEN 7 AND 8 THEN 'Q4'
    WHEN st.simd_decile BETWEEN 9 AND 10 THEN 'Q5'
  END AS simd_quintile,
  DATE_TRUNC('week', pel.created_at) AS week,
  COUNT(*) AS event_count,
  COUNT(DISTINCT pel.student_id) AS unique_students
FROM platform_engagement_log pel
  JOIN students st ON pel.student_id = st.id
  JOIN schools s ON pel.school_id = s.id
GROUP BY
  s.local_authority, s.id,
  pel.event_type, pel.event_category, pel.event_detail,
  st.gender, simd_quintile, week;
```

### 8b. Schema modifications to existing tables

```sql
-- Add to schools table
ALTER TABLE schools ADD COLUMN visible_to_authority BOOLEAN DEFAULT true;
-- Independent schools may opt out

-- Add demographic flags to students table (some may already exist)
ALTER TABLE students ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_care_experienced BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS has_asn BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_fsm_registered BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_eal BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_young_carer BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_home_educated BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS student_type TEXT DEFAULT 'mainstream'
  CHECK (student_type IN ('mainstream', 'home_educated', 'part_time', 'flexible', 'alternative_provision'));
```

### 8c. Row-level security

```sql
-- LA staff can only see aggregated data for schools in their authority
CREATE POLICY authority_staff_view_schools ON schools
  FOR SELECT
  USING (
    local_authority = (
      SELECT la.name FROM local_authorities la
      JOIN authority_staff ast ON ast.authority_id = la.id
      WHERE ast.user_id = auth.uid()
    )
    AND visible_to_authority = true
  );

-- QIOs can only see their assigned schools
CREATE POLICY qio_assigned_schools ON schools
  FOR SELECT
  USING (
    id = ANY(
      SELECT unnest(assigned_school_ids::uuid[])
      FROM authority_staff
      WHERE user_id = auth.uid() AND role = 'qio'
    )
    OR EXISTS (
      SELECT 1 FROM authority_staff
      WHERE user_id = auth.uid() AND role IN ('la_admin', 'data_analyst')
    )
  );

-- LA staff NEVER access individual student records directly
-- All student data accessed via materialised views which enforce aggregation
-- No RLS policy grants LA staff SELECT on the students table

-- Audit log: LA staff can only see their own authority's log
CREATE POLICY authority_audit_own ON authority_audit_log
  FOR ALL
  USING (
    authority_id = (
      SELECT authority_id FROM authority_staff WHERE user_id = auth.uid()
    )
  );
```

### 8d. Materialised view refresh

Materialised views refresh on a schedule:
- `mv_authority_subject_choices`: daily at 02:00 UTC
- `mv_authority_engagement`: every 6 hours
- Triggered manually by Pathfinder admin if needed
- Refresh managed via Supabase pg_cron extension

---

## 9. Routes and UI structure

### 9a. Route tree

| Route | Page | Auth | Role |
|---|---|---|---|
| /authority/register | LA registration form | Public | -- |
| /authority/join | Staff onboarding (from invite link) | Public with invite code | -- |
| /authority/dashboard | Main dashboard with metric categories | Auth | All LA roles |
| /authority/dashboard/subjects | Subject choices and curriculum metrics | Auth | All LA roles |
| /authority/dashboard/equity | Equity and widening access metrics | Auth | All LA roles |
| /authority/dashboard/careers | Career exploration and destinations | Auth | All LA roles |
| /authority/dashboard/engagement | Platform engagement metrics | Auth | All LA roles |
| /authority/schools | School list with scorecard summaries | Auth | All LA roles |
| /authority/schools/[seedCode] | Single school drill-down (aggregate metrics) | Auth | All LA roles (QIO: assigned only) |
| /authority/schools/compare | Multi-school comparison builder | Auth | All LA roles |
| /authority/reports | Report template library | Auth | All LA roles |
| /authority/reports/[reportId] | View/download generated report | Auth | All LA roles |
| /authority/reports/builder | Custom report builder | Auth | LA Admin, Data Analyst |
| /authority/exports | Export history and scheduled exports | Auth | All LA roles |
| /authority/exports/new | Configure new export | Auth | All LA roles |
| /authority/alerts | Alert centre (all triggered alerts) | Auth | All LA roles |
| /authority/alerts/settings | Alert configuration | Auth | LA Admin |
| /authority/settings | LA settings, staff management | Auth | LA Admin |
| /authority/settings/staff | Invite/manage staff, assign QIO schools | Auth | LA Admin |
| /authority/settings/api | API key management | Auth | LA Admin |
| /authority/audit | Access audit log | Auth | LA Admin |
| /for-authorities | Public landing page (pricing, features, demo request) | Public | -- |

### 9b. Dashboard layout

The main dashboard (/authority/dashboard) uses a tab-based layout:

**Header:** LA name, last data refresh timestamp, total schools connected, total students

**Tabs:**
1. **Overview** -- headline metrics cards (total students, active %, SIMD distribution, top subjects, equity gap headline), trend sparklines, school scorecard grid
2. **Subjects** -- subject uptake charts, curriculum breadth, STEM gender, progression rates, subject availability heatmap
3. **Equity** -- SIMD gap analysis, care-experienced metrics, ASN engagement, FSM patterns, widening access tool usage
4. **Careers** -- career sector exploration, university/college/apprenticeship interest split, pathway plans, DYW engagement
5. **Engagement** -- activation rates, feature adoption, retention, teacher/parent adoption
6. **Benchmarking** -- comparison builder with school-vs-school, school-vs-LA, year-on-year

Each tab has:
- Filter bar (schools, year groups, demographics, date range)
- Primary chart area (interactive, hover for detail)
- Data table below chart (sortable, exportable)
- "Export this view" button (CSV, Excel, PDF)

---

## 10. Pricing and commercial model

### 10a. Pricing structure: base fee + per-school with volume discount

Flat-rate pricing does not work across Scotland's 32 LAs because school counts range from 3 (Orkney, Clackmannanshire) to 30 (Glasgow). A flat rate either overcharges small LAs or massively undercharges large ones. The pricing model uses a base platform fee plus a per-school component with volume tiers.

| Component | Rate |
|---|---|
| Base platform fee (analytics layer, reports, alerts, staff accounts) | GBP 5,000/year |
| Per school, schools 1-10 | GBP 1,500/school/year |
| Per school, schools 11-20 | GBP 1,250/school/year |
| Per school, schools 21+ | GBP 1,000/school/year |

### 10b. Pricing examples across LA sizes

| Local authority | Secondary schools | Calculation | Annual total | vs individual school subscriptions (Premium GBP 2,500 each) | Saving |
|---|---|---|---|---|---|
| Orkney | 3 | 5,000 + (3 x 1,500) | GBP 9,500 | GBP 7,500 | +GBP 2,000 for analytics layer |
| Clackmannanshire | 3 | 5,000 + (3 x 1,500) | GBP 9,500 | GBP 7,500 | +GBP 2,000 for analytics layer |
| Inverclyde | 6 | 5,000 + (6 x 1,500) | GBP 14,000 | GBP 15,000 | GBP 1,000 saving + analytics |
| Moray | 9 | 5,000 + (9 x 1,500) | GBP 18,500 | GBP 22,500 | GBP 4,000 saving |
| Perth and Kinross | 13 | 5,000 + (10 x 1,500) + (3 x 1,250) | GBP 23,750 | GBP 32,500 | GBP 8,750 saving |
| Fife | 20 | 5,000 + (10 x 1,500) + (10 x 1,250) | GBP 32,500 | GBP 50,000 | GBP 17,500 saving |
| Edinburgh | 23 | 5,000 + (10 x 1,500) + (10 x 1,250) + (3 x 1,000) | GBP 35,500 | GBP 57,500 | GBP 22,000 saving |
| Highland | 29 | 5,000 + (10 x 1,500) + (10 x 1,250) + (9 x 1,000) | GBP 41,500 | GBP 72,500 | GBP 31,000 saving |
| Glasgow | 30 | 5,000 + (10 x 1,500) + (10 x 1,250) + (10 x 1,000) | GBP 42,500 | GBP 75,000 | GBP 32,500 saving |

### 10c. Why this works

- **Small LAs** (Orkney, Clackmannanshire, Na h-Eileanan Siar) pay a modest premium (GBP 2,000) over individual school subscriptions for the analytics layer. That is less than the cost of a few hours of analyst time spent manually compiling cross-school data -- easily justifiable.
- **Medium LAs** (Moray, Perth and Kinross) start to see genuine savings (GBP 4,000-8,000) that make the LA-level purchase the obvious choice.
- **Large LAs** (Edinburgh, Glasgow, Highland) save 40-57% compared to individual school purchases. The LA-level sale becomes the clearly superior option and the primary sales lever.
- **No cliff edges** -- pricing scales linearly within each band with smooth transitions between tiers.
- **Volume discount** rewards larger authorities without giving the product away.

### 10d. Bundled school subscriptions

LA purchase includes Standard school tier (GBP 1,500/year value) for all schools in the authority area:

- All schools in the LA get Standard school portal access at no additional per-school cost
- Schools wanting Premium features (DYW dashboard, SEEMIS import, curriculum rationale generator, parent evening booking) can upgrade for GBP 1,000/year -- the difference between Standard (GBP 1,500) and Premium (GBP 2,500)
- The sales pitch to LAs: "Your schools get GBP 1,500/year value each included, plus you get the analytics layer on top"
- For Glasgow (30 schools): GBP 42,500 for everything vs GBP 75,000 buying school subscriptions individually -- a saving of GBP 32,500

### 10e. Pilot programme

| Tier | Requirements | Terms |
|---|---|---|
| Founding LAs (first 3) | Must have at least 3 schools on Pathfinder | Free for 12 months, then standard pricing. Full dashboard, all reports, exports, alerts, up to 5 staff accounts |

Founding LA programme runs in parallel with founding school programme. Strategy: seed 3-5 schools in a target LA via the founding school programme, then approach the LA with live data already flowing.

### 10f. Pricing rationale

- LAs currently spend on: Insight (free from Scottish Government), SEEMIS (per-school licence), various ad hoc data analysis contracts, and manual Excel work by QIOs and data officers
- Pathfinder LA portal replaces manual cross-school data compilation, which currently consumes significant QIO and analyst time
- For medium-to-large LAs, the annual cost sits well below the cost of a part-time data analyst (GBP 25,000-30,000/year) while providing always-on, real-time analytics
- For small LAs, the GBP 2,000 premium over individual school subscriptions is trivial against the value of having a unified cross-school view

### 10g. Total addressable market

- 32 LAs in Scotland, approximately 355 state secondary schools
- Average ~11 schools per LA, average annual fee ~GBP 22,000
- If all 32 LAs signed up: approximately GBP 700,000/year
- Realistic near-term (years 1-2): 5-8 LAs = GBP 110,000-175,000/year
- Combined with school-level subscriptions for schools not covered by LA purchases, total platform revenue potential exceeds GBP 1 million/year

### 10h. Commercial dependencies

- LA portal only has value when schools in the area are on Pathfinder and generating data
- Minimum viable: 3 schools in an LA area for meaningful cross-school comparison
- Primary sales strategy: sign schools first via founding school programme, then approach LA once there is live data flowing
- Alternative strategy: LA purchases on behalf of all schools (LA tier includes Standard school subscriptions, incentivising top-down adoption)
- Founding school programme (10 free schools nationally) seeds the data that makes the LA portal viable

---

## 11. Data privacy and compliance

### 11a. Legal basis

- LA access to aggregated school data is justified under GDPR Article 6(1)(e): processing necessary for the performance of a task carried out in the public interest (LAs have a statutory duty to secure adequate and efficient education under the Education (Scotland) Act 1980)
- No individual student data is ever exposed to LA staff
- Statistical disclosure control (minimum cohort size of 5) prevents re-identification
- Schools can opt out via `visible_to_authority` flag
- Student privacy notice must be updated to inform students that anonymised, aggregated data may be shared with their local authority for education improvement purposes

### 11b. Data processing agreement

Each LA signs a data processing agreement covering:
- Purpose limitation (education improvement and strategic planning only)
- Data minimisation (aggregate data only, no individual records)
- Retention (aggregate reports retained for 7 years for trend analysis)
- Security measures (encryption in transit and at rest, access logging)
- Breach notification (within 72 hours per GDPR Article 33)
- Sub-processor disclosure (Supabase, Vercel)

### 11c. Audit trail

All LA portal access is logged:
- Who accessed what (staff ID, resource, filters applied)
- When (timestamp)
- From where (IP address)
- What was exported (export format, scope, filters)
- Logs retained for 2 years
- Accessible to LA Admin and Pathfinder admin

---

## 12. Data quality and completeness

### 12a. The problem

The LA dashboard is only as good as the data feeding it. If schools have not imported demographic flags via SEEMIS CSV, the equity tab shows nothing -- and an LA drawing conclusions from incomplete data is worse than having no data at all.

### 12b. Data completeness indicators

Every metric on the LA dashboard displays a data completeness badge:

| Badge | Meaning | Display |
|---|---|---|
| Complete (95%+) | Metric based on near-complete data | Green tick |
| Partial (50-94%) | Some schools or students missing data for this metric | Amber warning with "X of Y schools reporting" |
| Low (<50%) | Insufficient data for reliable conclusions | Red warning with "Data incomplete -- interpret with caution" |

Completeness is calculated per metric, per school:
- **Gender:** % of students with gender recorded
- **SIMD:** % of students with valid postcode / SIMD decile (should be near 100% from onboarding)
- **Care-experienced / FSM / ASN / EAL / young carer:** % of students with these flags populated (requires SEEMIS import or manual guidance teacher input)
- **Subject choices:** % of students who have submitted choices (seasonal -- relevant during choice windows)

### 12c. School-level data quality score

The school scorecard (section 9b, Overview tab) includes a data quality score per school:

| Score | Criteria |
|---|---|
| 5/5 | All demographic flags populated, subject choices complete, engagement logging active |
| 4/5 | Gender and SIMD complete, most flags populated, minor gaps |
| 3/5 | SIMD complete, some demographic flags missing |
| 2/5 | Basic registration only, no demographic import |
| 1/5 | School registered but minimal student activity |

This lets LA staff see at a glance which schools need support with data import rather than silently presenting incomplete data as authoritative.

### 12d. Data population routes

Demographic flags reach the students table via three routes:

| Route | Flags populated | Reliability | Dependency |
|---|---|---|---|
| SEEMIS CSV import (school portal Schools-8 session) | FSM, ASN, care-experienced, EAL, ethnicity, gender | High -- official records | School must run the import |
| Guidance teacher manual entry (school portal guidance hub) | Care-experienced, young carer, home educated, student type | Medium -- relies on guidance knowledge | Guidance teacher must flag individual students |
| Student self-declaration (onboarding) | Gender, home educated status | Medium -- voluntary disclosure | Student must choose to declare |

The architecture does not rely on any single route. The data quality indicators show what has been populated regardless of source, and the LA dashboard adapts its display accordingly.

### 12e. Nudge system

When a school's data quality score is below 3/5, the school portal displays a nudge to the school admin and head teacher:
- "Your school's demographic data is incomplete. Import your latest SEEMIS export to unlock equity analytics for your LA."
- Links directly to the SEEMIS import page
- Suppressed after dismissal for 30 days

---

## 13. Academic year handling

### 13a. Academic year definition

The Scottish academic year runs from August to June. The system defines academic years as:

| Field | Value | Example |
|---|---|---|
| academic_year | Text, format "YYYY-YY" | "2026-27" |
| year_start | 1 August of the start year | 2026-08-01 |
| year_end | 31 July of the end year | 2027-07-31 |

### 13b. Term structure

Scottish term dates vary by local authority but follow a common pattern:

| Term | Approximate dates | Label |
|---|---|---|
| Term 1 | August - October | Autumn |
| Term 2 | October - December | Winter |
| Term 3 | January - March | Spring |
| Term 4 | April - June | Summer |

Exact term dates are configured per LA in the `local_authorities` table:

```sql
ALTER TABLE local_authorities ADD COLUMN term_dates JSONB DEFAULT '{}';
-- Example: {"2026-27": {"term_1": {"start": "2026-08-19", "end": "2026-10-11"}, ...}}
```

### 13c. Current year detection

The system automatically detects the current academic year based on today's date:
- 1 August to 31 July = that academic year
- All dashboard views default to the current academic year
- Historical years are selectable via filter dropdown
- Year-on-year comparison views show the current year alongside previous years

### 13d. Data retention

- All student data retained for the duration of the student's time on the platform
- Aggregated metrics retained indefinitely for trend analysis
- After a student leaves (detected via school leaver flag or inactivity threshold of 12 months post-S6), individual records are anonymised but aggregate contributions are preserved
- LA dashboard retains year-on-year trend data for a minimum of 7 academic years

---

## 14. National tier and Scottish Government data partnership

### 14a. Strategic context

The Scottish Government currently has no real-time national visibility into:
- Subject choice patterns (compiled annually from SEEMIS with significant lag)
- Career exploration behaviour (no tool currently tracks this)
- Widening access engagement at subject-choice stage (Insight only covers post-results outcomes)
- Curriculum breadth trends across LAs (whether schools are narrowing their curriculum offer)
- Gender balance in STEM at the point of subject choice, not just at qualification stage

Pathfinder generates all of this data as a natural by-product of platform usage. This is a unique dataset that does not exist elsewhere in the Scottish education data landscape.

### 14b. National role

A fourth access tier above LA, for Scottish Government and national bodies.

| Role | Typical user | Access scope | Key features |
|---|---|---|---|
| National Admin | Scottish Government education data team | All LAs that have opted in to national data sharing | National dashboard, cross-LA comparison, national reports, API access |
| National Analyst | Education Scotland, SFC, Qualifications Scotland analysts | All opted-in LAs (read-only) | National dashboard, reports, exports |

### 14c. Opt-in model

National-level data sharing is strictly opt-in per LA:

- Each LA has a `share_national` boolean on the `local_authorities` table (default: false)
- When enabled, that LA's anonymised aggregate data is included in the national materialised views
- LAs can revoke at any time; their data is excluded from the next materialised view refresh
- Individual student data never reaches the national tier -- it is aggregated at LA level before inclusion
- Statistical disclosure control applies at the national level too (minimum cohort size of 5 per LA per metric)

```sql
ALTER TABLE local_authorities ADD COLUMN share_national BOOLEAN DEFAULT false;
ALTER TABLE local_authorities ADD COLUMN share_national_opted_at TIMESTAMPTZ;
```

### 14d. National dashboard metrics

The national dashboard shows the same metric categories as the LA dashboard (section 3) but aggregated across all opted-in LAs:

| Category | National view adds |
|---|---|
| Subject choices | Cross-LA comparison of subject uptake, national curriculum breadth index, LA-level STEM gender heatmap |
| Equity | National SIMD gap analysis, Challenge Authority vs non-Challenge comparison, national care-experienced engagement rate |
| Career exploration | National career sector popularity, regional variation in career interest, urban vs rural pathway preferences |
| Engagement | National platform adoption rate, LA-level activation comparison |
| Benchmarking | LA-vs-LA comparison, LA-vs-national, Challenge Authority cohort analysis |

### 14e. National reports

| Report | Audience | Content |
|---|---|---|
| National Subject Choice Trends | Scottish Government, Qualifications Scotland | Annual analysis of subject uptake patterns across all opted-in LAs, gender breakdown, SIMD analysis, year-on-year trends |
| Equity and Aspiration Gap Report | Scottish Government, Education Scotland | National picture of SIMD Q1 vs Q5 differences in subject choices, career exploration, and pathway planning |
| Curriculum Breadth Monitor | Education Scotland, Scottish Government | Which LAs and schools are narrowing curriculum, which subjects are declining nationally, Foundation Apprenticeship uptake |
| Career Exploration National Picture | SDS, DYW national | Which career sectors students are exploring nationally, regional variation, correlation with local labour market |
| Challenge Authority Supplement | Scottish Government (Attainment Scotland Fund) | Focused analysis of the 9 Challenge Authorities: engagement, equity metrics, comparison to non-Challenge authorities |
| STEM Gender Balance Report | SFC, Scottish Government | National gender breakdown in STEM subject choices, school-level and LA-level variation, trend over time |

### 14f. Data partnership strategy (not a product sale)

Phase 1 -- Demonstrate value (post-founding schools, pre-LA sales):
1. Generate a free national insights report once 20+ schools are generating data across 3+ LAs
2. Share with Education Scotland and the Insight team as a contribution to the national evidence base
3. Frame as "data that doesn't exist elsewhere" -- career exploration, subject choice timing, widening access engagement
4. No procurement required, no cost to government

Phase 2 -- Formal partnership (once 5+ LAs are subscribed):
1. Offer Education Scotland and Scottish Government interactive access to the national dashboard
2. Position as a complement to Insight: "Insight shows outcomes, Pathfinder shows the journey"
3. Target the Insight Professional Advisor directly -- they already support 30%+ of secondary schools and understand the data gaps

Phase 3 -- Funded integration:
1. Scottish Government funds Pathfinder subscriptions for all Challenge Authority schools as part of Attainment Scotland Fund delivery (9 LAs, approximately 120 schools)
2. National dashboard licence at GBP 50,000-75,000/year -- trivial against the ASF budget (GBP 750 million programme total)
3. Alternative: Scottish Government funds national platform access and LA portal access for all 32 LAs as a universal data infrastructure investment

### 14g. Revenue potential from national tier

| Scenario | Revenue | Timeline |
|---|---|---|
| Free national report (Phase 1) | GBP 0 (investment in visibility) | Year 1 |
| National dashboard licence (Phase 2) | GBP 50,000-75,000/year | Year 2 |
| Challenge Authority school funding (Phase 3) | GBP 120,000-180,000/year (120 schools at GBP 1,000-1,500) | Year 2-3 |
| Universal national infrastructure (Phase 3 stretch) | GBP 700,000+ (all 32 LAs funded centrally) | Year 3+ |

### 14h. Timing

- Not before the funding demo (July 2026)
- Write into the Entrepreneurial Education Fund application as a planned strategic partnership -- strengthens the systemic impact narrative
- First approach to Education Scotland / Insight team after founding schools have 1 term of data (December 2026 earliest)
- Scottish Parliament election is 7 May 2026 -- avoid any approach during the pre-election and post-election transition period. Earliest practical engagement: autumn 2026

### 14i. National data model additions

```sql
-- National staff accounts
CREATE TABLE national_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  organisation TEXT NOT NULL, -- 'Scottish Government', 'Education Scotland', 'SFC', 'Qualifications Scotland', 'SDS'

  role TEXT NOT NULL CHECK (role IN ('national_admin', 'national_analyst')),

  can_export_data BOOLEAN DEFAULT true,
  can_manage_staff BOOLEAN DEFAULT false, -- national_admin only
  can_access_api BOOLEAN DEFAULT false,

  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- National materialised views (aggregate of opted-in LAs)
CREATE MATERIALIZED VIEW mv_national_subject_choices AS
SELECT
  la.name AS local_authority_name,
  la.code AS local_authority_code,
  s.id AS school_id,
  s.name AS school_name,
  sc.academic_year,
  sc.year_group,
  sub.name AS subject_name,
  sub.category AS subject_category,
  st.gender,
  CASE
    WHEN st.simd_decile BETWEEN 1 AND 2 THEN 'Q1'
    WHEN st.simd_decile BETWEEN 3 AND 4 THEN 'Q2'
    WHEN st.simd_decile BETWEEN 5 AND 6 THEN 'Q3'
    WHEN st.simd_decile BETWEEN 7 AND 8 THEN 'Q4'
    WHEN st.simd_decile BETWEEN 9 AND 10 THEN 'Q5'
  END AS simd_quintile,
  st.is_care_experienced,
  st.has_asn,
  st.is_fsm_registered,
  COUNT(*) AS student_count
FROM subject_choices sc
  JOIN schools s ON sc.school_id = s.id
  JOIN local_authorities la ON s.local_authority = la.name
  JOIN subjects sub ON sc.subject_id = sub.id
  JOIN students st ON sc.student_id = st.id
WHERE la.share_national = true
  AND s.visible_to_authority = true
GROUP BY
  la.name, la.code, s.id, s.name,
  sc.academic_year, sc.year_group,
  sub.name, sub.category,
  st.gender, simd_quintile,
  st.is_care_experienced, st.has_asn, st.is_fsm_registered;

-- National audit log
CREATE TABLE national_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES national_staff(id),
  action TEXT NOT NULL,
  resource TEXT,
  filters_applied JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 14j. National routes

| Route | Page | Auth | Role |
|---|---|---|---|
| /national/dashboard | National metrics dashboard | Auth | National roles |
| /national/dashboard/subjects | National subject choice trends | Auth | National roles |
| /national/dashboard/equity | National equity and aspiration gap | Auth | National roles |
| /national/dashboard/careers | National career exploration patterns | Auth | National roles |
| /national/authorities | LA list with summary scorecards | Auth | National roles |
| /national/authorities/[code] | Single LA drill-down (aggregate) | Auth | National roles |
| /national/authorities/compare | Cross-LA comparison builder | Auth | National roles |
| /national/reports | National report templates | Auth | National roles |
| /national/reports/challenge-authorities | Challenge Authority focused view | Auth | National roles |
| /national/exports | National data exports | Auth | National roles |
| /national/settings | National staff management | Auth | National Admin |

---

## 15. Build plan

| Session | Scope | Model | Effort |
|---|---|---|---|
| Authority-1 | LA entity, registration, verification, staff accounts, join codes, RLS, /for-authorities landing page | Opus | High |
| Authority-2 | Student demographic flags (schema additions to students table), SEEMIS import demographic mapping, guidance teacher manual flagging UI, school opt-out toggle | Opus | High |
| Authority-3 | Platform engagement logging (add event capture to existing student-facing pages), engagement materialised views, pg_cron refresh scheduling | Opus | High |
| Authority-4 | Academic year configuration, term dates per LA, current year detection, historical data retention logic | Opus | Standard |
| Authority-5 | Dashboard shell, overview tab, school scorecard grid with data quality scores, filter system, data completeness indicators | Opus | High |
| Authority-6 | Subject choices tab, curriculum metrics, STEM gender analysis, subject availability heatmap, curriculum breadth index | Opus | High |
| Authority-7 | Equity tab, SIMD gap analysis, demographic breakdowns, widening access metrics, care-experienced and FSM analysis | Opus | High |
| Authority-8 | Career exploration tab, destinations planning metrics, DYW integration, career sector analysis | Opus | Standard |
| Authority-9 | Engagement tab, activation/retention metrics, teacher and parent adoption, feature adoption tracking | Opus | Standard |
| Authority-10 | Benchmarking tab, comparison builder, virtual comparator engine, year-on-year trend views | Opus | High |
| Authority-11 | Report templates (all 13 LA reports), PDF generation, custom report builder | Opus | High |
| Authority-12 | Data export (CSV, Excel, JSON), scheduled exports, API endpoints with OpenAPI spec | Opus | High |
| Authority-13 | Alerts system, notification centre, email digests, alert configuration UI, nudge system for low data quality schools | Opus | Standard |
| Authority-14 | Stripe integration for LA subscriptions, base + per-school pricing logic, bundled school tier logic, /authority/subscribe | Opus | Standard |
| Authority-15 | National tier: national_staff table, national RLS, opt-in toggle for LAs, national materialised views | Opus | High |
| Authority-16 | National dashboard: all tabs (subjects, equity, careers), LA scorecard grid, Challenge Authority view, cross-LA comparison | Opus | High |
| Authority-17 | National reports (6 report templates), national exports, national audit log, /national routes | Opus | Standard |
| Authority-18 | Audit log viewer (LA and national), privacy notice updates, data processing agreement templates, final performance optimisation | Opus | Standard |

Estimated total: 18 sessions, approximately 7-9 days of Claude Code work.

---

## 16. Architectural decisions

1. **Aggregation only, never individual data.** LA and national staff access materialised views, never the students table directly. RLS enforces this at the database level, not just the UI.
2. **Statistical disclosure control baked in.** Cohorts below 5 are suppressed in all views, exports, and API responses. This is enforced in the materialised views and API layer, not just client-side.
3. **Materialised views for performance.** Cross-school and cross-LA aggregation queries on live tables would be slow. Pre-aggregated materialised views refresh on schedule and serve dashboard queries in milliseconds.
4. **School opt-out respected.** The `visible_to_authority` flag on the schools table is checked in every RLS policy. Independent schools or any school that doesn't want LA visibility can opt out.
5. **LA verification is manual initially.** Automated verification (e.g., via official email domain validation) is a post-funding enhancement. Manual verification prevents impersonation.
6. **QIO school assignment is configurable.** LA Admins assign specific schools to QIOs, reflecting the real-world structure where each QIO covers a cluster of schools.
7. **API is a premium feature.** Raw API access enables LA data teams to integrate Pathfinder data into Power BI, Tableau, or their own dashboards.
8. **Alert thresholds are LA-configurable.** What counts as "concerning" varies by LA context. Highland's thresholds will differ from Edinburgh's. LAs set their own.
9. **National data sharing is opt-in per LA.** The `share_national` flag on the local_authorities table controls whether an LA's aggregated data appears in national views. Default is false. LAs can revoke at any time.
10. **Engagement logging is lightweight.** The platform_engagement_log captures event-level data but only the fields needed for aggregation. No session recordings, no click heatmaps, no tracking beyond what's needed for the metrics in section 3.
11. **Data quality indicators are mandatory.** Every metric on every dashboard (LA and national) shows a data completeness badge. No metric is ever presented without context on how complete the underlying data is.
12. **Three-tier data hierarchy enforced in RLS.** School staff see individual students (within their permission scope). LA staff see school-level aggregates. National staff see LA-level aggregates. Each tier has its own materialised views and RLS policies. No tier can access the tier below's raw data.
13. **Academic year is the primary time dimension.** All metrics are organised by Scottish academic year (August-July). Term-level granularity is available where term dates have been configured. Calendar date ranges are available as an alternative filter.
14. **Demographic data has multiple population routes.** SEEMIS CSV import, guidance teacher manual entry, and student self-declaration all feed the same flags. The system does not depend on any single route and shows data completeness regardless of source.
15. **Scottish Government engagement is a data partnership, not a product sale.** Phase 1 offers free national insights reports to demonstrate value. Paid national dashboard access follows only after the data has proved its worth. This avoids slow government procurement cycles and builds the relationship on demonstrated value.
