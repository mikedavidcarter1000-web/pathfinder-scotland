UPDATE public.career_roles SET
  ai_rating_2035_2045       = 3,
  robotics_rating_2030_2035 = 2,
  robotics_rating_2040_2045 = 3,
  robotics_description      = 'Plumbing involves deeply unstructured environments -- different buildings, inaccessible pipework, non-standard fittings -- that defeat current robotic manipulation. By the early 2030s robotic tools assist with pipe cutting and pressure testing in new-build settings, but core fault diagnosis and installation in occupied buildings remains human. The mid-career increase to 3 reflects incremental dexterity improvements rather than role-level displacement; the unstructured domestic environment and regulatory sign-off requirement keep robotics peripheral through both horizons.'
WHERE id = 'ee5efbee-25af-4e68-b1f7-39a19d9b901a';

UPDATE public.career_roles SET
  ai_rating_2035_2045       = 4,
  robotics_rating_2030_2035 = 2,
  robotics_rating_2040_2045 = 4,
  robotics_description      = 'Core electrical work demands fine-motor dexterity, spatial reasoning in cramped voids, and safety-critical judgement in environments robots cannot reliably interpret. By 2030-2035 robotic tools assist with cable routing in new-build structures and conduit runs in factory settings, but fault-finding and domestic rewiring remain firmly human. The jump to 4 by 2040-2045 reflects wider deployment of collaborative robots in commercial construction; Scotland''s older housing stock and mixed-age building fabric slows adoption relative to England''s newer build programme.'
WHERE id = 'd89a6072-656f-4957-b59c-b872b917e657';

UPDATE public.career_roles SET
  ai_rating_2035_2045       = 4,
  robotics_rating_2030_2035 = 1,
  robotics_rating_2040_2045 = 2,
  robotics_description      = 'Physical classroom management, pastoral relationships, and the requirement for a GTCS-registered practitioner anchor Primary Teacher at near-zero robotics exposure through both horizons. Early-career sees robotic classroom peripherals trialled in some settings (physical computing aids, tablet-delivery robots), but these are supplementary tools rather than displacement. The drift from 1 to 2 by mid-career reflects mainstream adoption of robotic classroom assistants, not any threat to the teacher role itself.'
WHERE id = '2ee40558-838e-4041-bb67-9581650a9ca7';

UPDATE public.career_roles SET
  ai_rating_2035_2045       = 5,
  robotics_rating_2030_2035 = 3,
  robotics_rating_2040_2045 = 4,
  robotics_description      = 'Robotic patient-handling aids and automated CPR devices (AutoPulse-class) are already deployed in Scottish ambulance services, and monitoring automation continues to expand through 2030-2035. Core paramedic work -- dynamic scene assessment, unstructured access, complex patient management -- is deeply unstructured and resists full automation. The mid-career drift to 4 reflects wider deployment of autonomous ambulance logistics on hospital campuses and drone-delivered first-responder kits in remote Highland and island areas, freeing paramedics for higher-acuity work rather than displacing them.'
WHERE id = 'd4f09a21-51d9-4a2d-b069-41d4e5eb5e4e';

UPDATE public.career_roles SET
  ai_rating_2035_2045       = 5,
  robotics_rating_2030_2035 = 2,
  robotics_rating_2040_2045 = 3,
  robotics_description      = 'GP work is out-of-hospital, unstructured, and relationship-dependent; the GMC registration requirement and therapeutic relationship keep robotics peripheral in primary care through both horizons. Robotic diagnostics augment the consultation (automated auscultation, skin lesion imaging) but do not replace the practitioner. The drift from 2 to 3 by mid-career reflects AI-assisted diagnostic devices becoming standard consultation tools, increasing the robotic footprint in the room without displacing the clinician.'
WHERE id = '47764fc6-985e-4c02-8f61-877aaab678b9';

UPDATE public.career_roles SET
  ai_rating_2035_2045       = 5,
  robotics_rating_2030_2035 = 3,
  robotics_rating_2040_2045 = 4,
  robotics_description      = 'Robotic lifting aids, medication dispensing systems, and automated vital signs monitoring are already deployed across NHS Scotland wards and continue to expand through 2030-2035. Core nursing -- patient assessment, therapeutic care, clinical judgement, NMC accountability -- remains firmly human through both horizons. The drift from 3 to 4 by mid-career reflects autonomous logistics robots in hospital corridors and robotic pharmacy dispensing becoming the NHS Scotland standard, displacing physical transport and dispensing tasks while leaving frontline care unchanged.'
WHERE id = '3871eba8-df22-4bf8-8d20-d3047b94d596';

UPDATE public.career_roles SET
  ai_rating_2035_2045       = 3,
  robotics_rating_2030_2035 = 1,
  robotics_rating_2040_2045 = 1,
  robotics_description      = 'Social work is built on human relationships, ethical judgement in complex family situations, and SSSC-registered professional accountability that cannot be delegated to machines. The physical environments of home visits, case conferences, and crisis interventions are unstructured and unpredictable in ways that defeat robotic deployment. No credible robotics path exists across either horizon; both ratings of 1 reflect that the profession is structurally protected from physical automation regardless of technical advances elsewhere.'
WHERE id = '9428b809-d630-4ecf-841a-29080bbda1fb';

UPDATE public.career_roles SET
  ai_rating_2035_2045       = 9,
  robotics_rating_2030_2035 = 1,
  robotics_rating_2040_2045 = 1,
  robotics_description      = 'Software development is entirely cognitive and screen-based; there is no physical task for robotics to displace. Junior roles that shift substantially toward AI-assisted and AI-supervised coding (reflected in the high ai_rating_2035_2045) are still executed by a human at a keyboard or equivalent interface. Both robotics ratings are 1 by definition: this is knowledge work with no embodied dimension.'
WHERE id = '0aac8ad5-cee1-403b-a097-9d10dad2cbcc';

UPDATE public.career_roles SET
  ai_rating_2035_2045       = 8,
  robotics_rating_2030_2035 = 1,
  robotics_rating_2040_2045 = 1,
  robotics_description      = 'Senior software development is purely cognitive, architectural, and collaborative; no physical manipulation is involved at any seniority level. The challenge for this role is AI cognitive automation (reflected in ai_rating_2035_2045 = 8), not physical automation. Both robotics ratings are 1 regardless of horizon.'
WHERE id = '70533e10-9f52-4195-b480-99123273c071';

UPDATE public.career_roles SET
  ai_rating_2035_2045       = 8,
  robotics_rating_2030_2035 = 8,
  robotics_rating_2040_2045 = 9,
  robotics_description      = 'Scottish distribution centres (Amazon Dunfermline, M&S Motherwell) are already deploying autonomous mobile robots for pick-and-pack, with operatives increasingly serving as exception handlers by 2030-2035. Humanoid robots capable of fully unstructured warehouse tasks reach commercial maturity by 2028-2030, and by 2040-2045 most routine operative functions -- picking, packing, palletising, transport -- are automated in large facilities. The jump from 8 to 9 mid-career reflects the transition from most-tasks-automated to primarily-supervisory; smaller warehouses and rural Scottish distribution points retain human staff longer due to lower deployment economics.'
WHERE id = 'fc77f34e-72fe-4e37-9078-6557cc4991c1';

UPDATE public.career_roles SET
  ai_rating_2035_2045       = 7,
  robotics_rating_2030_2035 = 6,
  robotics_rating_2040_2045 = 8,
  robotics_description      = 'Last-mile autonomous vehicle deployment reaches urban Scottish routes (Edinburgh, Glasgow, Aberdeen) in the early 2030s for light freight, and drone delivery becomes commercially mainstream for rural and island delivery by the same period. The early-career rating of 6 reflects that most traditional routes are impacted but human drivers remain essential for complex urban scenarios, customer interactions, and rural terrain. By mid-career the majority of standardised delivery roles in structured environments are automated, with surviving human roles concentrated on white-glove service, complex access, and high-value deliveries.'
WHERE id = '68b699de-7aa2-43d4-a056-92512932a833';

UPDATE public.career_roles SET
  ai_rating_2035_2045       = 7,
  robotics_rating_2030_2035 = 7,
  robotics_rating_2040_2045 = 9,
  robotics_description      = 'Long-haul autonomous trucking on motorway corridors (A9, M8, M74) reaches commercial maturity by the early 2030s, displacing the majority of trunk haulage roles as Level 4 autonomous HGV approval arrives by 2028-2030. The early-career rating of 7 reflects significant displacement already underway in structured motorway logistics, with human drivers concentrating on complex, high-discretion work. By mid-career surviving human HGV roles are concentrated on abnormal loads, Highland and island routes where terrain and low fleet density make automation uneconomic, and specialist haulage -- Scottish logistics geography meaningfully extends the human-driver period relative to the England-centric average.'
WHERE id = 'd606e62a-ac04-420d-9389-5214d6c188eb';

UPDATE public.career_roles SET
  ai_rating_2035_2045       = 8,
  robotics_rating_2030_2035 = 2,
  robotics_rating_2040_2045 = 3,
  robotics_description      = 'Architecture involves physical site visits, client relationships, design coordination, and ARB-registered professional sign-off that limit direct robotics exposure; the role is primarily cognitive and relational. Robotic fabrication (CNC cutting, 3D-printed structural elements, brick-laying robots) reshapes the construction process the architect specifies but does not directly displace the architect''s work. The drift from 2 to 3 by mid-career reflects robotic fabrication becoming central to the project delivery chain, meaning architects must increasingly design for robotic construction tolerances -- a workflow change rather than a displacement.'
WHERE id = 'c43326d1-fe78-42fd-a22e-76f37d1d47de';

UPDATE public.career_roles SET
  ai_rating_2035_2045       = 4,
  robotics_rating_2030_2035 = 7,
  robotics_rating_2040_2045 = 8,
  robotics_description      = 'Industrial welding is already heavily automated in Scottish manufacturing (Spirit AeroSystems Prestwick, Doosan Babcock Renfrew), with robotic welding cells handling repetitive high-volume seam work. By 2030-2035 collaborative robots and vision-guided systems extend automation to more varied fabrication tasks, leaving human welders on complex, low-volume, or safety-critical work requiring manual dexterity and inspection judgement. The mid-career drift to 8 reflects robotic welding reaching custom fabrication and repair work, with surviving human welders concentrated on heritage and specialist applications, site-based structural work, and quality sign-off roles.'
WHERE id = 'bdf9a653-388c-41ae-91b0-b32575a8c159';

UPDATE public.career_roles SET
  ai_rating_2035_2045       = 4,
  robotics_rating_2030_2035 = 5,
  robotics_rating_2040_2045 = 7,
  robotics_description      = 'High-volume commercial kitchens in Scotland (contract catering, hotel chains, institutional feeding) deploy robotic food assembly, automated frying, and controlled-atmosphere cooking through the early 2030s, shifting the head chef role toward quality control and menu development. The early-career rating of 5 reflects robotic systems handling standardised high-repetition tasks while skilled kitchen craft -- sauce work, live service judgement, plating -- remains human. By mid-career most chain and volume kitchen functions are hybrid human-robot and robotic kitchen systems are standard in hospital and university catering; independent and fine-dining kitchens retain the human craft dimension but represent a shrinking share of the overall chef market.'
WHERE id = '5ec417d0-00fd-4605-a803-c33a0cefbf3f';
