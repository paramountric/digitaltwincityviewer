import { Database, Json } from '../generated/db';

export type DbProfile = Database['public']['Tables']['users']['Row'];
export type DbStream = Database['public']['Tables']['streams']['Row'];
export type DbObject = Database['public']['Tables']['objects']['Row'];
export type DbWorkspace = Database['public']['Tables']['workspaces']['Row'];

// The types generated from supabase might not correspond 1:1 to the runtime types
// so we need to define the runtime types here, and the conversion functions in type-utils.ts

// from supabase user
export type User = {
  instanceId: string;
  id: string;
  aud: string;
  role: string;
  email: string;
  encryptedPassword: string;
  emailConfirmedAt: string | null;
  invitedAt: string | null;
  confirmationToken: string | null;
  confirmationSentAt: string | null;
  recoveryToken: string | null;
  recoverySentAt: string | null;
  emailChangeTokenNew: string | null;
  emailChange: string | null;
  emailChangeSentAt: string | null;
  lastSignInAt: string | null;
  rawAppMetaData: Json;
  rawUserMetaData: Json;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  phone: string | null;
  phoneConfirmedAt: string | null;
  phoneChange: string | null;
  phoneChangeToken: string | null;
  phoneChangeSentAt: string | null;
  confirmedAt: string | null;
  emailChangeTokenCurrent: string | null;
  emailChangeConfirmStatus: number | null;
  bannedUntil: string | null;
  reauthenticationToken: string | null;
  reauthenticationSentAt: string | null;
  isSsoUser: boolean;
  deletedAt: string | null;
  isAnonymous: boolean;
};

export type UserWithProfile = User & {
  profile: DbProfile;
};

// not generated in script because it's in the auth schema
export type DbUser = {
  instance_id: string;
  id: string;
  aud: string;
  role: string;
  email: string;
  encrypted_password: string;
  email_confirmed_at: string | null;
  invited_at: string | null;
  confirmation_token: string | null;
  confirmation_sent_at: string | null;
  recovery_token: string | null;
  recovery_sent_at: string | null;
  email_change_token_new: string | null;
  email_change: string | null;
  email_change_sent_at: string | null;
  last_sign_in_at: string | null;
  raw_app_meta_data: Json;
  raw_user_meta_data: Json;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
  phone: string | null;
  phone_confirmed_at: string | null;
  phone_change: string | null;
  phone_change_token: string | null;
  phone_change_sent_at: string | null;
  confirmed_at: string | null;
  email_change_token_current: string | null;
  email_change_confirm_status: number | null;
  banned_until: string | null;
  reauthentication_token: string | null;
  reauthentication_sent_at: string | null;
  is_sso_user: boolean;
  deleted_at: string | null;
  is_anonymous: boolean;
};

export type ProjectProperties = {
  longitude?: number;
  latitude?: number;
};

export type Project = DbStream & {
  properties: ProjectProperties | null;
};
