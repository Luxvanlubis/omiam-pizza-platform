"use client";

import { useState } from "react";
import { Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  available: boolean;
  preparationTime: number;
}

interface POSMenuProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
  searchTerm: string;
}

export function POSMenu({ items, onAddToCart, searchTerm }: POSMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const categories = ["Tous", "Pizzas", "Boissons", "Desserts"];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  const groupedByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredItems.filter(item => 
      category === "Tous" ? true : item.category === category
    );
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="flex-1 p-4">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4">
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedByCategory[category]?.map(item => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <Badge variant="outline" className="text-sm">
                        €{item.price}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{item.preparationTime} min</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onAddToCart(item)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {groupedByCategory[category]?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun produit disponible dans cette catégorie
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}