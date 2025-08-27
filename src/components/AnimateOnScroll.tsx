'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimateOnScrollProps {
  children: React.ReactNode
  className?: string
  animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale-up' | 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeInDown'
  delay?: number
  threshold?: number
}

export default function AnimateOnScroll({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1
}: AnimateOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasMounted, setHasMounted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted || !elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      { threshold }
    )

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [delay, threshold, hasMounted])

  const getAnimationClass = () => {
    const baseClass = 'transition-all duration-700 ease-out'
    
    if (!isVisible) {
      switch (animation) {
        case 'fade-up':
        case 'fadeInUp':
          return `${baseClass} opacity-0 translate-y-8`
        case 'fade-in':
          return `${baseClass} opacity-0`
        case 'slide-left':
        case 'fadeInLeft':
          return `${baseClass} opacity-0 -translate-x-8`
        case 'slide-right':
        case 'fadeInRight':
          return `${baseClass} opacity-0 translate-x-8`
        case 'scale-up':
          return `${baseClass} opacity-0 scale-95`
        case 'fadeInDown':
          return `${baseClass} opacity-0 -translate-y-8`
        default:
          return `${baseClass} opacity-0 translate-y-8`
      }
    }
    
    return `${baseClass} opacity-100 translate-y-0 translate-x-0 scale-100`
  }

  if (!hasMounted) {
    return null;
  }

  return (
    <div
      ref={elementRef}
      className={`${getAnimationClass()} ${className}`}
    >
      {children}
    </div>
  )
}