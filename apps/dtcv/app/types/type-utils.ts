import {
  DbProfile,
  DbUser,
  DbProject,
  DbFeature,
  Feature,
  Profile,
  Project,
  User,
  UserWithProfile,
} from "../types";

export function dbUserToUserWithProfile(
  dbUser: DbUser,
  dbProfile: DbProfile
): UserWithProfile {
  const user = dbUserToUser(dbUser);
  const profile = dbProfileToProfile(dbProfile);
  return {
    ...user,
    profile: profile,
  };
}

export function dbUserToUser(dbUser: DbUser): User {
  return {
    instanceId: dbUser.instance_id,
    id: dbUser.id,
    aud: dbUser.aud,
    role: dbUser.role,
    email: dbUser.email,
    encryptedPassword: dbUser.encrypted_password,
    emailConfirmedAt: dbUser.email_confirmed_at,
    invitedAt: dbUser.invited_at,
    confirmationToken: dbUser.confirmation_token,
    confirmationSentAt: dbUser.confirmation_sent_at,
    recoveryToken: dbUser.recovery_token,
    recoverySentAt: dbUser.recovery_sent_at,
    emailChangeTokenNew: dbUser.email_change_token_new,
    emailChange: dbUser.email_change,
    emailChangeSentAt: dbUser.email_change_sent_at,
    lastSignInAt: dbUser.last_sign_in_at,
    rawAppMetaData: dbUser.raw_app_meta_data,
    rawUserMetaData: dbUser.raw_user_meta_data,
    isSuperAdmin: dbUser.is_super_admin,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    phone: dbUser.phone,
    phoneConfirmedAt: dbUser.phone_confirmed_at,
    phoneChange: dbUser.phone_change,
    phoneChangeToken: dbUser.phone_change_token,
    phoneChangeSentAt: dbUser.phone_change_sent_at,
    confirmedAt: dbUser.confirmed_at,
    emailChangeTokenCurrent: dbUser.email_change_token_current,
    emailChangeConfirmStatus: dbUser.email_change_confirm_status,
    bannedUntil: dbUser.banned_until,
    reauthenticationToken: dbUser.reauthentication_token,
    reauthenticationSentAt: dbUser.reauthentication_sent_at,
    isSsoUser: dbUser.is_sso_user,
    deletedAt: dbUser.deleted_at,
    isAnonymous: dbUser.is_anonymous,
  };
}

export function dbProfileToProfile(dbProfile: DbProfile): Profile {
  return {
    id: dbProfile.id,
    username: dbProfile.username,
    avatarUrl: dbProfile.avatar_url,
    bio: dbProfile.bio,
    activeProjectId: dbProfile.active_project_id,
    createdAt: dbProfile.created_at || new Date().toISOString(),
    updatedAt: dbProfile.updated_at || new Date().toISOString(),
  };
}
export function dbProjectToProject(dbProject: DbProject): Project {
  return {
    id: dbProject.id,
    name: dbProject.name,
    description: dbProject.description,
    properties: dbProject.properties,
    adminId: dbProject.admin_id || "",
    createdAt: dbProject.created_at || new Date().toISOString(),
    updatedAt: dbProject.updated_at || new Date().toISOString(),
  };
}

export function dbFeatureToFeature(dbFeature: DbFeature): Feature {
  return {
    id: dbFeature.id,
    createdAt: dbFeature.created_at || new Date().toISOString(),
    description: dbFeature.description,
    geometry: dbFeature.geometry,
    name: dbFeature.name,
    position: dbFeature.position,
    projectId: dbFeature.project_id,
    properties: dbFeature.properties,
    updatedAt: dbFeature.updated_at || new Date().toISOString(),
  };
}

export function featureToDbFeature(feature: Feature): DbFeature {
  return {
    id: feature.id,
    created_at: feature.createdAt || new Date().toISOString(),
    updated_at: feature.updatedAt || new Date().toISOString(),
    description: feature.description || null,
    geometry: feature.geometry || null,
    name: feature.name || null,
    position: feature.position || null,
    project_id: feature.projectId || null,
    properties: feature.properties || null,
  };
}
