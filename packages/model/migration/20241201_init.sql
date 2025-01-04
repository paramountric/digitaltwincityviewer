-- Only create our sync functions and triggers
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_speckle()
RETURNS TRIGGER AS $$
DECLARE
    speckle_user_id TEXT;
BEGIN
    -- Generate Speckle user ID (10 chars)
    speckle_user_id := substr(encode(gen_random_bytes(8), 'hex'), 1, 10);

    -- Insert into Speckle users table
    INSERT INTO users (
        id,
        name,
        email,
        bio,
        company,
        verified,
        profiles,
        "createdAt"
    ) VALUES (
        speckle_user_id,
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
    RAISE WARNING 'Error in sync_auth_user_to_speckle: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_auth_user_to_speckle();

-- Set up permissions
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT SELECT ON auth.users TO postgres;