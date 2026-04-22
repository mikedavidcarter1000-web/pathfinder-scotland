-- Add image_url to universities and colleges tables
ALTER TABLE public.universities ADD COLUMN image_url TEXT DEFAULT '/logo-icon.png';
ALTER TABLE public.colleges ADD COLUMN image_url TEXT DEFAULT '/logo-icon.png';
