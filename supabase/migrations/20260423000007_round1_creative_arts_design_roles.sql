-- Round 1 careers expansion: Creative Arts & Design (+4 roles)
-- Source research: docs/research/round1/creative-arts-design.md
-- Salary source: ONS ASHE 2025 (scripts/ashe/ashe-2025-scotland.json, ashe-2025-uk.json)

-- Games Artist -- SOC 2142 (Graphic and multimedia designers)
-- Scotland p50 = 32457, UK p25 = 25778, p50 = 31236, p75 = 38814
INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  'a7814001-4ed2-4488-9a8f-36c35273c747',
  'Games Artist',
  6,
  'Games Artists create the visual assets for video games: concept art, character models, environments, props, textures, UI and in-game animation, working in engines such as Unity and Unreal alongside designers and programmers. The Scottish route is strongest through BA (Hons) Games Art at Abertay University Dundee (the UK''s first dedicated games university), with BDes Animation at Duncan of Jordanstone College of Art and Design (Dundee) and BA Communication Design at Glasgow School of Art also feeding the industry, backed by a polished portfolio of rendered assets. Dundee hosts Rockstar North''s studio (Grand Theft Auto franchise), 4J Studios (Minecraft console ports) and Outplay Entertainment, making it the densest games cluster in the UK and a genuine career destination for Scottish school leavers; generative AI can produce concept art and low-end game assets, but AAA studio art direction and craft remain human-led.',
  false,
  'Growing',
  '2142',
  26000,
  39000,
  32500,
  26000,
  31000,
  39000,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'SOC 2142 (Graphic and multimedia designers) used -- shared unit group with Graphic Designer, Prompt Artist, Animator and Illustrator; ASHE median is a pooled figure across all four disciplines. Scotland p50 (32457) available; Scotland p25/p75 suppressed. UK p25 (25778), p50 (31236) and p75 (38814) used for entry and experienced percentiles. Creative sector pay varies widely between employed and freelance routes. ASHE captures only PAYE-employed earnings; most Illustrators, Animators, Fine Artists and many Fashion / Textile designers work freelance with income ranging from minimal to six-figure depending on reputation and client base. Verify against Creative Scotland Freelance Fair Fees Toolkit and sector-specific union rates (BECTU for screen/broadcast, AOI for illustration) before pilot. Scottish games industry pay (Dundee hub) often exceeds ASHE creative median due to studio competition for talent. Verify against TIGA salary survey and individual studio published ranges (Rockstar Dundee, 4J Studios, Outplay).'
);

-- Animator -- SOC 2142 (Graphic and multimedia designers)
INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  'a7814001-4ed2-4488-9a8f-36c35273c747',
  'Animator',
  6,
  'Animators bring characters, objects and motion graphics to life using 2D or 3D software such as Blender, Maya, After Effects and Toon Boom, working across film, television, games, advertising and broadcast; day-to-day work includes storyboarding, rigging, keyframing, rendering and compositing. Entry is usually via BA (Hons) Animation at Edinburgh College of Art, BDes Animation at Duncan of Jordanstone (Dundee) or BA Animation at Glasgow School of Art, all backed by a strong showreel rather than transcripts alone. Scottish studios include Axis Animation and Blazing Griffin in Glasgow plus Iris Animation in Edinburgh, and generative video tools (Sora, Veo) are beginning to disrupt routine commercial animation while feature-film and character animation remain firmly human-led.',
  false,
  'Stable-Growing',
  '2142',
  26000,
  39000,
  32500,
  26000,
  31000,
  39000,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'SOC 2142 (Graphic and multimedia designers) used -- shared unit group with Graphic Designer, Prompt Artist, Games Artist and Illustrator; ASHE median is a pooled figure across all five disciplines. Scotland p50 (32457) available; Scotland p25/p75 suppressed. UK p25 (25778), p50 (31236) and p75 (38814) used for entry and experienced percentiles. Creative sector pay varies widely between employed and freelance routes. ASHE captures only PAYE-employed earnings; most Illustrators, Animators, Fine Artists and many Fashion / Textile designers work freelance with income ranging from minimal to six-figure depending on reputation and client base. Verify against Creative Scotland Freelance Fair Fees Toolkit and sector-specific union rates (BECTU for screen/broadcast, AOI for illustration) before pilot.'
);

-- Fashion Designer -- SOC 3422 (Clothing, fashion and accessories designers)
-- Scotland all suppressed; UK p50 = 36731 only; 1.2x creative multiplier applied for entry/experienced
INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  'a7814001-4ed2-4488-9a8f-36c35273c747',
  'Fashion Designer',
  3,
  'Fashion Designers research trends, sketch garments, select fabrics, cut patterns, fit samples and liaise with manufacturers to bring clothing and accessory collections from concept to shop floor or runway. The Scottish route runs through BA (Hons) Fashion at Edinburgh College of Art and BA (Hons) Fashion Design at Glasgow School of Art, with internships at brands and membership of the Chartered Society of Designers (CSD) or listing with the British Fashion Council supporting progression into in-house, freelance or own-label practice. Scottish heritage names Harris Tweed, Johnstons of Elgin and Pringle of Scotland sit alongside contemporary Scottish-trained designers Christopher Kane and Holly Fulton, and the embodied craft of pattern cutting, fabric handling and fit decisions is genuinely resistant to AI automation even as trend analysis and pattern generation are increasingly AI-assisted.',
  false,
  'Stable',
  '3422',
  30500,
  44000,
  NULL,
  30500,
  37000,
  44000,
  'ONS ASHE 2025 (UK fallback -- Scotland data suppressed) + 1.2x creative multiplier',
  CURRENT_DATE,
  true,
  'SOC 3422 (Clothing, fashion and accessories designers) used. Scotland p25/p50/p75 all suppressed; UK p25 and p75 also suppressed; only UK p50 (36731) available. Entry (30500) derived as UK p50 / 1.2 and experienced (44000) as UK p50 x 1.2 per creative-sector multiplier default. SOC 3422 is a catch-all for clothing, fashion and accessories designers; actual pay varies significantly between in-house high-street brand designers, luxury-house designers and independent or freelance makers. Creative sector pay varies widely between employed and freelance routes. ASHE captures only PAYE-employed earnings; most Illustrators, Animators, Fine Artists and many Fashion / Textile designers work freelance with income ranging from minimal to six-figure depending on reputation and client base. Verify against Creative Scotland Freelance Fair Fees Toolkit and sector-specific union rates (BECTU for screen/broadcast, AOI for illustration) before pilot.'
);

-- Illustrator -- SOC 2142 (Graphic and multimedia designers)
INSERT INTO public.career_roles (
  career_sector_id, title, ai_rating, ai_description,
  is_new_ai_role, growth_outlook,
  soc_code_2020, salary_entry, salary_experienced,
  salary_median_scotland, salary_entry_uk, salary_median_uk, salary_experienced_uk,
  salary_source, salary_last_updated, salary_needs_verification, salary_notes
) VALUES (
  'a7814001-4ed2-4488-9a8f-36c35273c747',
  'Illustrator',
  7,
  'Illustrators produce hand-drawn or digital images for books, magazines, packaging, apps, editorial and advertising, usually working freelance on commission briefs and delivering final artwork digitally. Entry is commonly via BA (Hons) Illustration at Edinburgh College of Art, BDes Illustration at Duncan of Jordanstone (Dundee) or the Communication Design pathway at Glasgow School of Art, with membership of the Association of Illustrators (AOI) supporting commercial practice, contracts and rate benchmarks. Scottish publishers Canongate and Floris Books plus editorial outlets such as The List magazine provide local commissioning work, but generative AI tools (Midjourney, DALL-E, Adobe Firefly) are displacing routine stock and editorial illustration at pace, leaving bespoke, brand-specific and distinctive-style work as the more defensible end of the market.',
  false,
  'Declining',
  '2142',
  26000,
  39000,
  32500,
  26000,
  31000,
  39000,
  'ONS ASHE 2025 (Scotland median + UK percentiles)',
  CURRENT_DATE,
  true,
  'SOC 2142 (Graphic and multimedia designers) used -- shared unit group with Graphic Designer, Prompt Artist, Games Artist and Animator; ASHE median is a pooled figure across all five disciplines. Scotland p50 (32457) available; Scotland p25/p75 suppressed. UK p25 (25778), p50 (31236) and p75 (38814) used for entry and experienced percentiles. ASHE figures under-represent illustrator earnings because most practitioners are freelance / self-employed and therefore excluded from the PAYE-only ASHE sample. Creative sector pay varies widely between employed and freelance routes. Verify against Creative Scotland Freelance Fair Fees Toolkit and the Association of Illustrators (AOI) Pricing Guide before pilot.'
);
