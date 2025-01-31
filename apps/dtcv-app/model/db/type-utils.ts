import { Feature, FeatureProperties } from '@/viewport';
import {
  DbProfile,
  DbUser,
  DbObject,
  DbStream,
  DbWorkspace,
  User,
  UserWithProfile,
  ProjectProperties,
  Project,
} from './types';
import { Entity } from '../entity/schema';

// help function to convert db types to runtime types

export function dbUserToUserWithProfile(dbUser: DbUser, profile: DbProfile): UserWithProfile {
  const user = dbUserToUser(dbUser);
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

export function dbProjectToProject(dbProject: DbStream): Project {
  // not sure here what kind of conversion is needed from db to runtime
  return { ...dbProject, properties: {} };
}

export function dbObjectToEntity(dbObject: DbObject): Entity {
  return dbObject as Entity;
}

export function entityToDbObject(entity: Entity): DbObject {
  return entity as DbObject;
}

export function projectToEntity(project: Project, extraProps?: FeatureProperties): Entity {
  return project as Entity;
}

// this function is to represent the project as an entity visually as this is defined in the properties
export function projectPropertiesToFeatureProperties(
  project: Project,
  extraProps?: FeatureProperties
): FeatureProperties {
  if (!project.properties) {
    return {};
  }
  return {
    ...extraProps,
    ...{
      // what to take from project?,
    },
  };
}
