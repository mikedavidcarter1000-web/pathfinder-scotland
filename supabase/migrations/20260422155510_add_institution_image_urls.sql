-- Add card/hero image URLs for institution selector and detail pages.

ALTER TABLE universities ADD COLUMN IF NOT EXISTS card_image_url text;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS hero_image_url text;

ALTER TABLE colleges ADD COLUMN IF NOT EXISTS card_image_url text;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS hero_image_url text;
