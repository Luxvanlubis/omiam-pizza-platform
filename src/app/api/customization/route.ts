import { NextRequest, NextResponse } from 'next/server';
import { supabaseIntegrationService } from '@/lib/supabase-integration-service';

// GET /api/customization - Récupérer toutes les options de personnalisation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type) {
      // Récupérer un type spécifique d'options
      switch (type) {
        case 'sizes':
          const { data: sizes, error: sizesError } = await supabaseIntegrationService
            .getSupabaseClient()
            .from('pizza_sizes')
            .select('*')
            .order('diameter', { ascending: true });

          if (sizesError) {
            throw new Error(`Erreur lors de la récupération des tailles: ${sizesError.message}`);
          }
          return NextResponse.json(sizes);

        case 'dough':
          const { data: doughTypes, error: doughError } = await supabaseIntegrationService
            .getSupabaseClient()
            .from('dough_types')
            .select('*')
            .order('name', { ascending: true });

          if (doughError) {
            throw new Error(`Erreur lors de la récupération des pâtes: ${doughError.message}`);
          }
          return NextResponse.json(doughTypes);

        case 'cooking':
          const { data: cookingLevels, error: cookingError } = await supabaseIntegrationService
            .getSupabaseClient()
            .from('cooking_levels')
            .select('*')
            .order('name', { ascending: true });

          if (cookingError) {
            throw new Error(`Erreur lors de la récupération des cuissons: ${cookingError.message}`);
          }
          return NextResponse.json(cookingLevels);

        case 'ingredients':
          const { data: ingredients, error: ingredientsError } = await supabaseIntegrationService
            .getSupabaseClient()
            .from('ingredients')
            .select('*')
            .order('category', { ascending: true })
            .order('name', { ascending: true });

          if (ingredientsError) {
            throw new Error(`Erreur lors de la récupération des ingrédients: ${ingredientsError.message}`);
          }
          return NextResponse.json(ingredients);

        default:
          return NextResponse.json(
            { error: 'Type non supporté' },
            { status: 400 }
          );
      }
    }

    // Récupérer toutes les options de personnalisation
    const [
      { data: sizes, error: sizesError },
      { data: doughTypes, error: doughError },
      { data: cookingLevels, error: cookingError },
      { data: ingredients, error: ingredientsError }
    ] = await Promise.all([
      supabaseIntegrationService.getSupabaseClient().from('pizza_sizes').select('*').order('diameter', { ascending: true }),
      supabaseIntegrationService.getSupabaseClient().from('dough_types').select('*').order('name', { ascending: true }),
      supabaseIntegrationService.getSupabaseClient().from('cooking_levels').select('*').order('name', { ascending: true }),
      supabaseIntegrationService.getSupabaseClient().from('ingredients').select('*').order('category', { ascending: true }).order('name', { ascending: true })
    ]);

    if (sizesError || doughError || cookingError || ingredientsError) {
      const errors = [sizesError, doughError, cookingError, ingredientsError].filter(Boolean);
      throw new Error(`Erreurs lors de la récupération: ${errors.map(e => e?.message).join(', ')}`);
    }

    return NextResponse.json({
      sizes,
      doughTypes,
      cookingLevels,
      ingredients
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des options:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/customization - Créer une nouvelle option de personnalisation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type et données requis' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'size':
        const { data: sizeResult, error: sizeCreateError } = await supabaseIntegrationService
          .getSupabaseClient()
          .from('pizza_sizes')
          .insert({
            name: data.name,
            diameter: data.diameter,
            base_price: data.basePrice
          })
          .select()
          .single();

        if (sizeCreateError) {
          throw new Error(`Erreur lors de la création de la taille: ${sizeCreateError.message}`);
        }
        result = sizeResult;
        break;

      case 'dough':
        const { data: doughResult, error: doughCreateError } = await supabaseIntegrationService
          .getSupabaseClient()
          .from('dough_types')
          .insert({
            name: data.name,
            description: data.description,
            extra_price: data.extraPrice
          })
          .select()
          .single();

        if (doughCreateError) {
          throw new Error(`Erreur lors de la création du type de pâte: ${doughCreateError.message}`);
        }
        result = doughResult;
        break;

      case 'cooking':
        const { data: cookingResult, error: cookingCreateError } = await supabaseIntegrationService
          .getSupabaseClient()
          .from('cooking_levels')
          .insert({
            name: data.name,
            description: data.description,
            extra_price: data.extraPrice
          })
          .select()
          .single();

        if (cookingCreateError) {
          throw new Error(`Erreur lors de la création du niveau de cuisson: ${cookingCreateError.message}`);
        }
        result = cookingResult;
        break;

      case 'ingredient':
        const { data: ingredientResult, error: ingredientCreateError } = await supabaseIntegrationService
          .getSupabaseClient()
          .from('ingredients')
          .insert({
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category,
            allergens: data.allergens || [],
            is_vegetarian: data.isVegetarian || false,
            is_vegan: data.isVegan || false
          })
          .select()
          .single();

        if (ingredientCreateError) {
          throw new Error(`Erreur lors de la création de l'ingrédient: ${ingredientCreateError.message}`);
        }
        result = ingredientResult;
        break;

      default:
        return NextResponse.json(
          { error: 'Type non supporté' },
          { status: 400 }
        );
    }

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de l\'option:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}