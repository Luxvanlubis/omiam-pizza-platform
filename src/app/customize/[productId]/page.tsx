'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import PizzaCustomizer from '@/components/pizza/PizzaCustomizer';

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  category: string;
}

interface PizzaCustomization {
  sizeId: string;
  doughTypeId: string;
  cookingLevelId: string;
  extraIngredients: { ingredientId: string; quantity: number }[];
}

const CustomizePage = () => {
  const params = useParams();
  const router = useRouter();
  const productId = params?.productId as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [customization, setCustomization] = useState<PizzaCustomization | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const productData = await response.json();
          setProduct(productData);
        } else {
          toast.error('Produit non trouvé');
          router.push('/menu');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

  const handleCustomizationChange = (newCustomization: PizzaCustomization, newTotalPrice: number) => {
    setCustomization(newCustomization);
    setTotalPrice(newTotalPrice);
  };

  const handleAddToCart = async () => {
    if (!product || !customization) {
      toast.error('Veuillez finaliser votre personnalisation');
      return;
    }

    try {
      // Simuler l'ajout au panier (à remplacer par l'API réelle)
      const cartItem = {
        productId: product.id,
        productName: product.name,
        basePrice: product.basePrice,
        customizations: customization,
        totalPrice: totalPrice,
        quantity: 1
      };

      // Stocker temporairement dans localStorage (à remplacer par un state manager)
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const updatedCart = [...existingCart, { ...cartItem, id: Date.now().toString() }];
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      toast.success('Pizza ajoutée au panier !', {
        description: `${product.name} personnalisée - ${totalPrice.toFixed(2)}€`
      });

      // Rediriger vers le panier ou le menu
      router.push('/cart');
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Produit non trouvé</p>
          <Button onClick={() => router.push('/menu')}>
            Retour au menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Personnaliser votre pizza</h1>
            <p className="text-gray-600">Créez la pizza parfaite selon vos goûts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations produit */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <div className="aspect-square relative mb-4 rounded-lg overflow-hidden">
                  <img
                    src={product.image || '/api/placeholder/300/300'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Prix de base:</span>
                    <Badge variant="outline">{product.basePrice.toFixed(2)}€</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Catégorie:</span>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  {totalPrice > 0 && (
                    <>
                      <hr className="my-3" />
                      <div className="flex items-center justify-between text-lg font-semibold">
                        <span>Prix total:</span>
                        <span className="text-primary">{totalPrice.toFixed(2)}€</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personnalisation */}
          <div className="lg:col-span-2">
            <PizzaCustomizer
              productId={product.id}
              basePrice={product.basePrice}
              onCustomizationChange={handleCustomizationChange}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizePage;