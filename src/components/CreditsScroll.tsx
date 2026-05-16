import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface CreditsScrollProps {
  content: string;
  className?: string;
  onComplete?: () => void;
}

export const CreditsScroll: React.FC<CreditsScrollProps> = ({ 
  content,
  className = '',
  onComplete
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const paragraphs = content.split('\n\n').filter(p => p.trim());
  const totalHeight = useRef(0);

  useEffect(() => {
    if (!containerRef.current || !hasStarted) return;
    
    setIsScrolling(true);
    totalHeight.current = containerRef.current.scrollHeight;
    
    let scrollPos = 0;
    const viewportHeight = window.innerHeight;
    const scrollSpeed = 30;
    
    const scroll = () => {
      if (!containerRef.current) return;
      
      scrollPos += scrollSpeed / 60;
      containerRef.current.scrollTop = scrollPos;
      
      const maxScroll = totalHeight.current - viewportHeight;
      
      if (scrollPos >= maxScroll) {
        setIsScrolling(false);
        if (onComplete) onComplete();
        return;
      }
      
      requestAnimationFrame(scroll);
    };
    
    const startDelay = setTimeout(() => {
      requestAnimationFrame(scroll);
    }, 500);
    
    return () => clearTimeout(startDelay);
  }, [hasStarted, onComplete]);

  const startScrolling = () => {
    if (!hasStarted) {
      setHasStarted(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Scrollable container */}
      <div 
        ref={containerRef}
        className="h-screen overflow-hidden"
        onClick={startScrolling}
      >
        <div className="min-h-full flex flex-col items-center justify-start pt-[60vh] pb-[40vh]">
          {paragraphs.map((paragraph, idx) => (
            <ParagraphFadeIn 
              key={idx} 
              text={paragraph}
              delay={idx * 0.3}
              onVisible={idx === 0 ? startScrolling : undefined}
            />
          ))}
          
          {/* End credits */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: paragraphs.length * 0.3 + 1, duration: 1 }}
            className="mt-12 text-center"
          >
            <div className="flex items-center gap-4 text-amber-500/60">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-500/60" />
              <div className="flex gap-3">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: paragraphs.length * 0.3 + 1.5 + i * 0.1 }}
                    className="w-2 h-2 rounded-full bg-amber-500/50"
                  />
                ))}
              </div>
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-500/60" />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      {!isScrolling && !hasStarted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-sm pointer-events-none"
        >
          点击开始播放
        </motion.div>
      )}
    </div>
  );
};

interface ParagraphFadeInProps {
  text: string;
  delay: number;
  onVisible?: () => void;
}

const ParagraphFadeIn: React.FC<ParagraphFadeInProps> = ({ text, delay, onVisible }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  useEffect(() => {
    if (isInView && onVisible) {
      onVisible();
    }
  }, [isInView, onVisible]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className="max-w-4xl px-8 text-center mb-8"
    >
      <p className="text-xl md:text-2xl text-gray-200 leading-relaxed whitespace-pre-wrap font-light">
        {text}
      </p>
    </motion.div>
  );
};
