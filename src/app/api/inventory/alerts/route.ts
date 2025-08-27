// API Inventory Alerts Management
import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/lib/inventory-service';

// Validation function for alert requests
function validateAlertRequest(body: any): { isValid: boolean; error?: string } {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }
  
  const { action } = body;
  if (!action || !['list', 'acknowledge'].includes(action)) {
    return { isValid: false, error: 'Valid action is required (list, acknowledge)' };
  }
  
  if (action === 'acknowledge') {
    const { alertId, employeeId } = body;
    if (!alertId || typeof alertId !== 'string') {
      return { isValid: false, error: 'Alert ID is required for acknowledge action' };
    }
    if (!employeeId || typeof employeeId !== 'string') {
      return { isValid: false, error: 'Employee ID is required for acknowledge action' };
    }
  }
  
  return { isValid: true };
}

// GET - Obtenir les alertes actives
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');
    const itemId = searchParams.get('itemId');
    
    let alerts = await inventoryService.getActiveAlerts();
    
    // Filtrer par priorité si spécifiée
    if (priority && ['low', 'medium', 'high', 'critical'].includes(priority)) {
      alerts = alerts.filter(alert => alert.priority === priority);
    }
    
    // Filtrer par type si spécifié
    if (type && ['low_stock', 'critical_stock', 'out_of_stock', 'expiry_warning', 'reorder_needed'].includes(type)) {
      alerts = alerts.filter(alert => alert.type === type);
    }
    
    // Filtrer par article si spécifié
    if (itemId) {
      alerts = alerts.filter(alert => alert.itemId === itemId);
    }
    
    // Grouper les alertes par priorité pour les statistiques
    const alertStats = {
      total: alerts.length,
      critical: alerts.filter(a => a.priority === 'critical').length,
      high: alerts.filter(a => a.priority === 'high').length,
      medium: alerts.filter(a => a.priority === 'medium').length,
      low: alerts.filter(a => a.priority === 'low').length
    };
    
    // Grouper par type
    const alertsByType = {
      low_stock: alerts.filter(a => a.type === 'low_stock').length,
      critical_stock: alerts.filter(a => a.type === 'critical_stock').length,
      out_of_stock: alerts.filter(a => a.type === 'out_of_stock').length,
      expiry_warning: alerts.filter(a => a.type === 'expiry_warning').length,
      reorder_needed: alerts.filter(a => a.type === 'reorder_needed').length
    };
    
    return NextResponse.json({
      success: true,
      alerts,
      stats: alertStats,
      byType: alertsByType,
      filters: {
        priority: priority || 'all',
        type: type || 'all',
        itemId: itemId || 'all'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Inventory alerts GET error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST - Gérer les alertes (acquittement)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateAlertRequest(body);
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.error
      }, { status: 400 });
    }
    
    const { action, alertId, employeeId } = body;
    let result: any = {};
    
    switch (action) {
      case 'list':
        result.alerts = await inventoryService.getActiveAlerts();
        break;
        
      case 'acknowledge':
        const acknowledgeSuccess = await inventoryService.acknowledgeAlert(alertId, employeeId);
        if (!acknowledgeSuccess) {
          return NextResponse.json({
            success: false,
            error: 'Failed to acknowledge alert or alert not found'
          }, { status: 400 });
        }
        result.message = `Alert ${alertId} acknowledged successfully`;
        result.acknowledgedBy = employeeId;
        result.acknowledgedAt = new Date().toISOString();
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      action,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Inventory alerts POST error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}