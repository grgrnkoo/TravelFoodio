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
      users: {
        Row: {
          id: string
          clerk_user_id: string
          email: string
          image: string | null
          name: string | null
          updates_remaining: number
          daily_updates: number
          subscription_type: string
          onboarding1_completed: boolean
          onboarding2_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_user_id: string
          email: string
          image?: string | null
          name?: string | null
          updates_remaining?: number
          daily_updates?: number
          subscription_type?: string
          onboarding1_completed?: boolean
          onboarding2_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_user_id?: string
          email?: string
          image?: string | null
          name?: string | null
          updates_remaining?: number
          daily_updates?: number
          subscription_type?: string
          onboarding1_completed?: boolean
          onboarding2_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          age: number
          date_of_birth: string | null
          location: string | null
          daily_calories_suggested: number
          daily_carbs_suggested: number
          daily_proteins_suggested: number
          daily_fats_suggested: number
          goals: string | null
          dietary_restrictions: string | null
          medical_recommendations: Json
          weight: string | null
          height: string | null
          other_info: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          age?: number
          date_of_birth?: string | null
          location?: string | null
          daily_calories_suggested?: number
          daily_carbs_suggested?: number
          daily_proteins_suggested?: number
          daily_fats_suggested?: number
          goals?: string | null
          dietary_restrictions?: string | null
          medical_recommendations?: Json
          weight?: string | null
          height?: string | null
          other_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          age?: number
          date_of_birth?: string | null
          location?: string | null
          daily_calories_suggested?: number
          daily_carbs_suggested?: number
          daily_proteins_suggested?: number
          daily_fats_suggested?: number
          goals?: string | null
          dietary_restrictions?: string | null
          medical_recommendations?: Json
          weight?: string | null
          height?: string | null
          other_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_favorite_meals: {
        Row: {
          id: string
          user_id: string
          meal_name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_meals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_disliked_meals: {
        Row: {
          id: string
          user_id: string
          meal_name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_disliked_meals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_ingredients: {
        Row: {
          id: string
          user_id: string
          ingredient_name: string
          rating: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ingredient_name: string
          rating?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ingredient_name?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ingredients_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_cuisines: {
        Row: {
          id: string
          user_id: string
          cuisine_name: string
          rating: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cuisine_name: string
          rating?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cuisine_name?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_cuisines_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      menus: {
        Row: {
          id: string
          user_id: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      menu_meals: {
        Row: {
          id: string
          menu_id: string
          name: string
          calories: number | null
          protein: number | null
          fats: number | null
          carbs: number | null
          weight: number | null
          cuisine: string | null
          ingredients: Json
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          menu_id: string
          name: string
          calories?: number | null
          protein?: number | null
          fats?: number | null
          carbs?: number | null
          weight?: number | null
          cuisine?: string | null
          ingredients?: Json
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          menu_id?: string
          name?: string
          calories?: number | null
          protein?: number | null
          fats?: number | null
          carbs?: number | null
          weight?: number | null
          cuisine?: string | null
          ingredients?: Json
          order_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_meals_menu_id_fkey"
            columns: ["menu_id"]
            referencedRelation: "menus"
            referencedColumns: ["id"]
          }
        ]
      }
      meals: {
        Row: {
          id: string
          name: string
          cuisine: string | null
          ingredients: Json
          calories: number | null
          protein: number | null
          fats: number | null
          carbs: number | null
          weight: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          cuisine?: string | null
          ingredients?: Json
          calories?: number | null
          protein?: number | null
          fats?: number | null
          carbs?: number | null
          weight?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          cuisine?: string | null
          ingredients?: Json
          calories?: number | null
          protein?: number | null
          fats?: number | null
          carbs?: number | null
          weight?: number | null
          created_at?: string
        }
        Relationships: []
      }
      consumed_meals: {
        Row: {
          id: string
          user_id: string
          meal_name: string
          calories: number | null
          protein: number | null
          fats: number | null
          carbs: number | null
          weight: number | null
          cuisine: string | null
          ingredients: Json
          consumed_at: string
          consumed_date: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_name: string
          calories?: number | null
          protein?: number | null
          fats?: number | null
          carbs?: number | null
          weight?: number | null
          cuisine?: string | null
          ingredients?: Json
          consumed_at?: string
          consumed_date?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_name?: string
          calories?: number | null
          protein?: number | null
          fats?: number | null
          carbs?: number | null
          weight?: number | null
          cuisine?: string | null
          ingredients?: Json
          consumed_at?: string
          consumed_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumed_meals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      feedback: {
        Row: {
          id: string
          author: string | null
          feedback: string
          created_at: string
        }
        Insert: {
          id?: string
          author?: string | null
          feedback: string
          created_at?: string
        }
        Update: {
          id?: string
          author?: string | null
          feedback?: string
          created_at?: string
        }
        Relationships: []
      }
      single_meals: {
        Row: {
          id: string
          user_id: string
          name: string
          calories: number | null
          protein: number | null
          fats: number | null
          carbs: number | null
          weight: number | null
          cuisine: string | null
          ingredients: Json
          source: 'photo' | 'prompt'
          created_at: string
          generation_date: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          calories?: number | null
          protein?: number | null
          fats?: number | null
          carbs?: number | null
          weight?: number | null
          cuisine?: string | null
          ingredients?: Json
          source: 'photo' | 'prompt'
          created_at?: string
          generation_date?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          calories?: number | null
          protein?: number | null
          fats?: number | null
          carbs?: number | null
          weight?: number | null
          cuisine?: string | null
          ingredients?: Json
          source?: 'photo' | 'prompt'
          created_at?: string
          generation_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "single_meals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      error_logs: {
        Row: {
          id: string
          user_id: string | null
          error_type: string
          error_message: string
          error_stack: string | null
          endpoint: string | null
          request_data: Json | null
          severity: 'low' | 'medium' | 'high' | 'critical'
          resolved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          error_type: string
          error_message: string
          error_stack?: string | null
          endpoint?: string | null
          request_data?: Json | null
          severity?: 'low' | 'medium' | 'high' | 'critical'
          resolved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          error_type?: string
          error_message?: string
          error_stack?: string | null
          endpoint?: string | null
          request_data?: Json | null
          severity?: 'low' | 'medium' | 'high' | 'critical'
          resolved?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_by_clerk_id: {
        Args: {
          p_clerk_user_id: string
        }
        Returns: Database['public']['Tables']['users']['Row'][]
      }
      get_user_full_profile: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      upsert_ingredient_rating: {
        Args: {
          p_user_id: string
          p_ingredient_name: string
          p_rating_change: number
        }
        Returns: void
      }
      upsert_cuisine_rating: {
        Args: {
          p_user_id: string
          p_cuisine_name: string
          p_rating_change: number
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type User = Tables<'users'>
export type UserInsert = InsertTables<'users'>
export type UserUpdate = UpdateTables<'users'>

export type UserPreferences = Tables<'user_preferences'>
export type UserPreferencesInsert = InsertTables<'user_preferences'>
export type UserPreferencesUpdate = UpdateTables<'user_preferences'>

export type UserFavoriteMeal = Tables<'user_favorite_meals'>
export type UserDislikedMeal = Tables<'user_disliked_meals'>
export type UserIngredient = Tables<'user_ingredients'>
export type UserCuisine = Tables<'user_cuisines'>

export type Menu = Tables<'menus'>
export type MenuMeal = Tables<'menu_meals'>
export type Meal = Tables<'meals'>
export type Feedback = Tables<'feedback'>
export type SingleMeal = Tables<'single_meals'>
export type SingleMealInsert = InsertTables<'single_meals'>
export type SingleMealUpdate = UpdateTables<'single_meals'>

export type ErrorLog = Tables<'error_logs'>
export type ErrorLogInsert = InsertTables<'error_logs'>
export type ErrorLogUpdate = UpdateTables<'error_logs'>

