export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          cpf: string
          full_name: string
          phone: string | null
          role: 'student' | 'admin' | 'teacher'
          status: 'active' | 'inactive' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          cpf: string
          full_name: string
          phone?: string | null
          role?: 'student' | 'admin' | 'teacher'
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cpf?: string
          full_name?: string
          phone?: string | null
          role?: 'student' | 'admin' | 'teacher'
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          profile_id: string
          class_name: string
          enrollment_date: string
          city: string | null
          school_type: string | null
          income_range: string | null
          ethnicity: string | null
          has_disability: boolean
          is_quilombola: boolean
          is_indigenous: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          class_name: string
          enrollment_date: string
          city?: string | null
          school_type?: string | null
          income_range?: string | null
          ethnicity?: string | null
          has_disability?: boolean
          is_quilombola?: boolean
          is_indigenous?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          class_name?: string
          enrollment_date?: string
          city?: string | null
          school_type?: string | null
          income_range?: string | null
          ethnicity?: string | null
          has_disability?: boolean
          is_quilombola?: boolean
          is_indigenous?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          profile_id: string
          permissions: Json
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          permissions?: Json
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          permissions?: Json
          created_at?: string
        }
      }
      attendances: {
        Row: {
          id: string
          student_id: string
          class_date: string
          subject: string
          teacher_name: string | null
          is_present: boolean
          justification: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_date: string
          subject: string
          teacher_name?: string | null
          is_present?: boolean
          justification?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_date?: string
          subject?: string
          teacher_name?: string | null
          is_present?: boolean
          justification?: string | null
          created_at?: string
        }
      }
      grades: {
        Row: {
          id: string
          student_id: string
          subject: string
          evaluation_type: 'mock_exam' | 'test' | 'assignment' | 'exercise'
          score: number
          max_score: number
          evaluation_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject: string
          evaluation_type: 'mock_exam' | 'test' | 'assignment' | 'exercise'
          score: number
          max_score: number
          evaluation_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject?: string
          evaluation_type?: 'mock_exam' | 'test' | 'assignment' | 'exercise'
          score?: number
          max_score?: number
          evaluation_date?: string
          notes?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          student_id: string
          type: 'monthly_fee' | 'material' | 'enrollment_fee' | 'other'
          amount: number
          due_date: string
          status: 'pending' | 'paid' | 'overdue' | 'cancelled'
          description: string
          payment_date: string | null
          payment_method: string | null
          transaction_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          type: 'monthly_fee' | 'material' | 'enrollment_fee' | 'other'
          amount: number
          due_date: string
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          description: string
          payment_date?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          type?: 'monthly_fee' | 'material' | 'enrollment_fee' | 'other'
          amount?: number
          due_date?: string
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          description?: string
          payment_date?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          title: string
          subject: string
          type: 'handbook' | 'exercise' | 'mock_exam' | 'video' | 'other'
          file_url: string | null
          description: string | null
          available_for_classes: string[]
          is_public: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subject: string
          type: 'handbook' | 'exercise' | 'mock_exam' | 'video' | 'other'
          file_url?: string | null
          description?: string | null
          available_for_classes: string[]
          is_public?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subject?: string
          type?: 'handbook' | 'exercise' | 'mock_exam' | 'video' | 'other'
          file_url?: string | null
          description?: string | null
          available_for_classes?: string[]
          is_public?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      access_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      calculator_logs: {
        Row: {
          id: string
          user_id: string | null
          process: string
          course: string
          quota: string
          total_score: number
          cutoff_score: number
          approved: boolean
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          process: string
          course: string
          quota: string
          total_score: number
          cutoff_score: number
          approved: boolean
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          process?: string
          course?: string
          quota?: string
          total_score?: number
          cutoff_score?: number
          approved?: boolean
          ip_address?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'student' | 'admin' | 'teacher'
      user_status: 'active' | 'inactive' | 'suspended'
      payment_status: 'pending' | 'paid' | 'overdue' | 'cancelled'
    }
  }
}