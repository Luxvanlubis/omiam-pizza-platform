import { NextResponse } from 'next/server'
import db from '@/lib/supabase-fallback'

export async function GET() {
  try {
    const health = await db.healthCheck();
    return NextResponse.json({
      status: 'success',
      database: health,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Database health check failed:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}