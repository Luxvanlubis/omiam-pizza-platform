import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabaseIntegrationService } from '@/lib/supabase-integration-service';

// GET /api/reviews - Récupérer les avis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const orderId = searchParams.get('orderId');
    const sortBy = searchParams.get('sortBy') || 'recent';
    const filterRating = searchParams.get('filterRating');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = supabaseIntegrationService.getSupabaseClient();
    
    let query = supabase
      .from('reviews')
      .select(`
        *,
        user:profiles!reviews_user_id_fkey(
          id,
          name
        ),
        product:products!reviews_product_id_fkey(
          id,
          name
        )
      `)
      .eq('is_visible', true);

    if (productId) {
      query = query.eq('product_id', productId);
    }
    if (orderId) {
      query = query.eq('order_id', orderId);
    }
    if (filterRating) {
      query = query.eq('rating', parseInt(filterRating));
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'helpful':
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data: reviews, error: reviewsError } = await query
      .range((page - 1) * limit, page * limit - 1);

    if (reviewsError) {
      throw new Error(`Erreur lors de la récupération des avis: ${reviewsError.message}`);
    }

    let countQuery = supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('is_visible', true);

    if (productId) {
      countQuery = countQuery.eq('product_id', productId);
    }
    if (orderId) {
      countQuery = countQuery.eq('order_id', orderId);
    }
    if (filterRating) {
      countQuery = countQuery.eq('rating', parseInt(filterRating));
    }

    const { count: totalReviews, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Erreur lors du comptage des avis: ${countError.message}`);
    }

    // Calculate average rating
    let avgQuery = supabase
      .from('reviews')
      .select('rating')
      .eq('is_visible', true);

    if (productId) {
      avgQuery = avgQuery.eq('product_id', productId);
    }

    const { data: ratingData, error: avgError } = await avgQuery;

    if (avgError) {
      throw new Error(`Erreur lors du calcul de la moyenne: ${avgError.message}`);
    }

    const avgRating = ratingData && ratingData.length > 0
      ? ratingData.reduce((sum, review) => sum + review.rating, 0) / ratingData.length
      : 0;

    // Calculate rating distribution
    const ratingDistribution = await Promise.all(
      [5, 4, 3, 2, 1].map(async (rating) => {
        let distQuery = supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('is_visible', true)
          .eq('rating', rating);

        if (productId) {
          distQuery = distQuery.eq('product_id', productId);
        }
        if (orderId) {
          distQuery = distQuery.eq('order_id', orderId);
        }

        const { count, error: distError } = await distQuery;

        if (distError) {
          console.error(`Erreur lors du calcul de la distribution pour la note ${rating}:`, distError);
          return { rating, count: 0, percentage: 0 };
        }

        return {
          rating,
          count: count || 0,
          percentage: totalReviews > 0 ? ((count || 0) / totalReviews) * 100 : 0,
        };
      })
    );

    return NextResponse.json({
      reviews: reviews?.map(review => ({
        ...review,
        userName: (review as any).user?.name || 'Utilisateur anonyme',
        userAvatar: null,
        // Add avatar logic if needed
      })) || [],
      pagination: {
        page,
        limit,
        total: totalReviews || 0,
        totalPages: Math.ceil((totalReviews || 0) / limit),
      },
      stats: {
        averageRating: avgRating || 0,
        totalReviews: totalReviews || 0,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      error: 'Erreur lors de la récupération des avis'
    }, { status: 500 });
  }
}

// POST /api/reviews - Créer un nouvel avis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      productId,
      orderId,
      rating,
      title,
      comment,
      photos = [],
    } = body;

    // Validation
    if (!userId || !rating || !comment) {
      return NextResponse.json({
        error: 'Données manquantes: userId, rating et comment sont requis'
      }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({
        error: 'La note doit être entre 1 et 5'
      }, { status: 400 });
    }

    if (comment.length < 10) {
      return NextResponse.json({
        error: 'Le commentaire doit contenir au moins 10 caractères'
      }, { status: 400 });
    }

    const supabase = supabaseIntegrationService.getSupabaseClient();

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        error: 'Utilisateur non trouvé'
      }, { status: 404 });
    }

    // Vérifier si le produit existe (si productId fourni)
    if (productId) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        return NextResponse.json({
          error: 'Produit non trouvé'
        }, { status: 404 });
      }
    }

    // Vérifier si la commande existe et appartient à l'utilisateur (si orderId fourni)
    if (orderId) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, user_id')
        .eq('id', orderId)
        .single();

      if (orderError || !order || order.user_id !== userId) {
        return NextResponse.json({
          error: 'Commande non trouvée ou non autorisée'
        }, { status: 404 });
      }
    }

    // Vérifier si l'utilisateur n'a pas déjà laissé un avis pour ce produit/commande
    let existingQuery = supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId);

    if (productId) {
      existingQuery = existingQuery.eq('product_id', productId);
    }
    if (orderId) {
      existingQuery = existingQuery.eq('order_id', orderId);
    }

    const { data: existingReview, error: existingError } = await existingQuery.single();

    if (existingReview && !existingError) {
      return NextResponse.json({
        error: 'Vous avez déjà laissé un avis pour cet élément'
      }, { status: 409 });
    }

    // Créer l'avis
    const { data: review, error: createError } = await supabase
      .from('reviews')
      .insert({
        user_id: userId,
        product_id: productId || null,
        order_id: orderId || null,
        rating,
        comment,
        photos,
        is_verified: orderId ? true : false, // Vérifié si lié à une commande
        is_visible: true, // Peut être mis à false pour modération
      })
      .select(`
        *,
        user:profiles!reviews_user_id_fkey(
          id,
          name
        ),
        product:products!reviews_product_id_fkey(
          id,
          name
        )
      `)
      .single();

    if (createError) {
      throw new Error(`Erreur lors de la création de l'avis: ${createError.message}`);
    }

    return NextResponse.json({
      message: 'Avis créé avec succès',
      review: {
        ...review,
        userName: (review as any).user?.name || 'Utilisateur anonyme',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      error: 'Erreur lors de la création de l\'avis'
    }, { status: 500 });
  }
}

// PUT /api/reviews/[id] - Mettre à jour un avis (pour modération)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({
        error: 'ID de l\'avis requis'
      }, { status: 400 });
    }

    const { isVisible, isVerified } = body;
    const supabase = supabaseIntegrationService.getSupabaseClient();

    const updateData: any = {};
    if (typeof isVisible === 'boolean') {
      updateData.is_visible = isVisible;
    }
    if (typeof isVerified === 'boolean') {
      updateData.is_verified = isVerified;
    }
    updateData.updated_at = new Date().toISOString();

    const { data: review, error: updateError } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select(`
        *,
        user:profiles!reviews_user_id_fkey(
          id,
          name
        )
      `)
      .single();

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour de l'avis: ${updateError.message}`);
    }

    return NextResponse.json({
      message: 'Avis mis à jour avec succès',
      review,
    });
  } catch (error) {
    console.error('Error updating review:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      error: 'Erreur lors de la mise à jour de l\'avis'
    }, { status: 500 });
  }
}

// DELETE /api/reviews/[id] - Supprimer un avis
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({
        error: 'ID de l\'avis requis'
      }, { status: 400 });
    }

    const supabase = supabaseIntegrationService.getSupabaseClient();

    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (deleteError) {
      throw new Error(`Erreur lors de la suppression de l'avis: ${deleteError.message}`);
    }

    return NextResponse.json({
      message: 'Avis supprimé avec succès',
    });
  } catch (error) {
    console.error('Error deleting review:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      error: 'Erreur lors de la suppression de l\'avis'
    }, { status: 500 });
  }
}