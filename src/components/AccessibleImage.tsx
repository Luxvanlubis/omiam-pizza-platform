'use client';

import Image from 'next/image';
import { useState } from 'react';

interface AccessibleImageProps { src: string; alt: string; width?: number; height?: number; className?: string; priority?: boolean; fill?: boolean; sizes?: string; loading?: 'lazy' | 'eager'; onError?: () => void;
}

export default function AccessibleImage({ src, alt, width, height, className = '', priority = false, fill = false, sizes, loading = 'lazy', onError
}: AccessibleImageProps) { const [imageError, setImageError] = useState(false); const [imageLoaded, setImageLoaded] = useState(false); const handleError = () => { setImageError(true); onError?.(); }; const handleLoad = () => { setImageLoaded(true); }; if (imageError) { return ( <div className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`} style={{ width, height }} role="img" aria-label={`Image non disponible: ${alt}`} > <span className="text-gray-500 dark:text-gray-400 text-sm text-center p-4"> Image non disponible </span> </div> ); } return ( <div className={`relative ${!imageLoaded ? 'animate-pulse bg-gray-200 dark:bg-gray-700' : ''}`}> <Image src={src} alt={alt} width={fill ? undefined : width} height={fill ? undefined : height} fill={fill} className={className} priority={priority} sizes={sizes} loading={loading} onError={handleError} onLoad={handleLoad} // Amélioration de l'accessibilité role="img" // Assure que l'alt text est toujours présent et descriptif {...(alt.trim() === '' && { 'aria-hidden': 'true' })} /> </div> );
}

// Composant pour les images décoratives
export function DecorativeImage(props: Omit<AccessibleImageProps, 'alt'>) { return ( <AccessibleImage {...props} alt="" aria-hidden="true" /> );
}

// Composant pour les images avec légende
interface CaptionedImageProps extends AccessibleImageProps { caption?: string; captionClassName?: string;
}

export function CaptionedImage({ caption, captionClassName = 'text-sm text-gray-600 dark:text-gray-400 mt-2 text-center', ...imageProps
}: CaptionedImageProps) { const imageId = `image-${Math.random().toString(36).substr(2, 9)}`; const captionId = `caption-${imageId}`; return ( <figure> <AccessibleImage {...imageProps} aria-describedby={caption ? captionId : undefined} /> {caption && ( <figcaption id={captionId} className={captionClassName}> {caption} </figcaption> )} </figure> );
}