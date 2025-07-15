import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { encryptWorkflowNodes, decryptWorkflowNodes } from '@/lib/secure-workflow'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role key to bypass RLS for now
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from('workflows')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 })
    }

    // Decrypt sensitive data before sending to client
    const decryptedWorkflows = data.map(workflow => ({
      ...workflow,
      nodes: decryptWorkflowNodes(workflow.nodes || [])
    }));

    return NextResponse.json({ workflows: decryptedWorkflows })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, nodes, edges } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Encrypt sensitive data before storing
    const encryptedNodes = encryptWorkflowNodes(nodes || []);

    // Use service role key for now
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from('workflows')
      .insert({
        user_id: userId,
        name,
        description: description || '',
        nodes: encryptedNodes,
        edges: edges || [],
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 })
    }

    // Decrypt before sending back to client
    const responseData = {
      ...data,
      nodes: decryptWorkflowNodes(data.nodes || [])
    };

    return NextResponse.json({ workflow: responseData }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}