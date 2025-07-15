import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { migrateExistingData } from '@/db/migrate-encryption'

export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`Migration triggered by user: ${userId}`);
    await migrateExistingData();

    return NextResponse.json({ 
      message: 'Encryption migration completed successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Migration API error:', error)
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}