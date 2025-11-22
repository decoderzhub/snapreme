/*
  # Add card_image_url column to creators table

  1. Changes
    - Add `card_image_url` text column to `creators` table
    - This field stores the URL for the card/thumbnail image displayed in creator grids

  2. Notes
    - This is used by the CreatorCard component on the homepage and network page
    - Existing creators will have null values until they upload a card image
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'card_image_url'
  ) THEN
    ALTER TABLE creators ADD COLUMN card_image_url text;
  END IF;
END $$;