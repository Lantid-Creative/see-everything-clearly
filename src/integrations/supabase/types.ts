export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_action_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          reason: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          reason?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          reason?: string | null
        }
        Relationships: []
      }
      agent_actions: {
        Row: {
          action_type: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      audit_requests: {
        Row: {
          admin_notes: string | null
          amount_kobo: number
          audit_type: Database["public"]["Enums"]["audit_type"]
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          currency: string
          id: string
          intake: Json
          paid_at: string | null
          paystack_reference: string | null
          reference: string
          status: string
          status_stage: Database["public"]["Enums"]["engagement_stage"]
          tier: string
          total_kobo: number
          updated_at: string
          user_id: string
          vat_kobo: number
          verification_code: string
        }
        Insert: {
          admin_notes?: string | null
          amount_kobo: number
          audit_type: Database["public"]["Enums"]["audit_type"]
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          currency?: string
          id?: string
          intake?: Json
          paid_at?: string | null
          paystack_reference?: string | null
          reference: string
          status?: string
          status_stage?: Database["public"]["Enums"]["engagement_stage"]
          tier: string
          total_kobo: number
          updated_at?: string
          user_id: string
          vat_kobo: number
          verification_code?: string
        }
        Update: {
          admin_notes?: string | null
          amount_kobo?: number
          audit_type?: Database["public"]["Enums"]["audit_type"]
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          currency?: string
          id?: string
          intake?: Json
          paid_at?: string | null
          paystack_reference?: string | null
          reference?: string
          status?: string
          status_stage?: Database["public"]["Enums"]["engagement_stage"]
          tier?: string
          total_kobo?: number
          updated_at?: string
          user_id?: string
          vat_kobo?: number
          verification_code?: string
        }
        Relationships: []
      }
      checklist_progress: {
        Row: {
          completed_at: string
          id: string
          item_id: string
          product_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          item_id: string
          product_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          item_id?: string
          product_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_progress_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      download_counters: {
        Row: {
          count: number
          first_at: string
          id: string
          ip: string | null
          last_at: string
          user_id: string | null
          verification_code: string
        }
        Insert: {
          count?: number
          first_at?: string
          id?: string
          ip?: string | null
          last_at?: string
          user_id?: string | null
          verification_code: string
        }
        Update: {
          count?: number
          first_at?: string
          id?: string
          ip?: string | null
          last_at?: string
          user_id?: string | null
          verification_code?: string
        }
        Relationships: []
      }
      email_drafts: {
        Row: {
          attachments: Json | null
          body: string
          created_at: string
          id: string
          is_template: boolean | null
          lead_id: string | null
          sent: boolean | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          body?: string
          created_at?: string
          id?: string
          is_template?: boolean | null
          lead_id?: string | null
          sent?: boolean | null
          subject?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          body?: string
          created_at?: string
          id?: string
          is_template?: boolean | null
          lead_id?: string | null
          sent?: boolean | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_drafts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_documents: {
        Row: {
          created_at: string
          engagement_id: string
          engagement_type: Database["public"]["Enums"]["engagement_type"]
          id: string
          issued_at: string
          issued_by: string | null
          kind: Database["public"]["Enums"]["doc_kind"]
          notes: string | null
          sha256_hash: string | null
          storage_path: string
          superseded: boolean
          version: number
        }
        Insert: {
          created_at?: string
          engagement_id: string
          engagement_type: Database["public"]["Enums"]["engagement_type"]
          id?: string
          issued_at?: string
          issued_by?: string | null
          kind: Database["public"]["Enums"]["doc_kind"]
          notes?: string | null
          sha256_hash?: string | null
          storage_path: string
          superseded?: boolean
          version?: number
        }
        Update: {
          created_at?: string
          engagement_id?: string
          engagement_type?: Database["public"]["Enums"]["engagement_type"]
          id?: string
          issued_at?: string
          issued_by?: string | null
          kind?: Database["public"]["Enums"]["doc_kind"]
          notes?: string | null
          sha256_hash?: string | null
          storage_path?: string
          superseded?: boolean
          version?: number
        }
        Relationships: []
      }
      engagement_messages: {
        Row: {
          attachment_path: string | null
          body: string
          created_at: string
          engagement_id: string
          engagement_type: Database["public"]["Enums"]["engagement_type"]
          id: string
          is_admin: boolean
          sender_id: string
        }
        Insert: {
          attachment_path?: string | null
          body: string
          created_at?: string
          engagement_id: string
          engagement_type: Database["public"]["Enums"]["engagement_type"]
          id?: string
          is_admin?: boolean
          sender_id: string
        }
        Update: {
          attachment_path?: string | null
          body?: string
          created_at?: string
          engagement_id?: string
          engagement_type?: Database["public"]["Enums"]["engagement_type"]
          id?: string
          is_admin?: boolean
          sender_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_kobo: number
          currency: string
          engagement_id: string | null
          engagement_type: Database["public"]["Enums"]["engagement_type"] | null
          id: string
          issued_at: string
          metadata: Json
          number: string
          payment_id: string | null
          pdf_path: string | null
          total_kobo: number
          user_id: string | null
          vat_kobo: number
        }
        Insert: {
          amount_kobo: number
          currency?: string
          engagement_id?: string | null
          engagement_type?:
            | Database["public"]["Enums"]["engagement_type"]
            | null
          id?: string
          issued_at?: string
          metadata?: Json
          number: string
          payment_id?: string | null
          pdf_path?: string | null
          total_kobo: number
          user_id?: string | null
          vat_kobo?: number
        }
        Update: {
          amount_kobo?: number
          currency?: string
          engagement_id?: string | null
          engagement_type?:
            | Database["public"]["Enums"]["engagement_type"]
            | null
          id?: string
          issued_at?: string
          metadata?: Json
          number?: string
          payment_id?: string | null
          pdf_path?: string | null
          total_kobo?: number
          user_id?: string | null
          vat_kobo?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          about: string | null
          avatar: string | null
          company: string
          company_overview: string | null
          created_at: string
          email: string
          experience: Json | null
          id: string
          lead_type: string
          linkedin: string | null
          name: string
          personal_interests: Json | null
          recent_activity: Json | null
          sent: boolean | null
          source: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          about?: string | null
          avatar?: string | null
          company?: string
          company_overview?: string | null
          created_at?: string
          email?: string
          experience?: Json | null
          id?: string
          lead_type?: string
          linkedin?: string | null
          name: string
          personal_interests?: Json | null
          recent_activity?: Json | null
          sent?: boolean | null
          source?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          about?: string | null
          avatar?: string | null
          company?: string
          company_overview?: string | null
          created_at?: string
          email?: string
          experience?: Json | null
          id?: string
          lead_type?: string
          linkedin?: string | null
          name?: string
          personal_interests?: Json | null
          recent_activity?: Json | null
          sent?: boolean | null
          source?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          action: string | null
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          action?: string | null
          attachments?: Json | null
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          action?: string | null
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          company_name: string
          contact_person: string
          created_at: string
          email: string
          id: string
          owner_id: string
          phone: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          company_name: string
          contact_person: string
          created_at?: string
          email: string
          id?: string
          owner_id: string
          phone?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          company_name?: string
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          owner_id?: string
          phone?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_kobo: number
          created_at: string
          currency: string
          id: string
          pci_request_id: string | null
          provider: string
          provider_reference: string | null
          raw_response: Json | null
          request_id: string | null
          source_type: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_kobo: number
          created_at?: string
          currency?: string
          id?: string
          pci_request_id?: string | null
          provider?: string
          provider_reference?: string | null
          raw_response?: Json | null
          request_id?: string | null
          source_type?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_kobo?: number
          created_at?: string
          currency?: string
          id?: string
          pci_request_id?: string | null
          provider?: string
          provider_reference?: string | null
          raw_response?: Json | null
          request_id?: string | null
          source_type?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_pci_request_id_fkey"
            columns: ["pci_request_id"]
            isOneToOne: false
            referencedRelation: "pci_dss_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "vapt_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      pci_dss_requests: {
        Row: {
          amount_kobo: number
          annual_transactions: string | null
          company: string
          contact_person: string
          created_at: string
          currency: string
          current_status: string | null
          email: string
          environment: string | null
          id: string
          merchant_level: string | null
          notes: string | null
          public_id: string
          saq_type: string | null
          status: string
          status_stage: Database["public"]["Enums"]["engagement_stage"]
          tier: string
          timeline: string | null
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          amount_kobo?: number
          annual_transactions?: string | null
          company: string
          contact_person: string
          created_at?: string
          currency?: string
          current_status?: string | null
          email: string
          environment?: string | null
          id?: string
          merchant_level?: string | null
          notes?: string | null
          public_id?: string
          saq_type?: string | null
          status?: string
          status_stage?: Database["public"]["Enums"]["engagement_stage"]
          tier?: string
          timeline?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          amount_kobo?: number
          annual_transactions?: string | null
          company?: string
          contact_person?: string
          created_at?: string
          currency?: string
          current_status?: string | null
          email?: string
          environment?: string | null
          id?: string
          merchant_level?: string | null
          notes?: string | null
          public_id?: string
          saq_type?: string | null
          status?: string
          status_stage?: Database["public"]["Enums"]["engagement_stage"]
          tier?: string
          timeline?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      product_details: {
        Row: {
          context_notes: string | null
          created_at: string
          id: string
          key_objectives: string | null
          product_id: string
          success_metrics: string | null
          target_audience: string | null
          updated_at: string
          user_id: string
          vision: string | null
        }
        Insert: {
          context_notes?: string | null
          created_at?: string
          id?: string
          key_objectives?: string | null
          product_id: string
          success_metrics?: string | null
          target_audience?: string | null
          updated_at?: string
          user_id: string
          vision?: string | null
        }
        Update: {
          context_notes?: string | null
          created_at?: string
          id?: string
          key_objectives?: string | null
          product_id?: string
          success_metrics?: string | null
          target_audience?: string | null
          updated_at?: string
          user_id?: string
          vision?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          current_phase: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_phase?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_phase?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          onboarding_complete: boolean
          product_goals: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          onboarding_complete?: boolean
          product_goals?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_complete?: boolean
          product_goals?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      renewal_reminders: {
        Row: {
          created_at: string
          due_at: string
          engagement_id: string
          engagement_type: Database["public"]["Enums"]["engagement_type"]
          id: string
          kind: string
          sent_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          due_at: string
          engagement_id: string
          engagement_type: Database["public"]["Enums"]["engagement_type"]
          id?: string
          kind: string
          sent_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          due_at?: string
          engagement_id?: string
          engagement_type?: Database["public"]["Enums"]["engagement_type"]
          id?: string
          kind?: string
          sent_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      report_findings: {
        Row: {
          created_at: string
          cvss_score: number | null
          cvss_vector: string | null
          description: string | null
          id: string
          remediation: string | null
          report_id: string
          retest_evidence_path: string | null
          severity: Database["public"]["Enums"]["finding_severity"]
          sort_order: number
          status: Database["public"]["Enums"]["finding_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cvss_score?: number | null
          cvss_vector?: string | null
          description?: string | null
          id?: string
          remediation?: string | null
          report_id: string
          retest_evidence_path?: string | null
          severity?: Database["public"]["Enums"]["finding_severity"]
          sort_order?: number
          status?: Database["public"]["Enums"]["finding_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cvss_score?: number | null
          cvss_vector?: string | null
          description?: string | null
          id?: string
          remediation?: string | null
          report_id?: string
          retest_evidence_path?: string | null
          severity?: Database["public"]["Enums"]["finding_severity"]
          sort_order?: number
          status?: Database["public"]["Enums"]["finding_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_findings_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_versions: {
        Row: {
          id: string
          issued_at: string
          issued_by: string | null
          kind: Database["public"]["Enums"]["version_kind"]
          notes: string | null
          report_id: string
          sha256_hash: string | null
          storage_path: string
          superseded: boolean
          version_no: number
        }
        Insert: {
          id?: string
          issued_at?: string
          issued_by?: string | null
          kind?: Database["public"]["Enums"]["version_kind"]
          notes?: string | null
          report_id: string
          sha256_hash?: string | null
          storage_path: string
          superseded?: boolean
          version_no: number
        }
        Update: {
          id?: string
          issued_at?: string
          issued_by?: string | null
          kind?: Database["public"]["Enums"]["version_kind"]
          notes?: string | null
          report_id?: string
          sha256_hash?: string | null
          storage_path?: string
          superseded?: boolean
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "report_versions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          assessment_type: Database["public"]["Enums"]["assessment_type"]
          company_name: string
          created_at: string
          id: string
          issued_at: string
          overall_result: string
          report_type: string
          request_id: string | null
          revoked_at: string | null
          revoked_reason: string | null
          scope_summary: string
          sha256_hash: string | null
          status: string
          storage_path: string | null
          target: string
          updated_at: string
          verification_code: string
        }
        Insert: {
          assessment_type?: Database["public"]["Enums"]["assessment_type"]
          company_name: string
          created_at?: string
          id?: string
          issued_at?: string
          overall_result?: string
          report_type?: string
          request_id?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          scope_summary: string
          sha256_hash?: string | null
          status?: string
          storage_path?: string | null
          target: string
          updated_at?: string
          verification_code: string
        }
        Update: {
          assessment_type?: Database["public"]["Enums"]["assessment_type"]
          company_name?: string
          created_at?: string
          id?: string
          issued_at?: string
          overall_result?: string
          report_type?: string
          request_id?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          scope_summary?: string
          sha256_hash?: string | null
          status?: string
          storage_path?: string | null
          target?: string
          updated_at?: string
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "vapt_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      slide_decks: {
        Row: {
          created_at: string
          id: string
          name: string
          slides: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          slides?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slides?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_activity: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          team_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          team_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_activity_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          team_id: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          team_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          api_key: string | null
          config: Json | null
          created_at: string
          display_name: string
          id: string
          is_connected: boolean
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key?: string | null
          config?: Json | null
          created_at?: string
          display_name?: string
          id?: string
          is_connected?: boolean
          provider: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string | null
          config?: Json | null
          created_at?: string
          display_name?: string
          id?: string
          is_connected?: boolean
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vapt_requests: {
        Row: {
          amount_kobo: number
          assessment_type: Database["public"]["Enums"]["assessment_type"]
          created_at: string
          currency: string
          id: string
          notes: string | null
          organization_id: string
          public_id: string
          scope: string
          status: Database["public"]["Enums"]["request_status"]
          status_stage: Database["public"]["Enums"]["engagement_stage"]
          target: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_kobo?: number
          assessment_type?: Database["public"]["Enums"]["assessment_type"]
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          organization_id: string
          public_id?: string
          scope: string
          status?: Database["public"]["Enums"]["request_status"]
          status_stage?: Database["public"]["Enums"]["engagement_stage"]
          target: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_kobo?: number
          assessment_type?: Database["public"]["Enums"]["assessment_type"]
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          organization_id?: string
          public_id?: string
          scope?: string
          status?: Database["public"]["Enums"]["request_status"]
          status_stage?: Database["public"]["Enums"]["engagement_stage"]
          target?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vapt_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_attempts: {
        Row: {
          created_at: string
          id: string
          ip: string | null
          result: string
          user_agent: string | null
          verification_code: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip?: string | null
          result: string
          user_agent?: string | null
          verification_code: string
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string | null
          result?: string
          user_agent?: string | null
          verification_code?: string
        }
        Relationships: []
      }
      workflows: {
        Row: {
          created_at: string
          id: string
          is_deployed: boolean | null
          name: string
          nodes: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_deployed?: boolean | null
          name?: string
          nodes?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_deployed?: boolean | null
          name?: string
          nodes?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      engagements_v: {
        Row: {
          amount_kobo: number | null
          company_name: string | null
          created_at: string | null
          currency: string | null
          id: string | null
          public_id: string | null
          raw_status: string | null
          status_stage: Database["public"]["Enums"]["engagement_stage"] | null
          subject: string | null
          type: Database["public"]["Enums"]["engagement_type"] | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_engagement: {
        Args: {
          _engagement_id: string
          _type: Database["public"]["Enums"]["engagement_type"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_team_role: {
        Args: {
          _role: Database["public"]["Enums"]["team_role"]
          _team_id: string
          _user_id: string
        }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      verify_audit_report: {
        Args: { _code: string }
        Returns: {
          audit_type: string
          company_name: string
          completed_at: string
          status: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      assessment_type: "basic" | "standard" | "advanced"
      audit_type:
        | "aml_cft"
        | "iso_27001"
        | "ndpr"
        | "cbn_rcsf"
        | "swift_csp"
        | "soc_2"
        | "ndic"
        | "gdpr"
        | "hipaa"
        | "nitda_grc"
        | "iso_22301"
        | "cloud_config"
        | "source_code"
        | "red_team"
        | "blockchain"
        | "iso_42001"
        | "vendor_risk"
        | "mobile_masvs"
        | "dfir"
      doc_kind:
        | "engagement_letter"
        | "scope_confirmation"
        | "report"
        | "retest"
        | "invoice"
        | "other"
      engagement_stage:
        | "requested"
        | "scoping"
        | "testing"
        | "draft"
        | "issued"
        | "revoked"
      engagement_type: "vapt" | "pci_dss" | "audit"
      finding_severity: "critical" | "high" | "medium" | "low" | "info"
      finding_status: "open" | "remediated" | "risk_accepted" | "wont_fix"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      request_status:
        | "pending_payment"
        | "paid"
        | "processing"
        | "completed"
        | "cancelled"
      team_role: "owner" | "admin" | "member" | "viewer"
      version_kind: "initial" | "retest" | "delta" | "revision"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      assessment_type: ["basic", "standard", "advanced"],
      audit_type: [
        "aml_cft",
        "iso_27001",
        "ndpr",
        "cbn_rcsf",
        "swift_csp",
        "soc_2",
        "ndic",
        "gdpr",
        "hipaa",
        "nitda_grc",
        "iso_22301",
        "cloud_config",
        "source_code",
        "red_team",
        "blockchain",
        "iso_42001",
        "vendor_risk",
        "mobile_masvs",
        "dfir",
      ],
      doc_kind: [
        "engagement_letter",
        "scope_confirmation",
        "report",
        "retest",
        "invoice",
        "other",
      ],
      engagement_stage: [
        "requested",
        "scoping",
        "testing",
        "draft",
        "issued",
        "revoked",
      ],
      engagement_type: ["vapt", "pci_dss", "audit"],
      finding_severity: ["critical", "high", "medium", "low", "info"],
      finding_status: ["open", "remediated", "risk_accepted", "wont_fix"],
      payment_status: ["pending", "paid", "failed", "refunded"],
      request_status: [
        "pending_payment",
        "paid",
        "processing",
        "completed",
        "cancelled",
      ],
      team_role: ["owner", "admin", "member", "viewer"],
      version_kind: ["initial", "retest", "delta", "revision"],
    },
  },
} as const
