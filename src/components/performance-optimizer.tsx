
// Security: Input validation and sanitization
const validateInput = (input: string): string => { if (!input || typeof input !== 'string') { throw new Error('Invalid input'); } // Sanitize input to prevent XSS and injection return input.replace(/[<>"'&]/g, (match) => { const entities: { [: string]: string } = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' }; return entities[match] || match; });
};
"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface PerformanceOptimizerProps { children: React.ReactNode; fallback?: React.ReactNode; threshold?: number; triggerOnce?: boolean;
}

// Composant de chargement paresseux pour les images et composants lourds
export function LazyLoad({ children, fallback = <div className="animate-pulse bg-gray-200 rounded-lg h-64"></div>, threshold = 0.1, triggerOnce = true
}: PerformanceOptimizerProps) { const { ref, inView, entry } = useInView({ threshold, triggerOnce, delay: 100 }); return ( <div ref={ref} className="w-full"> {inView ? children : fallback} </div> );
}

// Hook pour le chargement optimisé des images
export function useOptimizedImage(src: string, placeholder?: string) { const [imageSrc, setImageSrc] = useState(placeholder''); const [loading, setLoading] = useState(true); useEffect(() => { const img = new Image(); img.onload = () => { setImageSrc(src); setLoading(false); }; img.onerror = () => { setImageSrc(placeholder''); setLoading(false); }; img.src = src; }, [src, placeholder]); return { imageSrc, loading };
}

// Composant d'image optimisée
interface OptimizedImageProps { src: string; alt: string; width?: number; height?: number; className?: string; placeholder?: string; loading?: "lazy" | "eager";
}

export function OptimizedImage({ src, alt, width, height, className = "", placeholder = "", loading = "lazy"
}: OptimizedImageProps) { const { imageSrc, loading: isLoading } = useOptimizedImage(src, placeholder); return ( <div className={`relative overflow-hidden ${className}`}> {isLoading && ( <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"></div> )} <img src={imageSrc} alt={alt} width={width} height={height} loading={loading} className={`w-full h-full object-cover transition-opacity duration-300 ${ isLoading ? 'opacity-0' : 'opacity-100' }`} /> </div> );
}

// Hook pour le monitoring des performances
export function usePerformanceMonitoring() { const [metrics, setMetrics] = useState({ loadTime: 0, firstContentfulPaint: 0, largestContentfulPaint: 0, cumulativeLayoutShift: 0, firstInputDelay: 0 }); useEffect(() => { // Observer les métriques de performance if ('PerformanceObserver' in window) { // FCP (First Contentful Paint) const fcpObserver = new PerformanceObserver((list) => { const entries = list.getEntries(); const fcp = entries[entries.length - 1]; setMetrics(prev => ({ ...prev, firstContentfulPaint: fcp.startTime })); }); fcpObserver.observe({ entryTypes: ['paint'] }); // LCP (Largest Contentful Paint) const lcpObserver = new PerformanceObserver((list) => { const entries = list.getEntries(); const lcp = entries[entries.length - 1]; setMetrics(prev => ({ ...prev, largestContentfulPaint: lcp.startTime })); }); lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] }); // FID (First Input Delay) const fidObserver = new PerformanceObserver((list) => { const entries = list.getEntries(); const fid = entries[0] as any; setMetrics(prev => ({ ...prev, firstInputDelay: fid.processingStart - fid.startTime })); }); fidObserver.observe({ entryTypes: ['first-input'] }); } // Temps de chargement de la page const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart; setMetrics(prev => ({ ...prev, loadTime })); }, []); return metrics;
}

// Composant de préchargement des ressources critiques
export function CriticalResourcePreloader() { useEffect(() => { // Précharger les polices critiques const fontLink = document.createElement('link'); fontLink.rel = 'preload'; fontLink.href = '/fonts/inter-var.woff2'; fontLink.as = 'font'; fontLink.type = 'font/woff2'; fontLink.crossOrigin = 'anonymous'; document.head.appendChild(fontLink); // Précharger les images critiques const criticalImages = [ '/images/hero-bg.jpg', '/images/logo.png' ]; criticalImages.forEach(src => { const link = document.createElement('link'); link.rel = 'preload'; link.href = src; link.as = 'image'; document.head.appendChild(link); }); return () => { document.head.removeChild(fontLink); criticalImages.forEach(src => { const link = document.querySelector(`link[href="${src}"]`); if (link) document.head.removeChild(link); }); }; }, []); return null;
}

// Hook pour la détection de la connexion réseau
export function useNetworkInfo() { const [networkInfo, setNetworkInfo] = useState({ effectiveType: '4g', downlink: 10, rtt: 100, saveData: false }); useEffect(() => { const updateNetworkInfo = () => { if ('connection' in navigator) { const connection = (navigator as any).connection; setNetworkInfo({ effectiveType: connection.effectiveType, downlink: connection.downlink, rtt: connection.rtt, saveData: connection.saveData }); } }; updateNetworkInfo(); if ('connection' in navigator) { const connection = (navigator as any).connection; connection.addEventListener('change', updateNetworkInfo); return () => connection.removeEventListener('change', updateNetworkInfo); } }, []); return networkInfo;
}

// Composant adaptatif basé sur la connexion réseau
interface AdaptiveContentProps { children: React.ReactNode; lowBandwidthFallback?: React.ReactNode;
}

export function AdaptiveContent({ children, lowBandwidthFallback }: AdaptiveContentProps) { const networkInfo = useNetworkInfo(); const [isLowBandwidth, setIsLowBandwidth] = useState(false); useEffect(() => { setIsLowBandwidth( networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g' || networkInfo.saveData ); }, [networkInfo]); if (isLowBandwidth && lowBandwidthFallback) { return lowBandwidthFallback as React.ReactElement; } return children as React.ReactElement;
}

// Hook pour le chargement conditionnel des scripts
export function useScriptLoader(src: string, onLoad?: () => void) { const [loaded, setLoaded] = useState(false); const [error, setError] = useState(false); useEffect(() => { if (document.querySelector(`script[src="${src}"]`)) { setLoaded(true); return; } const script = document.createElement('script'); script.src = src; script.async = true; script.onload = () => { setLoaded(true); onLoad?.(); }; script.onerror = () => setError(true); document.head.appendChild(script); return () => { document.head.removeChild(script); }; }, [src, onLoad]); return { loaded, error };
}

// Export des utilitaires de performance
export const PerformanceUtils = { // Débouncer pour les événements fréquents debounce: (func: (...args: any[]) => void, wait: number) => { let timeout: NodeJS.Timeout; return (...args: any[]) => { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); }; }, // Throttler pour les événements fréquents throttle: (func: (...args: any[]) => void, limit: number) => { let inThrottle: boolean; return (...args: any[]) => { if (!inThrottle) { func.apply(this, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } }; }, // Optimisation du scroll optimizeScroll: (callback: (...args: any[]) => void) => { let ticking = false; return () => { if (!ticking) { requestAnimationFrame(() => { callback(); ticking = false; }); ticking = true; } }; }
};