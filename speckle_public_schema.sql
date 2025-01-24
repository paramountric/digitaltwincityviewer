

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."generate_speckle_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..10 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."generate_speckle_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_auth_user_deletion_to_speckle"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Delete from Speckle users table (this will cascade to users_meta due to FK)
    DELETE FROM users WHERE email = OLD.email;
    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."sync_auth_user_deletion_to_speckle"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_auth_user_to_speckle"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
        "createdAt"  -- Note: case sensitive column name
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

    -- Insert into users_meta
    INSERT INTO users_meta (user_id, key, value)
    SELECT 
        speckle_user_id,
        key,
        value_
    FROM (VALUES 
        ('name', COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))),
        ('company', NEW.raw_user_meta_data->>'company'),
        ('bio', NEW.raw_user_meta_data->>'bio'),
        ('verified', CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 'true' ELSE 'false' END)
    ) AS t(key, value_)
    WHERE value_ IS NOT NULL;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in sync_auth_user_to_speckle: %', SQLERRM;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."sync_auth_user_to_speckle"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_auth_user_updates_to_speckle"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update Speckle users table
    UPDATE users
    SET
        name = COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        email = NEW.email,
        bio = NEW.raw_user_meta_data->>'bio',
        company = NEW.raw_user_meta_data->>'company',
        verified = NEW.email_confirmed_at IS NOT NULL,
        avatar = NEW.raw_user_meta_data->>'avatar_url',
        profiles = NEW.raw_user_meta_data
    WHERE email = NEW.email;

    -- Update users_meta
    -- First delete existing metadata
    DELETE FROM users_meta 
    WHERE user_id IN (SELECT id FROM users WHERE email = NEW.email);

    -- Then insert new metadata
    WITH speckle_user AS (
        SELECT id FROM users WHERE email = NEW.email
    )
    INSERT INTO users_meta (user_id, key, value)
    SELECT 
        id,
        key,
        value_
    FROM speckle_user,
    (VALUES 
        ('name', COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))),
        ('company', NEW.raw_user_meta_data->>'company'),
        ('bio', NEW.raw_user_meta_data->>'bio'),
        ('verified', CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 'true' ELSE 'false' END)
    ) AS t(key, value_)
    WHERE value_ IS NOT NULL;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_auth_user_updates_to_speckle"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."api_tokens" (
    "id" character varying(10) NOT NULL,
    "tokenDigest" character varying(255),
    "owner" character varying(10) NOT NULL,
    "name" character varying(512),
    "lastChars" character varying(6),
    "revoked" boolean DEFAULT false,
    "lifespan" bigint DEFAULT '3154000000000'::bigint,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "lastUsed" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."api_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."authorization_codes" (
    "id" character varying(255) NOT NULL,
    "appId" character varying(255),
    "userId" character varying(255),
    "challenge" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "lifespan" bigint DEFAULT '600000'::bigint
);


ALTER TABLE "public"."authorization_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_function_runs" (
    "id" "text" NOT NULL,
    "runId" "text" NOT NULL,
    "functionId" "text" NOT NULL,
    "functionReleaseId" "text" NOT NULL,
    "elapsed" real NOT NULL,
    "status" "text" NOT NULL,
    "contextView" "text",
    "statusMessage" "text",
    "results" "jsonb",
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."automation_function_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_revision_functions" (
    "automationRevisionId" "text" NOT NULL,
    "functionId" "text" NOT NULL,
    "functionReleaseId" "text" NOT NULL,
    "functionInputs" "text",
    "id" "text" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."automation_revision_functions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_revisions" (
    "id" "text" NOT NULL,
    "automationId" "text",
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "active" boolean DEFAULT false NOT NULL,
    "userId" "text",
    "publicKey" character varying(255) NOT NULL
);


ALTER TABLE "public"."automation_revisions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_run_triggers" (
    "automationRunId" "text" NOT NULL,
    "triggeringId" "text" NOT NULL,
    "triggerType" "text" NOT NULL
);


ALTER TABLE "public"."automation_run_triggers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_runs" (
    "id" "text" NOT NULL,
    "automationRevisionId" "text" NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "status" character varying(255) NOT NULL,
    "executionEngineRunId" "text"
);


ALTER TABLE "public"."automation_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_tokens" (
    "automationId" "text" NOT NULL,
    "automateToken" "text" NOT NULL
);


ALTER TABLE "public"."automation_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_triggers" (
    "automationRevisionId" "text" NOT NULL,
    "triggerType" "text" NOT NULL,
    "triggeringId" "text" NOT NULL
);


ALTER TABLE "public"."automation_triggers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automations" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "projectId" "text",
    "enabled" boolean NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "executionEngineAutomationId" "text" DEFAULT ''::"text",
    "userId" "text",
    "isTestAutomation" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."automations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blob_storage" (
    "id" character varying(255) NOT NULL,
    "streamId" character varying(10) NOT NULL,
    "userId" character varying(10),
    "objectKey" character varying(255),
    "fileName" character varying(255) NOT NULL,
    "fileType" character varying(255) NOT NULL,
    "fileSize" integer,
    "uploadStatus" integer DEFAULT 0 NOT NULL,
    "uploadError" character varying(255),
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    "fileHash" character varying(255)
);


ALTER TABLE "public"."blob_storage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."branch_commits" (
    "branchId" character varying(10) NOT NULL,
    "commitId" character varying(255) NOT NULL
);


ALTER TABLE "public"."branch_commits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."branches" (
    "id" character varying(10) NOT NULL,
    "streamId" character varying(10) NOT NULL,
    "authorId" character varying(10),
    "name" character varying(512) NOT NULL,
    "description" character varying(65536),
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."branches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comment_links" (
    "commentId" character varying(10),
    "resourceId" character varying(255) NOT NULL,
    "resourceType" character varying(255) NOT NULL,
    CONSTRAINT "comment_links_resourceType_check" CHECK ((("resourceType")::"text" = ANY ((ARRAY['stream'::character varying, 'commit'::character varying, 'object'::character varying, 'comment'::character varying])::"text"[])))
);


ALTER TABLE "public"."comment_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comment_views" (
    "commentId" character varying(10) NOT NULL,
    "userId" character varying(10) NOT NULL,
    "viewedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."comment_views" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" character varying(10) NOT NULL,
    "streamId" character varying(10) NOT NULL,
    "authorId" character varying(10) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    "text" "text",
    "screenshot" "text",
    "data" "jsonb",
    "archived" boolean DEFAULT false NOT NULL,
    "parentComment" character varying(10) DEFAULT NULL::character varying
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."commits" (
    "id" character varying(10) NOT NULL,
    "referencedObject" character varying(255) NOT NULL,
    "author" character varying(10),
    "message" character varying(65536) DEFAULT 'no message'::character varying,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    "sourceApplication" character varying(1024),
    "totalChildrenCount" integer,
    "parents" "text"[]
);


ALTER TABLE "public"."commits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_verifications" (
    "id" character varying(255) NOT NULL,
    "email" character varying(255),
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."email_verifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."file_uploads" (
    "id" character varying(255) NOT NULL,
    "streamId" character varying(10),
    "branchName" character varying(255) NOT NULL,
    "userId" character varying(255) NOT NULL,
    "fileName" character varying(255) NOT NULL,
    "fileType" character varying(255) NOT NULL,
    "fileSize" integer,
    "uploadComplete" boolean DEFAULT false NOT NULL,
    "uploadDate" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    "convertedStatus" integer DEFAULT 0 NOT NULL,
    "convertedLastUpdate" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    "convertedMessage" character varying(255),
    "convertedCommitId" character varying(255)
);


ALTER TABLE "public"."file_uploads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gendo_ai_renders" (
    "id" "text" NOT NULL,
    "userId" "text",
    "projectId" "text",
    "modelId" "text",
    "versionId" "text",
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "gendoGenerationId" "text",
    "status" "text" NOT NULL,
    "prompt" "text" NOT NULL,
    "camera" "jsonb" NOT NULL,
    "baseImage" "text" NOT NULL,
    "responseImage" "text"
);


ALTER TABLE "public"."gendo_ai_renders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gendo_user_credits" (
    "userId" character varying(255) NOT NULL,
    "resetDate" timestamp(3) with time zone NOT NULL,
    "used" integer NOT NULL
);


ALTER TABLE "public"."gendo_user_credits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knex_migrations" (
    "id" integer NOT NULL,
    "name" character varying(255),
    "batch" integer,
    "migration_time" timestamp with time zone
);


ALTER TABLE "public"."knex_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."knex_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."knex_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."knex_migrations_id_seq" OWNED BY "public"."knex_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."knex_migrations_lock" (
    "index" integer NOT NULL,
    "is_locked" integer
);


ALTER TABLE "public"."knex_migrations_lock" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."knex_migrations_lock_index_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."knex_migrations_lock_index_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."knex_migrations_lock_index_seq" OWNED BY "public"."knex_migrations_lock"."index";



CREATE TABLE IF NOT EXISTS "public"."object_children_closure" (
    "parent" character varying(255) NOT NULL,
    "child" character varying(255) NOT NULL,
    "minDepth" integer DEFAULT 1 NOT NULL,
    "streamId" character varying(10) NOT NULL
);


ALTER TABLE "public"."object_children_closure" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."object_preview" (
    "streamId" character varying(10) NOT NULL,
    "objectId" character varying(255) NOT NULL,
    "previewStatus" integer DEFAULT 0 NOT NULL,
    "priority" integer DEFAULT 1 NOT NULL,
    "lastUpdate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "preview" "jsonb"
);


ALTER TABLE "public"."object_preview" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."objects" (
    "id" character varying(255) NOT NULL,
    "speckleType" character varying(1024) DEFAULT 'Base'::character varying NOT NULL,
    "totalChildrenCount" integer,
    "totalChildrenCountByDepth" "jsonb",
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "data" "jsonb",
    "streamId" character varying(10) NOT NULL
);


ALTER TABLE "public"."objects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."personal_api_tokens" (
    "tokenId" character varying(255),
    "userId" character varying(255)
);


ALTER TABLE "public"."personal_api_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."previews" (
    "id" character varying(255) NOT NULL,
    "data" "bytea"
);


ALTER TABLE "public"."previews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pwdreset_tokens" (
    "id" character varying(255) DEFAULT "gen_random_uuid"() NOT NULL,
    "email" character varying(256) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."pwdreset_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ratelimit_actions" (
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "action" character varying(255) NOT NULL,
    "source" character varying(255) NOT NULL
);


ALTER TABLE "public"."ratelimit_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."refresh_tokens" (
    "id" character varying(255) NOT NULL,
    "tokenDigest" character varying(255) NOT NULL,
    "appId" character varying(255),
    "userId" character varying(255),
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "lifespan" bigint DEFAULT '15770000000'::bigint
);


ALTER TABLE "public"."refresh_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."regions" (
    "key" character varying(255) NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."regions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scheduled_tasks" (
    "taskName" character varying(255) NOT NULL,
    "lockExpiresAt" timestamp(3) with time zone NOT NULL
);


ALTER TABLE "public"."scheduled_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scopes" (
    "name" character varying(512) NOT NULL,
    "description" character varying(512) NOT NULL,
    "public" boolean DEFAULT true
);


ALTER TABLE "public"."scopes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."server_access_requests" (
    "id" character varying(10) NOT NULL,
    "requesterId" character varying(10) NOT NULL,
    "resourceType" character varying(255) NOT NULL,
    "resourceId" character varying(255),
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."server_access_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."server_acl" (
    "userId" character varying(10) NOT NULL,
    "role" character varying(255) NOT NULL
);


ALTER TABLE "public"."server_acl" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."server_apps" (
    "id" character varying(10) NOT NULL,
    "secret" character varying(10),
    "name" character varying(256) NOT NULL,
    "description" character varying(512),
    "termsAndConditionsLink" character varying(256),
    "logo" character varying(524288),
    "public" boolean DEFAULT false,
    "trustByDefault" boolean DEFAULT false,
    "authorId" character varying(255),
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "redirectUrl" character varying(100) NOT NULL
);


ALTER TABLE "public"."server_apps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."server_apps_scopes" (
    "appId" character varying(255) NOT NULL,
    "scopeName" character varying(255) NOT NULL
);


ALTER TABLE "public"."server_apps_scopes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."server_config" (
    "id" integer DEFAULT 0 NOT NULL,
    "name" character varying(255) DEFAULT 'My new Speckle Server'::character varying,
    "company" character varying(255) DEFAULT 'Unknown Company'::character varying,
    "description" character varying(255) DEFAULT 'This a community deployment of a Speckle Server.'::character varying,
    "adminContact" character varying(255) DEFAULT 'n/a'::character varying,
    "termsOfService" character varying(255) DEFAULT 'n/a'::character varying,
    "canonicalUrl" character varying(255),
    "completed" boolean DEFAULT false,
    "inviteOnly" boolean DEFAULT false,
    "guestModeEnabled" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."server_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."server_invites" (
    "id" character varying(255) DEFAULT "gen_random_uuid"() NOT NULL,
    "target" character varying(256) NOT NULL,
    "inviterId" character varying(256) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    "message" character varying(1024),
    "token" character varying(256) DEFAULT ''::character varying NOT NULL,
    "resource" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."server_invites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sso_providers" (
    "id" "text" NOT NULL,
    "providerType" "text" NOT NULL,
    "encryptedProviderData" "text" NOT NULL,
    "createdAt" timestamp(3) with time zone NOT NULL,
    "updatedAt" timestamp(3) with time zone NOT NULL
);


ALTER TABLE "public"."sso_providers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stream_acl" (
    "userId" character varying(10) NOT NULL,
    "resourceId" character varying(10) NOT NULL,
    "role" character varying(255) NOT NULL
);


ALTER TABLE "public"."stream_acl" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stream_activity" (
    "streamId" character varying(10),
    "time" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "resourceType" character varying(255),
    "resourceId" character varying(255),
    "actionType" character varying(255),
    "userId" character varying(255),
    "info" "jsonb",
    "message" character varying(255)
);


ALTER TABLE "public"."stream_activity" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stream_commits" (
    "streamId" character varying(10) NOT NULL,
    "commitId" character varying(255) NOT NULL
);


ALTER TABLE "public"."stream_commits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stream_favorites" (
    "streamId" character varying(10) NOT NULL,
    "userId" character varying(10) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    "cursor" integer NOT NULL
);


ALTER TABLE "public"."stream_favorites" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."stream_favorites_cursor_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."stream_favorites_cursor_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."stream_favorites_cursor_seq" OWNED BY "public"."stream_favorites"."cursor";



CREATE TABLE IF NOT EXISTS "public"."streams" (
    "id" character varying(10) NOT NULL,
    "name" character varying(512) DEFAULT 'Unnamed Stream'::character varying NOT NULL,
    "description" character varying(65536),
    "isPublic" boolean DEFAULT true,
    "clonedFrom" character varying(10),
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    "allowPublicComments" boolean DEFAULT false,
    "isDiscoverable" boolean DEFAULT false NOT NULL,
    "workspaceId" character varying(255),
    "regionKey" "text"
);


ALTER TABLE "public"."streams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."streams_meta" (
    "streamId" character varying(10) NOT NULL,
    "key" character varying(255) NOT NULL,
    "value" "json",
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."streams_meta" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."token_resource_access" (
    "tokenId" character varying(10) NOT NULL,
    "resourceId" character varying(255) NOT NULL,
    "resourceType" character varying(255) NOT NULL
);


ALTER TABLE "public"."token_resource_access" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."token_scopes" (
    "tokenId" character varying(255) NOT NULL,
    "scopeName" character varying(255) NOT NULL
);


ALTER TABLE "public"."token_scopes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_emails" (
    "id" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "primary" boolean DEFAULT false,
    "verified" boolean DEFAULT false,
    "userId" character varying(255) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."user_emails" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_notification_preferences" (
    "userId" character varying(10) NOT NULL,
    "preferences" "jsonb" NOT NULL
);


ALTER TABLE "public"."user_notification_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "name" character varying(256) NOT NULL,
    "description" character varying(256) NOT NULL,
    "resourceTarget" character varying(256) NOT NULL,
    "aclTableName" character varying(256) NOT NULL,
    "weight" integer DEFAULT 100 NOT NULL,
    "public" boolean DEFAULT true
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_server_app_tokens" (
    "appId" character varying(255) NOT NULL,
    "userId" character varying(255) NOT NULL,
    "tokenId" character varying(255) NOT NULL
);


ALTER TABLE "public"."user_server_app_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_sso_sessions" (
    "userId" character varying(255) NOT NULL,
    "providerId" character varying(255) NOT NULL,
    "createdAt" timestamp(3) with time zone NOT NULL,
    "validUntil" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."user_sso_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" character varying(10) NOT NULL,
    "suuid" character varying(255) DEFAULT "gen_random_uuid"(),
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    "name" character varying(512) NOT NULL,
    "bio" character varying(2048),
    "company" character varying(512),
    "email" character varying(255) NOT NULL,
    "verified" boolean DEFAULT false,
    "avatar" character varying(524288),
    "profiles" "jsonb",
    "passwordDigest" character varying(255),
    "ip" character varying(50)
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users_meta" (
    "userId" character varying(10) NOT NULL,
    "key" character varying(255) NOT NULL,
    "value" "json",
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."users_meta" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhooks_config" (
    "id" character varying(255) NOT NULL,
    "streamId" character varying(10),
    "url" "text",
    "description" "text",
    "triggers" "jsonb",
    "secret" character varying(255),
    "enabled" boolean DEFAULT true,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."webhooks_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhooks_events" (
    "id" character varying(255) NOT NULL,
    "webhookId" character varying(255),
    "status" integer DEFAULT 0 NOT NULL,
    "statusInfo" "text" DEFAULT 'Pending'::"text" NOT NULL,
    "lastUpdate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "payload" "text"
);


ALTER TABLE "public"."webhooks_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_acl" (
    "userId" "text" NOT NULL,
    "workspaceId" "text" NOT NULL,
    "role" "text" NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."workspace_acl" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_checkout_sessions" (
    "workspaceId" "text" NOT NULL,
    "id" "text" NOT NULL,
    "url" "text" NOT NULL,
    "workspacePlan" "text" NOT NULL,
    "paymentStatus" "text" NOT NULL,
    "billingInterval" "text" NOT NULL,
    "createdAt" timestamp(3) with time zone NOT NULL,
    "updatedAt" timestamp(3) with time zone NOT NULL
);


ALTER TABLE "public"."workspace_checkout_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_creation_state" (
    "workspaceId" "text" NOT NULL,
    "completed" boolean NOT NULL,
    "state" "jsonb" NOT NULL
);


ALTER TABLE "public"."workspace_creation_state" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_domains" (
    "id" "text" NOT NULL,
    "domain" "text" NOT NULL,
    "verified" boolean NOT NULL,
    "createdAt" timestamp(3) with time zone NOT NULL,
    "updatedAt" timestamp(3) with time zone NOT NULL,
    "createdByUserId" "text",
    "workspaceId" "text"
);


ALTER TABLE "public"."workspace_domains" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_plans" (
    "workspaceId" "text" NOT NULL,
    "name" "text" NOT NULL,
    "status" "text" NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."workspace_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_regions" (
    "workspaceId" "text" NOT NULL,
    "regionKey" character varying(255) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."workspace_regions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_sso_providers" (
    "workspaceId" character varying(255) NOT NULL,
    "providerId" character varying(255) NOT NULL
);


ALTER TABLE "public"."workspace_sso_providers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_subscriptions" (
    "workspaceId" "text" NOT NULL,
    "createdAt" timestamp(3) with time zone NOT NULL,
    "updatedAt" timestamp(3) with time zone NOT NULL,
    "currentBillingCycleEnd" timestamp(3) with time zone NOT NULL,
    "billingInterval" "text" NOT NULL,
    "subscriptionData" "jsonb" NOT NULL
);


ALTER TABLE "public"."workspace_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspaces" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "createdAt" timestamp(3) with time zone NOT NULL,
    "updatedAt" timestamp(3) with time zone NOT NULL,
    "logo" "text",
    "domainBasedMembershipProtectionEnabled" boolean DEFAULT false,
    "discoverabilityEnabled" boolean DEFAULT false,
    "defaultLogoIndex" integer DEFAULT 0 NOT NULL,
    "defaultProjectRole" "text" DEFAULT 'stream:contributor'::"text" NOT NULL,
    "slug" "text" DEFAULT "substring"("md5"(("random"())::"text"), 0, 15) NOT NULL,
    CONSTRAINT "workspaces_defaultProjectRole_check" CHECK (("defaultProjectRole" = ANY (ARRAY['stream:reviewer'::"text", 'stream:contributor'::"text"])))
);


ALTER TABLE "public"."workspaces" OWNER TO "postgres";


ALTER TABLE ONLY "public"."knex_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."knex_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."knex_migrations_lock" ALTER COLUMN "index" SET DEFAULT "nextval"('"public"."knex_migrations_lock_index_seq"'::"regclass");



ALTER TABLE ONLY "public"."stream_favorites" ALTER COLUMN "cursor" SET DEFAULT "nextval"('"public"."stream_favorites_cursor_seq"'::"regclass");



ALTER TABLE ONLY "public"."api_tokens"
    ADD CONSTRAINT "api_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_tokens"
    ADD CONSTRAINT "api_tokens_tokendigest_unique" UNIQUE ("tokenDigest");



ALTER TABLE ONLY "public"."authorization_codes"
    ADD CONSTRAINT "authorization_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_function_runs"
    ADD CONSTRAINT "automation_function_run_id_pk" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automations"
    ADD CONSTRAINT "automation_id_pk" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_revision_functions"
    ADD CONSTRAINT "automation_revision_functions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_revisions"
    ADD CONSTRAINT "automation_revisions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_run_triggers"
    ADD CONSTRAINT "automation_run_triggers_pkey" PRIMARY KEY ("automationRunId", "triggeringId");



ALTER TABLE ONLY "public"."automation_runs"
    ADD CONSTRAINT "automation_runs_primary" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_tokens"
    ADD CONSTRAINT "automation_tokens_pkey" PRIMARY KEY ("automationId");



ALTER TABLE ONLY "public"."automation_triggers"
    ADD CONSTRAINT "automation_triggers_pkey" PRIMARY KEY ("automationRevisionId", "triggerType", "triggeringId");



ALTER TABLE ONLY "public"."blob_storage"
    ADD CONSTRAINT "blob_storage_pkey" PRIMARY KEY ("id", "streamId");



ALTER TABLE ONLY "public"."branch_commits"
    ADD CONSTRAINT "branch_commits_pkey" PRIMARY KEY ("branchId", "commitId");



ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_streamid_name_unique" UNIQUE ("streamId", "name");



ALTER TABLE ONLY "public"."comment_views"
    ADD CONSTRAINT "comment_views_pkey" PRIMARY KEY ("commentId", "userId");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."commits"
    ADD CONSTRAINT "commits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_verifications"
    ADD CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."file_uploads"
    ADD CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gendo_ai_renders"
    ADD CONSTRAINT "gendo_ai_renders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gendo_user_credits"
    ADD CONSTRAINT "gendo_user_credits_pkey" PRIMARY KEY ("userId");



ALTER TABLE ONLY "public"."knex_migrations_lock"
    ADD CONSTRAINT "knex_migrations_lock_pkey" PRIMARY KEY ("index");



ALTER TABLE ONLY "public"."knex_migrations"
    ADD CONSTRAINT "knex_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."object_children_closure"
    ADD CONSTRAINT "obj_parent_child_index" UNIQUE ("streamId", "parent", "child");



ALTER TABLE ONLY "public"."object_preview"
    ADD CONSTRAINT "object_preview_pkey" PRIMARY KEY ("streamId", "objectId");



ALTER TABLE ONLY "public"."objects"
    ADD CONSTRAINT "objects_pkey" PRIMARY KEY ("streamId", "id");



ALTER TABLE ONLY "public"."previews"
    ADD CONSTRAINT "previews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pwdreset_tokens"
    ADD CONSTRAINT "pwdreset_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."regions"
    ADD CONSTRAINT "regions_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."scheduled_tasks"
    ADD CONSTRAINT "scheduled_tasks_pkey" PRIMARY KEY ("taskName");



ALTER TABLE ONLY "public"."scopes"
    ADD CONSTRAINT "scopes_pkey" PRIMARY KEY ("name");



ALTER TABLE ONLY "public"."server_access_requests"
    ADD CONSTRAINT "server_access_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."server_access_requests"
    ADD CONSTRAINT "server_access_requests_requesterid_resourceid_resourcetype_uniq" UNIQUE ("requesterId", "resourceId", "resourceType");



ALTER TABLE ONLY "public"."server_acl"
    ADD CONSTRAINT "server_acl_pkey" PRIMARY KEY ("userId");



ALTER TABLE ONLY "public"."server_apps"
    ADD CONSTRAINT "server_apps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."server_invites"
    ADD CONSTRAINT "server_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sso_providers"
    ADD CONSTRAINT "sso_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stream_acl"
    ADD CONSTRAINT "stream_acl_pkey" PRIMARY KEY ("userId", "resourceId");



ALTER TABLE ONLY "public"."stream_acl"
    ADD CONSTRAINT "stream_acl_userid_resourceid_unique" UNIQUE ("userId", "resourceId");



ALTER TABLE ONLY "public"."stream_commits"
    ADD CONSTRAINT "stream_commits_pkey" PRIMARY KEY ("streamId", "commitId");



ALTER TABLE ONLY "public"."stream_favorites"
    ADD CONSTRAINT "stream_favorites_pkey" PRIMARY KEY ("userId", "streamId");



ALTER TABLE ONLY "public"."streams_meta"
    ADD CONSTRAINT "streams_meta_pkey" PRIMARY KEY ("streamId", "key");



ALTER TABLE ONLY "public"."streams"
    ADD CONSTRAINT "streams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_emails"
    ADD CONSTRAINT "user_emails_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_emails"
    ADD CONSTRAINT "user_emails_userid_email_unique" UNIQUE ("userId", "email");



ALTER TABLE ONLY "public"."user_notification_preferences"
    ADD CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("userId");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("name");



ALTER TABLE ONLY "public"."user_sso_sessions"
    ADD CONSTRAINT "user_sso_sessions_pkey" PRIMARY KEY ("userId", "providerId");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_unique" UNIQUE ("email");



ALTER TABLE ONLY "public"."users_meta"
    ADD CONSTRAINT "users_meta_pkey" PRIMARY KEY ("userId", "key");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webhooks_config"
    ADD CONSTRAINT "webhooks_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webhooks_events"
    ADD CONSTRAINT "webhooks_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workspace_acl"
    ADD CONSTRAINT "workspace_acl_pkey" PRIMARY KEY ("userId", "workspaceId");



ALTER TABLE ONLY "public"."workspace_checkout_sessions"
    ADD CONSTRAINT "workspace_checkout_sessions_pkey" PRIMARY KEY ("workspaceId");



ALTER TABLE ONLY "public"."workspace_creation_state"
    ADD CONSTRAINT "workspace_creation_state_pkey" PRIMARY KEY ("workspaceId");



ALTER TABLE ONLY "public"."workspace_domains"
    ADD CONSTRAINT "workspace_domains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workspace_domains"
    ADD CONSTRAINT "workspace_domains_workspaceid_domain_unique" UNIQUE ("workspaceId", "domain");



ALTER TABLE ONLY "public"."workspace_plans"
    ADD CONSTRAINT "workspace_plans_pkey" PRIMARY KEY ("workspaceId");



ALTER TABLE ONLY "public"."workspace_regions"
    ADD CONSTRAINT "workspace_regions_pkey" PRIMARY KEY ("workspaceId", "regionKey");



ALTER TABLE ONLY "public"."workspace_sso_providers"
    ADD CONSTRAINT "workspace_sso_providers_pkey" PRIMARY KEY ("workspaceId");



ALTER TABLE ONLY "public"."workspace_subscriptions"
    ADD CONSTRAINT "workspace_subscriptions_pkey" PRIMARY KEY ("workspaceId");



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_slug_unique" UNIQUE ("slug");



CREATE INDEX "automation_function_runs_runid_index" ON "public"."automation_function_runs" USING "btree" ("runId");



CREATE INDEX "automation_revisions_automationid_index" ON "public"."automation_revisions" USING "btree" ("automationId");



CREATE INDEX "automation_run_triggers_triggertype_index" ON "public"."automation_run_triggers" USING "btree" ("triggerType");



CREATE INDEX "automations_projectid_index" ON "public"."automations" USING "btree" ("projectId");



CREATE INDEX "comments_authorid_index" ON "public"."comments" USING "btree" ("authorId");



CREATE INDEX "comments_streamid_index" ON "public"."comments" USING "btree" ("streamId");



CREATE INDEX "email_verifications_email_index" ON "public"."email_verifications" USING "btree" ("email");



CREATE INDEX "file_uploads_streamid_index" ON "public"."file_uploads" USING "btree" ("streamId");



CREATE INDEX "full_pcd_index" ON "public"."object_children_closure" USING "btree" ("streamId", "parent", "minDepth");



CREATE INDEX "gendo_ai_renders_gendogenerationid_index" ON "public"."gendo_ai_renders" USING "btree" ("gendoGenerationId");



CREATE INDEX "object_children_closure_streamid_child_index" ON "public"."object_children_closure" USING "btree" ("streamId", "child");



CREATE INDEX "object_children_closure_streamid_mindepth_index" ON "public"."object_children_closure" USING "btree" ("streamId", "minDepth");



CREATE INDEX "object_children_closure_streamid_parent_index" ON "public"."object_children_closure" USING "btree" ("streamId", "parent");



CREATE INDEX "object_preview_previewstatus_priority_lastupdate_index" ON "public"."object_preview" USING "btree" ("previewStatus", "priority", "lastUpdate");



CREATE INDEX "objects_id_index" ON "public"."objects" USING "btree" ("id");



CREATE INDEX "objects_streamid_index" ON "public"."objects" USING "btree" ("streamId");



CREATE INDEX "ratelimit_query_idx" ON "public"."ratelimit_actions" USING "btree" ("source", "action", "timestamp");



CREATE INDEX "server_access_requests_resourcetype_resourceid_index" ON "public"."server_access_requests" USING "btree" ("resourceType", "resourceId");



CREATE INDEX "server_apps_scopes_appid_index" ON "public"."server_apps_scopes" USING "btree" ("appId");



CREATE INDEX "server_apps_scopes_scopename_index" ON "public"."server_apps_scopes" USING "btree" ("scopeName");



CREATE INDEX "server_config_id_index" ON "public"."server_config" USING "btree" ("id");



CREATE INDEX "server_invites_resource_index" ON "public"."server_invites" USING "btree" ("resource");



CREATE INDEX "server_invites_target_resource_index" ON "public"."server_invites" USING "btree" ("target", "resource");



CREATE INDEX "server_invites_token_index" ON "public"."server_invites" USING "btree" ("token");



CREATE INDEX "stream_activity_resourceid_time_index" ON "public"."stream_activity" USING "btree" ("resourceId", "time");



CREATE INDEX "stream_activity_streamid_time_index" ON "public"."stream_activity" USING "btree" ("streamId", "time");



CREATE INDEX "stream_activity_userid_time_index" ON "public"."stream_activity" USING "btree" ("userId", "time");



CREATE INDEX "token_resource_access_tokenid_index" ON "public"."token_resource_access" USING "btree" ("tokenId");



CREATE INDEX "token_scope_combined_idx" ON "public"."token_scopes" USING "btree" ("tokenId", "scopeName");



CREATE INDEX "token_scopes_scopename_index" ON "public"."token_scopes" USING "btree" ("scopeName");



CREATE INDEX "token_scopes_tokenid_index" ON "public"."token_scopes" USING "btree" ("tokenId");



CREATE INDEX "user_server_app_tokens_appid_index" ON "public"."user_server_app_tokens" USING "btree" ("appId");



CREATE INDEX "user_server_app_tokens_tokenid_index" ON "public"."user_server_app_tokens" USING "btree" ("tokenId");



CREATE INDEX "user_server_app_tokens_userid_index" ON "public"."user_server_app_tokens" USING "btree" ("userId");



CREATE INDEX "users_suuid_index" ON "public"."users" USING "btree" ("suuid");



CREATE INDEX "webhooks_config_streamid_index" ON "public"."webhooks_config" USING "btree" ("streamId");



CREATE INDEX "webhooks_events_status_index" ON "public"."webhooks_events" USING "btree" ("status");



CREATE INDEX "webhooks_events_webhookid_index" ON "public"."webhooks_events" USING "btree" ("webhookId");



CREATE INDEX "workspace_checkout_sessions_id_index" ON "public"."workspace_checkout_sessions" USING "btree" ("id");



CREATE INDEX "workspace_domains_domain_index" ON "public"."workspace_domains" USING "btree" ("domain");



CREATE INDEX "workspace_domains_workspaceid_index" ON "public"."workspace_domains" USING "btree" ("workspaceId");



ALTER TABLE ONLY "public"."api_tokens"
    ADD CONSTRAINT "api_tokens_owner_foreign" FOREIGN KEY ("owner") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."authorization_codes"
    ADD CONSTRAINT "authorization_codes_appid_foreign" FOREIGN KEY ("appId") REFERENCES "public"."server_apps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."authorization_codes"
    ADD CONSTRAINT "authorization_codes_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."automation_function_runs"
    ADD CONSTRAINT "automation_function_runs_runid_foreign" FOREIGN KEY ("runId") REFERENCES "public"."automation_runs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."automation_revision_functions"
    ADD CONSTRAINT "automation_revision_functions_automationrevisionid_foreign" FOREIGN KEY ("automationRevisionId") REFERENCES "public"."automation_revisions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."automation_revisions"
    ADD CONSTRAINT "automation_revisions_automationid_foreign" FOREIGN KEY ("automationId") REFERENCES "public"."automations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."automation_revisions"
    ADD CONSTRAINT "automation_revisions_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."automation_run_triggers"
    ADD CONSTRAINT "automation_run_triggers_automationrunid_foreign" FOREIGN KEY ("automationRunId") REFERENCES "public"."automation_runs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."automation_runs"
    ADD CONSTRAINT "automation_runs_automationrevisionid_foreign" FOREIGN KEY ("automationRevisionId") REFERENCES "public"."automation_revisions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."automation_tokens"
    ADD CONSTRAINT "automation_tokens_automationid_foreign" FOREIGN KEY ("automationId") REFERENCES "public"."automations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."automation_triggers"
    ADD CONSTRAINT "automation_triggers_automationrevisionid_foreign" FOREIGN KEY ("automationRevisionId") REFERENCES "public"."automation_revisions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."automations"
    ADD CONSTRAINT "automations_projectid_foreign" FOREIGN KEY ("projectId") REFERENCES "public"."streams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."automations"
    ADD CONSTRAINT "automations_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."branch_commits"
    ADD CONSTRAINT "branch_commits_branchid_foreign" FOREIGN KEY ("branchId") REFERENCES "public"."branches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."branch_commits"
    ADD CONSTRAINT "branch_commits_commitid_foreign" FOREIGN KEY ("commitId") REFERENCES "public"."commits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_authorid_foreign" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_streamid_foreign" FOREIGN KEY ("streamId") REFERENCES "public"."streams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_links"
    ADD CONSTRAINT "comment_links_commentid_foreign" FOREIGN KEY ("commentId") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_views"
    ADD CONSTRAINT "comment_views_commentid_foreign" FOREIGN KEY ("commentId") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_views"
    ADD CONSTRAINT "comment_views_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_authorid_foreign" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_parentcomment_foreign" FOREIGN KEY ("parentComment") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_streamid_foreign" FOREIGN KEY ("streamId") REFERENCES "public"."streams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."commits"
    ADD CONSTRAINT "commits_author_foreign" FOREIGN KEY ("author") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."file_uploads"
    ADD CONSTRAINT "file_uploads_streamid_foreign" FOREIGN KEY ("streamId") REFERENCES "public"."streams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gendo_ai_renders"
    ADD CONSTRAINT "gendo_ai_renders_modelid_foreign" FOREIGN KEY ("modelId") REFERENCES "public"."branches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gendo_ai_renders"
    ADD CONSTRAINT "gendo_ai_renders_projectid_foreign" FOREIGN KEY ("projectId") REFERENCES "public"."streams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gendo_ai_renders"
    ADD CONSTRAINT "gendo_ai_renders_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gendo_ai_renders"
    ADD CONSTRAINT "gendo_ai_renders_versionid_foreign" FOREIGN KEY ("versionId") REFERENCES "public"."commits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gendo_user_credits"
    ADD CONSTRAINT "gendo_user_credits_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."object_children_closure"
    ADD CONSTRAINT "object_children_closure_streamid_foreign" FOREIGN KEY ("streamId") REFERENCES "public"."streams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."object_preview"
    ADD CONSTRAINT "object_preview_streamid_foreign" FOREIGN KEY ("streamId") REFERENCES "public"."streams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."objects"
    ADD CONSTRAINT "objects_streamid_foreign" FOREIGN KEY ("streamId") REFERENCES "public"."streams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."personal_api_tokens"
    ADD CONSTRAINT "personal_api_tokens_tokenid_foreign" FOREIGN KEY ("tokenId") REFERENCES "public"."api_tokens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."personal_api_tokens"
    ADD CONSTRAINT "personal_api_tokens_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_appid_foreign" FOREIGN KEY ("appId") REFERENCES "public"."server_apps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."server_access_requests"
    ADD CONSTRAINT "server_access_requests_requesterid_foreign" FOREIGN KEY ("requesterId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."server_acl"
    ADD CONSTRAINT "server_acl_role_foreign" FOREIGN KEY ("role") REFERENCES "public"."user_roles"("name") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."server_acl"
    ADD CONSTRAINT "server_acl_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."server_apps"
    ADD CONSTRAINT "server_apps_authorid_foreign" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."server_apps_scopes"
    ADD CONSTRAINT "server_apps_scopes_appid_foreign" FOREIGN KEY ("appId") REFERENCES "public"."server_apps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."server_apps_scopes"
    ADD CONSTRAINT "server_apps_scopes_scopename_foreign" FOREIGN KEY ("scopeName") REFERENCES "public"."scopes"("name") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."server_invites"
    ADD CONSTRAINT "server_invites_inviterid_foreign" FOREIGN KEY ("inviterId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stream_acl"
    ADD CONSTRAINT "stream_acl_resourceid_foreign" FOREIGN KEY ("resourceId") REFERENCES "public"."streams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stream_acl"
    ADD CONSTRAINT "stream_acl_role_foreign" FOREIGN KEY ("role") REFERENCES "public"."user_roles"("name") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stream_acl"
    ADD CONSTRAINT "stream_acl_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stream_commits"
    ADD CONSTRAINT "stream_commits_commitid_foreign" FOREIGN KEY ("commitId") REFERENCES "public"."commits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stream_commits"
    ADD CONSTRAINT "stream_commits_streamid_foreign" FOREIGN KEY ("streamId") REFERENCES "public"."streams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stream_favorites"
    ADD CONSTRAINT "stream_favorites_streamid_foreign" FOREIGN KEY ("streamId") REFERENCES "public"."streams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stream_favorites"
    ADD CONSTRAINT "stream_favorites_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."streams"
    ADD CONSTRAINT "streams_clonedfrom_foreign" FOREIGN KEY ("clonedFrom") REFERENCES "public"."streams"("id");



ALTER TABLE ONLY "public"."streams_meta"
    ADD CONSTRAINT "streams_meta_streamid_foreign" FOREIGN KEY ("streamId") REFERENCES "public"."streams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."streams"
    ADD CONSTRAINT "streams_workspaceid_foreign" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."token_resource_access"
    ADD CONSTRAINT "token_resource_access_tokenid_foreign" FOREIGN KEY ("tokenId") REFERENCES "public"."api_tokens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."token_scopes"
    ADD CONSTRAINT "token_scopes_scopename_foreign" FOREIGN KEY ("scopeName") REFERENCES "public"."scopes"("name") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."token_scopes"
    ADD CONSTRAINT "token_scopes_tokenid_foreign" FOREIGN KEY ("tokenId") REFERENCES "public"."api_tokens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_emails"
    ADD CONSTRAINT "user_emails_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_notification_preferences"
    ADD CONSTRAINT "user_notification_preferences_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_server_app_tokens"
    ADD CONSTRAINT "user_server_app_tokens_appid_foreign" FOREIGN KEY ("appId") REFERENCES "public"."server_apps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_server_app_tokens"
    ADD CONSTRAINT "user_server_app_tokens_tokenid_foreign" FOREIGN KEY ("tokenId") REFERENCES "public"."api_tokens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_server_app_tokens"
    ADD CONSTRAINT "user_server_app_tokens_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_sso_sessions"
    ADD CONSTRAINT "user_sso_sessions_providerid_foreign" FOREIGN KEY ("providerId") REFERENCES "public"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_sso_sessions"
    ADD CONSTRAINT "user_sso_sessions_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users_meta"
    ADD CONSTRAINT "users_meta_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."webhooks_events"
    ADD CONSTRAINT "webhooks_events_webhookid_foreign" FOREIGN KEY ("webhookId") REFERENCES "public"."webhooks_config"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_acl"
    ADD CONSTRAINT "workspace_acl_role_foreign" FOREIGN KEY ("role") REFERENCES "public"."user_roles"("name") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_acl"
    ADD CONSTRAINT "workspace_acl_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_acl"
    ADD CONSTRAINT "workspace_acl_workspaceid_foreign" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_checkout_sessions"
    ADD CONSTRAINT "workspace_checkout_sessions_workspaceid_foreign" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_creation_state"
    ADD CONSTRAINT "workspace_creation_state_workspaceid_foreign" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_domains"
    ADD CONSTRAINT "workspace_domains_createdbyuserid_foreign" FOREIGN KEY ("createdByUserId") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."workspace_domains"
    ADD CONSTRAINT "workspace_domains_workspaceid_foreign" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_plans"
    ADD CONSTRAINT "workspace_plans_workspaceid_foreign" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_regions"
    ADD CONSTRAINT "workspace_regions_regionkey_foreign" FOREIGN KEY ("regionKey") REFERENCES "public"."regions"("key") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_regions"
    ADD CONSTRAINT "workspace_regions_workspaceid_foreign" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_sso_providers"
    ADD CONSTRAINT "workspace_sso_providers_providerid_foreign" FOREIGN KEY ("providerId") REFERENCES "public"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_sso_providers"
    ADD CONSTRAINT "workspace_sso_providers_workspaceid_foreign" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_subscriptions"
    ADD CONSTRAINT "workspace_subscriptions_workspaceid_foreign" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_speckle_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_speckle_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_speckle_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_auth_user_deletion_to_speckle"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_auth_user_deletion_to_speckle"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_auth_user_deletion_to_speckle"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_auth_user_to_speckle"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_auth_user_to_speckle"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_auth_user_to_speckle"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_auth_user_updates_to_speckle"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_auth_user_updates_to_speckle"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_auth_user_updates_to_speckle"() TO "service_role";



GRANT ALL ON TABLE "public"."api_tokens" TO "anon";
GRANT ALL ON TABLE "public"."api_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."api_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."authorization_codes" TO "anon";
GRANT ALL ON TABLE "public"."authorization_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."authorization_codes" TO "service_role";



GRANT ALL ON TABLE "public"."automation_function_runs" TO "anon";
GRANT ALL ON TABLE "public"."automation_function_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_function_runs" TO "service_role";



GRANT ALL ON TABLE "public"."automation_revision_functions" TO "anon";
GRANT ALL ON TABLE "public"."automation_revision_functions" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_revision_functions" TO "service_role";



GRANT ALL ON TABLE "public"."automation_revisions" TO "anon";
GRANT ALL ON TABLE "public"."automation_revisions" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_revisions" TO "service_role";



GRANT ALL ON TABLE "public"."automation_run_triggers" TO "anon";
GRANT ALL ON TABLE "public"."automation_run_triggers" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_run_triggers" TO "service_role";



GRANT ALL ON TABLE "public"."automation_runs" TO "anon";
GRANT ALL ON TABLE "public"."automation_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_runs" TO "service_role";



GRANT ALL ON TABLE "public"."automation_tokens" TO "anon";
GRANT ALL ON TABLE "public"."automation_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."automation_triggers" TO "anon";
GRANT ALL ON TABLE "public"."automation_triggers" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_triggers" TO "service_role";



GRANT ALL ON TABLE "public"."automations" TO "anon";
GRANT ALL ON TABLE "public"."automations" TO "authenticated";
GRANT ALL ON TABLE "public"."automations" TO "service_role";



GRANT ALL ON TABLE "public"."blob_storage" TO "anon";
GRANT ALL ON TABLE "public"."blob_storage" TO "authenticated";
GRANT ALL ON TABLE "public"."blob_storage" TO "service_role";



GRANT ALL ON TABLE "public"."branch_commits" TO "anon";
GRANT ALL ON TABLE "public"."branch_commits" TO "authenticated";
GRANT ALL ON TABLE "public"."branch_commits" TO "service_role";



GRANT ALL ON TABLE "public"."branches" TO "anon";
GRANT ALL ON TABLE "public"."branches" TO "authenticated";
GRANT ALL ON TABLE "public"."branches" TO "service_role";



GRANT ALL ON TABLE "public"."comment_links" TO "anon";
GRANT ALL ON TABLE "public"."comment_links" TO "authenticated";
GRANT ALL ON TABLE "public"."comment_links" TO "service_role";



GRANT ALL ON TABLE "public"."comment_views" TO "anon";
GRANT ALL ON TABLE "public"."comment_views" TO "authenticated";
GRANT ALL ON TABLE "public"."comment_views" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."commits" TO "anon";
GRANT ALL ON TABLE "public"."commits" TO "authenticated";
GRANT ALL ON TABLE "public"."commits" TO "service_role";



GRANT ALL ON TABLE "public"."email_verifications" TO "anon";
GRANT ALL ON TABLE "public"."email_verifications" TO "authenticated";
GRANT ALL ON TABLE "public"."email_verifications" TO "service_role";



GRANT ALL ON TABLE "public"."file_uploads" TO "anon";
GRANT ALL ON TABLE "public"."file_uploads" TO "authenticated";
GRANT ALL ON TABLE "public"."file_uploads" TO "service_role";



GRANT ALL ON TABLE "public"."gendo_ai_renders" TO "anon";
GRANT ALL ON TABLE "public"."gendo_ai_renders" TO "authenticated";
GRANT ALL ON TABLE "public"."gendo_ai_renders" TO "service_role";



GRANT ALL ON TABLE "public"."gendo_user_credits" TO "anon";
GRANT ALL ON TABLE "public"."gendo_user_credits" TO "authenticated";
GRANT ALL ON TABLE "public"."gendo_user_credits" TO "service_role";



GRANT ALL ON TABLE "public"."knex_migrations" TO "anon";
GRANT ALL ON TABLE "public"."knex_migrations" TO "authenticated";
GRANT ALL ON TABLE "public"."knex_migrations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."knex_migrations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."knex_migrations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."knex_migrations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."knex_migrations_lock" TO "anon";
GRANT ALL ON TABLE "public"."knex_migrations_lock" TO "authenticated";
GRANT ALL ON TABLE "public"."knex_migrations_lock" TO "service_role";



GRANT ALL ON SEQUENCE "public"."knex_migrations_lock_index_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."knex_migrations_lock_index_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."knex_migrations_lock_index_seq" TO "service_role";



GRANT ALL ON TABLE "public"."object_children_closure" TO "anon";
GRANT ALL ON TABLE "public"."object_children_closure" TO "authenticated";
GRANT ALL ON TABLE "public"."object_children_closure" TO "service_role";



GRANT ALL ON TABLE "public"."object_preview" TO "anon";
GRANT ALL ON TABLE "public"."object_preview" TO "authenticated";
GRANT ALL ON TABLE "public"."object_preview" TO "service_role";



GRANT ALL ON TABLE "public"."objects" TO "anon";
GRANT ALL ON TABLE "public"."objects" TO "authenticated";
GRANT ALL ON TABLE "public"."objects" TO "service_role";



GRANT ALL ON TABLE "public"."personal_api_tokens" TO "anon";
GRANT ALL ON TABLE "public"."personal_api_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."personal_api_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."previews" TO "anon";
GRANT ALL ON TABLE "public"."previews" TO "authenticated";
GRANT ALL ON TABLE "public"."previews" TO "service_role";



GRANT ALL ON TABLE "public"."pwdreset_tokens" TO "anon";
GRANT ALL ON TABLE "public"."pwdreset_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."pwdreset_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."ratelimit_actions" TO "anon";
GRANT ALL ON TABLE "public"."ratelimit_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."ratelimit_actions" TO "service_role";



GRANT ALL ON TABLE "public"."refresh_tokens" TO "anon";
GRANT ALL ON TABLE "public"."refresh_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."refresh_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."regions" TO "anon";
GRANT ALL ON TABLE "public"."regions" TO "authenticated";
GRANT ALL ON TABLE "public"."regions" TO "service_role";



GRANT ALL ON TABLE "public"."scheduled_tasks" TO "anon";
GRANT ALL ON TABLE "public"."scheduled_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."scheduled_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."scopes" TO "anon";
GRANT ALL ON TABLE "public"."scopes" TO "authenticated";
GRANT ALL ON TABLE "public"."scopes" TO "service_role";



GRANT ALL ON TABLE "public"."server_access_requests" TO "anon";
GRANT ALL ON TABLE "public"."server_access_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."server_access_requests" TO "service_role";



GRANT ALL ON TABLE "public"."server_acl" TO "anon";
GRANT ALL ON TABLE "public"."server_acl" TO "authenticated";
GRANT ALL ON TABLE "public"."server_acl" TO "service_role";



GRANT ALL ON TABLE "public"."server_apps" TO "anon";
GRANT ALL ON TABLE "public"."server_apps" TO "authenticated";
GRANT ALL ON TABLE "public"."server_apps" TO "service_role";



GRANT ALL ON TABLE "public"."server_apps_scopes" TO "anon";
GRANT ALL ON TABLE "public"."server_apps_scopes" TO "authenticated";
GRANT ALL ON TABLE "public"."server_apps_scopes" TO "service_role";



GRANT ALL ON TABLE "public"."server_config" TO "anon";
GRANT ALL ON TABLE "public"."server_config" TO "authenticated";
GRANT ALL ON TABLE "public"."server_config" TO "service_role";



GRANT ALL ON TABLE "public"."server_invites" TO "anon";
GRANT ALL ON TABLE "public"."server_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."server_invites" TO "service_role";



GRANT ALL ON TABLE "public"."sso_providers" TO "anon";
GRANT ALL ON TABLE "public"."sso_providers" TO "authenticated";
GRANT ALL ON TABLE "public"."sso_providers" TO "service_role";



GRANT ALL ON TABLE "public"."stream_acl" TO "anon";
GRANT ALL ON TABLE "public"."stream_acl" TO "authenticated";
GRANT ALL ON TABLE "public"."stream_acl" TO "service_role";



GRANT ALL ON TABLE "public"."stream_activity" TO "anon";
GRANT ALL ON TABLE "public"."stream_activity" TO "authenticated";
GRANT ALL ON TABLE "public"."stream_activity" TO "service_role";



GRANT ALL ON TABLE "public"."stream_commits" TO "anon";
GRANT ALL ON TABLE "public"."stream_commits" TO "authenticated";
GRANT ALL ON TABLE "public"."stream_commits" TO "service_role";



GRANT ALL ON TABLE "public"."stream_favorites" TO "anon";
GRANT ALL ON TABLE "public"."stream_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."stream_favorites" TO "service_role";



GRANT ALL ON SEQUENCE "public"."stream_favorites_cursor_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."stream_favorites_cursor_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."stream_favorites_cursor_seq" TO "service_role";



GRANT ALL ON TABLE "public"."streams" TO "anon";
GRANT ALL ON TABLE "public"."streams" TO "authenticated";
GRANT ALL ON TABLE "public"."streams" TO "service_role";



GRANT ALL ON TABLE "public"."streams_meta" TO "anon";
GRANT ALL ON TABLE "public"."streams_meta" TO "authenticated";
GRANT ALL ON TABLE "public"."streams_meta" TO "service_role";



GRANT ALL ON TABLE "public"."token_resource_access" TO "anon";
GRANT ALL ON TABLE "public"."token_resource_access" TO "authenticated";
GRANT ALL ON TABLE "public"."token_resource_access" TO "service_role";



GRANT ALL ON TABLE "public"."token_scopes" TO "anon";
GRANT ALL ON TABLE "public"."token_scopes" TO "authenticated";
GRANT ALL ON TABLE "public"."token_scopes" TO "service_role";



GRANT ALL ON TABLE "public"."user_emails" TO "anon";
GRANT ALL ON TABLE "public"."user_emails" TO "authenticated";
GRANT ALL ON TABLE "public"."user_emails" TO "service_role";



GRANT ALL ON TABLE "public"."user_notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_notification_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_server_app_tokens" TO "anon";
GRANT ALL ON TABLE "public"."user_server_app_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."user_server_app_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."user_sso_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_sso_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sso_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."users_meta" TO "anon";
GRANT ALL ON TABLE "public"."users_meta" TO "authenticated";
GRANT ALL ON TABLE "public"."users_meta" TO "service_role";



GRANT ALL ON TABLE "public"."webhooks_config" TO "anon";
GRANT ALL ON TABLE "public"."webhooks_config" TO "authenticated";
GRANT ALL ON TABLE "public"."webhooks_config" TO "service_role";



GRANT ALL ON TABLE "public"."webhooks_events" TO "anon";
GRANT ALL ON TABLE "public"."webhooks_events" TO "authenticated";
GRANT ALL ON TABLE "public"."webhooks_events" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_acl" TO "anon";
GRANT ALL ON TABLE "public"."workspace_acl" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_acl" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_checkout_sessions" TO "anon";
GRANT ALL ON TABLE "public"."workspace_checkout_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_checkout_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_creation_state" TO "anon";
GRANT ALL ON TABLE "public"."workspace_creation_state" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_creation_state" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_domains" TO "anon";
GRANT ALL ON TABLE "public"."workspace_domains" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_domains" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_plans" TO "anon";
GRANT ALL ON TABLE "public"."workspace_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_plans" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_regions" TO "anon";
GRANT ALL ON TABLE "public"."workspace_regions" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_regions" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_sso_providers" TO "anon";
GRANT ALL ON TABLE "public"."workspace_sso_providers" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_sso_providers" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."workspace_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."workspaces" TO "anon";
GRANT ALL ON TABLE "public"."workspaces" TO "authenticated";
GRANT ALL ON TABLE "public"."workspaces" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
