-- # n8n Database Schema Documentation

-- ## Core Tables

-- ### Users
-- - Primary table for user management
-- - Fields:
--   - id (uuid): Primary key
--   - email (varchar): User email
--   - firstName (varchar): First name
--   - lastName (varchar): Last name
--   - password (varchar): Hashed password
--   - role (text): User role
--   - settings (json): User preferences
--   - disabled (boolean): Account status
--   - mfaEnabled (boolean): Multi-factor auth status
--   - createdAt (timestamp): Creation timestamp
--   - updatedAt (timestamp): Last update timestamp

-- ### Workflows
-- - Stores automation workflows
-- - Fields:
--   - id (int): Primary key
--   - name (varchar): Workflow name
--   - active (boolean): Whether workflow is active
--   - nodes (json): Node configurations
--   - connections (json): Node connections
--   - settings (json): Workflow settings
--   - staticData (json): Static workflow data
--   - userId (uuid): Owner reference
--   - shared (boolean): Sharing status
--   - createdAt (timestamp): Creation timestamp
--   - updatedAt (timestamp): Last update timestamp

-- ### Credentials
-- - Stores encrypted credentials
-- - Fields:
--   - id (int): Primary key
--   - name (varchar): Credential name
--   - data (text): Encrypted credential data
--   - type (varchar): Credential type
--   - userId (uuid): Owner reference
--   - createdAt (timestamp): Creation timestamp
--   - updatedAt (timestamp): Last update timestamp

-- ### Tags
-- - Workflow and credential organization
-- - Fields:
--   - id (int): Primary key
--   - name (varchar): Tag name
--   - createdAt (timestamp): Creation timestamp
--   - updatedAt (timestamp): Last update timestamp

-- ### Workflow Statistics
-- - Execution statistics for workflows
-- - Fields:
--   - workflowId (int): Reference to workflow
--   - count (int): Execution count
--   - latestEvent (timestamp): Latest execution
--   - name (varchar): Statistics name
--   - data (json): Additional data

-- ### Execution
-- - Workflow execution history
-- - Fields:
--   - id (int): Primary key
--   - workflowId (int): Reference to workflow
--   - finished (boolean): Execution status
--   - mode (varchar): Execution mode
--   - retryOf (varchar): Original execution ID if retry
--   - retrySuccessId (varchar): Successful retry reference
--   - startedAt (timestamp): Start time
--   - stoppedAt (timestamp): End time
--   - data (json): Execution data

-- ## Relationships

-- 1. Workflows -> Users
--    - userId references Users(id)
--    - Tracks workflow ownership

-- 2. Credentials -> Users
--    - userId references Users(id)
--    - Manages credential ownership

-- 3. WorkflowStatistics -> Workflows
--    - workflowId references Workflows(id)
--    - Tracks workflow performance

-- 4. Execution -> Workflows
--    - workflowId references Workflows(id)
--    - Records workflow execution history

-- ## Indexes

-- 1. Users
--    - email_idx (email)
--    - role_idx (role)

-- 2. Workflows
--    - name_idx (name)
--    - userId_idx (userId)

-- 3. Credentials
--    - type_idx (type)
--    - userId_idx (userId)

-- 4. Execution
--    - workflowId_idx (workflowId)
--    - status_idx (status)

-- ## Notes

-- 1. Database Migrations
--    - Located in `packages/cli/src/databases/migrations/`
--    - Separate migrations for PostgreSQL, MySQL, and SQLite
--    - Migration files follow TypeORM naming convention

-- 2. Entity Definitions
--    - Located in `packages/cli/src/databases/entities/`
--    - Use TypeORM decorators for schema definition
--    - Support multiple database types

-- 3. Configuration
--    - Database settings in environment variables
--    - Supports PostgreSQL, MySQL, MariaDB, SQLite
--    - Auto-migration on startup

-- Function to sync Supabase user to n8n
CREATE OR REPLACE FUNCTION public.sync_first_auth_user_to_n8n()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    existing_owner_id uuid;
BEGIN
    -- Find existing owner
    SELECT id INTO existing_owner_id 
    FROM public."user" 
    WHERE role = 'global:owner' 
    LIMIT 1;

    IF existing_owner_id IS NOT NULL THEN
        RAISE NOTICE 'Updating n8n owner: old_id=%, new_id=%, email=%', 
            existing_owner_id,
            NEW.id,
            NEW.email;

        -- Clone the owner with new data
        INSERT INTO public."user" (
            "id", 
            "email", 
            "firstName",
            "lastName", 
            "password", 
            "role", 
            "settings", 
            "disabled", 
            "mfaEnabled", 
            "createdAt", 
            "updatedAt"
        )
        SELECT 
            NEW.id,                      -- use Supabase auth UUID
            NEW.email,                   -- from auth
            COALESCE(
                NEW.raw_user_meta_data->>'name',
                split_part(NEW.email, '@', 1)
            ),
            '',                          -- empty lastName
            NEW.encrypted_password,      -- from auth
            "role",                      -- keep existing role
            "settings",                  -- keep existing settings
            "disabled",
            "mfaEnabled",
            NEW.created_at,
            NEW.created_at
        FROM public."user"
        WHERE id = existing_owner_id;

        -- Update project relations
        UPDATE public."project_relation"
        SET "userId" = NEW.id
        WHERE "userId" = existing_owner_id;

        -- Delete old owner
        DELETE FROM public."user" WHERE id = existing_owner_id;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in sync_first_auth_user_to_n8n: % %, Raw meta data: %', 
        SQLERRM, 
        SQLSTATE,
        NEW.raw_user_meta_data;
    RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created_n8n ON auth.users;

CREATE TRIGGER on_auth_user_created_n8n
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_first_auth_user_to_n8n();

-- Set up permissions
GRANT USAGE ON SCHEMA public TO postgres, supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, supabase_auth_admin;