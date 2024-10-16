-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    properties JSONB,
    admin_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before each update
CREATE TRIGGER update_projects_modtime
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create features table
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255),
    type VARCHAR(255),
    namespace VARCHAR(255),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255),
    description TEXT,
    geometry GEOMETRY(Geometry, 4326),
    position GEOMETRY(Geometry, 3857),
    properties JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    observed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_features_modtime
BEFORE UPDATE ON features
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create spatial indexes on features geometry columns
CREATE INDEX features_geometry_idx ON features USING GIST (geometry);
CREATE INDEX features_position_idx ON features USING GIST (position);

-- Enable RLS on features table
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- Create a table to manage project collaborators
CREATE TABLE project_collaborators (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    PRIMARY KEY (project_id, user_id)
);

-- RLS Policies for features table

-- Policy for project admin (full access)
CREATE POLICY admin_feature_access ON features
    USING (project_id IN (SELECT id FROM projects WHERE admin_id = auth.uid()));

-- Policy for project collaborators (create, read, update, delete)
CREATE POLICY collaborator_feature_access ON features
    USING (project_id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid()))
    WITH CHECK (project_id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid()));

-- Function to check if a user is a project admin or collaborator
CREATE OR REPLACE FUNCTION is_project_member(project_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM projects WHERE id = project_id AND admin_id = user_id
    ) OR EXISTS (
        SELECT 1 FROM project_collaborators WHERE project_id = project_id AND user_id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy to allow project members to update features
CREATE POLICY update_feature_policy ON features
    FOR UPDATE USING (is_project_member(project_id, auth.uid()));

-- Create a table for pending invitations
CREATE TABLE project_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    invitation_token UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days')
);

-- Function to create an invitation
CREATE OR REPLACE FUNCTION create_project_invitation(
    p_project_id UUID,
    p_email VARCHAR(255),
    p_admin_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_invitation_id UUID;
BEGIN
    -- Check if the user is the project admin
    IF NOT EXISTS (SELECT 1 FROM projects WHERE id = p_project_id AND admin_id = p_admin_id) THEN
        RAISE EXCEPTION 'User is not the project admin';
    END IF;

    -- Create the invitation
    INSERT INTO project_invitations (project_id, email)
    VALUES (p_project_id, p_email)
    RETURNING id INTO v_invitation_id;

    -- Here you would typically send an email with the invitation link
    -- The link would include the invitation_token

    RETURN v_invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process an invitation
CREATE OR REPLACE FUNCTION process_project_invitation(
    p_invitation_token UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_project_id UUID;
BEGIN
    -- Find and validate the invitation
    SELECT project_id INTO v_project_id
    FROM project_invitations
    WHERE invitation_token = p_invitation_token
    AND expires_at > CURRENT_TIMESTAMP;

    IF v_project_id IS NULL THEN
        RETURN FALSE; -- Invalid or expired invitation
    END IF;

    -- Add the user as a project collaborator
    INSERT INTO project_collaborators (project_id, user_id)
    VALUES (v_project_id, p_user_id)
    ON CONFLICT DO NOTHING;

    -- Delete the processed invitation
    DELETE FROM project_invitations
    WHERE invitation_token = p_invitation_token;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a profile table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    active_project_id UUID REFERENCES projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger to automatically create a profile when a new user is added
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_profile_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_new_user();

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read any profile
CREATE POLICY read_profiles_policy ON profiles
    FOR SELECT USING (true);

-- Create policy to allow users to update their own profile
CREATE POLICY update_own_profile_policy ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Add a policy to ensure users can only set active_project_id to projects they're a member of
CREATE POLICY set_active_project_policy ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        active_project_id IS NULL OR
        is_project_member(active_project_id, auth.uid())
    );
