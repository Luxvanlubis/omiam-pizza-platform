"use client";

import { Suspense } from 'react';
import { AllergenDisplay, type AllergenId } from './AllergenDisplay';

interface OptimizedSectionProps { children: React.ReactNode; fallback?: React.ReactNode; className?: string;
}

export function OptimizedSection({ children, fallback = <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />, className = "" 
}: OptimizedSectionProps) { return ( <Suspense fallback={fallback}> <div className={className}> {children} </div> </Suspense> );
}

// Composant pour le lazy loading des images avec placeholder
interface LazyImageProps { src: string; alt: string; width: number; height: number; className?: string; priority?: boolean;
}

export function LazyImage({ src, alt, width, height, className = "", priority = false }: LazyImageProps) { return ( <div className={`relative overflow-hidden ${className}`}> <div className="absolute inset-0 bg-gray-200 animate-pulse" /> <img src={src} alt={alt} width={width} height={height} className={`relative z-10 w-full h-full object-cover ${priority ? '' : 'lazy'}`} loading={priority ? 'eager' : 'lazy'} onLoad={(e) => { const target = e.target as HTMLImageElement; target.previousElementSibling?.classList.add('hidden'); }} /> </div> );
}

// Composant pour le chargement optimisé des cartes de menu
interface MenuCardProps { item: { name: string; description: string; price: string; image: string; ingredients: string[]; allergens?: AllergenId[]; traces?: AllergenId[]; }; onAddToCart?: () => void;
}

export function OptimizedMenuCard({ item, onAddToCart }: MenuCardProps) { return ( <div className="group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"> <div className="relative h-48 overflow-hidden"> <LazyImage src={item.image} alt={item.name} width={400} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> </div> <div className="p-4 bg-white"> <div className="flex justify-between items-start mb-2"> <h3 className="text-lg font-semibold text-red-800">{item.name}</h3> <span className="text-xl font-bold text-red-600">{item.price}</span> </div> <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p> <div className="mb-3 space-y-2"> <div className="flex flex-wrap gap-1"> {item.ingredients.slice(0, 3).map((ingredient, idx) => ( <span ={idx} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full"> {ingredient} </span> ))} {item.ingredients.length > 3 && ( <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"> +{item.ingredients.length - 3} </span> )} </div> {/* Affichage des allergènes */} {(item.allergens || item.traces) && ( <AllergenDisplay allergens={item.allergens || []} traces={item.traces || []} variant="compact" showWarning={false} className="mt-2" /> )} </div> <button onClick={onAddToCart} className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium" > Ajouter au panier </button> </div> </div> );
}