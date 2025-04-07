// Types générés automatiquement par Supabase - à mettre à jour selon le schéma réel
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          status: string
          due_date: string | null
          assigned_to: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          status?: string
          due_date?: string | null
          assigned_to?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          status?: string
          due_date?: string | null
          assigned_to?: string | null
        }
      }
      // Ajouter d'autres tables selon votre schéma
    }
    Views: {
      // Définir les vues si nécessaire
    }
    Functions: {
      // Définir les fonctions si nécessaire
    }
    Enums: {
      // Définir les enums si nécessaire
    }
  }
}

// Types existants (conservés pour compatibilité)
// Ces interfaces sont maintenant définies dans task.ts