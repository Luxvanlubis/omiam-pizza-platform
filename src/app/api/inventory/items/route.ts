import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/lib/inventory-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const items = await inventoryService.getAllItems();
    let filteredItems = items;

    // Filtrer par catégorie
    if (category && category !== 'all') {
      filteredItems = filteredItems.filter(item => 
        item.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Filtrer par recherche
    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.sku?.toLowerCase().includes(searchLower)
      );
    }

    // Trier
    filteredItems.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      
      // Conversion sécurisée pour la comparaison
      const aStr = typeof aValue === 'string' ? aValue.toLowerCase() : String(aValue || '');
      const bStr = typeof bValue === 'string' ? bValue.toLowerCase() : String(bValue || '');
      
      if (sortOrder === 'desc') {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
      return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    // Statistiques
    const totalItems = filteredItems.length;
    const totalValue = filteredItems.reduce((sum, item) => 
      sum + (item.currentStock * (item.cost || 0)), 0
    );
    const lowStockItems = filteredItems.filter(item => 
      item.currentStock <= item.minStock
    ).length;
    const outOfStockItems = filteredItems.filter(item => 
      item.currentStock === 0
    ).length;

    return NextResponse.json({
      success: true,
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total: totalItems,
        totalPages: Math.ceil(totalItems / limit),
        hasNext: endIndex < totalItems,
        hasPrev: page > 1
      },
      stats: {
        totalItems,
        totalValue: Math.round(totalValue * 100) / 100,
        lowStockItems,
        outOfStockItems
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des articles',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des champs requis
    const requiredFields = ['name', 'sku', 'category'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Le champ '${field}' est requis`
          },
          { status: 400 }
        );
      }
    }

    // Validation des types
    if (body.current_stock && typeof body.current_stock !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Le stock actuel doit être un nombre'
        },
        { status: 400 }
      );
    }

    if (body.min_stock && typeof body.min_stock !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Le stock minimum doit être un nombre'
        },
        { status: 400 }
      );
    }

    if (body.cost_price && typeof body.cost_price !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Le prix de revient doit être un nombre'
        },
        { status: 400 }
      );
    }

    if (body.selling_price && typeof body.selling_price !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Le prix de vente doit être un nombre'
        },
        { status: 400 }
      );
    }

    const newItem = await inventoryService.createItem(body);
    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Article créé avec succès'
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création de l\'article',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}