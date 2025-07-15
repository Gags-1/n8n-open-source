import { useSupabaseClient } from './supabase'
import { useAuth } from '@clerk/nextjs'

export interface WorkflowData {
  id: string
  user_id: string
  name: string
  description?: string
  nodes: any[]
  edges: any[]
  created_at: string
  updated_at: string
}

export interface CreateWorkflowData {
  name: string
  description?: string
  nodes?: any[]
  edges?: any[]
}

export interface UpdateWorkflowData {
  name?: string
  description?: string
  nodes?: any[]
  edges?: any[]
}

export const useWorkflowService = () => {
  const supabase = useSupabaseClient()
  const { userId } = useAuth()

  const getAllWorkflows = async (): Promise<WorkflowData[]> => {
    if (!userId) throw new Error('User not authenticated')

    try {
      console.log('Fetching workflows for user:', userId)
      
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('updated_at', { ascending: false })

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }
      return data || []
    } catch (error) {
      console.error('Error fetching workflows:', error)
      throw error
    }
  }

  const getWorkflowById = async (id: string): Promise<WorkflowData | null> => {
    if (!userId) throw new Error('User not authenticated')

    try {
      console.log('Fetching workflow by ID:', id)
      
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single()

      console.log('Supabase response:', { data, error })

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        console.error('Supabase error details:', error)
        throw error
      }
      return data
    } catch (error) {
      console.error('Error fetching workflow:', error)
      throw error
    }
  }

  const createWorkflow = async (workflowData: CreateWorkflowData): Promise<WorkflowData> => {
    if (!userId) throw new Error('User not authenticated')

    try {
      console.log('Creating workflow:', workflowData, 'for user:', userId)
      
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          user_id: userId,
          name: workflowData.name,
          description: workflowData.description || '',
          nodes: workflowData.nodes || [],
          edges: workflowData.edges || [],
        })
        .select()
        .single()

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }
      return data
    } catch (error) {
      console.error('Error creating workflow:', error)
      throw error
    }
  }

  const updateWorkflow = async (id: string, updates: UpdateWorkflowData): Promise<WorkflowData> => {
    if (!userId) throw new Error('User not authenticated')

    try {
      console.log('Updating workflow:', id, 'with:', updates)
      
      const { data, error } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }
      return data
    } catch (error) {
      console.error('Error updating workflow:', error)
      throw error
    }
  }

  const deleteWorkflow = async (id: string): Promise<void> => {
    if (!userId) throw new Error('User not authenticated')

    try {
      console.log('Deleting workflow:', id)
      
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id)

      console.log('Supabase response:', { error })

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }
    } catch (error) {
      console.error('Error deleting workflow:', error)
      throw error
    }
  }

  return {
    getAllWorkflows,
    getWorkflowById,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
  }
}

// Alternative approach using API routes instead of direct Supabase calls
export const useWorkflowServiceAPI = () => {
  const getAllWorkflows = async (): Promise<WorkflowData[]> => {
    try {
      console.log('Fetching workflows via API...')
      
      const response = await fetch('/api/workflows')
      const result = await response.json()
      
      console.log('API response:', { status: response.status, result })
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch workflows')
      }
      
      return result.workflows || []
    } catch (error) {
      console.error('Error fetching workflows via API:', error)
      throw error
    }
  }

  const createWorkflow = async (workflowData: CreateWorkflowData): Promise<WorkflowData> => {
    try {
      console.log('Creating workflow via API:', workflowData)
      
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      })
      
      const result = await response.json()
      
      console.log('API response:', { status: response.status, result })
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create workflow')
      }
      
      return result.workflow
    } catch (error) {
      console.error('Error creating workflow via API:', error)
      throw error
    }
  }

  const updateWorkflow = async (id: string, updates: UpdateWorkflowData): Promise<WorkflowData> => {
    try {
      console.log('Updating workflow via API:', id, updates)
      
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      const result = await response.json()
      
      console.log('API response:', { status: response.status, result })
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update workflow')
      }
      
      return result.workflow
    } catch (error) {
      console.error('Error updating workflow via API:', error)
      throw error
    }
  }

  const getWorkflowById = async (id: string): Promise<WorkflowData | null> => {
    try {
      console.log('Fetching workflow by ID via API:', id)
      
      const response = await fetch(`/api/workflows/${id}`)
      const result = await response.json()
      
      console.log('API response:', { status: response.status, result })
      
      if (response.status === 404) {
        return null
      }
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch workflow')
      }
      
      return result.workflow
    } catch (error) {
      console.error('Error fetching workflow by ID via API:', error)
      throw error
    }
  }

  const deleteWorkflow = async (id: string): Promise<void> => {
    try {
      console.log('Deleting workflow via API:', id)
      
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      console.log('API response:', { status: response.status, result })
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete workflow')
      }
    } catch (error) {
      console.error('Error deleting workflow via API:', error)
      throw error
    }
  }

  return {
    getAllWorkflows,
    getWorkflowById,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
  }
}