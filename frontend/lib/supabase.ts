import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Hook to get authenticated Supabase client
export const useSupabaseClient = () => {
  const { getToken } = useAuth()
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        try {
          console.log('Getting Clerk token...')
          const clerkToken = await getToken({
            template: 'supabase',
          })
          console.log('Clerk token obtained:', clerkToken ? 'Yes' : 'No')

          const headers = new Headers(options?.headers)
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`)
            console.log('Authorization header set')
          } else {
            console.warn('No Clerk token available')
          }

          console.log(`Making request to: ${url}`)
          const response = await fetch(url, {
            ...options,
            headers,
          })
          
          console.log(`Response status: ${response.status}`)
          if (!response.ok) {
            console.error(`Request failed: ${response.status} ${response.statusText}`)
          }
          
          return response
        } catch (error) {
          console.error('Error in Supabase fetch:', error)
          throw error
        }
      },
    },
  })
}

// Server-side client for API routes
export const createServerSupabaseClient = (clerkToken?: string | null) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        const headers = new Headers(options?.headers)
        if (clerkToken) {
          headers.set('Authorization', `Bearer ${clerkToken}`)
        }

        return fetch(url, {
          ...options,
          headers,
        })
      },
    },
  })
}

// Default client for non-authenticated requests
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database
export interface Database {
  public: {
    Tables: {
      workflows: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          nodes: any
          edges: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          nodes?: any
          edges?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          nodes?: any
          edges?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}