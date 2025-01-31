export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  auth: {
    Tables: {
      audit_log_entries: {
        Row: {
          created_at: string | null
          id: string
          instance_id: string | null
          ip_address: string
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          id: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Relationships: []
      }
      flow_state: {
        Row: {
          auth_code: string
          auth_code_issued_at: string | null
          authentication_method: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at: string | null
          id: string
          provider_access_token: string | null
          provider_refresh_token: string | null
          provider_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth_code: string
          auth_code_issued_at?: string | null
          authentication_method: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth_code?: string
          auth_code_issued_at?: string | null
          authentication_method?: string
          code_challenge?: string
          code_challenge_method?: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id?: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      identities: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          identity_data: Json
          last_sign_in_at: string | null
          provider: string
          provider_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data: Json
          last_sign_in_at?: string | null
          provider: string
          provider_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data?: Json
          last_sign_in_at?: string | null
          provider?: string
          provider_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      instances: {
        Row: {
          created_at: string | null
          id: string
          raw_base_config: string | null
          updated_at: string | null
          uuid: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Relationships: []
      }
      mfa_amr_claims: {
        Row: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Update: {
          authentication_method?: string
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mfa_amr_claims_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_challenges: {
        Row: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code: string | null
          verified_at: string | null
          web_authn_session_data: Json | null
        }
        Insert: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Update: {
          created_at?: string
          factor_id?: string
          id?: string
          ip_address?: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_challenges_auth_factor_id_fkey"
            columns: ["factor_id"]
            isOneToOne: false
            referencedRelation: "mfa_factors"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_factors: {
        Row: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name: string | null
          id: string
          last_challenged_at: string | null
          phone: string | null
          secret: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid: string | null
          web_authn_credential: Json | null
        }
        Insert: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id: string
          last_challenged_at?: string | null
          phone?: string | null
          secret?: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Update: {
          created_at?: string
          factor_type?: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id?: string
          last_challenged_at?: string | null
          phone?: string | null
          secret?: string | null
          status?: Database["auth"]["Enums"]["factor_status"]
          updated_at?: string
          user_id?: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_factors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      one_time_tokens: {
        Row: {
          created_at: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relates_to?: string
          token_hash?: string
          token_type?: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_time_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          created_at: string | null
          id: number
          instance_id: string | null
          parent: string | null
          revoked: boolean | null
          session_id: string | null
          token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_providers: {
        Row: {
          attribute_mapping: Json | null
          created_at: string | null
          entity_id: string
          id: string
          metadata_url: string | null
          metadata_xml: string
          name_id_format: string | null
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id: string
          id: string
          metadata_url?: string | null
          metadata_xml: string
          name_id_format?: string | null
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id?: string
          id?: string
          metadata_url?: string | null
          metadata_xml?: string
          name_id_format?: string | null
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_providers_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_relay_states: {
        Row: {
          created_at: string | null
          flow_state_id: string | null
          for_email: string | null
          id: string
          redirect_to: string | null
          request_id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id: string
          redirect_to?: string | null
          request_id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id?: string
          redirect_to?: string | null
          request_id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_relay_states_flow_state_id_fkey"
            columns: ["flow_state_id"]
            isOneToOne: false
            referencedRelation: "flow_state"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saml_relay_states_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_migrations: {
        Row: {
          version: string
        }
        Insert: {
          version: string
        }
        Update: {
          version?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          aal: Database["auth"]["Enums"]["aal_level"] | null
          created_at: string | null
          factor_id: string | null
          id: string
          ip: unknown | null
          not_after: string | null
          refreshed_at: string | null
          tag: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id: string
          ip?: unknown | null
          not_after?: string | null
          refreshed_at?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id?: string
          ip?: unknown | null
          not_after?: string | null
          refreshed_at?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_domains_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_providers: {
        Row: {
          created_at: string | null
          id: string
          resource_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          aud: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string
          instance_id: string | null
          invited_at: string | null
          is_anonymous: boolean
          is_sso_user: boolean
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      jwt: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      aal_level: "aal1" | "aal2" | "aal3"
      code_challenge_method: "s256" | "plain"
      factor_status: "unverified" | "verified"
      factor_type: "totp" | "webauthn" | "phone"
      one_time_token_type:
        | "confirmation_token"
        | "reauthentication_token"
        | "recovery_token"
        | "email_change_token_new"
        | "email_change_token_current"
        | "phone_change_token"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  n8n: {
    Tables: {
      annotation_tag_entity: {
        Row: {
          createdAt: string
          id: string
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          name: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      auth_identity: {
        Row: {
          createdAt: string
          providerId: string
          providerType: string
          updatedAt: string
          userId: string | null
        }
        Insert: {
          createdAt?: string
          providerId: string
          providerType: string
          updatedAt?: string
          userId?: string | null
        }
        Update: {
          createdAt?: string
          providerId?: string
          providerType?: string
          updatedAt?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auth_identity_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_provider_sync_history: {
        Row: {
          created: number
          disabled: number
          endedAt: string
          error: string | null
          id: number
          providerType: string
          runMode: string
          scanned: number
          startedAt: string
          status: string
          updated: number
        }
        Insert: {
          created: number
          disabled: number
          endedAt?: string
          error?: string | null
          id?: number
          providerType: string
          runMode: string
          scanned: number
          startedAt?: string
          status: string
          updated: number
        }
        Update: {
          created?: number
          disabled?: number
          endedAt?: string
          error?: string | null
          id?: number
          providerType?: string
          runMode?: string
          scanned?: number
          startedAt?: string
          status?: string
          updated?: number
        }
        Relationships: []
      }
      credentials_entity: {
        Row: {
          createdAt: string
          data: string
          id: string
          isManaged: boolean
          name: string
          type: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          data: string
          id: string
          isManaged?: boolean
          name: string
          type: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          data?: string
          id?: string
          isManaged?: boolean
          name?: string
          type?: string
          updatedAt?: string
        }
        Relationships: []
      }
      event_destinations: {
        Row: {
          createdAt: string
          destination: Json
          id: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          destination: Json
          id: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          destination?: Json
          id?: string
          updatedAt?: string
        }
        Relationships: []
      }
      execution_annotation_tags: {
        Row: {
          annotationId: number
          tagId: string
        }
        Insert: {
          annotationId: number
          tagId: string
        }
        Update: {
          annotationId?: number
          tagId?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_a3697779b366e131b2bbdae2976"
            columns: ["tagId"]
            isOneToOne: false
            referencedRelation: "annotation_tag_entity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FK_c1519757391996eb06064f0e7c8"
            columns: ["annotationId"]
            isOneToOne: false
            referencedRelation: "execution_annotations"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_annotations: {
        Row: {
          createdAt: string
          executionId: number
          id: number
          note: string | null
          updatedAt: string
          vote: string | null
        }
        Insert: {
          createdAt?: string
          executionId: number
          id?: number
          note?: string | null
          updatedAt?: string
          vote?: string | null
        }
        Update: {
          createdAt?: string
          executionId?: number
          id?: number
          note?: string | null
          updatedAt?: string
          vote?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FK_97f863fa83c4786f19565084960"
            columns: ["executionId"]
            isOneToOne: false
            referencedRelation: "execution_entity"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_data: {
        Row: {
          data: string
          executionId: number
          workflowData: Json
        }
        Insert: {
          data: string
          executionId: number
          workflowData: Json
        }
        Update: {
          data?: string
          executionId?: number
          workflowData?: Json
        }
        Relationships: [
          {
            foreignKeyName: "execution_data_fk"
            columns: ["executionId"]
            isOneToOne: true
            referencedRelation: "execution_entity"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_entity: {
        Row: {
          createdAt: string
          deletedAt: string | null
          finished: boolean
          id: number
          mode: string
          retryOf: string | null
          retrySuccessId: string | null
          startedAt: string | null
          status: string
          stoppedAt: string | null
          waitTill: string | null
          workflowId: string
        }
        Insert: {
          createdAt?: string
          deletedAt?: string | null
          finished: boolean
          id?: number
          mode: string
          retryOf?: string | null
          retrySuccessId?: string | null
          startedAt?: string | null
          status: string
          stoppedAt?: string | null
          waitTill?: string | null
          workflowId: string
        }
        Update: {
          createdAt?: string
          deletedAt?: string | null
          finished?: boolean
          id?: number
          mode?: string
          retryOf?: string | null
          retrySuccessId?: string | null
          startedAt?: string | null
          status?: string
          stoppedAt?: string | null
          waitTill?: string | null
          workflowId?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_execution_entity_workflow_id"
            columns: ["workflowId"]
            isOneToOne: false
            referencedRelation: "workflow_entity"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_metadata: {
        Row: {
          executionId: number
          id: number
          key: string
          value: string
        }
        Insert: {
          executionId: number
          id?: number
          key: string
          value: string
        }
        Update: {
          executionId?: number
          id?: number
          key?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_31d0b4c93fb85ced26f6005cda3"
            columns: ["executionId"]
            isOneToOne: false
            referencedRelation: "execution_entity"
            referencedColumns: ["id"]
          },
        ]
      }
      installed_nodes: {
        Row: {
          latestVersion: number
          name: string
          package: string
          type: string
        }
        Insert: {
          latestVersion?: number
          name: string
          package: string
          type: string
        }
        Update: {
          latestVersion?: number
          name?: string
          package?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_73f857fc5dce682cef8a99c11dbddbc969618951"
            columns: ["package"]
            isOneToOne: false
            referencedRelation: "installed_packages"
            referencedColumns: ["packageName"]
          },
        ]
      }
      installed_packages: {
        Row: {
          authorEmail: string | null
          authorName: string | null
          createdAt: string
          installedVersion: string
          packageName: string
          updatedAt: string
        }
        Insert: {
          authorEmail?: string | null
          authorName?: string | null
          createdAt?: string
          installedVersion: string
          packageName: string
          updatedAt?: string
        }
        Update: {
          authorEmail?: string | null
          authorName?: string | null
          createdAt?: string
          installedVersion?: string
          packageName?: string
          updatedAt?: string
        }
        Relationships: []
      }
      invalid_auth_token: {
        Row: {
          expiresAt: string
          token: string
        }
        Insert: {
          expiresAt: string
          token: string
        }
        Update: {
          expiresAt?: string
          token?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          id: number
          name: string
          timestamp: number
        }
        Insert: {
          id?: number
          name: string
          timestamp: number
        }
        Update: {
          id?: number
          name?: string
          timestamp?: number
        }
        Relationships: []
      }
      processed_data: {
        Row: {
          context: string
          createdAt: string
          updatedAt: string
          value: string
          workflowId: string
        }
        Insert: {
          context: string
          createdAt?: string
          updatedAt?: string
          value: string
          workflowId: string
        }
        Update: {
          context?: string
          createdAt?: string
          updatedAt?: string
          value?: string
          workflowId?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_06a69a7032c97a763c2c7599464"
            columns: ["workflowId"]
            isOneToOne: false
            referencedRelation: "workflow_entity"
            referencedColumns: ["id"]
          },
        ]
      }
      project: {
        Row: {
          createdAt: string
          icon: Json | null
          id: string
          name: string
          type: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          icon?: Json | null
          id: string
          name: string
          type: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          icon?: Json | null
          id?: string
          name?: string
          type?: string
          updatedAt?: string
        }
        Relationships: []
      }
      project_relation: {
        Row: {
          createdAt: string
          projectId: string
          role: string
          updatedAt: string
          userId: string
        }
        Insert: {
          createdAt?: string
          projectId: string
          role: string
          updatedAt?: string
          userId: string
        }
        Update: {
          createdAt?: string
          projectId?: string
          role?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_5f0643f6717905a05164090dde7"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FK_61448d56d61802b5dfde5cdb002"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      role: {
        Row: {
          createdAt: string
          id: number
          name: string
          scope: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id?: number
          name: string
          scope: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          id?: number
          name?: string
          scope?: string
          updatedAt?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          loadOnStartup: boolean
          value: string
        }
        Insert: {
          key: string
          loadOnStartup?: boolean
          value: string
        }
        Update: {
          key?: string
          loadOnStartup?: boolean
          value?: string
        }
        Relationships: []
      }
      shared_credentials: {
        Row: {
          createdAt: string
          credentialsId: string
          projectId: string
          role: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          credentialsId: string
          projectId: string
          role: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          credentialsId?: string
          projectId?: string
          role?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_416f66fc846c7c442970c094ccf"
            columns: ["credentialsId"]
            isOneToOne: false
            referencedRelation: "credentials_entity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FK_812c2852270da1247756e77f5a4"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_workflow: {
        Row: {
          createdAt: string
          projectId: string
          role: string
          updatedAt: string
          workflowId: string
        }
        Insert: {
          createdAt?: string
          projectId: string
          role: string
          updatedAt?: string
          workflowId: string
        }
        Update: {
          createdAt?: string
          projectId?: string
          role?: string
          updatedAt?: string
          workflowId?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_a45ea5f27bcfdc21af9b4188560"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FK_daa206a04983d47d0a9c34649ce"
            columns: ["workflowId"]
            isOneToOne: false
            referencedRelation: "workflow_entity"
            referencedColumns: ["id"]
          },
        ]
      }
      tag_entity: {
        Row: {
          createdAt: string
          id: string
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          name: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      test_definition: {
        Row: {
          annotationTagId: string | null
          createdAt: string
          description: string | null
          evaluationWorkflowId: string | null
          id: string
          mockedNodes: Json
          name: string
          updatedAt: string
          workflowId: string
        }
        Insert: {
          annotationTagId?: string | null
          createdAt?: string
          description?: string | null
          evaluationWorkflowId?: string | null
          id: string
          mockedNodes?: Json
          name: string
          updatedAt?: string
          workflowId: string
        }
        Update: {
          annotationTagId?: string | null
          createdAt?: string
          description?: string | null
          evaluationWorkflowId?: string | null
          id?: string
          mockedNodes?: Json
          name?: string
          updatedAt?: string
          workflowId?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_9ec1ce6fbf82305f489adb971d3"
            columns: ["evaluationWorkflowId"]
            isOneToOne: false
            referencedRelation: "workflow_entity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FK_b0dd0087fe3da02b0ffa4b9c5bb"
            columns: ["workflowId"]
            isOneToOne: false
            referencedRelation: "workflow_entity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FK_d5d7ea64662dbc62f5e266fbeb0"
            columns: ["annotationTagId"]
            isOneToOne: false
            referencedRelation: "annotation_tag_entity"
            referencedColumns: ["id"]
          },
        ]
      }
      test_metric: {
        Row: {
          createdAt: string
          id: string
          name: string
          testDefinitionId: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          name: string
          testDefinitionId: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          testDefinitionId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_3a4e9cf37111ac3270e2469b475"
            columns: ["testDefinitionId"]
            isOneToOne: false
            referencedRelation: "test_definition"
            referencedColumns: ["id"]
          },
        ]
      }
      test_run: {
        Row: {
          completedAt: string | null
          createdAt: string
          failedCases: number | null
          id: string
          metrics: Json | null
          passedCases: number | null
          runAt: string | null
          status: string
          testDefinitionId: string
          totalCases: number | null
          updatedAt: string
        }
        Insert: {
          completedAt?: string | null
          createdAt?: string
          failedCases?: number | null
          id: string
          metrics?: Json | null
          passedCases?: number | null
          runAt?: string | null
          status: string
          testDefinitionId: string
          totalCases?: number | null
          updatedAt?: string
        }
        Update: {
          completedAt?: string | null
          createdAt?: string
          failedCases?: number | null
          id?: string
          metrics?: Json | null
          passedCases?: number | null
          runAt?: string | null
          status?: string
          testDefinitionId?: string
          totalCases?: number | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_3a81713a76f2295b12b46cdfcab"
            columns: ["testDefinitionId"]
            isOneToOne: false
            referencedRelation: "test_definition"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          createdAt: string
          disabled: boolean
          email: string | null
          firstName: string | null
          id: string
          lastName: string | null
          mfaEnabled: boolean
          mfaRecoveryCodes: string | null
          mfaSecret: string | null
          password: string | null
          personalizationAnswers: Json | null
          role: string
          settings: Json | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          disabled?: boolean
          email?: string | null
          firstName?: string | null
          id?: string
          lastName?: string | null
          mfaEnabled?: boolean
          mfaRecoveryCodes?: string | null
          mfaSecret?: string | null
          password?: string | null
          personalizationAnswers?: Json | null
          role: string
          settings?: Json | null
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          disabled?: boolean
          email?: string | null
          firstName?: string | null
          id?: string
          lastName?: string | null
          mfaEnabled?: boolean
          mfaRecoveryCodes?: string | null
          mfaSecret?: string | null
          password?: string | null
          personalizationAnswers?: Json | null
          role?: string
          settings?: Json | null
          updatedAt?: string
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          apiKey: string
          createdAt: string
          id: string
          label: string
          updatedAt: string
          userId: string
        }
        Insert: {
          apiKey: string
          createdAt?: string
          id: string
          label: string
          updatedAt?: string
          userId: string
        }
        Update: {
          apiKey?: string
          createdAt?: string
          id?: string
          label?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_e131705cbbc8fb589889b02d457"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      variables: {
        Row: {
          id: string
          key: string
          type: string
          value: string | null
        }
        Insert: {
          id: string
          key: string
          type?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          type?: string
          value?: string | null
        }
        Relationships: []
      }
      webhook_entity: {
        Row: {
          method: string
          node: string
          pathLength: number | null
          webhookId: string | null
          webhookPath: string
          workflowId: string
        }
        Insert: {
          method: string
          node: string
          pathLength?: number | null
          webhookId?: string | null
          webhookPath: string
          workflowId: string
        }
        Update: {
          method?: string
          node?: string
          pathLength?: number | null
          webhookId?: string | null
          webhookPath?: string
          workflowId?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_webhook_entity_workflow_id"
            columns: ["workflowId"]
            isOneToOne: false
            referencedRelation: "workflow_entity"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_entity: {
        Row: {
          active: boolean
          connections: Json
          createdAt: string
          id: string
          meta: Json | null
          name: string
          nodes: Json
          pinData: Json | null
          settings: Json | null
          staticData: Json | null
          triggerCount: number
          updatedAt: string
          versionId: string | null
        }
        Insert: {
          active: boolean
          connections: Json
          createdAt?: string
          id: string
          meta?: Json | null
          name: string
          nodes: Json
          pinData?: Json | null
          settings?: Json | null
          staticData?: Json | null
          triggerCount?: number
          updatedAt?: string
          versionId?: string | null
        }
        Update: {
          active?: boolean
          connections?: Json
          createdAt?: string
          id?: string
          meta?: Json | null
          name?: string
          nodes?: Json
          pinData?: Json | null
          settings?: Json | null
          staticData?: Json | null
          triggerCount?: number
          updatedAt?: string
          versionId?: string | null
        }
        Relationships: []
      }
      workflow_history: {
        Row: {
          authors: string
          connections: Json
          createdAt: string
          nodes: Json
          updatedAt: string
          versionId: string
          workflowId: string
        }
        Insert: {
          authors: string
          connections: Json
          createdAt?: string
          nodes: Json
          updatedAt?: string
          versionId: string
          workflowId: string
        }
        Update: {
          authors?: string
          connections?: Json
          createdAt?: string
          nodes?: Json
          updatedAt?: string
          versionId?: string
          workflowId?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_1e31657f5fe46816c34be7c1b4b"
            columns: ["workflowId"]
            isOneToOne: false
            referencedRelation: "workflow_entity"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_statistics: {
        Row: {
          count: number | null
          latestEvent: string | null
          name: string
          workflowId: string
        }
        Insert: {
          count?: number | null
          latestEvent?: string | null
          name: string
          workflowId: string
        }
        Update: {
          count?: number | null
          latestEvent?: string | null
          name?: string
          workflowId?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_workflow_statistics_workflow_id"
            columns: ["workflowId"]
            isOneToOne: false
            referencedRelation: "workflow_entity"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows_tags: {
        Row: {
          tagId: string
          workflowId: string
        }
        Insert: {
          tagId: string
          workflowId: string
        }
        Update: {
          tagId?: string
          workflowId?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_workflows_tags_tag_id"
            columns: ["tagId"]
            isOneToOne: false
            referencedRelation: "tag_entity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_workflows_tags_workflow_id"
            columns: ["workflowId"]
            isOneToOne: false
            referencedRelation: "workflow_entity"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      api_tokens: {
        Row: {
          createdAt: string | null
          id: string
          lastChars: string | null
          lastUsed: string | null
          lifespan: number | null
          name: string | null
          owner: string
          revoked: boolean | null
          tokenDigest: string | null
        }
        Insert: {
          createdAt?: string | null
          id: string
          lastChars?: string | null
          lastUsed?: string | null
          lifespan?: number | null
          name?: string | null
          owner: string
          revoked?: boolean | null
          tokenDigest?: string | null
        }
        Update: {
          createdAt?: string | null
          id?: string
          lastChars?: string | null
          lastUsed?: string | null
          lifespan?: number | null
          name?: string | null
          owner?: string
          revoked?: boolean | null
          tokenDigest?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_tokens_owner_foreign"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      authorization_codes: {
        Row: {
          appId: string | null
          challenge: string
          createdAt: string | null
          id: string
          lifespan: number | null
          userId: string | null
        }
        Insert: {
          appId?: string | null
          challenge: string
          createdAt?: string | null
          id: string
          lifespan?: number | null
          userId?: string | null
        }
        Update: {
          appId?: string | null
          challenge?: string
          createdAt?: string | null
          id?: string
          lifespan?: number | null
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "authorization_codes_appid_foreign"
            columns: ["appId"]
            isOneToOne: false
            referencedRelation: "server_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "authorization_codes_userid_foreign"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_function_runs: {
        Row: {
          contextView: string | null
          createdAt: string
          elapsed: number
          functionId: string
          functionReleaseId: string
          id: string
          results: Json | null
          runId: string
          status: string
          statusMessage: string | null
          updatedAt: string
        }
        Insert: {
          contextView?: string | null
          createdAt?: string
          elapsed: number
          functionId: string
          functionReleaseId: string
          id: string
          results?: Json | null
          runId: string
          status: string
          statusMessage?: string | null
          updatedAt?: string
        }
        Update: {
          contextView?: string | null
          createdAt?: string
          elapsed?: number
          functionId?: string
          functionReleaseId?: string
          id?: string
          results?: Json | null
          runId?: string
          status?: string
          statusMessage?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_function_runs_runid_foreign"
            columns: ["runId"]
            isOneToOne: false
            referencedRelation: "automation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_revision_functions: {
        Row: {
          automationRevisionId: string
          functionId: string
          functionInputs: string | null
          functionReleaseId: string
          id: string
        }
        Insert: {
          automationRevisionId: string
          functionId: string
          functionInputs?: string | null
          functionReleaseId: string
          id?: string
        }
        Update: {
          automationRevisionId?: string
          functionId?: string
          functionInputs?: string | null
          functionReleaseId?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_revision_functions_automationrevisionid_foreign"
            columns: ["automationRevisionId"]
            isOneToOne: false
            referencedRelation: "automation_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_revisions: {
        Row: {
          active: boolean
          automationId: string | null
          createdAt: string
          id: string
          publicKey: string
          userId: string | null
        }
        Insert: {
          active?: boolean
          automationId?: string | null
          createdAt?: string
          id: string
          publicKey: string
          userId?: string | null
        }
        Update: {
          active?: boolean
          automationId?: string | null
          createdAt?: string
          id?: string
          publicKey?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_revisions_automationid_foreign"
            columns: ["automationId"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_revisions_userid_foreign"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_run_triggers: {
        Row: {
          automationRunId: string
          triggeringId: string
          triggerType: string
        }
        Insert: {
          automationRunId: string
          triggeringId: string
          triggerType: string
        }
        Update: {
          automationRunId?: string
          triggeringId?: string
          triggerType?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_run_triggers_automationrunid_foreign"
            columns: ["automationRunId"]
            isOneToOne: false
            referencedRelation: "automation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_runs: {
        Row: {
          automationRevisionId: string
          createdAt: string
          executionEngineRunId: string | null
          id: string
          status: string
          updatedAt: string
        }
        Insert: {
          automationRevisionId: string
          createdAt?: string
          executionEngineRunId?: string | null
          id: string
          status: string
          updatedAt?: string
        }
        Update: {
          automationRevisionId?: string
          createdAt?: string
          executionEngineRunId?: string | null
          id?: string
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_runs_automationrevisionid_foreign"
            columns: ["automationRevisionId"]
            isOneToOne: false
            referencedRelation: "automation_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_tokens: {
        Row: {
          automateToken: string
          automationId: string
        }
        Insert: {
          automateToken: string
          automationId: string
        }
        Update: {
          automateToken?: string
          automationId?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_tokens_automationid_foreign"
            columns: ["automationId"]
            isOneToOne: true
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_triggers: {
        Row: {
          automationRevisionId: string
          triggeringId: string
          triggerType: string
        }
        Insert: {
          automationRevisionId: string
          triggeringId: string
          triggerType: string
        }
        Update: {
          automationRevisionId?: string
          triggeringId?: string
          triggerType?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_triggers_automationrevisionid_foreign"
            columns: ["automationRevisionId"]
            isOneToOne: false
            referencedRelation: "automation_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          createdAt: string
          enabled: boolean
          executionEngineAutomationId: string | null
          id: string
          isTestAutomation: boolean
          name: string
          projectId: string | null
          updatedAt: string
          userId: string | null
        }
        Insert: {
          createdAt?: string
          enabled: boolean
          executionEngineAutomationId?: string | null
          id: string
          isTestAutomation?: boolean
          name: string
          projectId?: string | null
          updatedAt?: string
          userId?: string | null
        }
        Update: {
          createdAt?: string
          enabled?: boolean
          executionEngineAutomationId?: string | null
          id?: string
          isTestAutomation?: boolean
          name?: string
          projectId?: string | null
          updatedAt?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automations_projectid_foreign"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_userid_foreign"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blob_storage: {
        Row: {
          createdAt: string | null
          fileHash: string | null
          fileName: string
          fileSize: number | null
          fileType: string
          id: string
          objectKey: string | null
          streamId: string
          uploadError: string | null
          uploadStatus: number
          userId: string | null
        }
        Insert: {
          createdAt?: string | null
          fileHash?: string | null
          fileName: string
          fileSize?: number | null
          fileType: string
          id: string
          objectKey?: string | null
          streamId: string
          uploadError?: string | null
          uploadStatus?: number
          userId?: string | null
        }
        Update: {
          createdAt?: string | null
          fileHash?: string | null
          fileName?: string
          fileSize?: number | null
          fileType?: string
          id?: string
          objectKey?: string | null
          streamId?: string
          uploadError?: string | null
          uploadStatus?: number
          userId?: string | null
        }
        Relationships: []
      }
      branch_commits: {
        Row: {
          branchId: string
          commitId: string
        }
        Insert: {
          branchId: string
          commitId: string
        }
        Update: {
          branchId?: string
          commitId?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_commits_branchid_foreign"
            columns: ["branchId"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_commits_commitid_foreign"
            columns: ["commitId"]
            isOneToOne: false
            referencedRelation: "commits"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          authorId: string | null
          createdAt: string | null
          description: string | null
          id: string
          name: string
          streamId: string
          updatedAt: string | null
        }
        Insert: {
          authorId?: string | null
          createdAt?: string | null
          description?: string | null
          id: string
          name: string
          streamId: string
          updatedAt?: string | null
        }
        Update: {
          authorId?: string | null
          createdAt?: string | null
          description?: string | null
          id?: string
          name?: string
          streamId?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_authorid_foreign"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branches_streamid_foreign"
            columns: ["streamId"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_links: {
        Row: {
          commentId: string | null
          resourceId: string
          resourceType: string
        }
        Insert: {
          commentId?: string | null
          resourceId: string
          resourceType: string
        }
        Update: {
          commentId?: string | null
          resourceId?: string
          resourceType?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_links_commentid_foreign"
            columns: ["commentId"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_views: {
        Row: {
          commentId: string
          userId: string
          viewedAt: string | null
        }
        Insert: {
          commentId: string
          userId: string
          viewedAt?: string | null
        }
        Update: {
          commentId?: string
          userId?: string
          viewedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_views_commentid_foreign"
            columns: ["commentId"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_views_userid_foreign"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          archived: boolean
          authorId: string
          createdAt: string | null
          data: Json | null
          id: string
          parentComment: string | null
          screenshot: string | null
          streamId: string
          text: string | null
          updatedAt: string | null
        }
        Insert: {
          archived?: boolean
          authorId: string
          createdAt?: string | null
          data?: Json | null
          id: string
          parentComment?: string | null
          screenshot?: string | null
          streamId: string
          text?: string | null
          updatedAt?: string | null
        }
        Update: {
          archived?: boolean
          authorId?: string
          createdAt?: string | null
          data?: Json | null
          id?: string
          parentComment?: string | null
          screenshot?: string | null
          streamId?: string
          text?: string | null
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_authorid_foreign"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parentcomment_foreign"
            columns: ["parentComment"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_streamid_foreign"
            columns: ["streamId"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      commits: {
        Row: {
          author: string | null
          createdAt: string | null
          id: string
          message: string | null
          parents: string[] | null
          referencedObject: string
          sourceApplication: string | null
          totalChildrenCount: number | null
        }
        Insert: {
          author?: string | null
          createdAt?: string | null
          id: string
          message?: string | null
          parents?: string[] | null
          referencedObject: string
          sourceApplication?: string | null
          totalChildrenCount?: number | null
        }
        Update: {
          author?: string | null
          createdAt?: string | null
          id?: string
          message?: string | null
          parents?: string[] | null
          referencedObject?: string
          sourceApplication?: string | null
          totalChildrenCount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "commits_author_foreign"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verifications: {
        Row: {
          createdAt: string | null
          email: string | null
          id: string
        }
        Insert: {
          createdAt?: string | null
          email?: string | null
          id: string
        }
        Update: {
          createdAt?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          branchName: string
          convertedCommitId: string | null
          convertedLastUpdate: string | null
          convertedMessage: string | null
          convertedStatus: number
          fileName: string
          fileSize: number | null
          fileType: string
          id: string
          streamId: string | null
          uploadComplete: boolean
          uploadDate: string | null
          userId: string
        }
        Insert: {
          branchName: string
          convertedCommitId?: string | null
          convertedLastUpdate?: string | null
          convertedMessage?: string | null
          convertedStatus?: number
          fileName: string
          fileSize?: number | null
          fileType: string
          id: string
          streamId?: string | null
          uploadComplete?: boolean
          uploadDate?: string | null
          userId: string
        }
        Update: {
          branchName?: string
          convertedCommitId?: string | null
          convertedLastUpdate?: string | null
          convertedMessage?: string | null
          convertedStatus?: number
          fileName?: string
          fileSize?: number | null
          fileType?: string
          id?: string
          streamId?: string | null
          uploadComplete?: boolean
          uploadDate?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_streamid_foreign"
            columns: ["streamId"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      gendo_ai_renders: {
        Row: {
          baseImage: string
          camera: Json
          createdAt: string
          gendoGenerationId: string | null
          id: string
          modelId: string | null
          projectId: string | null
          prompt: string
          responseImage: string | null
          status: string
          updatedAt: string
          userId: string | null
          versionId: string | null
        }
        Insert: {
          baseImage: string
          camera: Json
          createdAt?: string
          gendoGenerationId?: string | null
          id: string
          modelId?: string | null
          projectId?: string | null
          prompt: string
          responseImage?: string | null
          status: string
          updatedAt?: string
          userId?: string | null
          versionId?: string | null
        }
        Update: {
          baseImage?: string
          camera?: Json
          createdAt?: string
          gendoGenerationId?: string | null
          id?: string
          modelId?: string | null
          projectId?: string | null
          prompt?: string
          responseImage?: string | null
          status?: string
          updatedAt?: string
          userId?: string | null
          versionId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gendo_ai_renders_modelid_foreign"
            columns: ["modelId"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gendo_ai_renders_projectid_foreign"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gendo_ai_renders_userid_foreign"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gendo_ai_renders_versionid_foreign"
            columns: ["versionId"]
            isOneToOne: false
            referencedRelation: "commits"
            referencedColumns: ["id"]
          },
        ]
      }
      gendo_user_credits: {
        Row: {
          resetDate: string
          used: number
          userId: string
        }
        Insert: {
          resetDate: string
          used: number
          userId: string
        }
        Update: {
          resetDate?: string
          used?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "gendo_user_credits_userid_foreign"
            columns: ["userId"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      knex_migrations: {
        Row: {
          batch: number | null
          id: number
          migration_time: string | null
          name: string | null
        }
        Insert: {
          batch?: number | null
          id?: number
          migration_time?: string | null
          name?: string | null
        }
        Update: {
          batch?: number | null
          id?: number
          migration_time?: string | null
          name?: string | null
        }
        Relationships: []
      }
      knex_migrations_lock: {
        Row: {
          index: number
          is_locked: number | null
        }
        Insert: {
          index?: number
          is_locked?: number | null
        }
        Update: {
          index?: number
          is_locked?: number | null
        }
        Relationships: []
      }
      object_children_closure: {
        Row: {
          child: string
          minDepth: number
          parent: string
          streamId: string
        }
        Insert: {
          child: string
          minDepth?: number
          parent: string
          streamId: string
        }
        Update: {
          child?: string
          minDepth?: number
          parent?: string
          streamId?: string
        }
        Relationships: [
          {
            foreignKeyName: "object_children_closure_streamid_foreign"
            columns: ["streamId"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      object_preview: {
        Row: {
          lastUpdate: string
          objectId: string
          preview: Json | null
          previewStatus: number
          priority: number
          streamId: string
        }
        Insert: {
          lastUpdate?: string
          objectId: string
          preview?: Json | null
          previewStatus?: number
          priority?: number
          streamId: string
        }
        Update: {
          lastUpdate?: string
          objectId?: string
          preview?: Json | null
          previewStatus?: number
          priority?: number
          streamId?: string
        }
        Relationships: [
          {
            foreignKeyName: "object_preview_streamid_foreign"
            columns: ["streamId"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      objects: {
        Row: {
          createdAt: string | null
          data: Json | null
          id: string
          speckleType: string
          streamId: string
          totalChildrenCount: number | null
          totalChildrenCountByDepth: Json | null
        }
        Insert: {
          createdAt?: string | null
          data?: Json | null
          id: string
          speckleType?: string
          streamId: string
          totalChildrenCount?: number | null
          totalChildrenCountByDepth?: Json | null
        }
        Update: {
          createdAt?: string | null
          data?: Json | null
          id?: string
          speckleType?: string
          streamId?: string
          totalChildrenCount?: number | null
          totalChildrenCountByDepth?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_streamid_foreign"
            columns: ["streamId"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_api_tokens: {
        Row: {
          tokenId: string | null
          userId: string | null
        }
        Insert: {
          tokenId?: string | null
          userId?: string | null
        }
        Update: {
          tokenId?: string | null
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_api_tokens_tokenid_foreign"
            columns: ["tokenId"]
            isOneToOne: false
            referencedRelation: "api_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_api_tokens_userid_foreign"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      previews: {
        Row: {
          data: string | null
          id: string
        }
        Insert: {
          data?: string | null
          id: string
        }
        Update: {
          data?: string | null
          id?: string
        }
        Relationships: []
      }
      pwdreset_tokens: {
        Row: {
          createdAt: string | null
          email: string
          id: string
        }
        Insert: {
          createdAt?: string | null
          email: string
          id?: string
        }
        Update: {
          createdAt?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      ratelimit_actions: {
        Row: {
          action: string
          source: string
          timestamp: string | null
        }
        Insert: {
          action: string
          source: string
          timestamp?: string | null
        }
        Update: {
          action?: string
          source?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      refresh_tokens: {
        Row: {
          appId: string | null
          createdAt: string | null
          id: string
          lifespan: number | null
          tokenDigest: string
          userId: string | null
        }
        Insert: {
          appId?: string | null
          createdAt?: string | null
          id: string
          lifespan?: number | null
          tokenDigest: string
          userId?: string | null
        }
        Update: {
          appId?: string | null
          createdAt?: string | null
          id?: string
          lifespan?: number | null
          tokenDigest?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_appid_foreign"
            columns: ["appId"]
            isOneToOne: false
            referencedRelation: "server_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refresh_tokens_userid_foreign"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          createdAt: string
          description: string | null
          key: string
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          key: string
          name: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          key?: string
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          lockExpiresAt: string
          taskName: string
        }
        Insert: {
          lockExpiresAt: string
          taskName: string
        }
        Update: {
          lockExpiresAt?: string
          taskName?: string
        }
        Relationships: []
      }
      scopes: {
        Row: {
          description: string
          name: string
          public: boolean | null
        }
        Insert: {
          description: string
          name: string
          public?: boolean | null
        }
        Update: {
          description?: string
          name?: string
          public?: boolean | null
        }
        Relationships: []
      }
      server_access_requests: {
        Row: {
          createdAt: string
          id: string
          requesterId: string
          resourceId: string | null
          resourceType: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          requesterId: string
          resourceId?: string | null
          resourceType: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          id?: string
          requesterId?: string
          resourceId?: string | null
          resourceType?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_access_requests_requesterid_foreign"
            columns: ["requesterId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      server_acl: {
        Row: {
          role: string
          userId: string
        }
        Insert: {
          role: string
          userId: string
        }
        Update: {
          role?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_acl_role_foreign"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "server_acl_userid_foreign"
            columns: ["userId"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      server_apps: {
        Row: {
          authorId: string | null
          createdAt: string | null
          description: string | null
          id: string
          logo: string | null
          name: string
          public: boolean | null
          redirectUrl: string
          secret: string | null
          termsAndConditionsLink: string | null
          trustByDefault: boolean | null
        }
        Insert: {
          authorId?: string | null
          createdAt?: string | null
          description?: string | null
          id: string
          logo?: string | null
          name: string
          public?: boolean | null
          redirectUrl: string
          secret?: string | null
          termsAndConditionsLink?: string | null
          trustByDefault?: boolean | null
        }
        Update: {
          authorId?: string | null
          createdAt?: string | null
          description?: string | null
          id?: string
          logo?: string | null
          name?: string
          public?: boolean | null
          redirectUrl?: string
          secret?: string | null
          termsAndConditionsLink?: string | null
          trustByDefault?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "server_apps_authorid_foreign"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      server_apps_scopes: {
        Row: {
          appId: string
          scopeName: string
        }
        Insert: {
          appId: string
          scopeName: string
        }
        Update: {
          appId?: string
          scopeName?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_apps_scopes_appid_foreign"
            columns: ["appId"]
            isOneToOne: false
            referencedRelation: "server_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_apps_scopes_scopename_foreign"
            columns: ["scopeName"]
            isOneToOne: false
            referencedRelation: "scopes"
            referencedColumns: ["name"]
          },
        ]
      }
      server_config: {
        Row: {
          adminContact: string | null
          canonicalUrl: string | null
          company: string | null
          completed: boolean | null
          description: string | null
          guestModeEnabled: boolean
          id: number
          inviteOnly: boolean | null
          name: string | null
          termsOfService: string | null
        }
        Insert: {
          adminContact?: string | null
          canonicalUrl?: string | null
          company?: string | null
          completed?: boolean | null
          description?: string | null
          guestModeEnabled?: boolean
          id?: number
          inviteOnly?: boolean | null
          name?: string | null
          termsOfService?: string | null
        }
        Update: {
          adminContact?: string | null
          canonicalUrl?: string | null
          company?: string | null
          completed?: boolean | null
          description?: string | null
          guestModeEnabled?: boolean
          id?: number
          inviteOnly?: boolean | null
          name?: string | null
          termsOfService?: string | null
        }
        Relationships: []
      }
      server_invites: {
        Row: {
          createdAt: string | null
          id: string
          inviterId: string
          message: string | null
          resource: Json
          target: string
          token: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string | null
          id?: string
          inviterId: string
          message?: string | null
          resource?: Json
          target: string
          token?: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string | null
          id?: string
          inviterId?: string
          message?: string | null
          resource?: Json
          target?: string
          token?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_invites_inviterid_foreign"
            columns: ["inviterId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_providers: {
        Row: {
          createdAt: string
          encryptedProviderData: string
          id: string
          providerType: string
          updatedAt: string
        }
        Insert: {
          createdAt: string
          encryptedProviderData: string
          id: string
          providerType: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          encryptedProviderData?: string
          id?: string
          providerType?: string
          updatedAt?: string
        }
        Relationships: []
      }
      stream_acl: {
        Row: {
          resourceId: string
          role: string
          userId: string
        }
        Insert: {
          resourceId: string
          role: string
          userId: string
        }
        Update: {
          resourceId?: string
          role?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_acl_resourceid_foreign"
            columns: ["resourceId"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_acl_role_foreign"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "stream_acl_userid_foreign"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_activity: {
        Row: {
          actionType: string | null
          info: Json | null
          message: string | null
          resourceId: string | null
          resourceType: string | null
          streamId: string | null
          time: string | null
          userId: string | null
        }
        Insert: {
          actionType?: string | null
          info?: Json | null
          message?: string | null
          resourceId?: string | null
          resourceType?: string | null
          streamId?: string | null
          time?: string | null
          userId?: string | null
        }
        Update: {
          actionType?: string | null
          info?: Json | null
          message?: string | null
          resourceId?: string | null
          resourceType?: string | null
          streamId?: string | null
          time?: string | null
          userId?: string | null
        }
        Relationships: []
      }
      stream_commits: {
        Row: {
          commitId: string
          streamId: string
        }
        Insert: {
          commitId: string
          streamId: string
        }
        Update: {
          commitId?: string
          streamId?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_commits_commitid_foreign"
            columns: ["commitId"]
            isOneToOne: false
            referencedRelation: "commits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_commits_streamid_foreign"
            columns: ["streamId"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_favorites: {
        Row: {
          createdAt: string | null
          cursor: number
          streamId: string
          userId: string
        }
        Insert: {
          createdAt?: string | null
          cursor?: number
          streamId: string
          userId: string
        }
        Update: {
          createdAt?: string | null
          cursor?: number
          streamId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_favorites_streamid_foreign"
            columns: ["streamId"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_favorites_userid_foreign"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      streams: {
        Row: {
          allowPublicComments: boolean | null
          clonedFrom: string | null
          createdAt: string | null
          description: string | null
          id: string
          isDiscoverable: boolean
          isPublic: boolean | null
          name: string
          regionKey: string | null
          updatedAt: string | null
          workspaceId: string | null
        }
        Insert: {
          allowPublicComments?: boolean | null
          clonedFrom?: string | null
          createdAt?: string | null
          description?: string | null
          id: string
          isDiscoverable?: boolean
          isPublic?: boolean | null
          name?: string
          regionKey?: string | null
          updatedAt?: string | null
          workspaceId?: string | null
        }
        Update: {
          allowPublicComments?: boolean | null
          clonedFrom?: string | null
          createdAt?: string | null
          description?: string | null
          id?: string
          isDiscoverable?: boolean
          isPublic?: boolean | null
          name?: string
          regionKey?: string | null
          updatedAt?: string | null
          workspaceId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "streams_clonedfrom_foreign"
            columns: ["clonedFrom"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streams_workspaceid_foreign"
            columns: ["workspaceId"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      streams_meta: {
        Row: {
          createdAt: string
          key: string
          streamId: string
          updatedAt: string
          value: Json | null
        }
        Insert: {
          createdAt?: string
          key: string
          streamId: string
          updatedAt?: string
          value?: Json | null
        }
        Update: {
          createdAt?: string
          key?: string
          streamId?: string
          updatedAt?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "streams_meta_streamid_foreign"
            columns: ["streamId"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      token_resource_access: {
        Row: {
          resourceId: string
          resourceType: string
          tokenId: string
        }
        Insert: {
          resourceId: string
          resourceType: string
          tokenId: string
        }
        Update: {
          resourceId?: string
          resourceType?: string
          tokenId?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_resource_access_tokenid_foreign"
            columns: ["tokenId"]
            isOneToOne: false
            referencedRelation: "api_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      token_scopes: {
        Row: {
          scopeName: string
          tokenId: string
        }
        Insert: {
          scopeName: string
          tokenId: string
        }
        Update: {
          scopeName?: string
          tokenId?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_scopes_scopename_foreign"
            columns: ["scopeName"]
            isOneToOne: false
            referencedRelation: "scopes"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "token_scopes_tokenid_foreign"
            columns: ["tokenId"]
            isOneToOne: false
            referencedRelation: "api_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      user_emails: {
        Row: {
          createdAt: string
          email: string
          id: string
          primary: boolean | null
          updatedAt: string
          userId: string
          verified: boolean | null
        }
        Insert: {
          createdAt?: string
          email: string
          id: string
          primary?: boolean | null
          updatedAt?: string
          userId: string
          verified?: boolean | null
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
          primary?: boolean | null
          updatedAt?: string
          userId?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_emails_userid_foreign"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_preferences: {
        Row: {
          preferences: Json
          userId: string
        }
        Insert: {
          preferences: Json
          userId: string
        }
        Update: {
          preferences?: Json
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_userid_foreign"
            columns: ["userId"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          aclTableName: string
          description: string
          name: string
          public: boolean | null
          resourceTarget: string
          weight: number
        }
        Insert: {
          aclTableName: string
          description: string
          name: string
          public?: boolean | null
          resourceTarget: string
          weight?: number
        }
        Update: {
          aclTableName?: string
          description?: string
          name?: string
          public?: boolean | null
          resourceTarget?: string
          weight?: number
        }
        Relationships: []
      }
      user_server_app_tokens: {
        Row: {
          appId: string
          tokenId: string
          userId: string
        }
        Insert: {
          appId: string
          tokenId: string
          userId: string
        }
        Update: {
          appId?: string
          tokenId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_server_app_tokens_appid_foreign"
            columns: ["appId"]
            isOneToOne: false
            referencedRelation: "server_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_server_app_tokens_tokenid_foreign"
            columns: ["tokenId"]
            isOneToOne: false
            referencedRelation: "api_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_server_app_tokens_userid_foreign"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sso_sessions: {
        Row: {
          createdAt: string
          providerId: string
          userId: string
          validUntil: string
        }
        Insert: {
          createdAt: string
          providerId: string
          userId: string
          validUntil?: string
        }
        Update: {
          createdAt?: string
          providerId?: string
          userId?: string
          validUntil?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sso_sessions_providerid_foreign"
            columns: ["providerId"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sso_sessions_userid_foreign"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          bio: string | null
          company: string | null
          createdAt: string | null
          email: string
          id: string
          ip: string | null
          name: string
          passwordDigest: string | null
          profiles: Json | null
          suuid: string | null
          verified: boolean | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          company?: string | null
          createdAt?: string | null
          email: string
          id: string
          ip?: string | null
          name: string
          passwordDigest?: string | null
          profiles?: Json | null
          suuid?: string | null
          verified?: boolean | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          company?: string | null
          createdAt?: string | null
          email?: string
          id?: string
          ip?: string | null
          name?: string
          passwordDigest?: string | null
          profiles?: Json | null
          suuid?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      users_meta: {
        Row: {
          createdAt: string
          key: string
          updatedAt: string
          userId: string
          value: Json | null
        }
        Insert: {
          createdAt?: string
          key: string
          updatedAt?: string
          userId: string
          value?: Json | null
        }
        Update: {
          createdAt?: string
          key?: string
          updatedAt?: string
          userId?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "users_meta_userid_foreign"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks_config: {
        Row: {
          createdAt: string
          description: string | null
          enabled: boolean | null
          id: string
          secret: string | null
          streamId: string | null
          triggers: Json | null
          updatedAt: string
          url: string | null
        }
        Insert: {
          createdAt?: string
          description?: string | null
          enabled?: boolean | null
          id: string
          secret?: string | null
          streamId?: string | null
          triggers?: Json | null
          updatedAt?: string
          url?: string | null
        }
        Update: {
          createdAt?: string
          description?: string | null
          enabled?: boolean | null
          id?: string
          secret?: string | null
          streamId?: string | null
          triggers?: Json | null
          updatedAt?: string
          url?: string | null
        }
        Relationships: []
      }
      webhooks_events: {
        Row: {
          id: string
          lastUpdate: string
          payload: string | null
          status: number
          statusInfo: string
          webhookId: string | null
        }
        Insert: {
          id: string
          lastUpdate?: string
          payload?: string | null
          status?: number
          statusInfo?: string
          webhookId?: string | null
        }
        Update: {
          id?: string
          lastUpdate?: string
          payload?: string | null
          status?: number
          statusInfo?: string
          webhookId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_events_webhookid_foreign"
            columns: ["webhookId"]
            isOneToOne: false
            referencedRelation: "webhooks_config"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_acl: {
        Row: {
          createdAt: string
          role: string
          userId: string
          workspaceId: string
        }
        Insert: {
          createdAt?: string
          role: string
          userId: string
          workspaceId: string
        }
        Update: {
          createdAt?: string
          role?: string
          userId?: string
          workspaceId?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_acl_role_foreign"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "workspace_acl_userid_foreign"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_acl_workspaceid_foreign"
            columns: ["workspaceId"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_checkout_sessions: {
        Row: {
          billingInterval: string
          createdAt: string
          id: string
          paymentStatus: string
          updatedAt: string
          url: string
          workspaceId: string
          workspacePlan: string
        }
        Insert: {
          billingInterval: string
          createdAt: string
          id: string
          paymentStatus: string
          updatedAt: string
          url: string
          workspaceId: string
          workspacePlan: string
        }
        Update: {
          billingInterval?: string
          createdAt?: string
          id?: string
          paymentStatus?: string
          updatedAt?: string
          url?: string
          workspaceId?: string
          workspacePlan?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_checkout_sessions_workspaceid_foreign"
            columns: ["workspaceId"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_creation_state: {
        Row: {
          completed: boolean
          state: Json
          workspaceId: string
        }
        Insert: {
          completed: boolean
          state: Json
          workspaceId: string
        }
        Update: {
          completed?: boolean
          state?: Json
          workspaceId?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_creation_state_workspaceid_foreign"
            columns: ["workspaceId"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_domains: {
        Row: {
          createdAt: string
          createdByUserId: string | null
          domain: string
          id: string
          updatedAt: string
          verified: boolean
          workspaceId: string | null
        }
        Insert: {
          createdAt: string
          createdByUserId?: string | null
          domain: string
          id: string
          updatedAt: string
          verified: boolean
          workspaceId?: string | null
        }
        Update: {
          createdAt?: string
          createdByUserId?: string | null
          domain?: string
          id?: string
          updatedAt?: string
          verified?: boolean
          workspaceId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_domains_createdbyuserid_foreign"
            columns: ["createdByUserId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_domains_workspaceid_foreign"
            columns: ["workspaceId"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_join_requests: {
        Row: {
          createdAt: string
          status: string
          updatedAt: string
          userId: string
          workspaceId: string
        }
        Insert: {
          createdAt?: string
          status: string
          updatedAt?: string
          userId: string
          workspaceId: string
        }
        Update: {
          createdAt?: string
          status?: string
          updatedAt?: string
          userId?: string
          workspaceId?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_join_requests_userid_foreign"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_join_requests_workspaceid_foreign"
            columns: ["workspaceId"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_plans: {
        Row: {
          createdAt: string
          name: string
          status: string
          workspaceId: string
        }
        Insert: {
          createdAt?: string
          name: string
          status: string
          workspaceId: string
        }
        Update: {
          createdAt?: string
          name?: string
          status?: string
          workspaceId?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_plans_workspaceid_foreign"
            columns: ["workspaceId"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_regions: {
        Row: {
          createdAt: string
          regionKey: string
          workspaceId: string
        }
        Insert: {
          createdAt?: string
          regionKey: string
          workspaceId: string
        }
        Update: {
          createdAt?: string
          regionKey?: string
          workspaceId?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_regions_regionkey_foreign"
            columns: ["regionKey"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "workspace_regions_workspaceid_foreign"
            columns: ["workspaceId"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_sso_providers: {
        Row: {
          providerId: string
          workspaceId: string
        }
        Insert: {
          providerId: string
          workspaceId: string
        }
        Update: {
          providerId?: string
          workspaceId?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_sso_providers_providerid_foreign"
            columns: ["providerId"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_sso_providers_workspaceid_foreign"
            columns: ["workspaceId"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_subscriptions: {
        Row: {
          billingInterval: string
          createdAt: string
          currentBillingCycleEnd: string
          subscriptionData: Json
          updatedAt: string
          workspaceId: string
        }
        Insert: {
          billingInterval: string
          createdAt: string
          currentBillingCycleEnd: string
          subscriptionData: Json
          updatedAt: string
          workspaceId: string
        }
        Update: {
          billingInterval?: string
          createdAt?: string
          currentBillingCycleEnd?: string
          subscriptionData?: Json
          updatedAt?: string
          workspaceId?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_subscriptions_workspaceid_foreign"
            columns: ["workspaceId"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          createdAt: string
          defaultLogoIndex: number
          defaultProjectRole: string
          description: string | null
          discoverabilityEnabled: boolean | null
          domainBasedMembershipProtectionEnabled: boolean | null
          id: string
          logo: string | null
          name: string
          slug: string
          updatedAt: string
        }
        Insert: {
          createdAt: string
          defaultLogoIndex?: number
          defaultProjectRole?: string
          description?: string | null
          discoverabilityEnabled?: boolean | null
          domainBasedMembershipProtectionEnabled?: boolean | null
          id: string
          logo?: string | null
          name: string
          slug?: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          defaultLogoIndex?: number
          defaultProjectRole?: string
          description?: string | null
          discoverabilityEnabled?: boolean | null
          domainBasedMembershipProtectionEnabled?: boolean | null
          id?: string
          logo?: string | null
          name?: string
          slug?: string
          updatedAt?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

