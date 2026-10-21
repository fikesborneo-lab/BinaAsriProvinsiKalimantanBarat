import React from 'react';
import { motion, Variants } from 'framer-motion';

export interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'zoom';
  delay?: number;
  duration?: number;
  className?: string;
  distance?: number;
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
  distance = 32,
  once = true,
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: distance, scale: 1 };
      case 'down':
        return { opacity: 0, y: -distance, scale: 1 };
      case 'left':
        return { opacity: 0, x: distance, scale: 1 };
      case 'right':
        return { opacity: 0, x: -distance, scale: 1 };
      case 'zoom':
        return { opacity: 0, scale: 0.92, y: 0, x: 0 };
      case 'fade':
      default:
        return { opacity: 0, y: 0, x: 0, scale: 1 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
      }}
      viewport={{ once, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // easeOutQuart
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* =========================================================================
   Stagger Container & Item for grids (Cards, Team, News, Gallery)
   ========================================================================= */

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
  once?: boolean;
}

const containerVariants = (staggerDelay: number, delayChildren: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  delayChildren = 0.05,
  className = '',
  once = true,
}) => {
  return (
    <motion.div
      variants={containerVariants(staggerDelay, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'zoom' | 'fade';
  distance?: number;
}

const itemVariants = (direction: 'up' | 'zoom' | 'fade', distance: number): Variants => ({
  hidden: {
    opacity: 0,
    y: direction === 'up' ? distance : 0,
    scale: direction === 'zoom' ? 0.94 : 1,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
});

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className = '',
  direction = 'up',
  distance = 28,
}) => {
  return (
    <motion.div variants={itemVariants(direction, distance)} className={className}>
      {children}
    </motion.div>
  );
};
