import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface KenBurnsImageProps {
  src: string;
  alt?: string;
  duration?: number;
  className?: string;
  onLoad?: () => void;
}

export const KenBurnsImage: React.FC<KenBurnsImageProps> = ({ 
  src, 
  alt = 'Image',
  duration = 10000,
  className = '',
  onLoad
}) => {
  const [direction, setDirection] = useState<'zoom-in' | 'zoom-out'>('zoom-in');
  const [transformOrigin, setTransformOrigin] = useState({ x: 'center', y: 'center' });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const randomDirection = Math.random() > 0.5 ? 'zoom-in' : 'zoom-out';
    setDirection(randomDirection);
    
    const origins = [
      { x: 'left', y: 'top' },
      { x: 'right', y: 'top' },
      { x: 'left', y: 'bottom' },
      { x: 'right', y: 'bottom' },
      { x: 'center', y: 'center' }
    ];
    const randomOrigin = origins[Math.floor(Math.random() * origins.length)];
    setTransformOrigin(randomOrigin);
  }, [src]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const scaleValue = direction === 'zoom-in' ? 1.2 : 0.9;
  const initialScale = direction === 'zoom-in' ? 1 : 1.2;

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    >
      {/* Film border effect */}
      <div className="absolute inset-0 border-4 border-black/80 z-20 pointer-events-none" />
      <div className="absolute inset-0 border-2 border-gray-800/50 z-20 pointer-events-none m-2" />
      
      {/* Corner markers */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/60 z-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500/60 z-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-500/60 z-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/60 z-30 pointer-events-none" />
      
      {/* Image with Ken Burns effect */}
      <motion.img
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        className="w-full h-full object-cover"
        initial={{ 
          scale: initialScale,
          transformOrigin: `${transformOrigin.x} ${transformOrigin.y}`
        }}
        animate={{ 
          scale: scaleValue,
          transformOrigin: `${transformOrigin.x} ${transformOrigin.y}`
        }}
        transition={{
          duration: duration / 1000,
          ease: 'linear'
        }}
      />
      
      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-10 pointer-events-none" />
    </motion.div>
  );
};
