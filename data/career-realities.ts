// Honest working-conditions data for the 18 career sectors surfaced on Pathfinder.
// Student-friendly language, GBP currency, "around"/"typically" for approximate figures.
// Sources cited in SECURITY_REVIEW / research docs -- do not invent new figures here.

export type JobSecurity = 'high' | 'medium-high' | 'medium' | 'medium-low' | 'low'
export type Rating1To5 = 1 | 2 | 3 | 4 | 5

export interface CareerRealities {
  sectorSlug: string
  sectorName: string

  // Hours and patterns
  weeklyHoursContractual: string
  weeklyHoursReality: string
  workPattern: string
  remoteHybrid: string
  weekendEvening: string

  // Pay and benefits
  entrySalary: string
  seniorSalary: string
  pension: string
  sickPay: string
  maternityPaternity: string
  overtimePay: string
  notablePerks: string

  // Progression and security
  progressionSpeed: string
  jobSecurity: JobSecurity
  redundancyRisk: string
  cpdRequirements: string
  qualificationCosts: string
  noticePeriod: string

  // Lifestyle impact
  stressLevel: Rating1To5
  stressExplanation: string
  workLifeBalance: Rating1To5
  workLifeExplanation: string
  physicalDemands: string
  dressCode: string
  travelRequirements: string
  partTimeAvailability: string
  unionRepresentation: string
}

export const CAREER_REALITIES: CareerRealities[] = [
  {
    sectorSlug: 'healthcare-and-medicine',
    sectorName: 'Healthcare and Medicine',
    weeklyHoursContractual:
      'Around 37.5 hours/week for nurses and allied health professionals (Agenda for Change). Doctors have rota-based hours averaging up to 48 hours/week.',
    weeklyHoursReality:
      'Often longer in reality because of handovers, staffing gaps, and documentation. Junior doctors can regularly work close to the 48-hour limit.',
    workPattern:
      'Shift work including nights, weekends, and on-call. Nurses and junior doctors work rotating shifts. Consultants have more predictable patterns but still carry on-call duties.',
    remoteHybrid:
      'Mostly on-site -- clinical work can\u2019t be done from home. Some senior admin roles allow limited hybrid working.',
    weekendEvening:
      'Common and usually mandatory in hospitals. Compensated via unsocial hours payments and overtime (time-and-a-half for Bands 1-7; Bands 8-9 are not eligible for overtime).',
    entrySalary:
      'Band 5 nurse or allied health professional starts at around \u00a333,295 (2025-26). FY1 doctors start at around \u00a334,500.',
    seniorSalary: 'Consultant basic pay starts at around \u00a3111,430.',
    pension:
      'NHS Pension Scheme Scotland -- employer contributes around 22.5%. One of the best pensions in the country.',
    sickPay:
      'Enhanced -- up to 6 months full pay then 6 months half pay after 5 years\u2019 service.',
    maternityPaternity:
      'Enhanced -- typically 8 weeks full pay plus 18 weeks half pay for maternity (eligibility rules apply).',
    overtimePay:
      'Bands 1-7 paid time-and-a-half; double time on public holidays. Bands 8-9 are not eligible for overtime pay.',
    notablePerks:
      'Blue Light Card discounts, study leave, NHS staff discounts, cycle-to-work scheme.',
    progressionSpeed:
      'Nurse Band 5 to Band 6 typically 2-5 years. Doctor FY1 to consultant typically 10-15 years depending on specialty.',
    jobSecurity: 'high',
    redundancyRisk:
      'Low. Service redesign happens, but posts are generally secure because NHS demand is structural.',
    cpdRequirements:
      'Mandatory. NMC requires 35 hours every 3 years for nurses. GMC requires 5-yearly revalidation for doctors.',
    qualificationCosts:
      'NMC registration around \u00a3120/year. GMC annual fee around \u00a3481. HCPC renewal around \u00a3123/year for AHPs. Usually paid personally.',
    noticePeriod: 'Typically 4-8 weeks at entry, 8-12 weeks for senior roles.',
    stressLevel: 5,
    stressExplanation:
      'High-stakes decisions, fatigue, and emotional load -- especially for doctors. Nurses face heavy workloads and staffing shortages (around 4/5). AHPs typically sit around 3-4/5.',
    workLifeBalance: 2,
    workLifeExplanation:
      'Junior doctors often sit at 2/5, nurses around 3/5, AHPs 3-4/5. Shift work disrupts social life and sleep.',
    physicalDemands:
      'Mixed to physically demanding. Long periods standing, manual handling, and night-shift fatigue.',
    dressCode: 'Uniform or scrubs provided. PPE in clinical settings.',
    travelRequirements:
      'Mostly site-based. Community nurses travel for home visits. Doctors may rotate across hospitals.',
    partTimeAvailability:
      'Available but harder at junior levels. More realistic for experienced nurses and consultants.',
    unionRepresentation:
      'BMA for doctors (strong). RCN and UNISON for nurses (strong). Public sector union density around 50%.',
  },

  {
    sectorSlug: 'education-and-teaching',
    sectorName: 'Education and Teaching',
    weeklyHoursContractual:
      'Around 35 hours/week for teachers, with a maximum class-contact time of 22.5 hours/week.',
    weeklyHoursReality:
      'Planning, marking, and reporting regularly push hours past 35. Early-career teachers often work evenings and weekends to keep up.',
    workPattern:
      'Term-time working (around 39 weeks). Parents\u2019 evenings and school events add extra commitments throughout the year.',
    remoteHybrid:
      'Mostly on-site during term. "Remote" usually means unpaid prep at home rather than flexible working.',
    weekendEvening:
      'Parents\u2019 evenings, marking deadlines, and events are periodic but unavoidable. Usually not separately compensated.',
    entrySalary:
      'Probationer teacher starts at around \u00a335,022 from April 2026.',
    seniorSalary: 'Headteacher scale reaches around \u00a3119,649.',
    pension:
      'Scottish Teachers\u2019 Pension Scheme -- employer contributes around 26%. One of the strongest pensions available.',
    sickPay:
      'Enhanced -- up to 183 days full pay plus 182 days half pay after 5+ years\u2019 service.',
    maternityPaternity: 'Enhanced above the statutory minimum.',
    overtimePay:
      'Teaching has no formal overtime. Extra work (marking, planning) is effectively unpaid.',
    notablePerks:
      'School holidays (around 13 weeks of closures, though not all are fully discretionary), strong pension, and job stability.',
    progressionSpeed:
      'Probationer to fully registered teacher is 1 year. Principal teacher typically 5-10 years. Headteacher 10-15+ years.',
    jobSecurity: 'high',
    redundancyRisk:
      'Low, though subject shortages and school roll changes can affect individual posts.',
    cpdRequirements:
      'Maximum 35 hours per year. GTCS Professional Update is required.',
    qualificationCosts:
      'GTCS registration fee around \u00a365-83/year (confirm current rate). Usually paid personally.',
    noticePeriod: 'Often tied to school terms, typically 2-3 months.',
    stressLevel: 4,
    stressExplanation:
      'Classroom behaviour, safeguarding responsibilities, and workload peaks. Leadership roles sit around 4-5/5.',
    workLifeBalance: 2,
    workLifeExplanation:
      '2-3/5 during term (intense), but school holidays provide recovery time. Leadership roles often sit at 2/5.',
    physicalDemands: 'Active -- standing, moving around classrooms, voice strain.',
    dressCode: 'Smart or professional. No uniform.',
    travelRequirements: 'Usually school-based. Occasional local authority meetings.',
    partTimeAvailability: 'Available and common after probation. Job shares exist.',
    unionRepresentation:
      'EIS is the main union in Scotland (strong). Also NASUWT and SSTA. High coverage.',
  },

  {
    sectorSlug: 'engineering-and-manufacturing',
    sectorName: 'Engineering and Manufacturing',
    weeklyHoursContractual: 'Typically 37-39 hours/week.',
    weeklyHoursReality:
      'Often longer during project deadlines, shutdowns, and commissioning work. Overtime is common and usually paid.',
    workPattern:
      'Mix of office and site work. Some shift patterns in manufacturing. On-call possible for maintenance engineers.',
    remoteHybrid:
      'Senior design and office roles may be hybrid. Site-based roles are on-site. Entry-level engineers are usually on-site for mentoring.',
    weekendEvening:
      'Project-dependent. Shutdown work and commissioning often require weekends. Usually compensated.',
    entrySalary:
      'Engineering technician around \u00a324,000-28,000. Graduate engineer around \u00a328,000-35,000 depending on sector and employer.',
    seniorSalary:
      'Senior or principal engineer salaries vary by sector; chartered engineers typically earn well into five figures above graduate pay.',
    pension:
      'Varies widely. Large employers (BAE, Babcock, SSE) offer good schemes. Small firms may be at the auto-enrolment minimum (3% employer).',
    sickPay:
      'Varies. Large employers usually enhanced. SMEs may be statutory only (around \u00a3123.25/week SSP).',
    maternityPaternity:
      'Varies by employer. Large firms often enhanced. SMEs may be statutory only.',
    overtimePay:
      'Usually paid -- often time-and-a-half or double time. Salaried engineers may get time-off-in-lieu (TOIL) instead.',
    notablePerks:
      'Professional development funding, chartership support, company cars in some roles, private healthcare at larger firms.',
    progressionSpeed:
      'Apprentice to qualified typically 3-4 years. Engineer to chartered (IEng or CEng) typically 5-10 years. Senior or principal engineer 10+ years.',
    jobSecurity: 'medium-high',
    redundancyRisk:
      'Medium. Project-based work can be cyclical. Skilled engineers with transferable skills fare better.',
    cpdRequirements:
      'Required for professional registration (IEng or CEng). Engineering Council sets standards.',
    qualificationCosts:
      'Engineering Council registration fees vary. Professional institution membership (IMechE, IET, ICE) around \u00a3100-200/year.',
    noticePeriod: 'Typically 1 month at entry, 3 months at senior level.',
    stressLevel: 3,
    stressExplanation:
      'Deadlines and safety responsibility. Higher in construction and site-based roles.',
    workLifeBalance: 3,
    workLifeExplanation:
      'Can be good on steady projects, worse during shutdowns or commissioning.',
    physicalDemands:
      'Mixed. Office-based for design roles. Physically active for site and manufacturing roles.',
    dressCode:
      'PPE on site (provided). Smart casual in the office. No formal dress code usually.',
    travelRequirements:
      'Can be significant -- multi-site work, client visits, offshore in the energy sector.',
    partTimeAvailability:
      'Less common in site roles. More available in design or office roles at senior level.',
    unionRepresentation:
      'Unite is the main union. Coverage around 28% in construction. Stronger in large employers and on public contracts.',
  },

  {
    sectorSlug: 'computing-software-and-technology',
    sectorName: 'Computing, Software and Technology',
    weeklyHoursContractual: 'Typically 37.5-40 hours/week.',
    weeklyHoursReality:
      'Close to contractual for most roles. Deadline crunches and releases can push hours up. On-call rotations for DevOps and infrastructure roles.',
    workPattern:
      'Mostly weekday work. Flexible start and finish times are common. Sprint cycles in agile teams.',
    remoteHybrid:
      'High hybrid availability -- around 49% of information and communication businesses offer hybrid. Many tech roles are fully remote-capable. Entry-level may be more office-based for mentoring.',
    weekendEvening:
      'Rare except for releases, incidents, and on-call rotations. Usually compensated via TOIL or on-call allowances.',
    entrySalary:
      'Software developer in Scotland starts around \u00a330,000. Cyber security around \u00a328,000-32,000. IT support around \u00a322,000-26,000.',
    seniorSalary:
      'Principal or staff engineers in Edinburgh fintech or Glasgow games studios can earn significantly more, with share schemes at larger firms.',
    pension:
      'Varies. Large tech firms (JPMorgan, FanDuel, Skyscanner) offer good schemes. Startups often at auto-enrolment minimum.',
    sickPay:
      'Usually enhanced at larger firms. Startups may be statutory only.',
    maternityPaternity:
      'Often enhanced at larger firms. Statutory at smaller companies.',
    overtimePay:
      'Salaried roles rarely pay overtime. TOIL or flexible working is used instead. On-call may be separately compensated.',
    notablePerks:
      'Remote working, flexible hours, conference budgets, training allowances, free food or drinks in some offices, share schemes.',
    progressionSpeed:
      'Junior to mid-level typically 2-3 years. Mid to senior 3-5 years. Principal or staff engineer 8+ years.',
    jobSecurity: 'medium',
    redundancyRisk:
      'Medium. Startups are higher risk. Established companies are more stable. Tech layoff cycles exist.',
    cpdRequirements:
      'Not formally mandated but essential to stay current. Often employer-funded.',
    qualificationCosts:
      'Usually none -- no mandatory registration body. Some certifications (AWS, Azure) are typically employer-funded.',
    noticePeriod: 'Typically 1 month at entry, 3 months at senior level.',
    stressLevel: 3,
    stressExplanation:
      'Deadline pressure and incident response, but generally lower than many professional sectors.',
    workLifeBalance: 4,
    workLifeExplanation:
      'Flexible working, hybrid options, and reasonable hours make this one of the better sectors for balance.',
    physicalDemands: 'Desk-based and sedentary. Ergonomic setup matters.',
    dressCode: 'Casual. T-shirt and jeans is normal in most tech companies.',
    travelRequirements: 'Minimal. Mostly desk-based with occasional meetings.',
    partTimeAvailability:
      'Available, especially at senior level and in contracting.',
    unionRepresentation:
      'Low union coverage in tech (around 12% in information and communication). Prospect union covers some roles.',
  },

  {
    sectorSlug: 'law-and-legal-services',
    sectorName: 'Law and Legal Services',
    weeklyHoursContractual: '35-40 hours/week in most firms.',
    weeklyHoursReality:
      'Often 40-50+ hours in private practice. Trainees frequently do unpaid extra time. Corporate and commercial law can push to 60+ hours. Public sector and in-house roles are steadier.',
    workPattern:
      'Mostly weekday office work. Court timetables and deal deadlines drive late finishes. Advocates have unpredictable court-led schedules.',
    remoteHybrid:
      'Many firms now offer hybrid. Trainees are often more office-based for supervision. Court work is always on-site.',
    weekendEvening:
      'Common near deadlines in private practice. Usually not separately compensated.',
    entrySalary:
      'Trainee solicitor recommended minimum \u00a324,840 (year 1) and \u00a328,850 (year 2) from June 2025. Paralegal around \u00a322,000-30,000.',
    seniorSalary:
      'Newly qualified solicitor salaries vary widely by sector. Partners receive profit share; corporate and commercial sits at the top of the range.',
    pension:
      'Private firms typically auto-enrolment (3% employer). Partners and advocates arrange their own.',
    sickPay:
      'Varies. Enhanced in larger firms. Statutory only in many smaller firms. Self-employed advocates have no sick pay.',
    maternityPaternity:
      'Better in larger firms. Statutory only in many smaller firms. Complex for self-employed advocates.',
    overtimePay:
      'Often an unpaid expectation in private practice. Some firms offer TOIL.',
    notablePerks:
      'Larger firms offer bonuses, private healthcare, professional subscriptions, and CPD budgets. Partners get profit share.',
    progressionSpeed:
      'Traineeship is 2 years. NQ to associate typically 2-5 years. Partner typically 8-15 years. Advocacy involves devilling (around 9 months of structured training).',
    jobSecurity: 'medium',
    redundancyRisk:
      'Medium. Small firms can be fragile. In-house and public sector roles are more stable.',
    cpdRequirements:
      'Solicitors must complete 20 hours of relevant CPD per year. Trainees must complete 60 hours of TCPD across the traineeship.',
    qualificationCosts:
      'Law Society of Scotland practising certificate is a significant annual fee. Faculty of Advocates costs are high for self-employed advocates.',
    noticePeriod: 'Typically 1-3 months when employed. Partnerships are longer.',
    stressLevel: 4,
    stressExplanation:
      'Deadlines, client stakes, adversarial conflict, and emotional exposure in criminal and family law.',
    workLifeBalance: 2,
    workLifeExplanation:
      '2-3/5 in private practice. Around 3/5 possible in public sector or in-house roles.',
    physicalDemands: 'Mostly desk-based. Long sedentary periods.',
    dressCode: 'Business formal in most firms. Court dress for some appearances.',
    travelRequirements:
      'Court appearances, client visits, prison visits (criminal law). More desk-based in corporate and commercial.',
    partTimeAvailability:
      'Possible, more common in in-house and public sector roles. Harder during traineeship and in litigation.',
    unionRepresentation:
      'Legal sector is less unionised. Law Society of Scotland regulates but is not a union.',
  },

  {
    sectorSlug: 'business-and-finance',
    sectorName: 'Business and Finance',
    weeklyHoursContractual: 'Typically 35-40 hours/week.',
    weeklyHoursReality:
      'Accountancy busy season (January-April) can push to 50-60 hours. Banking and financial services are mostly closer to contractual.',
    workPattern:
      'Mostly weekday. Hybrid is common for desk-based roles. Audit teams may be at client sites.',
    remoteHybrid:
      'Often hybrid. Edinburgh (the UK\u2019s second-largest financial centre) has a strong hybrid culture in large firms.',
    weekendEvening:
      'Rare outside busy season in accountancy. Banking rarely requires weekends.',
    entrySalary:
      'Accountant (private practice) around \u00a324,000-28,000. Graduate banking or financial services around \u00a328,000-35,000. Major Edinburgh employers (Baillie Gifford, Standard Life, NatWest) pay at the higher end.',
    seniorSalary:
      'Partner in accountancy is reached after 10-15 years. Senior banking roles with bonus schemes reach significantly higher pay.',
    pension:
      'Large financial firms often exceed auto-enrolment minimums. Edinburgh firms are known for good pension contributions.',
    sickPay: 'Usually enhanced in large firms. Varies in smaller practices.',
    maternityPaternity: 'Often enhanced in large firms.',
    overtimePay:
      'Salaried roles rarely pay overtime. Audit-season work is often unpaid extra hours.',
    notablePerks:
      'Professional qualification support (ICAS, ACCA), bonus schemes, share schemes in larger firms, private healthcare.',
    progressionSpeed:
      'Trainee to qualified accountant typically 3-4 years (ICAS or ACCA). Graduate to manager in banking typically 3-5 years. Partner in accountancy 10-15 years.',
    jobSecurity: 'medium-high',
    redundancyRisk:
      'Medium. Economic cycles affect financial services. Automation is reducing some entry-level roles.',
    cpdRequirements:
      'Mandatory for ICAS, ACCA, or CIMA. Employer-funded during training.',
    qualificationCosts:
      'Professional body membership around \u00a3200-500/year. Often employer-funded.',
    noticePeriod: 'Typically 1 month at entry, 3 months at senior level.',
    stressLevel: 3,
    stressExplanation:
      'Steady most of the year. 4-5/5 during audit or tax busy season in accountancy.',
    workLifeBalance: 3,
    workLifeExplanation:
      '3-4/5 most of the year. Around 2/5 during busy season.',
    physicalDemands: 'Desk-based.',
    dressCode:
      'Business formal in banking and client-facing roles. Smart casual in some offices. Casual Fridays are common.',
    travelRequirements: 'Some travel for audit and client work. Otherwise desk-based.',
    partTimeAvailability: 'Available at senior level. Less common during training.',
    unionRepresentation:
      'Low union coverage in financial services (around 20% in finance and insurance at UK level).',
  },

  {
    sectorSlug: 'creative-arts-media-and-design',
    sectorName: 'Creative Arts, Media and Design',
    weeklyHoursContractual:
      'Varies hugely. Employed roles typically 35-40 hours. Freelance has no set hours.',
    weeklyHoursReality:
      'Project deadlines and client demands push hours up. Edinburgh Festival season means intense periods. Games studios are known for "crunch".',
    workPattern:
      'Irregular in many roles. Evening and weekend events, shoots, and deadlines are common.',
    remoteHybrid:
      'Mixed. Design and digital roles can be remote. Film, TV, and live events are on-site. Around 30% of creative industry workers are self-employed.',
    weekendEvening:
      'Common in events, broadcasting, journalism, and live performance.',
    entrySalary:
      'Graphic designer around \u00a322,000-26,000. UX designer around \u00a328,000-32,000. Journalist around \u00a320,000-25,000. Games developer around \u00a325,000-30,000.',
    seniorSalary:
      'Senior creative roles in established studios (Rockstar North, 4J Studios, Outplay) pay competitively. Freelance top earners build on reputation and portfolio.',
    pension:
      'Auto-enrolment minimum at many employers. Freelancers must arrange their own.',
    sickPay: 'Often statutory only. Freelancers have none.',
    maternityPaternity:
      'Often statutory only. Freelancers have limited provision.',
    overtimePay:
      'Freelance work is priced by project. Employed roles may have unpaid overtime during deadlines.',
    notablePerks:
      'Creative work, portfolio building, industry events, and sometimes equipment provided.',
    progressionSpeed:
      'Varies hugely. Portfolio and reputation matter more than time served. Junior to mid-level 2-4 years. Senior 5-10 years.',
    jobSecurity: 'low',
    redundancyRisk:
      'Medium-high in freelance. Lower in established studios. BBC Scotland, STV, and Screen Scotland provide some stability.',
    cpdRequirements:
      'Not formally mandated. Portfolio development is continuous.',
    qualificationCosts: 'Usually none -- no mandatory registration body.',
    noticePeriod:
      'Often 1 month for employed roles. Freelance has contract-dependent terms.',
    stressLevel: 3,
    stressExplanation:
      'Deadline pressure and income insecurity for freelancers. Lower in stable employed roles.',
    workLifeBalance: 3,
    workLifeExplanation:
      '3/5 in employed roles. Around 2/5 in freelance during busy periods.',
    physicalDemands:
      'Mostly desk-based for design. Active for film, TV production, and live events.',
    dressCode: 'Casual in most creative environments.',
    travelRequirements:
      'Varies. Desk-based for digital work. Significant travel for film, TV locations, and events.',
    partTimeAvailability:
      'Common in freelance by nature. Available in some employed roles.',
    unionRepresentation:
      'BECTU for broadcasting and entertainment. NUJ for journalism. Coverage around 14% in arts and entertainment.',
  },

  {
    sectorSlug: 'construction-and-trades',
    sectorName: 'Construction and Trades',
    weeklyHoursContractual:
      '37.5 hours/week in electrical (SJIB rules). 39 hours/week in general construction (CIJC rules).',
    weeklyHoursReality:
      'Often exceeds contractual due to overtime, early starts, and project pressure. Working rules explicitly allow employers to require reasonable overtime.',
    workPattern:
      'Predominantly daytime weekday site work. Night shifts and weekend work on some projects. On-call for maintenance (especially electrical and plumbing).',
    remoteHybrid:
      'Trades are almost entirely on-site. Site managers may do some admin from home.',
    weekendEvening:
      'Project-dependent. Compensated at premium rates -- time-and-a-half for the first 4 hours then double time (CIJC).',
    entrySalary:
      'Electrician (new worker) around \u00a326,000. Plumber around \u00a325,000. Joiner around \u00a323,000. Construction manager around \u00a335,000. Approved Electrician rate \u00a321.06/hour (SJIB 2026).',
    seniorSalary:
      'Site managers and skilled specialists earn well above entry rates. Self-employed tradespeople set their own day rates.',
    pension:
      'SJIB electrical: Evolve Pension Scheme (3% employer minimum). CIJC: The People\u2019s Pension (minimum \u00a35/week employer). Plumbing: industry scheme with rates up to 10.6% employer.',
    sickPay:
      'SSP plus industry sick pay. CIJC pays \u00a3168.59/week on top of SSP after a qualifying period, rising with service. Self-employed get nothing.',
    maternityPaternity:
      'Many private SMEs are statutory only. Large contractors may offer enhanced packages.',
    overtimePay:
      'Paid at premium rates. CIJC: time-and-a-half then double time. Electrical: night-shift premia after 37.5 hours. Self-employed price overtime into day rates.',
    notablePerks:
      'PPE provided, tools allowance, van and fuel for some roles, travel and subsistence on distant sites, death-in-service benefits.',
    progressionSpeed:
      'Apprentice to qualified tradesperson typically 3-4 years. Experienced to supervisor 5-10 years. Supervisor to site manager 8-15 years.',
    jobSecurity: 'medium',
    redundancyRisk:
      'Medium. Project-based work creates natural breaks. Public infrastructure work is more stable than private housing.',
    cpdRequirements:
      'Not formally mandated for all trades. SJIB requires up-to-date safety competence for card renewal. Gas Safe registration requires ongoing competence.',
    qualificationCosts:
      'CSCS card application \u00a336 (apprentice cards free). ECS card fees vary. Gas Safe renewal around \u00a3168/year. Self-employed pay their own.',
    noticePeriod:
      'CIJC: 1 day first month, then 1 week, rising to 1 week per year of service up to 12 weeks.',
    stressLevel: 4,
    stressExplanation:
      'Deadlines, safety risk, weather and time pressure. Self-employment adds financial stress.',
    workLifeBalance: 2,
    workLifeExplanation:
      '2-3/5. Can be good on steady local work but deteriorates during project peaks. Early starts are standard.',
    physicalDemands:
      'Physically demanding. Manual handling, weather exposure, working at height, confined spaces.',
    dressCode:
      'PPE, hi-vis, boots, and hard hat on sites (provided). Branded workwear for domestic trades.',
    travelRequirements:
      'Site-based with daily travel between sites. CIJC rules include travel allowances.',
    partTimeAvailability:
      'Less common on major projects. Self-employment can offer flexibility but income is unstable.',
    unionRepresentation:
      'Construction union membership around 28% in Scotland. Unite and GMB are the main unions. CIJC rules reference signatory unions for collective bargaining.',
  },

  {
    sectorSlug: 'science-and-research',
    sectorName: 'Science and Research',
    weeklyHoursContractual: 'Typically 37-40 hours/week.',
    weeklyHoursReality:
      'Experiments and deadlines often push beyond. Academic research culture can normalise long hours.',
    workPattern:
      'Mix of lab work, fieldwork, and desk-based analysis. Academic researchers have more flexibility but also more pressure.',
    remoteHybrid:
      'Lab and field work is on-site. Data analysis and writing can be remote. Around 42% of professional and scientific businesses offer hybrid.',
    weekendEvening:
      'Can be required for experiments, fieldwork seasons, and publication deadlines.',
    entrySalary:
      'Biomedical scientist around \u00a327,000-30,000. Research associate (postdoc) around \u00a333,000-38,000. Environmental scientist around \u00a324,000-28,000.',
    seniorSalary:
      'Lecturer or principal investigator roles take 5-10+ years post-PhD. Industry senior scientist salaries scale well.',
    pension:
      'Universities typically USS or LGPS (good employer contributions). NHS labs use NHS pension. Private sector varies.',
    sickPay: 'Enhanced in universities and NHS. Variable in private sector.',
    maternityPaternity:
      'Enhanced in universities and NHS. Variable in private sector.',
    overtimePay:
      'Usually unpaid in research and academic roles. Lab-based industry roles may pay overtime.',
    notablePerks:
      'Intellectual stimulation, conference attendance, publications, access to facilities, and sometimes sabbatical options.',
    progressionSpeed:
      'PhD typically 3-4 years. Postdoc contracts often 1-3 years (fixed-term). Lecturer or PI position 5-10+ years post-PhD. Industry scientist progression typically 3-5 years to senior.',
    jobSecurity: 'low',
    redundancyRisk:
      'Medium-high in academia (grant-dependent). Lower in industry and public sector science (SEPA, NatureScot). Around two-thirds of university research staff are on fixed-term contracts.',
    cpdRequirements:
      'Not formally mandated in most roles. Professional registration (e.g. RSC, RSB) requires evidence of development.',
    qualificationCosts:
      'Professional body membership around \u00a350-150/year. Often employer-funded.',
    noticePeriod: 'Typically 1-3 months.',
    stressLevel: 4,
    stressExplanation:
      '4/5 in academia (publish-or-perish, grant pressure, job insecurity). 3/5 in industry and public sector science.',
    workLifeBalance: 2,
    workLifeExplanation:
      '2/5 early career in academia. 3-4/5 in industry and public sector.',
    physicalDemands:
      'Mixed. Lab work involves standing and handling chemicals or equipment. Fieldwork can be physically demanding.',
    dressCode:
      'Lab coat and PPE in labs. Smart casual in offices. Outdoor gear for fieldwork.',
    travelRequirements:
      'Fieldwork and conference travel. Lab-based roles are mostly site-based.',
    partTimeAvailability:
      'Available in some roles, especially public sector. Harder in early academic career.',
    unionRepresentation:
      'UCU for university staff (active). Coverage varies. Public sector union density around 50%.',
  },

  {
    sectorSlug: 'social-work-and-community-services',
    sectorName: 'Social Work and Community Services',
    weeklyHoursContractual: '35-37 hours/week in councils.',
    weeklyHoursReality:
      'Often exceeds due to caseloads, court deadlines, and crisis intervention. Unpaid emotional labour is a significant reality.',
    workPattern:
      'Mostly weekday, but on-call, emergency duty, and crisis response create spillover. Support workers often do shift work.',
    remoteHybrid:
      'Hybrid is common -- admin and reports can be remote, but home visits and meetings are on-site.',
    weekendEvening:
      'Can be frequent in child and adult protection. Support worker shifts often include weekends.',
    entrySalary:
      'Social worker starting around \u00a331,000-38,000 in a local authority. Support worker around \u00a322,000-28,000. Adult social care minimum \u00a313.45/hour from April 2026.',
    seniorSalary:
      'Management roles in local authorities pay well after 5-10+ years of experience.',
    pension:
      'Scottish LGPS for local authority roles (average employer contribution around 17.5%). Third sector varies.',
    sickPay:
      'Councils usually have occupational sick pay. Third sector may be statutory only.',
    maternityPaternity:
      'Usually enhanced in local authority. Variable in third sector.',
    overtimePay:
      'Often TOIL rather than paid overtime. Senior levels often have unpaid expectation.',
    notablePerks:
      'Meaningful work, local authority pension, supervision and training support, mileage for visits.',
    progressionSpeed:
      'Newly qualified to senior social worker typically 2-5 years. Management roles 5-10+ years.',
    jobSecurity: 'medium-high',
    redundancyRisk:
      'Low-medium. Statutory services are protected but third sector roles are more vulnerable.',
    cpdRequirements:
      'SSSC registration requires continuous professional learning (no set hours, but an annual declaration is required).',
    qualificationCosts:
      'SSSC annual fees -- Social Worker \u00a396, Support Worker \u00a328, Community Worker \u00a352. Who pays varies.',
    noticePeriod: 'Typically 4 weeks at entry, 8-12 weeks at senior level.',
    stressLevel: 5,
    stressExplanation:
      'Statutory risk decisions, trauma exposure, caseload pressure, and bureaucratic burden. One of the most stressful careers.',
    workLifeBalance: 2,
    workLifeExplanation:
      'Crisis-driven work and emotional spillover are common.',
    physicalDemands:
      'Mixed. Lots of travel, meetings, and home visits.',
    dressCode: 'Practical smart casual. No uniform for most roles.',
    travelRequirements:
      'High -- home visits, placement visits, community settings.',
    partTimeAvailability:
      'Possible, but caseload allocation can make it harder than it looks.',
    unionRepresentation:
      'UNISON, GMB, and Unite are common in councils. Coverage is reasonably strong in public sector.',
  },

  {
    sectorSlug: 'public-services-and-government',
    sectorName: 'Public Services and Government',
    weeklyHoursContractual:
      'Scottish Government typically 37 hours/week. Councils often 35-37 hours.',
    weeklyHoursReality:
      'Usually close to contractual except during budget rounds, crises, or policy deadlines.',
    workPattern:
      'Generally weekday 9-5 with flexi-time and compressed-hours options.',
    remoteHybrid:
      'Strong hybrid culture. Scottish Government promotes flexible working and has a right-to-disconnect policy. Many roles are 40-60% remote.',
    weekendEvening:
      'Rare except during ministerial deadlines or emergency response.',
    entrySalary:
      'Scottish Government around \u00a325,000-28,000 at entry grades. Council officers around \u00a324,000-32,000.',
    seniorSalary:
      'Senior Civil Service grades and council directorships pay significantly more, though progression is more competitive.',
    pension:
      'Civil Service Pension Scheme (alpha) -- employer contributes around 28.97%. Scottish LGPS for councils (average 17.5% employer). Among the best pensions available.',
    sickPay:
      'Enhanced -- Scottish Government offers up to 6 months full pay then 6 months half pay.',
    maternityPaternity:
      'Scottish Government maternity includes 27 weeks full pay. Very generous compared to private sector.',
    overtimePay:
      'Often TOIL rather than cash. Senior grades often have unpaid extra hours.',
    notablePerks:
      'Flexible working, hybrid roles, career breaks, right-to-disconnect policy, generous leave.',
    progressionSpeed:
      'Structured and fairly rapid for analytical or policy tracks -- 2-4 years between grades is common. Senior progression is more competitive.',
    jobSecurity: 'high',
    redundancyRisk:
      'Low-medium. Reorganisations happen but overall stability is strong.',
    cpdRequirements:
      'Employer-driven, not statutory. Good development programmes available.',
    qualificationCosts: 'Usually none unless in a regulated profession.',
    noticePeriod: 'Typically 1 month at entry, 3 months at senior level.',
    stressLevel: 3,
    stressExplanation:
      'Policy deadlines and stakeholder pressure, but manageable in many roles. 4/5 at senior level.',
    workLifeBalance: 4,
    workLifeExplanation:
      'Flexi-time, hybrid working, and generous leave make this one of the best sectors for balance.',
    physicalDemands: 'Desk-based.',
    dressCode: 'Smart casual to office professional.',
    travelRequirements:
      'Some travel between offices and stakeholder sites. Limited by hybrid policies.',
    partTimeAvailability:
      'Strongly available -- part-time, job-share, compressed hours, and term-time working all possible.',
    unionRepresentation:
      'PCS for civil service, UNISON or GMB for councils. Coverage around 50% in public sector.',
  },

  {
    sectorSlug: 'hospitality-and-tourism',
    sectorName: 'Hospitality and Tourism',
    weeklyHoursContractual:
      'Many contracts are part-time (16-30 hours). Around 44% of hospitality jobs are part-time.',
    weeklyHoursReality:
      'Chefs and managers often work beyond rostered hours. Unpaid overtime is common, especially for salaried staff and chefs.',
    workPattern:
      'Shift work -- early or late shifts, split shifts, evenings, weekends. Long hours during Edinburgh Festival and peak tourist seasons.',
    remoteHybrid:
      'Almost entirely on-site. Only around 6% of hospitality employers offer any home working.',
    weekendEvening:
      'Very common and usually mandatory. This is one of the defining features of the sector.',
    entrySalary:
      'Scotland median hourly pay in accommodation and food is \u00a312.00/hour (2024). National Living Wage (21+) is \u00a312.71/hour from April 2026. At 37.5 hours/week this is around \u00a324,790/year.',
    seniorSalary:
      'Head chef and general manager roles in larger venues pay well above entry rates. Top-end roles in Edinburgh and Glasgow fine dining or major hotels are competitive.',
    pension:
      'Auto-enrolment minimum (3% employer) at most employers.',
    sickPay:
      'Poor. Only around 20% of hospitality workers surveyed receive full salary when sick. Around 33% receive no sick pay. Statutory SSP is \u00a3123.25/week from April 2026.',
    maternityPaternity: 'Usually statutory only.',
    overtimePay:
      'Hourly-paid staff usually get basic rate for extra hours. Salaried roles face unpaid overtime.',
    notablePerks:
      'Tips and service charge (fair distribution now legally required since October 2024), staff meals, staff discounts, sometimes live-in accommodation in remote hotels.',
    progressionSpeed:
      'Often fast early (high turnover creates opportunities). Plateau risk is real unless you move into management or specialist cuisine. Entry to supervisor 1-3 years.',
    jobSecurity: 'medium-low',
    redundancyRisk:
      'Medium-high. Seasonal and sensitive to economic shocks. Scotland\u2019s tourism is worth over \u00a36bn, but employment is volatile.',
    cpdRequirements:
      'Not formally mandated except food hygiene and licensing requirements.',
    qualificationCosts:
      'Low -- food hygiene certificates and personal licence costs.',
    noticePeriod: 'Often 1-4 weeks.',
    stressLevel: 4,
    stressExplanation:
      'Customer pressure, variable staffing, long shifts. Chefs face particular intensity.',
    workLifeBalance: 2,
    workLifeExplanation:
      'Evening and weekend work is normal. Seasonal peaks disrupt routines. 53% of hospitality workers reported good work-life balance in 2026 (down from 59% in 2024).',
    physicalDemands:
      'Active to physically demanding. Standing, carrying, kitchen heat and pace.',
    dressCode:
      'Uniform usually provided -- chef whites, branded front-of-house clothing.',
    travelRequirements:
      'Usually single-site. Tourism operators may travel to venues.',
    partTimeAvailability:
      'Widely available (also a downside -- can mean insecure hours).',
    unionRepresentation:
      'Very low union coverage -- around 2-3% in accommodation and food. Usdaw has some hospitality presence.',
  },

  {
    sectorSlug: 'agriculture-environment-and-land-based',
    sectorName: 'Agriculture, Environment and Land-based',
    weeklyHoursContractual:
      'Employed farm workers have defined hours. Environmental officers work standard council hours (35-37).',
    weeklyHoursReality:
      'Farming is seasonal and weather-driven -- lambing, calving, and harvest mean very long days. Environmental officers are more predictable.',
    workPattern:
      'Farm work has early starts, weekend work, and seasonal peaks. Gamekeeping includes early mornings, evenings, and weekends on rota. Environmental officers have office hours plus fieldwork.',
    remoteHybrid:
      'Farm, forestry, and gamekeeping are entirely on-site (the land is the workplace). Environmental officers may have hybrid options for report-writing. NatureScot offers home- or field-based working.',
    weekendEvening:
      'Regular on farms and estates during peak season. Environmental officers usually limited except for incidents.',
    entrySalary:
      'Agricultural minimum wage \u00a312.71/hour (SAWB Order 2026). Overtime at \u00a319.07/hour. Environmental officer entry aligns with council pay scales (around \u00a324,000-30,000). Vet graduate salaries vary.',
    seniorSalary:
      'Experienced vets, estate managers, and senior environmental officers earn well into five figures above entry. Farm owners\u2019 income depends on land, subsidy, and market prices.',
    pension:
      'Local authority roles typically LGPS. NatureScot offers Civil Service pension (28.97% employer). Private farms typically auto-enrolment minimum.',
    sickPay:
      'Council roles have occupational sick pay (up to 26 weeks full plus 26 weeks half after 5+ years). Agricultural Sick Pay available after 52 weeks\u2019 service. Self-employed farmers have none.',
    maternityPaternity:
      'Council roles enhanced. Farm and estate roles often statutory only.',
    overtimePay:
      'Agricultural Wage Order requires overtime at 1.5x after 8 hours/day or 48 hours/week. Council roles may offer TOIL.',
    notablePerks:
      'Gamekeeping often includes tied housing. NatureScot offers civil service benefits. Dog allowance for shepherds (\u00a311.18/week per dog, max 4).',
    progressionSpeed:
      'Environmental officer progression is structured through council grades. Veterinary progression depends on practice structure. Farm progression often depends on access to land or capital (frequently family route).',
    jobSecurity: 'medium',
    redundancyRisk:
      'Medium. Public sector environmental roles are more stable. Farm businesses are sensitive to subsidy policy and market prices. Gamekeeping can be sensitive to estate economics.',
    cpdRequirements:
      'Veterinary CPD is compulsory -- 35 hours/year. Environmental officers encouraged but not mandated.',
    qualificationCosts:
      'RCVS annual fee around \u00a3431. Gas Safe, pesticide, and chainsaw certifications carry renewal costs.',
    noticePeriod: 'Council roles typically 4 weeks+. Farm roles vary.',
    stressLevel: 4,
    stressExplanation:
      'Farming and veterinary work involve isolation, long hours, and welfare responsibility. Environmental enforcement has regulatory conflict.',
    workLifeBalance: 2,
    workLifeExplanation:
      '2-3/5. Environmental officer roles can be stable. Farm, estate, and vet roles frequently require irregular hours.',
    physicalDemands:
      'Physically demanding outdoors for farming, forestry, and gamekeeping. Mixed for environmental officers. Vets have lifting and difficult animal handling.',
    dressCode:
      'Outdoor PPE, boots, and weather gear for field roles. Smart casual plus PPE for environmental officers. Clinical PPE for vets.',
    travelRequirements:
      'Farm and forestry work is site-based on the land. Environmental officers mix desk and site visits. Vets travel for farm calls.',
    partTimeAvailability:
      'Available in public sector environmental roles. Farm and estate work is less flexible. Veterinary part-time is possible but harder early career.',
    unionRepresentation:
      'Agriculture union data is suppressed in Scotland (small sample). NFU Scotland represents farmers (not a trade union for employees). Public sector environmental roles have UNISON presence.',
  },

  {
    sectorSlug: 'sport-fitness-and-leisure',
    sectorName: 'Sport, Fitness and Leisure',
    weeklyHoursContractual:
      'Leisure centre roles around 37 hours/week in local authority. Outdoor instructors 36-44 hours (variable). Personal trainers have no set hours (client-driven).',
    weeklyHoursReality:
      'Hours are highly variable in coaching and personal training. Evenings and weekends are when clients are free.',
    workPattern:
      'Leisure centres work shifts including early and late shifts and weekends. Coaching and outdoor instruction often include evenings and weekends. Seasonal variation in outdoor roles.',
    remoteHybrid:
      'Mostly on-site. Some senior or self-employed personal trainers do online coaching (around 10-40% remote).',
    weekendEvening:
      'Common and often mandatory in leisure centres. Coaching is mainly evenings and weekends. Outdoor centres often run multi-day courses.',
    entrySalary:
      'Sports coach around \u00a319,000. Fitness instructor around \u00a317,000. Outdoor instructor around \u00a323,000. Leisure centre manager around \u00a324,000. Personal trainer income is highly variable (commission or self-employed).',
    seniorSalary:
      'Senior management or an established self-employed PT client base can reach significantly higher earnings.',
    pension:
      'Local authority leisure roles typically LGPS. Private gyms and self-employed: auto-enrolment or none.',
    sickPay:
      'Council leisure roles have occupational sick pay. Private gyms and self-employed: SSP only or nothing.',
    maternityPaternity: 'Council roles enhanced. Private sector usually statutory only.',
    overtimePay:
      'Council roles have overtime and TOIL provisions. Self-employed prep (programming, marketing) is unpaid.',
    notablePerks:
      'Free or discounted gym membership, training discounts, access to facilities. Outdoor centres sometimes include equipment and accommodation.',
    progressionSpeed:
      'Qualifications stack quickly early on. Senior progression depends on building a client base or moving into management. Entry to mid-level 2-5 years. Mid to senior 5-10 years.',
    jobSecurity: 'medium',
    redundancyRisk:
      'Medium. Public leisure is budget-sensitive. Private gym demand fluctuates.',
    cpdRequirements:
      'CIMSPA requires 10 CPD points per year (minimum 5 endorsed) for members. Many instructors self-fund.',
    qualificationCosts:
      'CIMSPA membership from \u00a339/year. First-aid refreshers, governing body memberships, and coaching certifications add costs.',
    noticePeriod: '1-4 weeks at entry, 1-3 months at management level.',
    stressLevel: 3,
    stressExplanation:
      'Client responsibility and safety duty of care (especially outdoors). Income insecurity for self-employed.',
    workLifeBalance: 3,
    workLifeExplanation:
      'Can be good for people who prefer flexible work, but evenings and weekends are common and income can be unstable.',
    physicalDemands:
      'Active to physically demanding. Outdoor instruction is weather-exposed.',
    dressCode:
      'Sportswear or uniform. Outdoor roles require safety kit and weather gear.',
    travelRequirements:
      'Leisure centres are site-based. Coaches travel to venues. Outdoor instructors travel to remote centres.',
    partTimeAvailability:
      'Very common. Part-time and sessional roles are the norm in coaching and leisure.',
    unionRepresentation:
      'Low union coverage -- around 14% in arts, entertainment, and recreation. Council leisure staff have stronger union presence.',
  },

  {
    sectorSlug: 'transport-and-logistics',
    sectorName: 'Transport and Logistics',
    weeklyHoursContractual:
      'HGV and bus driving are limited by safety rules -- maximum 56 hours driving/week and 90 hours in 2 consecutive weeks.',
    weeklyHoursReality:
      'Total working time can exceed driving time due to loading, waiting, and paperwork.',
    workPattern:
      'Bus and rail: rota-based shifts including early, late, and weekends. ScotRail runs 7 days a week. Warehouse: shift work (days or nights).',
    remoteHybrid:
      'Almost entirely on-site or mobile. Transport planners may have some hybrid.',
    weekendEvening:
      'Frequent and expected in passenger transport. ScotRail explicitly requires shift and weekend working.',
    entrySalary:
      'HGV driver around \u00a327,000. Bus driver around \u00a325,000. Lothian Buses drivers \u00a333,786-39,120. ScotRail trainee driver \u00a336,032, newly qualified \u00a350,086, rising to \u00a363,421 after 3 years. Warehouse operative around \u00a319,000.',
    seniorSalary:
      'Qualified train drivers and senior operators reach strong pay. Management and trainer roles pay above driver rates.',
    pension:
      'ScotRail has a contributory final salary pension scheme (employer around 12.5%). Bus and logistics often auto-enrolment minimum.',
    sickPay:
      'Varies by employer. Unionised rail roles often have enhanced sick pay. Many logistics employers are statutory only.',
    maternityPaternity:
      'Varies. ScotRail lists maternity and paternity pay but details not specified.',
    overtimePay:
      'Bus operators often pay enhanced overtime rates. Rail overtime exists but depends on agreements.',
    notablePerks:
      'ScotRail: free rail travel for employee and family, discounted national and international rail travel. Bus: staff travel passes. Warehouse: shift allowances.',
    progressionSpeed:
      'Driver training is intensive -- ScotRail takes up to 24 months. Bus or HGV training 1-2 years. Driver to trainer or manager 5-10 years.',
    jobSecurity: 'medium-high',
    redundancyRisk:
      'Medium. Automation and contract changes affect warehouses. Public ownership stabilises rail.',
    cpdRequirements:
      'HGV and bus: Driver CPC requires 35 hours of training every 5 years (mandatory). Rail: ongoing professional development.',
    qualificationCosts:
      'CPC training costs vary (often employer-funded). Driver medicals and licence checks add costs.',
    noticePeriod:
      'Often 4 weeks for operational roles, longer for managers.',
    stressLevel: 4,
    stressExplanation:
      'Safety-critical driving, shift work, passenger responsibility, and time pressure.',
    workLifeBalance: 2,
    workLifeExplanation:
      '2-3/5. Predictable rosters can help, but early and late shifts and weekends are normal.',
    physicalDemands:
      'Drivers: sedentary but fatigue-sensitive. Warehouse: physically demanding (lifting, pace).',
    dressCode: 'Uniform provided by operator. PPE in warehouses.',
    travelRequirements:
      'Drivers travel as part of the job. Warehouse is site-based.',
    partTimeAvailability:
      'Available in bus driving at some operators. Rail driving is usually full-time. Warehouse often offers part-time shifts.',
    unionRepresentation:
      'Strong in transport -- 43.3% union membership in Scotland (2023). RMT and ASLEF in rail. Unite and GMB in bus and logistics.',
  },

  {
    sectorSlug: 'retail-and-customer-service',
    sectorName: 'Retail and Customer Service',
    weeklyHoursContractual:
      'Many shop-floor contracts are part-time (16-30 hours). Call centres typically 37.5 hours.',
    weeklyHoursReality:
      'Optional overtime peaks at Christmas and sales. Call centres have structured shift patterns.',
    workPattern:
      'Retail includes evenings and weekends (Scotland has no Sunday trading restrictions). Call centres vary -- some 9-5, some 24/7.',
    remoteHybrid:
      'Shop floor is 100% on-site. Call centres increasingly offer hybrid (around 27% of call centre agents after a training period).',
    weekendEvening:
      'Common and usually rota-required in retail. Sunday working is routine in Scotland.',
    entrySalary:
      'Sales assistant around \u00a319,000. Retail manager around \u00a326,000. Call centre representative around \u00a323,000-28,000. Scotland median hourly pay in wholesale and retail is \u00a312.88/hour. NLW (21+) is \u00a312.71/hour from April 2026. Tesco \u00a313.28/hour, Sainsbury\u2019s \u00a313.23/hour (2026 deals).',
    seniorSalary:
      'Store or regional manager roles at larger retailers pay well above entry, often with bonus and share schemes.',
    pension: 'Typically auto-enrolment at minimum rates.',
    sickPay:
      'Often statutory only at entry. Large retailers like Tesco offer enhanced packages.',
    maternityPaternity:
      'Large retailers increasingly offer enhanced -- Tesco: 26 weeks fully paid maternity and 6 weeks fully paid paternity. Many smaller employers are statutory only.',
    overtimePay:
      'Shop floor usually paid hourly. Management may have unpaid extra at peak season.',
    notablePerks:
      'Staff discount, bonus schemes, paid domestic abuse leave at Tesco. Some share schemes in larger retailers.',
    progressionSpeed:
      'Entry to supervisor 1-3 years. Supervisor to manager 3-7 years. Senior management longer and often requires geographic mobility.',
    jobSecurity: 'medium-low',
    redundancyRisk:
      'Medium-high. Store closures and automation are ongoing trends. Retail faces structural pressure from online shopping.',
    cpdRequirements:
      'Employer-led internal training. Not formally mandated.',
    qualificationCosts: 'Typically none.',
    noticePeriod: 'Often 1-4 weeks at entry, 1-3 months at management level.',
    stressLevel: 3,
    stressExplanation:
      'Customer conflict, targets, and understaffing. Call centres can be target-driven and monitored.',
    workLifeBalance: 3,
    workLifeExplanation:
      '3/5 for part-time retail. 2-3/5 for full-time rota work. Call centres vary by shift and hybrid options.',
    physicalDemands:
      'Retail: active (standing, stocking). Call centres: desk-based and sedentary.',
    dressCode:
      'Retail: uniform or branded dress code. Call centres: casual to smart casual.',
    travelRequirements:
      'Retail is store-based. Managers may move between stores. Call centres are site-based or home-based for hybrid roles.',
    partTimeAvailability:
      'Widely available in retail. Mixed in call centres.',
    unionRepresentation:
      'Low -- 6.4% union membership in wholesale and retail in Scotland (2023). Usdaw covers larger chains. STUC reports 12% growth in young union membership, partly driven by retail workers.',
  },

  {
    sectorSlug: 'armed-forces-and-emergency-services',
    sectorName: 'Armed Forces and Emergency Services',
    weeklyHoursContractual:
      'Police around 40 hours determined. Ambulance (Agenda for Change) 37.5 hours. Fire rota-based, often averaging 42 hours.',
    weeklyHoursReality:
      'All regularly exceed due to incidents, handovers, and staffing. Armed forces hours are highly variable with deployments.',
    workPattern:
      'All involve shift work, nights, weekends, and on-call. Armed forces have deployments and exercises that disrupt normal patterns.',
    remoteHybrid:
      'Operational roles are 95-100% on-site. Some senior admin roles may allow limited hybrid.',
    weekendEvening:
      'Frequent and mandatory in all response roles.',
    entrySalary:
      'Police constable \u00a334,001 from April 2026. Firefighter trainee \u00a329,169 (2025 settlement). Newly qualified paramedic Band 5 around \u00a333,295. Armed forces starting pay varies by service.',
    seniorSalary:
      'Senior officers and senior fire or ambulance management reach significantly higher pay. Armed forces officer career tracks add command pay.',
    pension:
      'Very strong. Police employer rate around 38.7%. Firefighters around 34.1%. Ambulance (NHS) 22.5%. Armed forces 73.5% employer (unfunded scheme, 0% member contribution -- different structure from civilian pensions).',
    sickPay:
      'Police and fire have occupational schemes. Ambulance follows NHS terms (up to 6 months full plus 6 months half after 5 years). Armed forces have separate arrangements.',
    maternityPaternity:
      'Firefighters (SFRS) get 26 weeks full pay plus 13 weeks at SMP. Police officer maternity improving in 2026. Ambulance follows NHS terms.',
    overtimePay:
      'Police overtime for constables and sergeants at time-and-a-third. Fire overtime at published rates. Ambulance follows NHS overtime. Armed forces generally no overtime -- pay via salary and allowances.',
    notablePerks:
      'Strong pensions, discount schemes, free travel for families (some services), training and development opportunities.',
    progressionSpeed:
      'Police constable to sergeant 5-10 years. Fire trainee to competent firefighter, then to management. Ambulance Band 5 to advanced practitioner. All competitive for promotion.',
    jobSecurity: 'high',
    redundancyRisk:
      'Low. Blue-light services are essential. Armed forces have restructuring but are generally stable.',
    cpdRequirements:
      'Mandatory for all services. Paramedics require HCPC CPD. Police and fire have mandatory training and fitness requirements.',
    qualificationCosts:
      'Police and fire: usually employer-funded. Paramedics (HCPC): around \u00a3123/year. Armed forces: service covers training.',
    noticePeriod: 'Varies by service and regulations.',
    stressLevel: 5,
    stressExplanation:
      '5/5 for police and ambulance (trauma exposure, risk, public scrutiny). 4/5 for fire and armed forces.',
    workLifeBalance: 2,
    workLifeExplanation:
      '2-3/5 across all services. Shift work disrupts life. Predictability varies by rota and staffing.',
    physicalDemands:
      'High across all services. Long shifts, physical incidents, PPE, and manual handling.',
    dressCode: 'Uniform and PPE provided in all services.',
    travelRequirements:
      'Police patrol areas. Fire and ambulance are mobile response. Armed forces have postings and deployments.',
    partTimeAvailability:
      'Possible in some roles but constrained by operational cover. Armed forces: very limited.',
    unionRepresentation:
      'Police Scotland Federation (SPF) represents over 16,000 members (around 98% of officers -- strong, but not a union in strike terms). FBU for firefighters (strong). UNISON for ambulance. Armed forces are not unionised.',
  },

  {
    sectorSlug: 'energy-and-utilities',
    sectorName: 'Energy and Utilities',
    weeklyHoursContractual:
      'Typically 37-40 hours/week. Offshore roles use 2 weeks on / 2 weeks off patterns (around 84 hours per rotation week).',
    weeklyHoursReality:
      'Onshore roles are usually close to contractual. Offshore rotations are intense but compensated by time off.',
    workPattern:
      'Mix of office, field, and shift work. Utilities (Scottish Water, SSE) have on-call engineers. Offshore is rota-based.',
    remoteHybrid:
      'Office-based engineering and planning roles are often hybrid. Field and offshore work is on-site.',
    weekendEvening:
      'On-call and emergency response for utilities. Offshore work is continuous during rotation.',
    entrySalary:
      'Graduate energy engineer around \u00a328,000-35,000. Offshore roles can be significantly higher (\u00a340,000+ at entry due to rotation premium). Utilities operative around \u00a324,000-28,000.',
    seniorSalary:
      'Chartered engineers and senior technical specialists earn well above graduate pay. Offshore specialists and project managers reach particularly high pay.',
    pension:
      'Large energy companies (SSE, Scottish Power, Scottish Water) typically offer good pension schemes above auto-enrolment minimum. Public utilities may use LGPS.',
    sickPay:
      'Usually enhanced in large employers. Varies in smaller firms.',
    maternityPaternity: 'Usually enhanced in large employers.',
    overtimePay:
      'Often paid, especially in utilities emergency response. Offshore roles are compensated via rotation pattern rather than overtime.',
    notablePerks:
      'Offshore roles include accommodation and food during rotation. Large companies offer private healthcare, employee assistance, and professional development funding. Scottish Water and SSE have comprehensive benefits packages.',
    progressionSpeed:
      'Graduate to chartered engineer 5-10 years. Technician to senior technician 3-5 years. Management roles 8+ years.',
    jobSecurity: 'medium-high',
    redundancyRisk:
      'Medium. Oil and gas has cyclical redundancies. Renewables is growing. Utilities are stable. Scotland\u2019s energy transition (ScotWind, hydrogen) is creating new roles.',
    cpdRequirements:
      'Required for professional registration (IEng or CEng). Often employer-funded.',
    qualificationCosts:
      'Engineering institution membership around \u00a3100-200/year. Often employer-funded.',
    noticePeriod: 'Typically 1 month at entry, 3 months at senior level.',
    stressLevel: 3,
    stressExplanation:
      '3/5 onshore. 3-4/5 offshore (isolation, safety-critical environment, weather). 4/5 in utilities emergency response.',
    workLifeBalance: 3,
    workLifeExplanation:
      '3-4/5 onshore with hybrid. 3/5 offshore (2 weeks on / 2 weeks off gives extended time off but total absence from home during rotation).',
    physicalDemands:
      'Office-based for planning and design. Physically active for field roles. Offshore is mixed but safety-demanding.',
    dressCode: 'PPE on sites and offshore (provided). Smart casual in offices.',
    travelRequirements:
      'Significant for field and offshore roles. Aberdeen is the main hub for offshore. Renewables work spreads across Scotland.',
    partTimeAvailability:
      'Available in some office-based roles. Less common offshore.',
    unionRepresentation:
      'Strong union presence in energy. Unite and GMB are prominent. Energy sector union membership is above average.',
  },
]

export function getCareerRealities(sectorSlug: string): CareerRealities | undefined {
  return CAREER_REALITIES.find((r) => r.sectorSlug === sectorSlug)
}

// Maps the `name` column of the `career_sectors` DB table to the slug used in
// CAREER_REALITIES above. The DB has no slug column and the two lists were
// authored independently, so a few names diverge (e.g. "Computing & Digital
// Technology" → "computing-software-and-technology"). Sectors in the data file
// without a DB equivalent (armed-forces-and-emergency-services,
// energy-and-utilities) are intentionally absent from this map.
export const SECTOR_NAME_TO_REALITIES_SLUG: Record<string, string> = {
  'Healthcare & Medicine': 'healthcare-and-medicine',
  'Engineering & Manufacturing': 'engineering-and-manufacturing',
  'Computing & Digital Technology': 'computing-software-and-technology',
  'Science & Research': 'science-and-research',
  'Law & Justice': 'law-and-legal-services',
  'Education & Teaching': 'education-and-teaching',
  'Business & Finance': 'business-and-finance',
  'Creative Arts & Design': 'creative-arts-media-and-design',
  'Media & Communications': 'creative-arts-media-and-design',
  'Social Work & Community': 'social-work-and-community-services',
  'Sport & Fitness': 'sport-fitness-and-leisure',
  'Hospitality & Tourism': 'hospitality-and-tourism',
  'Construction & Trades': 'construction-and-trades',
  'Public Services & Government': 'public-services-and-government',
  'Agriculture & Environment': 'agriculture-environment-and-land-based',
  'Performing Arts & Entertainment': 'creative-arts-media-and-design',
  'Retail & Customer Service': 'retail-and-customer-service',
  'Transport & Logistics': 'transport-and-logistics',
}

export type RemoteWorkClassification = 'on-site' | 'hybrid'

// Buckets the free-text `remoteHybrid` description into the two labels used by
// the careers listing badge. Order of checks matters: a "Mostly on-site"
// sector that mentions limited hybrid for senior admin still classifies as
// on-site for the entry-level audience this site serves. No sector in the
// dataset is fully remote, so the function intentionally only returns two
// values rather than three.
export function classifyRemoteWork(remoteHybrid: string): RemoteWorkClassification {
  const lower = remoteHybrid.toLowerCase()
  if (
    /^mostly on-site|^almost entirely on-site|^trades are almost entirely on-site|^operational roles are 95-100% on-site|^shop floor is 100% on-site|^farm, forestry|entirely on-site/.test(
      lower
    )
  ) {
    return 'on-site'
  }
  if (
    /^often hybrid|^hybrid is common|^high hybrid|^strong hybrid|^many firms now offer hybrid|^mixed|office-based.*often hybrid/.test(
      lower
    )
  ) {
    return 'hybrid'
  }
  // Catch sectors whose lead clause is on-site but where hybrid is explicitly
  // available for office/admin roles (engineering, sciences). These phrases
  // never occur in the same text as a "mostly on-site" lead, so they're safe
  // to treat as a hybrid signal here.
  if (/may be hybrid|can be remote|businesses offer hybrid|fully remote-capable/.test(lower)) {
    return 'hybrid'
  }
  return 'on-site'
}

export function getCareerRealitiesBySectorName(
  sectorName: string | null | undefined
): CareerRealities | undefined {
  if (!sectorName) return undefined
  const slug = SECTOR_NAME_TO_REALITIES_SLUG[sectorName]
  return slug ? getCareerRealities(slug) : undefined
}
