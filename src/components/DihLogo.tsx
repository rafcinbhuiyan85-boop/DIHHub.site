import React from 'react';
import { motion } from 'motion/react';

interface DihLogoProps {
  small?: boolean;
  className?: string;
  animateOnHover?: boolean;
}

export default function DihLogo({ small = false, className = '', animateOnHover = true }: DihLogoProps) {
  // SVG drawing configuration
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        duration: 2, 
        ease: "easeInOut",
        staggerChildren: 0.15
      } 
    }
  };

  // Pulse animation for gold elements
  const pulseVariants = {
    animate: {
      opacity: [0.85, 1, 0.85],
      filter: [
        'drop-shadow(0 0 2px rgba(234,179,8,0.2))',
        'drop-shadow(0 0 10px rgba(234,179,8,0.6))',
        'drop-shadow(0 0 2px rgba(234,179,8,0.2))'
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const containerAnimations = animateOnHover ? {
    whileHover: { scale: 1.05, y: -1 },
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <motion.div 
      className={`relative inline-flex items-center select-none ${className}`}
      {...containerAnimations}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <svg
        viewBox="14 4 114 82"
        className={small ? "w-10 h-7" : "w-16 h-12 sm:w-20 sm:h-16"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic Gold Primary Gradient */}
          <linearGradient id="dih-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="25%" stopColor="#aa771c" />
            <stop offset="50%" stopColor="#fbf5b7" />
            <stop offset="75%" stopColor="#bf953f" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>

          {/* Golden Ambient Glow Filter */}
          <filter id="gold-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Animated Shimmer Linear Mask */}
          <linearGradient id="shimmer-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.85)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          <mask id="shimmer-mask">
            <use href="#dih-monogram-paths" fill="white" />
          </mask>
        </defs>

        {/* Ambient Glow Aura */}
        <g filter="url(#gold-glow-filter)" className="pointer-events-none opacity-50 dark:opacity-75">
          {/* Monogram drawing in glow */}
          <path
            d="M 28 8 H 42 M 28 8 V 52 H 42 M 42 8 C 65 8, 65 52, 42 52 M 42 52 L 20 52 C 10 52, 10 62, 35 62 L 58 62"
            stroke="#aa771c"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 68 8 L 68 52 V 42"
            stroke="#aa771c"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 88 8 L 88 52 M 115 8 L 115 52 M 88 30 L 115 30"
            stroke="#aa771c"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Main Monogram Group with Shimmer Effect */}
        <motion.g 
          variants={pulseVariants}
          animate="animate"
          id="dih-monogram-paths"
        >
          {/* 1. Letter 'D' with its bottom elegant swoop */}
          <motion.path
            d="M 28 8 H 42 M 28 8 V 52 H 42 M 42 8 C 65 8, 65 52, 42 52 M 42 52 L 20 52 C 10 52, 10 62, 35 62 L 58 62"
            stroke="url(#dih-gold)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
          />

          {/* 2. Letter 'I' (Center Stem) */}
          <motion.path
            d="M 68 8 L 68 52"
            stroke="url(#dih-gold)"
            strokeWidth="4.5"
            strokeLinecap="round"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          />

          {/* 3. Letter 'H' (Right interlocking character) */}
          <motion.path
            d="M 88 8 L 88 52 M 115 8 L 115 52 M 88 30 L 115 30"
            stroke="url(#dih-gold)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
          />

          {/* Underlines & Center Core Accent Dot below the monogram */}
          {/* Left segment underline */}
          <motion.line
            x1="18"
            y1="82"
            x2="56"
            y2="82"
            stroke="url(#dih-gold)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          />

          {/* Golden Core Dot representing high-end connection */}
          <motion.circle
            cx="71"
            cy="82"
            r="3"
            fill="url(#dih-gold)"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ delay: 1.4, duration: 0.5 }}
          />

          {/* Right segment underline */}
          <motion.line
            x1="86"
            y1="82"
            x2="124"
            y2="82"
            stroke="url(#dih-gold)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          />
        </motion.g>

        {/* Shimmer overlay path */}
        <motion.g mask="url(#shimmer-mask)" className="pointer-events-none mix-blend-overlay">
          <motion.rect
            x="-100"
            y="0"
            width="200"
            height="100"
            fill="url(#shimmer-grad)"
            animate={{
              x: [100, 300],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 2
            }}
          />
        </motion.g>

        {/* Dynamic Sparkle Particles (Magical floating dots) */}
        {!small && (
          <g className="pointer-events-none opacity-80">
            {/* Sparkle 1 */}
            <motion.circle
              cx="54"
              cy="25"
              r="1.2"
              fill="#fff"
              animate={{
                opacity: [0.1, 1, 0.1],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Sparkle 2 */}
            <motion.circle
              cx="95"
              cy="45"
              r="1.5"
              fill="#fff"
              animate={{
                opacity: [0.2, 0.9, 0.2],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4
              }}
            />
          </g>
        )}
      </svg>
    </motion.div>
  );
}
