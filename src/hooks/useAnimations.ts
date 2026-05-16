import { useState, useEffect } from 'react';

export const useTypewriter = (text: string, speed: number = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    if (!text) {
      setDisplayText('');
      return;
    }
    
    setIsTyping(true);
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed]);
  
  return { displayText, isTyping };
};

export const useScrollAnimation = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const handleScroll = (containerRef: React.RefObject<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const progress = scrollHeight > clientHeight 
      ? (scrollTop / (scrollHeight - clientHeight)) * 100 
      : 0;
    
    setScrollProgress(progress);
  };
  
  return { scrollProgress, handleScroll };
};

export const useKenBurns = (duration: number = 8000) => {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const randomDirection = Math.random() > 0.5 ? 1 : -1;
    const randomScale = 1 + Math.random() * 0.15;
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeInOutQuad = (t: number) => 
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      
      const currentScale = 1 + (randomScale - 1) * easeInOutQuad(progress);
      const currentTranslateX = randomDirection * 5 * easeInOutQuad(progress);
      const currentTranslateY = randomDirection * 3 * easeInOutQuad(progress);
      
      setScale(currentScale);
      setTranslate({ x: currentTranslateX, y: currentTranslateY });
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [duration]);
  
  return { scale, translate };
};

export const useFadeInSequence = (itemCount: number, delay: number = 200) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    
    for (let i = 0; i < itemCount; i++) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => [...prev, i]);
      }, i * delay);
      timers.push(timer);
    }
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [itemCount, delay]);
  
  return visibleItems;
};
