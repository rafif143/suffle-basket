-- ============================================================
-- SUPABASE AUTH MIGRATION
-- ============================================================
-- This script sets up Supabase Auth integration
-- ============================================================

-- 1. Create profiles table (for additional user data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'organizer' CHECK (role IN ('admin', 'organizer')),
  full_name TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, username)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'organizer'),
    SPLIT_PART(NEW.email, '@', 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Migrate existing users (if any)
-- Run this manually if you have existing users to migrate
/*
INSERT INTO public.profiles (id, username, role, full_name, email, is_active)
SELECT 
  id,
  SPLIT_PART(email, '@', 1) as username,
  role,
  full_name,
  email,
  is_active
FROM users
WHERE id NOT IN (SELECT id FROM public.profiles);
*/

-- 7. Update existing tables to use auth.uid() instead of custom user lookup
-- Example for registrations table:
-- ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_user_fkey;
-- ALTER TABLE registrations ADD CONSTRAINT registrations_user_fkey 
--   FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Check if everything is set up correctly:

-- SELECT COUNT(*) FROM auth.users; -- Should show existing users
-- SELECT COUNT(*) FROM public.profiles; -- Should show profiles

-- ============================================================
-- ROLLBACK (if needed)
-- ============================================================
/*
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles;
*/
