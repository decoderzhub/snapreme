/*
  # Create Storage Buckets for Profile Images

  ## Summary
  Creates storage buckets for user-uploaded profile images (avatars and covers)
  with appropriate access policies for authenticated users.

  ## New Buckets
  
  ### profile-images
  - Stores user avatar and cover images
  - Public read access for all images
  - Authenticated users can upload their own images
  - Users can update and delete only their own images
  
  ## Security
  - Public bucket allows anyone to view images via URL
  - RLS policies restrict upload/update/delete to authenticated users
  - File path includes user_id for organization and security
  - Policies verify that user_id in path matches authenticated user
*/

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload their own profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all profile images
CREATE POLICY "Public read access for profile images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Allow users to update their own profile images
CREATE POLICY "Users can update their own profile images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
