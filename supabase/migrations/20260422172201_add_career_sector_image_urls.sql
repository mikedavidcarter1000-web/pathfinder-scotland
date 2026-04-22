-- Add card/hero image URLs for career sector listing and detail pages.

ALTER TABLE career_sectors ADD COLUMN IF NOT EXISTS hero_image_url text;
ALTER TABLE career_sectors ADD COLUMN IF NOT EXISTS card_image_url text;
