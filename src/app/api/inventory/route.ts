// API Inventory Management - CRUD Operations
import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/lib/inventory-service';

// Validation function for inventory requests
function validateInventoryRequest(body: any): { isValid: boolean; error?: string } {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  const { action, itemId, quantity, reason } = body;

  if (!action || !['get', 'update', 'consume', 'add', 'list'].includes(action)) {
    return { isValid: false, error: 'Valid action is required (get, update, consume, add, list)' };
  }

  if (action !== 'list' && !itemId) {
    return { isValid: false, error: 'Item ID is required for this action' };
  }

  if (['update', 'consume', 'add'].includes(action)) {
    if (typeof quantity !== 'number' || quantity < 0) {
      return { isValid: false, error: 'Valid quantity is required' };
    }
    if (!reason || typeof reason !== 'string') {
      return { isValid: false, error: 'Reason is required for stock changes' };
    }
  }

  return { isValid: true };
}

// GET - Obtenir les articles d'inventaire
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const includeStats = searchParams.get('stats') === 'true';
    const includeAlerts = searchParams.get('alerts') === 'true';
    const includeMovements = searchParams.get('movements') === 'true';

    let result: any = {};

    if (itemId) {
      // Obtenir un article spécifique
      const item = await inventoryService.getItemById(itemId);
      if (!item) {
        return NextResponse.json({
          success: false,
          error: 'Item not found'
        }, { status: 404 });
      }
      
      result.item = item;
      
      if (includeMovements) {
        result.movements = await inventoryService.getStockMovements(itemId, 20);
      }
    } else {
      // Obtenir tous les articles
      result.items = await inventoryService.getAllItems();
    }

    if (includeStats) {
      result.stats = await inventoryService.getInventoryStats();
    }

    if (includeAlerts) {
      result.alerts = await inventoryService.getActiveAlerts();
    }

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Inventory GET error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST - Opérations sur les stocks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateInventoryRequest(body);

    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.error
      }, { status: 400 });
    }

    const { action, itemId, quantity, reason, employeeId, orderId, cost, batchNumber } = body;
    let result: any = {};

    switch (action) {
      case 'list':
        result.items = await inventoryService.getAllItems();
        break;

      case 'get':
        const item = await inventoryService.getItemById(itemId);
        if (!item) {
          return NextResponse.json({
            success: false,
            error: 'Item not found'
          }, { status: 404 });
        }
        result.item = item;
        break;

      case 'update':
        const updateSuccess = await inventoryService.updateStock(itemId, quantity, reason, employeeId);
        if (!updateSuccess) {
          return NextResponse.json({
            success: false,
            error: 'Failed to update stock'
          }, { status: 400 });
        }
        result.message = `Stock updated successfully for item ${itemId}`;
        result.newQuantity = quantity;
        break;

      case 'consume':
        const consumeSuccess = await inventoryService.consumeStock(itemId, quantity, orderId);
        if (!consumeSuccess) {
          const item = await inventoryService.getItemById(itemId);
          return NextResponse.json({
            success: false,
            error: `Insufficient stock. Available: ${item?.currentStock || 0}, Requested: ${quantity}`
          }, { status: 400 });
        }
        result.message = `Stock consumed successfully for item ${itemId}`;
        result.consumedQuantity = quantity;
        break;

      case 'add':
        const addSuccess = await inventoryService.addStock(itemId, quantity, cost, batchNumber);
        if (!addSuccess) {
          return NextResponse.json({
            success: false,
            error: 'Failed to add stock'
          }, { status: 400 });
        }
        result.message = `Stock added successfully for item ${itemId}`;
        result.addedQuantity = quantity;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

    // Obtenir l'article mis à jour pour la réponse
    if (['update', 'consume', 'add'].includes(action)) {
      result.updatedItem = await inventoryService.getItemById(itemId);
    }

    return NextResponse.json({
      success: true,
      action,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Inventory POST error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}