/**
 * Framer Motion Animation Variants & Helpers for CAPP Engine
 * Optimized for 60fps GPU acceleration (transform & opacity only)
 */

export const isReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Fade & Slide In Variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

export const slideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    transition: { duration: 0.35, ease: 'easeIn' },
  },
};

// Stagger Container
export const staggerContainer = (staggerDelay = 0.08, delayChildren = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: delayChildren,
    },
  },
});

// Preloader Sequence Variants
export const preloaderLogoVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  pulse: {
    scale: [1, 1.03, 1],
    boxShadow: [
      '0 0 20px rgba(124, 58, 237, 0.3)',
      '0 0 45px rgba(168, 85, 247, 0.6)',
      '0 0 20px rgba(124, 58, 237, 0.3)',
    ],
    transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
  },
};

// Scroll Steps Card Variants
export const stepCardVariants = {
  active: {
    scale: 1.03,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  inactive: {
    scale: 0.97,
    opacity: 0.45,
    filter: 'blur(0.4px)',
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

// Parallel Lane Task Flow Animation Variants for Step 3
export const parallelLaneVariants = {
  initial: { x: -40, opacity: 0 },
  animate: (i) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: i * 0.12,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
};
