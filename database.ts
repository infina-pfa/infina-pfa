export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      budgets: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["budget_category"]
          color: string
          created_at: string
          ended_at: string
          icon: string
          id: string
          name: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: Database["public"]["Enums"]["budget_category"]
          color: string
          created_at?: string
          ended_at: string
          icon: string
          id?: string
          name: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["budget_category"]
          color?: string
          created_at?: string
          ended_at?: string
          icon?: string
          id?: string
          name?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          budget_id: string | null
          created_at: string
          description: string | null
          expense_date: string
          id: string
          recurring_month: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          budget_id?: string | null
          created_at?: string
          description?: string | null
          expense_date: string
          id?: string
          recurring_month?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          budget_id?: string | null
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          recurring_month?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      incomes: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          id: string
          is_recurring: boolean | null
          pay_yourself_percent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          description: string
          id?: string
          is_recurring?: boolean | null
          pay_yourself_percent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          is_recurring?: boolean | null
          pay_yourself_percent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          intro_dialogue: string | null
          learning_objective: string | null
          name: string
          order: number
          personal_type_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          intro_dialogue?: string | null
          learning_objective?: string | null
          name: string
          order?: number
          personal_type_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          intro_dialogue?: string | null
          learning_objective?: string | null
          name?: string
          order?: number
          personal_type_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_groups_personal_type_id_fkey"
            columns: ["personal_type_id"]
            isOneToOne: false
            referencedRelation: "personal_types"
            referencedColumns: ["id"]
          },
        ]
      }
      operators: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      personal_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          type_name: string
          updated_at: string | null
          world_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          type_name: string
          updated_at?: string | null
          world_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          type_name?: string
          updated_at?: string | null
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_types_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_expense_presets: {
        Row: {
          amount: number
          budget_id: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          budget_id?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          budget_id?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quick_expense_presets_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_answers: {
        Row: {
          answer_score: number | null
          answer_text: string
          created_at: string | null
          explanation: string | null
          id: string
          is_correct: boolean | null
          order_no: number
          personal_type_id: string | null
          quiz_question_id: string
          updated_at: string | null
          world_id: string | null
        }
        Insert: {
          answer_score?: number | null
          answer_text: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          is_correct?: boolean | null
          order_no: number
          personal_type_id?: string | null
          quiz_question_id: string
          updated_at?: string | null
          world_id?: string | null
        }
        Update: {
          answer_score?: number | null
          answer_text?: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          is_correct?: boolean | null
          order_no?: number
          personal_type_id?: string | null
          quiz_question_id?: string
          updated_at?: string | null
          world_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_personal_type_id_fkey"
            columns: ["personal_type_id"]
            isOneToOne: false
            referencedRelation: "personal_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_answers_quiz_question_id_fkey"
            columns: ["quiz_question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_answers_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string | null
          id: string
          order_no: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          quiz_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_no: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          quiz_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_no?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          quiz_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          title: string
          type: Database["public"]["Enums"]["quiz_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
          type: Database["public"]["Enums"]["quiz_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
          type?: Database["public"]["Enums"]["quiz_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          content: Json
          created_at: string | null
          created_by: string | null
          id: string
          milestone_id: string
          order_no: number
          quiz_id: string | null
          title: string
          type: Database["public"]["Enums"]["task_type"]
          updated_at: string | null
          video_id: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          milestone_id: string
          order_no: number
          quiz_id?: string | null
          title: string
          type: Database["public"]["Enums"]["task_type"]
          updated_at?: string | null
          video_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          milestone_id?: string
          order_no?: number
          quiz_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["task_type"]
          updated_at?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_task_group_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_conversations: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          latest_response_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          latest_response_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          latest_response_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          world_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          world_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      user_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          meta_data: Json | null
          sender_type: Database["public"]["Enums"]["message_sender_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          meta_data?: Json | null
          sender_type: Database["public"]["Enums"]["message_sender_type"]
          updated_at: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          meta_data?: Json | null
          sender_type?: Database["public"]["Enums"]["message_sender_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "user_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          milestone_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          milestone_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          milestone_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_milestones_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_personal_types: {
        Row: {
          created_at: string
          id: string
          personal_type_id: string
          updated_at: string
          user_id: string
          world_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          personal_type_id: string
          updated_at?: string
          user_id: string
          world_id: string
        }
        Update: {
          created_at?: string
          id?: string
          personal_type_id?: string
          updated_at?: string
          user_id?: string
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_personal_types_personal_type_id_fkey"
            columns: ["personal_type_id"]
            isOneToOne: false
            referencedRelation: "personal_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_personal_types_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          milestone_id: string
          result: Json | null
          task_id: string
          user_id: string
          world_id: string
          xp_earned: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          milestone_id: string
          result?: Json | null
          task_id: string
          user_id: string
          world_id: string
          xp_earned?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          milestone_id?: string
          result?: Json | null
          task_id?: string
          user_id?: string
          world_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quiz_answers: {
        Row: {
          answer_text: string | null
          answered_at: string | null
          created_at: string | null
          id: string
          quiz_answer_id: string | null
          quiz_id: string
          quiz_question_id: string
          source: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          answer_text?: string | null
          answered_at?: string | null
          created_at?: string | null
          id?: string
          quiz_answer_id?: string | null
          quiz_id: string
          quiz_question_id: string
          source: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          answer_text?: string | null
          answered_at?: string | null
          created_at?: string | null
          id?: string
          quiz_answer_id?: string | null
          quiz_id?: string
          quiz_question_id?: string
          source?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_answers_quiz_answer_id_fkey"
            columns: ["quiz_answer_id"]
            isOneToOne: false
            referencedRelation: "quiz_answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_answers_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_answers_quiz_question_id_fkey"
            columns: ["quiz_question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_answers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tasks_conversations: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_conversations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "user_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tasks_conversations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          budgeting_onboarding_completed_at: string | null
          created_at: string | null
          current_world_id: string | null
          id: string
          level: number | null
          updated_at: string | null
          user_id: string
          xp: number | null
        }
        Insert: {
          budgeting_onboarding_completed_at?: string | null
          created_at?: string | null
          current_world_id?: string | null
          id?: string
          level?: number | null
          updated_at?: string | null
          user_id: string
          xp?: number | null
        }
        Update: {
          budgeting_onboarding_completed_at?: string | null
          created_at?: string | null
          current_world_id?: string | null
          id?: string
          level?: number | null
          updated_at?: string | null
          user_id?: string
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "users_current_world_id_fkey"
            columns: ["current_world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          length: number
          title: string
          type: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          length?: number
          title: string
          type: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          length?: number
          title?: string
          type?: string
          updated_at?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      worlds: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          intro_story: string | null
          intro_video_id: string | null
          mentor_name: string | null
          name: string
          order_no: number
          personality_survey_id: string | null
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          intro_story?: string | null
          intro_video_id?: string | null
          mentor_name?: string | null
          name: string
          order_no: number
          personality_survey_id?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          intro_story?: string | null
          intro_video_id?: string | null
          mentor_name?: string | null
          name?: string
          order_no?: number
          personality_survey_id?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "worlds_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worlds_intro_video_id_fkey"
            columns: ["intro_video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worlds_personality_survey_id_fkey"
            columns: ["personality_survey_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
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
      budget_category: "fixed" | "flexible" | "planed"
      message_sender_type: "BOT" | "USER"
      question_type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "OPEN"
      quiz_type: "TASK" | "PERSONALITY_SURVEY" | "WORLD_SURVEY"
      task_type: "QUIZ" | "WATCH_VIDEO" | "AI_CHAT" | "USE_TOOL" | "TEXT"
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

