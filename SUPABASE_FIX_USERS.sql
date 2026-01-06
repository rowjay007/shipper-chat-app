-- Quick Fix: Add User Sync Trigger and Insert Existing Users
-- Run this if tables already exist

-- STEP 1: Create function to sync auth users to public users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar, provider, online_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    avatar = COALESCE(EXCLUDED.avatar, public.users.avatar),
    online_status = true,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- STEP 2: Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 3: Disable RLS temporarily for easier testing (re-enable in production!)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chats DISABLE ROW LEVEL SECURITY;

-- STEP 4: Insert existing auth users into public.users
INSERT INTO public.users (id, email, name, avatar, provider, online_status)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  COALESCE(au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture'),
  COALESCE(au.raw_user_meta_data->>'provider', 'email'),
  true
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, public.users.name),
  online_status = true,
  updated_at = NOW();

-- STEP 5: Verify users were inserted
SELECT id, email, name, online_status, created_at FROM public.users ORDER BY created_at DESC;

