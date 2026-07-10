import { useState, useRef, useEffect, memo } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  width?: number;
  height?: number;
}

/**
 * LazyImage component with native lazy loading and blur-up effect
 * Optimized for performance with intersection observer fallback
 * Includes explicit dimensions to prevent CLS
 */
export const LazyImage = memo(({ 
  src, 
  alt, 
  className = "", 
  placeholderClassName = "",
  width,
  height
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "100px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Calculate aspect ratio for placeholder to prevent CLS
  const aspectRatio = width && height ? `${width} / ${height}` : undefined;

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden ${placeholderClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Placeholder skeleton with proper dimensions */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {/* Only render image when in view */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"} ${className}`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
});

LazyImage.displayName = "LazyImage";

export default LazyImage;
