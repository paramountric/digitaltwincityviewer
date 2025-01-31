import { Database, Json } from '../generated/db';

export type DbUser = Database['auth']['Tables']['users']['Row'];
export type DbProfile = Database['public']['Tables']['users']['Row'];
export type DbStream = Database['public']['Tables']['streams']['Row'];
export type DbObject = Database['public']['Tables']['objects']['Row'];
export type DbWorkspace = Database['public']['Tables']['workspaces']['Row'];

// The types generated from supabase might not correspond 1:1 to the runtime types
// so we need to define the runtime types here, and the conversion functions in type-utils.ts

// from supabase user, converted to camelCase
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

export type ProjectProperties = {
  longitude?: number;
  latitude?: number;
};

export type Project = DbStream & {
  properties: ProjectProperties | null;
};
