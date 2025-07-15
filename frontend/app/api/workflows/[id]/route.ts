import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { encryptWorkflowNodes, decryptWorkflowNodes } from '@/lib/secure-workflow'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const isShared = url.searchParams.has('shared')
    
    // For shared workflows, we don't require authentication
    if (!isShared) {
      const { userId } = await auth()
      
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Use service role key to bypass RLS for now
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    let query = supabaseAdmin
      .from('workflows')
      .select('*')
      .eq('id', id)

    // Only filter by user_id if not a shared request
    if (!isShared) {
      const { userId } = await auth()
      query = query.eq('user_id', userId!)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch workflow' }, { status: 500 })
    }

    // For shared workflows, we might want to remove sensitive data like API keys
    let responseData;
    if (isShared) {
      // Decrypt but remove sensitive API key data for shared workflows
      const decryptedNodes = decryptWorkflowNodes(data.nodes || [])
      const sanitizedNodes = decryptedNodes.map((node: any) => {
        const sanitizedNode = { ...node }
        // Remove API keys and other sensitive data for shared workflows
        if (sanitizedNode.data) {
          delete sanitizedNode.data.apiKey
          delete sanitizedNode.data.password
          delete sanitizedNode.data.twilio_sid
          delete sanitizedNode.data.twilio_token
          delete sanitizedNode.data.username
        }
        return sanitizedNode
      })
      
      responseData = {
        ...data,
        nodes: sanitizedNodes
      };
    } else {
      // Decrypt sensitive data before sending to client (for authenticated users)
      responseData = {
        ...data,
        nodes: decryptWorkflowNodes(data.nodes || [])
      };
    }

    return NextResponse.json({ workflow: responseData })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, nodes, edges } = body

    // Use service role key to bypass RLS for now
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (nodes !== undefined) {
      // Encrypt sensitive data before storing
      updateData.nodes = encryptWorkflowNodes(nodes)
    }
    if (edges !== undefined) updateData.edges = edges

    const { data, error } = await supabaseAdmin
      .from('workflows')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 })
    }

    // Decrypt before sending back to client
    const responseData = {
      ...data,
      nodes: decryptWorkflowNodes(data.nodes || [])
    };

    return NextResponse.json({ workflow: responseData })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Use service role key to bypass RLS for now
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { error } = await supabaseAdmin
      .from('workflows')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Workflow deleted successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}