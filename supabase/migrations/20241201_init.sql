-- Only create our sync functions and triggers
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_speckle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    speckle_user_id TEXT;
BEGIN
    -- Generate Speckle user ID (10 chars) using uuid instead
    speckle_user_id := substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);

    RAISE NOTICE 'New user data: id=%, email=%, raw_user_meta_data=%', 
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data;

    INSERT INTO public.users (
        id,                -- Speckle's short ID
        suuid,            -- Store Supabase UUID here for reference
        name,
        email,
        bio,
        company,
        verified,
        profiles,
        "createdAt"
    ) VALUES (
        speckle_user_id,  -- Short Speckle ID
        NEW.id,           -- Full Supabase UUID
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'bio',
        NEW.raw_user_meta_data->>'company',
        NEW.email_confirmed_at IS NOT NULL,
        NEW.raw_user_meta_data,
        NEW.created_at
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in sync_auth_user_to_speckle: % %, Raw meta data: %', 
        SQLERRM, 
        SQLSTATE,
        NEW.raw_user_meta_data;
    RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_auth_user_to_speckle();

-- Set up permissions
GRANT USAGE ON SCHEMA auth TO postgres, supabase_auth_admin;
GRANT SELECT ON auth.users TO postgres, supabase_auth_admin;