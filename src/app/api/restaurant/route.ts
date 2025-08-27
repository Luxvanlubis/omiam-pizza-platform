import { NextRequest, NextResponse } from 'next/server';

// Version simplifiée pour diagnostic
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Restaurant - Test simple');
    
    // Test basique sans Supabase
    const mockData = {
      id: '1',
      name: 'Restaurant O\'Miam',
      description: 'Restaurant de test',
      address: '123 Rue de Test',
      phone: '+33 1 23 45 67 89',
      email: 'contact@omiam.fr',
      status: 'active'
    };
    
    console.log('✅ API Restaurant - Données mockées retournées');
    
    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'Restaurant data retrieved successfully (mock)'
    });
    
  } catch (error) {
    console.error('❌ API Restaurant Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, message: 'POST method not implemented yet' },
    { status: 501 }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { success: false, message: 'PUT method not implemented yet' },
    { status: 501 }
  );
}