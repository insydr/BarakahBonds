export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Assessment section types
export type AssessmentSection = 'deen' | 'dunya' | 'aila' | 'nafs'
export type QuestionType = 'likert' | 'multiple_choice' | 'open_text'
export type AssessmentStatus = 'not_started' | 'in_progress' | 'completed'
export type CitationType = 'quran' | 'hadith'

// Score object type
export interface AssessmentScores {
  deen?: number
  dunya?: number
  aila?: number
  nafs?: number
  overall?: number
}

// Flag object type
export interface AssessmentFlag {
  type: 'hard' | 'soft'
  category: string
  description: string
  section: AssessmentSection
  guidance?: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          timezone: string
          privacy_settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          timezone?: string
          privacy_settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          timezone?: string
          privacy_settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      couples: {
        Row: {
          id: string
          partner_1_id: string
          partner_2_id: string | null
          invitation_code: string
          invitation_expires_at: string | null
          status: 'pending' | 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          partner_1_id: string
          partner_2_id?: string | null
          invitation_code: string
          invitation_expires_at?: string | null
          status?: 'pending' | 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          partner_1_id?: string
          partner_2_id?: string | null
          invitation_code?: string
          invitation_expires_at?: string | null
          status?: 'pending' | 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          ip_address: string | null
          user_agent: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      citations: {
        Row: {
          id: string
          type: CitationType
          source: string
          reference: string
          arabic_text: string | null
          translation: string
          scholar_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          type: CitationType
          source: string
          reference: string
          arabic_text?: string | null
          translation: string
          scholar_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          type?: CitationType
          source?: string
          reference?: string
          arabic_text?: string | null
          translation?: string
          scholar_verified?: boolean
          created_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          section: AssessmentSection
          order_index: number
          question_text: string
          question_type: QuestionType
          options: Json | null
          citation_id: string | null
          version: number
          active: boolean
          scholar_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section: AssessmentSection
          order_index: number
          question_text: string
          question_type: QuestionType
          options?: Json | null
          citation_id?: string | null
          version?: number
          active?: boolean
          scholar_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section?: AssessmentSection
          order_index?: number
          question_text?: string
          question_type?: QuestionType
          options?: Json | null
          citation_id?: string | null
          version?: number
          active?: boolean
          scholar_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'questions_citation_id_fkey'
            columns: ['citation_id']
            isOneToOne: true
            referencedRelation: 'citations'
            referencedColumns: ['id']
          }
        ]
      }
      assessments: {
        Row: {
          id: string
          user_id: string
          status: AssessmentStatus
          current_section: AssessmentSection | null
          started_at: string | null
          completed_at: string | null
          scores: Json
          flags: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: AssessmentStatus
          current_section?: AssessmentSection | null
          started_at?: string | null
          completed_at?: string | null
          scores?: Json
          flags?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: AssessmentStatus
          current_section?: AssessmentSection | null
          started_at?: string | null
          completed_at?: string | null
          scores?: Json
          flags?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'assessments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      assessment_responses: {
        Row: {
          id: string
          assessment_id: string
          question_id: string
          response_value: Json
          responded_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          question_id: string
          response_value: Json
          responded_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          question_id?: string
          response_value?: Json
          responded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'assessment_responses_assessment_id_fkey'
            columns: ['assessment_id']
            isOneToOne: false
            referencedRelation: 'assessments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'assessment_responses_question_id_fkey'
            columns: ['question_id']
            isOneToOne: false
            referencedRelation: 'questions'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_partner_id: {
        Args: Record<string, never>
        Returns: string | null
      }
      has_active_couple: {
        Args: Record<string, never>
        Returns: boolean
      }
      get_user_assessment_id: {
        Args: Record<string, never>
        Returns: string | null
      }
      has_completed_assessment: {
        Args: Record<string, never>
        Returns: boolean
      }
      get_assessment_progress: {
        Args: {
          assessment_uuid: string
        }
        Returns: Json
      }
    }
    Enums: {
      assessment_section: AssessmentSection
      question_type: QuestionType
      assessment_status: AssessmentStatus
      citation_type: CitationType
    }
  }
}

// Convenience type exports for database rows
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Couple = Database['public']['Tables']['couples']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type Citation = Database['public']['Tables']['citations']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type Assessment = Database['public']['Tables']['assessments']['Row']
export type AssessmentResponse = Database['public']['Tables']['assessment_responses']['Row']

// Convenience type exports for inserts
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type CoupleInsert = Database['public']['Tables']['couples']['Insert']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']
export type CitationInsert = Database['public']['Tables']['citations']['Insert']
export type QuestionInsert = Database['public']['Tables']['questions']['Insert']
export type AssessmentInsert = Database['public']['Tables']['assessments']['Insert']
export type AssessmentResponseInsert = Database['public']['Tables']['assessment_responses']['Insert']

// Question with citation (joined query result)
export interface QuestionWithCitation extends Question {
  citation: Citation | null
}

// Assessment with responses (joined query result)
export interface AssessmentWithResponses extends Assessment {
  responses: AssessmentResponse[]
}

// Assessment progress type (returned by get_assessment_progress function)
export interface AssessmentProgress {
  total_questions: number
  answered_questions: number
  percentage: number
  sections: {
    [key in AssessmentSection]?: {
      total: number
      answered: number
    }
  }
}
