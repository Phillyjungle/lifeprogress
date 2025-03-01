import React, { createContext, useContext, useState, useEffect } from 'react';

const AnimationContext = createContext();

export function AnimationProvider({ children }) {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(prefersReducedMotion.matches);
    
    const handleChange = (e) => setReducedMotion(e.matches);
    prefersReducedMotion.addEventListener('change', handleChange);
    
    // Check for mobile devices
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      prefersReducedMotion.removeEventListener('change', handleChange);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Get animation properties based on current settings
  const getAnimationProps = (type) => {
    if (!animationsEnabled || reducedMotion) {
      return { duration: 0 };
    }
    
    const baseProps = {
      score: { duration: isMobile ? 600 : 800, ease: 'power4.out' },
      chart: { duration: isMobile ? 900 : 1200, ease: 'elastic' },
      tooltip: { duration: isMobile ? 150 : 200, delay: isMobile ? 60 : 80 }
    };
    
    return baseProps[type] || baseProps.score;
  };
  
  return (
    <AnimationContext.Provider value={{
      animationsEnabled,
      setAnimationsEnabled,
      reducedMotion,
      isMobile,
      getAnimationProps
    }}>
      {children}
    </AnimationContext.Provider>
  );
}

export const useAnimation = () => useContext(AnimationContext); 