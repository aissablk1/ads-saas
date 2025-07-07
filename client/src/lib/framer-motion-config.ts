import React from 'react'

// Configuration pour éviter les warnings de positionnement
export const framerMotionConfig = {
  // Configuration pour les animations de scroll
  scroll: {
    // S'assurer que les conteneurs ont une position relative
    containerProps: {
      style: { position: 'relative' }
    }
  },
  
  // Configuration pour les transitions
  transition: {
    type: "spring",
    stiffness: 100,
    damping: 20
  }
}

// Hook personnalisé pour les animations de scroll
export const useSafeScroll = (target?: React.RefObject<HTMLElement>) => {
  // S'assurer que le conteneur a une position relative
  React.useEffect(() => {
    if (target?.current) {
      const computedStyle = window.getComputedStyle(target.current)
      if (computedStyle.position === 'static') {
        target.current.style.position = 'relative'
      }
    }
  }, [target])
  
  return { scrollYProgress: 0, scrollY: 0 }
}
