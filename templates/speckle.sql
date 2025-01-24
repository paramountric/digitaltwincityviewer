-- Create base tables first, then tables with foreign key dependencies

-- Users meta table
CREATE TABLE IF NOT EXISTS users_meta (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, key)
);

-- Streams table
CREATE TABLE IF NOT EXISTS streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    description TEXT,
    is_public BOOLEAN,
    cloned_from UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    allow_public_comments BOOLEAN,
    is_discoverable BOOLEAN,
    workspace_id UUID,
    region_key TEXT
);

-- Streams meta table
CREATE TABLE IF NOT EXISTS streams_meta (
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (stream_id, key)
);

-- Stream ACL
CREATE TABLE IF NOT EXISTS stream_acl (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES streams(id) ON DELETE CASCADE,
    role TEXT,
    PRIMARY KEY (user_id, resource_id)
);

-- Stream favorites
CREATE TABLE IF NOT EXISTS stream_favorites (
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    cursor TEXT,
    PRIMARY KEY (stream_id, user_id)
);

-- Server ACL
CREATE TABLE IF NOT EXISTS server_acl (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT,
    PRIMARY KEY (user_id)
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    text TEXT,
    screenshot TEXT,
    data JSONB,
    archived BOOLEAN,
    parent_comment UUID REFERENCES comments(id) ON DELETE CASCADE
);

-- Comment links
CREATE TABLE IF NOT EXISTS comment_links (
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    resource_id TEXT,
    resource_type TEXT,
    PRIMARY KEY (comment_id, resource_id, resource_type)
);

-- Comment views
CREATE TABLE IF NOT EXISTS comment_views (
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (comment_id, user_id)
);

-- Server invites
CREATE TABLE IF NOT EXISTS server_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target TEXT,
    inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    message TEXT,
    resource TEXT,
    token TEXT
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS pwdreset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Authorization codes
CREATE TABLE IF NOT EXISTS authorization_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    lifespan INTEGER
);

-- API tokens
CREATE TABLE IF NOT EXISTS api_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_digest TEXT,
    owner TEXT,
    name TEXT,
    last_chars TEXT,
    revoked BOOLEAN,
    lifespan INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMPTZ
);

-- Personal API tokens
CREATE TABLE IF NOT EXISTS personal_api_tokens (
    token_id UUID REFERENCES api_tokens(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY (token_id, user_id)
);

-- User server app tokens
CREATE TABLE IF NOT EXISTS user_server_app_tokens (
    app_id TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token_id UUID REFERENCES api_tokens(id) ON DELETE CASCADE,
    PRIMARY KEY (app_id, user_id, token_id)
);

-- Token scopes
CREATE TABLE IF NOT EXISTS token_scopes (
    token_id UUID REFERENCES api_tokens(id) ON DELETE CASCADE,
    scope_name TEXT,
    PRIMARY KEY (token_id, scope_name)
);

-- Email verifications
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN
);

-- Server access requests
CREATE TABLE IF NOT EXISTS server_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_type TEXT,
    resource_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Stream activity
CREATE TABLE IF NOT EXISTS stream_activity (
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE,
    time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resource_type TEXT,
    resource_id UUID,
    action_type TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    info JSONB,
    message TEXT
);

-- User notification preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    preferences JSONB
);

-- Commits
CREATE TABLE IF NOT EXISTS commits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referenced_object TEXT,
    author TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    source_application TEXT,
    total_children_count INTEGER,
    parents JSONB
);

-- Stream commits
CREATE TABLE IF NOT EXISTS stream_commits (
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE,
    commit_id UUID REFERENCES commits(id) ON DELETE CASCADE,
    PRIMARY KEY (stream_id, commit_id)
);

-- Branch commits
CREATE TABLE IF NOT EXISTS branch_commits (
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    commit_id UUID REFERENCES commits(id) ON DELETE CASCADE,
    PRIMARY KEY (branch_id, commit_id)
);

-- Branches
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled tasks
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    task_name TEXT PRIMARY KEY,
    lock_expires_at TIMESTAMPTZ
);

-- Objects
CREATE TABLE IF NOT EXISTS objects (
    id TEXT PRIMARY KEY,
    speckle_type TEXT,
    total_children_count INTEGER,
    total_children_count_by_depth JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    data JSONB,
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE
);

-- File uploads
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE,
    branch_name TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT,
    file_type TEXT,
    file_size BIGINT,
    upload_complete BOOLEAN,
    upload_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    converted_status TEXT,
    converted_last_update TIMESTAMPTZ,
    converted_message TEXT,
    converted_commit_id UUID REFERENCES commits(id) ON DELETE CASCADE
);

-- Server apps scopes
CREATE TABLE IF NOT EXISTS server_apps_scopes (
    app_id TEXT,
    scope_name TEXT,
    PRIMARY KEY (app_id, scope_name)
);

-- Server apps
CREATE TABLE IF NOT EXISTS server_apps (
    id TEXT PRIMARY KEY,
    secret TEXT,
    name TEXT,
    description TEXT,
    terms_and_conditions_link TEXT,
    logo TEXT,
    public BOOLEAN,
    trust_by_default BOOLEAN,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    redirect_url TEXT
);

-- Scopes
CREATE TABLE IF NOT EXISTS scopes (
    name TEXT PRIMARY KEY,
    description TEXT,
    public BOOLEAN
);

-- Token resource access
CREATE TABLE IF NOT EXISTS token_resource_access (
    token_id UUID REFERENCES api_tokens(id) ON DELETE CASCADE,
    resource_type TEXT,
    resource_id UUID,
    PRIMARY KEY (token_id, resource_type, resource_id)
);

-- Automation function runs
CREATE TABLE IF NOT EXISTS automation_function_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id TEXT,
    function_release_id TEXT,
    function_id TEXT,
    elapsed INTEGER,
    status TEXT,
    context_view JSONB,
    status_message TEXT,
    results JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Automation revision functions
CREATE TABLE IF NOT EXISTS automation_revision_functions (
    automation_revision_id UUID REFERENCES automation_revisions(id) ON DELETE CASCADE,
    function_release_id TEXT,
    function_inputs JSONB,
    function_id TEXT,
    PRIMARY KEY (automation_revision_id, function_release_id)
);

-- Automation revisions
CREATE TABLE IF NOT EXISTS automation_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
    active BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    public_key TEXT
);

-- Automation tokens
CREATE TABLE IF NOT EXISTS automation_tokens (
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
    automate_token TEXT,
    PRIMARY KEY (automation_id)
);

-- Automation runs
CREATE TABLE IF NOT EXISTS automation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_revision_id UUID REFERENCES automation_revisions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status TEXT,
    execution_engine_run_id TEXT
);

-- Automation triggers
CREATE TABLE IF NOT EXISTS automation_triggers (
    automation_revision_id UUID REFERENCES automation_revisions(id) ON DELETE CASCADE,
    trigger_type TEXT,
    triggering_id TEXT,
    PRIMARY KEY (automation_revision_id, trigger_type, triggering_id)
);

-- Automation run triggers
CREATE TABLE IF NOT EXISTS automation_run_triggers (
    automation_run_id UUID REFERENCES automation_runs(id) ON DELETE CASCADE,
    trigger_type TEXT,
    triggering_id TEXT,
    PRIMARY KEY (automation_run_id, trigger_type, triggering_id)
);

-- Automations
CREATE TABLE IF NOT EXISTS automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    project_id UUID,
    enabled BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    execution_engine_automation_id TEXT,
    is_test_automation BOOLEAN
);

-- Gendo AI renders
CREATE TABLE IF NOT EXISTS gendo_ai_renders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID,
    model_id TEXT,
    version_id TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    gendo_generation_id TEXT,
    status TEXT,
    prompt TEXT,
    camera JSONB,
    base_image TEXT,
    response_image TEXT
);

-- User emails
CREATE TABLE IF NOT EXISTS user_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    primary BOOLEAN,
    verified BOOLEAN,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User roles
CREATE TABLE IF NOT EXISTS user_roles (
    name TEXT PRIMARY KEY,
    description TEXT,
    resource_target TEXT,
    acl_table_name TEXT,
    weight INTEGER,
    public BOOLEAN
);

-- Add indexes for common queries
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_streams_workspace ON streams(workspace_id);
CREATE INDEX idx_comments_stream ON comments(stream_id);
CREATE INDEX idx_objects_stream ON objects(stream_id);
CREATE INDEX idx_stream_activity_stream ON stream_activity(stream_id);
CREATE INDEX idx_file_uploads_stream ON file_uploads(stream_id);
CREATE INDEX idx_branches_stream ON branches(stream_id);

-- Enable Row Level Security on all tables
DO $$ 
DECLARE 
    table_name text;
BEGIN 
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    END LOOP;
END $$;

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables
DO $$ 
DECLARE 
    table_name text;
BEGIN 
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'streams',
            'auth.users',
            'comments',
            'branches',
            'automations',
            'user_emails',
            'gendo_ai_renders'
            -- Add other tables that need updated_at trigger
        )
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at 
                BEFORE UPDATE ON %I 
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column()',
            table_name, table_name);
    END LOOP;
END $$;

-- Create a view to maintain compatibility with Speckle's code
CREATE VIEW speckle_users AS
SELECT 
    id,
    raw_user_meta_data->>'name' as name,
    raw_user_meta_data->>'bio' as bio,
    raw_user_meta_data->>'company' as company,
    email,
    email_confirmed_at IS NOT NULL as verified,
    raw_user_meta_data->>'avatar_url' as avatar,
    raw_user_meta_data as profiles,
    created_at
FROM auth.users;

-- Drop tables that are replaced by Supabase auth
DROP TABLE IF EXISTS auth.users CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS api_tokens CASCADE;
DROP TABLE IF EXISTS personal_api_tokens CASCADE;