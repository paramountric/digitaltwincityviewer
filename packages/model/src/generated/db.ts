export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
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

