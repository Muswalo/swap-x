-- Add desired location and ministry preferences to profiles table
-- This allows users to set their swap preferences in their profile

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS desired_district TEXT,
ADD COLUMN IF NOT EXISTS desired_ministry TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_desired_district ON profiles(desired_district);
CREATE INDEX IF NOT EXISTS idx_profiles_desired_ministry ON profiles(desired_ministry);

-- Update the database types if needed
COMMENT ON COLUMN profiles.desired_district IS 'User preferred district for swapping';
COMMENT ON COLUMN profiles.desired_ministry IS 'User preferred ministry for swapping';