INSERT INTO career_sectors (
  name,
  description,
  display_order,
  example_jobs,
  ai_impact_rating,
  ai_impact_description,
  ai_impact_source,
  ai_sector_narrative,
  sqa_subjects_text,
  apprenticeships_text,
  scottish_context,
  external_links
) VALUES (
  'Armed Forces',
  'The UK Armed Forces -- Army, Royal Navy, Royal Air Force, and Royal Marines -- are a major employer in Scotland with key bases at Faslane (HMNB Clyde, submarine service), RAF Lossiemouth (Typhoon quick reaction alert, P-8A Poseidon), Leuchars Station (Army), Kinloss Barracks, and Rosyth dockyard (Babcock marine engineering). Scottish regiments and units have strong community recruitment ties across the country.',
  19,
  ARRAY[
    'Army Officer',
    'Army Soldier',
    'Royal Navy Officer',
    'Royal Navy Rating',
    'RAF Officer',
    'RAF Airman / Airwoman',
    'Royal Marines Commando'
  ],
  'human-centric',
  'AI is reshaping logistics, intelligence analysis, tactical simulation, and autonomous systems management across all three services. Operational command, physical readiness, and combat leadership remain human-led, with regulatory and constitutional accountability remaining firmly with personnel.',
  'Based on research by Anthropic (2024), OpenAI/University of Pennsylvania (2023), and McKinsey Global Institute (2023). Last updated April 2026.',
  'The Armed Forces are undergoing sustained technical modernisation with autonomous vehicles, AI-assisted sensor fusion, drone fleets, and predictive maintenance becoming standard in operational and support roles. However, the core military requirement -- leadership under pressure, physical deployment, command accountability, and the ethical use of force -- remains human. Officers and soldiers increasingly supervise and interpret AI-generated intelligence rather than relying on instinct alone, but the human element in UK defence is constitutionally and operationally non-negotiable.',
  'No formal subject gate for most enlisted entry routes, though Maths and English at National 5 are a minimum standard. Officer candidates typically need 5 Highers at grade B/C minimum (or equivalent UCAS tariff). Technical trade routes -- aviation engineering, weapons engineering, medical -- require specific Highers in Maths, Physics, or Chemistry. STEM Higher qualifications strengthen applications across all technical specialisms.',
  'MOD-run apprenticeship programmes operate independently of Skills Development Scotland. The Army Apprenticeship Scheme, RAF Apprenticeships, and Royal Navy Apprenticeship Programme cover engineering, logistics, communications, IT, and healthcare trades. These are MOD-funded and delivered, not through the Scottish Apprenticeship system. Most MOD apprenticeships align to approximately SCQF Level 6-7, with some Level 8 routes in specialist trades.',
  'Scotland hosts a significant share of UK defence infrastructure: HMNB Clyde at Faslane (strategic submarine base, Trident deterrent), Coulport (nuclear weapons storage), RAF Lossiemouth in Moray (Typhoon QRA squadrons, P-8A Poseidon maritime patrol), Leuchars Station in Fife (Army, 1 Scots), Kinloss Barracks (Moray), and Rosyth dockyard (Babcock, Type 26/31 frigate construction support). Scottish regiments -- Royal Regiment of Scotland, Royal Scots Dragoon Guards, Scots Guards, Royal Scots Borderers -- have strong historic community ties and recruit actively across Scotland.',
  '[]'::jsonb
);
