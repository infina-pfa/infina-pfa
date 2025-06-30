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
      budget_transactions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          budget_id: string
          transaction_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          budget_id: string
          transaction_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          budget_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_transactions_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_transactions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          month: number
          year: number
          name: string
          color: string
          icon: string
          category: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          month: number
          year: number
          name: string
          color?: string
          icon?: string
          category?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          month?: number
          year?: number
          name?: string
          color?: string
          icon?: string
          category?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          name: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_transactions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          debt_id: string
          transaction_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          debt_id: string
          transaction_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          debt_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_transactions_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_transactions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          name: string
          description: string | null
          due_date: string
          amount: number
          current_amount: number
          interest_rate: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          name: string
          description?: string | null
          due_date: string
          amount: number
          current_amount: number
          interest_rate?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          name?: string
          description?: string | null
          due_date?: string
          amount?: number
          current_amount?: number
          interest_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "debts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_transactions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          goal_id: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          goal_id: string
          transaction_id: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          goal_id?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_transactions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_transactions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          title: string
          due_date: string | null
          description: string | null
          current_amount: number
          target_amount: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          title: string
          due_date?: string | null
          description?: string | null
          current_amount?: number
          target_amount?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          title?: string
          due_date?: string | null
          description?: string | null
          current_amount?: number
          target_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          conversation_id: string
          content: string
          type: Database["public"]["Enums"]["message_type"]
          sender: Database["public"]["Enums"]["message_sender"]
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          conversation_id: string
          content: string
          type?: Database["public"]["Enums"]["message_type"]
          sender?: Database["public"]["Enums"]["message_sender"]
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          conversation_id?: string
          content?: string
          type?: Database["public"]["Enums"]["message_type"]
          sender?: Database["public"]["Enums"]["message_sender"]
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          amount: number
          recurring: number
          name: string
          description: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          amount: number
          recurring: number
          name: string
          description?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          amount?: number
          recurring?: number
          name?: string
          description?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          user_id: string
          total_asset_value: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          user_id: string
          total_asset_value?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          user_id?: string
          total_asset_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      message_sender: "ai" | "user" | "system"
      message_type: "text" | "image" | "photo" | "component" | "tool"
      transaction_type: "income" | "outcome" | "transfer"
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
