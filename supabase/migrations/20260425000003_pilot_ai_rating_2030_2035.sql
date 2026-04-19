-- Set ai_rating_2030_2035 for all 15 pilot roles
UPDATE public.career_roles
SET ai_rating_2030_2035 = CASE title
  WHEN 'Plumber'                     THEN 2
  WHEN 'Electrician'                 THEN 3
  WHEN 'Primary Teacher'             THEN 3
  WHEN 'Paramedic'                   THEN 4
  WHEN 'Doctor / GP'                 THEN 4
  WHEN 'Nurse'                       THEN 4
  WHEN 'Social Worker'               THEN 3
  WHEN 'Junior Software Developer'   THEN 8
  WHEN 'Senior Software Developer'   THEN 7
  WHEN 'Warehouse Operative'         THEN 7
  WHEN 'Delivery Driver'             THEN 6
  WHEN 'HGV Driver'                  THEN 5
  WHEN 'Architect'                   THEN 7
  WHEN 'Welder / Fabricator'         THEN 3
  WHEN 'Chef (Professional Kitchen)' THEN 3
END
WHERE title IN (
  'Plumber','Electrician','Primary Teacher','Paramedic','Doctor / GP',
  'Nurse','Social Worker','Junior Software Developer','Senior Software Developer',
  'Warehouse Operative','Delivery Driver','HGV Driver','Architect',
  'Welder / Fabricator','Chef (Professional Kitchen)'
);

-- GP fix: correct ai_rating_2040_2045 and robotics ratings (under-rated in prior session)
UPDATE public.career_roles
SET ai_rating_2040_2045      = 6,
    robotics_rating_2030_2035 = 3,
    robotics_rating_2040_2045 = 4
WHERE title = 'Doctor / GP';

-- Architect fix: correct pre-existing ai_rating mis-rating (3→6, rubric band "heavy AI augmentation")
UPDATE public.career_roles
SET ai_rating = 6
WHERE title = 'Architect';
