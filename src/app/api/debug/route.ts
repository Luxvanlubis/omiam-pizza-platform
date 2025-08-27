import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basique sans Prisma
    return NextResponse.json({
      success: true,
      message: 'Debug API working',
      timestamp: new Date().toISOString(),
      env: {
        database_url: process.env.DATABASE_URL ? 'SET' : 'NOT_SET'
      }
    });
  } catch (error) {
    console.error('Debug API Error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Debug API failed' },
      { status: 500 }
    );
  }
}