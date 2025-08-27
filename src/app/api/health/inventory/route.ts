// API Health Check - Inventory Service
import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/lib/inventory-service';

export async function GET(request: NextRequest) { try { const healthCheck = await inventoryService.healthCheck(); const stats = await inventoryService.getInventoryStats(); const activeAlerts = await inventoryService.getActiveAlerts(); return NextResponse.json({ success: true, service: 'inventory', ...healthCheck, stats, alerts: { total: activeAlerts.length, critical: activeAlerts.filter(a => a.priority === 'critical').length, high: activeAlerts.filter(a => a.priority === 'high').length, medium: activeAlerts.filter(a => a.priority === 'medium').length, low: activeAlerts.filter(a => a.priority === 'low').length }, features: { automaticReorder: true, stockAlerts: true, movementTracking: true, expiryTracking: true, realTimeSync: true, emailNotifications: true }, timestamp: new Date().toISOString() }); } catch (error) { console.error('Inventory health check error:', error instanceof Error ? error.message : String(error)); return NextResponse.json({
      success: false,
      service: 'inventory',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 }); }
}