import { Database, Json } from '@/utils/supabase/generated_remove/db';

export type DbProfile = Database['public']['Tables']['profiles']['Row'];
export type DbProject = Database['public']['Tables']['projects']['Row'];
export type DbFeature = Database['public']['Tables']['features']['Row'];

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

export type Profile = {
  id: string;
  displayName: string | null;
  imageUrl: string | null;
  bio: string | null;
  activeProjectId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserWithProfile = User & {
  profile: Profile;
};

export type ProjectProperties = {
  longitude?: number;
  latitude?: number;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  properties: ProjectProperties | null;
  adminId: string;
  createdAt: string;
  updatedAt: string;
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
