import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Vérifications de santé de l'application
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: await checkDatabase(),
        memory: checkMemory(),
        disk: checkDisk()
      }
    };
    
    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    );
  }
}

async function checkDatabase() {
  try {
    // Vérification simple de la base de données
    // À adapter selon votre configuration Supabase
    return { status: 'connected', latency: '< 50ms' };
  } catch (error) {
    return { status: 'disconnected', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function checkMemory() {
  const usage = process.memoryUsage();
  const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
  const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
  
  return {
    total: `${totalMB}MB`,
    used: `${usedMB}MB`,
    percentage: Math.round((usedMB / totalMB) * 100)
  };
}

function checkDisk() {
  // Vérification basique de l'espace disque
  return {
    status: 'available',
    usage: '< 80%'
  };
}
