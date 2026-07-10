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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      assessment_attempts: {
        Row: {
          assessment_type: string
          attempt_number: number
          can_retake: boolean | null
          created_at: string
          id: string
          last_attempt_at: string | null
          max_attempts: number
          student_id: string
        }
        Insert: {
          assessment_type: string
          attempt_number?: number
          can_retake?: boolean | null
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number
          student_id: string
        }
        Update: {
          assessment_type?: string
          attempt_number?: number
          can_retake?: boolean | null
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number
          student_id?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          analysis: Json | null
          answers: Json | null
          attempt_number: number | null
          completed_at: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          questions: Json | null
          recommended_role: string | null
          score: number | null
          student_id: string | null
          type: string
        }
        Insert: {
          analysis?: Json | null
          answers?: Json | null
          attempt_number?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          questions?: Json | null
          recommended_role?: string | null
          score?: number | null
          student_id?: string | null
          type: string
        }
        Update: {
          analysis?: Json | null
          answers?: Json | null
          attempt_number?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          questions?: Json | null
          recommended_role?: string | null
          score?: number | null
          student_id?: string | null
          type?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          category: string
          content: string
          excerpt: string
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published: boolean
          published_at: string
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          author?: string
          category: string
          content: string
          excerpt: string
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean
          published_at?: string
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          author?: string
          category?: string
          content?: string
          excerpt?: string
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean
          published_at?: string
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      configs: {
        Row: {
          config: Json
          id: string
          updated_at: string | null
        }
        Insert: {
          config?: Json
          id?: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string | null
          curriculum: Json | null
          description: string
          description_hi: string | null
          duration_weeks: number
          id: string
          preview_video_url: string | null
          role_type: string
          status: string | null
          title: string
          title_hi: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          curriculum?: Json | null
          description: string
          description_hi?: string | null
          duration_weeks: number
          id?: string
          preview_video_url?: string | null
          role_type: string
          status?: string | null
          title: string
          title_hi?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          curriculum?: Json | null
          description?: string
          description_hi?: string | null
          duration_weeks?: number
          id?: string
          preview_video_url?: string | null
          role_type?: string
          status?: string | null
          title?: string
          title_hi?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      courses_new: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          modules: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          modules?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          modules?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      employer_conversions: {
        Row: {
          company_name: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          page_name: string
          phone: string | null
          timestamp: string | null
          user_email: string | null
          visitor_id: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_name: string
          phone?: string | null
          timestamp?: string | null
          user_email?: string | null
          visitor_id?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_name?: string
          phone?: string | null
          timestamp?: string | null
          user_email?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      employers: {
        Row: {
          cohort_size_estimate: number | null
          company_name: string
          contact_name: string
          created_at: string | null
          designation: string | null
          email: string
          hiring_timeline: string | null
          id: string
          notes: string | null
          phone: string
          roles_needed: string[] | null
          tools_stack: string | null
        }
        Insert: {
          cohort_size_estimate?: number | null
          company_name: string
          contact_name: string
          created_at?: string | null
          designation?: string | null
          email: string
          hiring_timeline?: string | null
          id?: string
          notes?: string | null
          phone: string
          roles_needed?: string[] | null
          tools_stack?: string | null
        }
        Update: {
          cohort_size_estimate?: number | null
          company_name?: string
          contact_name?: string
          created_at?: string | null
          designation?: string | null
          email?: string
          hiring_timeline?: string | null
          id?: string
          notes?: string | null
          phone?: string
          roles_needed?: string[] | null
          tools_stack?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          issued_at: string | null
          payment_id: string | null
          pdf_url: string | null
          student_id: string | null
        }
        Insert: {
          id?: string
          invoice_number: string
          issued_at?: string | null
          payment_id?: string | null
          pdf_url?: string | null
          student_id?: string | null
        }
        Update: {
          id?: string
          invoice_number?: string
          issued_at?: string | null
          payment_id?: string | null
          pdf_url?: string | null
          student_id?: string | null
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
      job_applications: {
        Row: {
          applied_date: string
          company_name: string
          created_at: string | null
          id: string
          interview_date: string | null
          notes: string | null
          position: string
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          applied_date: string
          company_name: string
          created_at?: string | null
          id?: string
          interview_date?: string | null
          notes?: string | null
          position: string
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          applied_date?: string
          company_name?: string
          created_at?: string | null
          id?: string
          interview_date?: string | null
          notes?: string | null
          position?: string
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mentor_sessions: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          id: string
          meeting_link: string | null
          mentor_name: string
          notes: string | null
          session_date: string
          status: string | null
          student_id: string
          topic: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          mentor_name: string
          notes?: string | null
          session_date: string
          status?: string | null
          student_id: string
          topic?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          mentor_name?: string
          notes?: string | null
          session_date?: string
          status?: string | null
          student_id?: string
          topic?: string | null
        }
        Relationships: []
      }
      otp_rate_limits: {
        Row: {
          attempts: number
          blocked_until: string | null
          created_at: string
          last_attempt: string
          phone: string
        }
        Insert: {
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          last_attempt?: string
          phone: string
        }
        Update: {
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          last_attempt?: string
          phone?: string
        }
        Relationships: []
      }
      page_visits: {
        Row: {
          bounced: boolean | null
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          os: string | null
          page_name: string
          referrer: string | null
          session_duration_seconds: number | null
          session_id: string | null
          timestamp: string
          visitor_id: string | null
        }
        Insert: {
          bounced?: boolean | null
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          os?: string | null
          page_name: string
          referrer?: string | null
          session_duration_seconds?: number | null
          session_id?: string | null
          timestamp?: string
          visitor_id?: string | null
        }
        Update: {
          bounced?: boolean | null
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          os?: string | null
          page_name?: string
          referrer?: string | null
          session_duration_seconds?: number | null
          session_id?: string | null
          timestamp?: string
          visitor_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          amount_base_inr: number | null
          amount_final_inr: number | null
          course_id: string | null
          created_at: string | null
          currency: string | null
          discount_inr: number | null
          gateway_response: Json | null
          gst_amount_inr: number | null
          gst_percent: number | null
          id: string
          method: string | null
          razorpay_order_id: string
          razorpay_payment_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          amount_base_inr?: number | null
          amount_final_inr?: number | null
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          discount_inr?: number | null
          gateway_response?: Json | null
          gst_amount_inr?: number | null
          gst_percent?: number | null
          id?: string
          method?: string | null
          razorpay_order_id: string
          razorpay_payment_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          amount_base_inr?: number | null
          amount_final_inr?: number | null
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          discount_inr?: number | null
          gateway_response?: Json | null
          gst_amount_inr?: number | null
          gst_percent?: number | null
          id?: string
          method?: string | null
          razorpay_order_id?: string
          razorpay_payment_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      placements: {
        Row: {
          company_name: string
          created_at: string | null
          id: string
          location: string | null
          placement_date: string
          position: string
          salary_package: string | null
          student_id: string
        }
        Insert: {
          company_name: string
          created_at?: string | null
          id?: string
          location?: string | null
          placement_date: string
          position: string
          salary_package?: string | null
          student_id: string
        }
        Update: {
          company_name?: string
          created_at?: string | null
          id?: string
          location?: string | null
          placement_date?: string
          position?: string
          salary_package?: string | null
          student_id?: string
        }
        Relationships: []
      }
      student_progress: {
        Row: {
          completed_modules: Json | null
          course_id: string
          created_at: string | null
          id: string
          last_accessed: string | null
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          completed_modules?: Json | null
          course_id: string
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          completed_modules?: Json | null
          course_id?: string
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      student_registrations: {
        Row: {
          assessments_progress: Json | null
          city: string | null
          created_at: string | null
          degree: string | null
          desired_role: string
          district: string | null
          email: string
          final_role: string | null
          full_name: string
          id: string
          invoice_id: string | null
          location: string | null
          otp_code: string | null
          otp_expires_at: string | null
          otp_status: string | null
          payment_order_id: string | null
          payment_status: string | null
          phone: string
          qualification: string | null
          referral_code: string | null
          role_recommendation: string | null
          state: string | null
          status: string | null
          training_completed_at: string | null
          training_started_at: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          assessments_progress?: Json | null
          city?: string | null
          created_at?: string | null
          degree?: string | null
          desired_role: string
          district?: string | null
          email: string
          final_role?: string | null
          full_name: string
          id?: string
          invoice_id?: string | null
          location?: string | null
          otp_code?: string | null
          otp_expires_at?: string | null
          otp_status?: string | null
          payment_order_id?: string | null
          payment_status?: string | null
          phone: string
          qualification?: string | null
          referral_code?: string | null
          role_recommendation?: string | null
          state?: string | null
          status?: string | null
          training_completed_at?: string | null
          training_started_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          assessments_progress?: Json | null
          city?: string | null
          created_at?: string | null
          degree?: string | null
          desired_role?: string
          district?: string | null
          email?: string
          final_role?: string | null
          full_name?: string
          id?: string
          invoice_id?: string | null
          location?: string | null
          otp_code?: string | null
          otp_expires_at?: string | null
          otp_status?: string | null
          payment_order_id?: string | null
          payment_status?: string | null
          phone?: string
          qualification?: string | null
          referral_code?: string | null
          role_recommendation?: string | null
          state?: string | null
          status?: string | null
          training_completed_at?: string | null
          training_started_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_registrations_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          content: Json
          created_at: string
          description: string | null
          duration_hours: number | null
          id: string
          is_active: boolean | null
          module_order: number
          role_type: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          module_order?: number
          role_type: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          module_order?: number
          role_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_testimonials: {
        Row: {
          company: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          quote: string
          quote_hi: string | null
          role: string
          role_hi: string | null
          student_name: string
          student_name_hi: string | null
          thumbnail_url: string | null
          video_url: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          quote: string
          quote_hi?: string | null
          role: string
          role_hi?: string | null
          student_name: string
          student_name_hi?: string | null
          thumbnail_url?: string | null
          video_url: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          quote?: string
          quote_hi?: string | null
          role?: string
          role_hi?: string | null
          student_name?: string
          student_name_hi?: string | null
          thumbnail_url?: string | null
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_otp_rate_limits: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
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
      app_role: ["admin", "student"],
    },
  },
} as const
