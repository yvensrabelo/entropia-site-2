"use client";

import { useEffect, useRef, useState } from 'react';
import styles from './IntroPortal.module.css';

interface IntroPortalProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function IntroPortal({ onComplete, onSkip }: IntroPortalProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const introRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dotTimerRef = useRef<NodeJS.Timeout | null>(null);

  const closeIntro = () => {
    setIsExiting(true);
    
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    if (dotTimerRef.current) {
      clearInterval(dotTimerRef.current);
    }
    
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 1000);
  };

  const handleSkip = () => {
    onSkip?.();
    closeIntro();
  };

  useEffect(() => {
    // Força um frame antes de iniciar para sincronizar
    requestAnimationFrame(() => {
      // Animar dots com RAF para consistência
      let dotFrame = 0;
      const animateDots = () => {
        dotFrame++;
        if (dotFrame % 48 === 0) { // ~800ms em 60fps
          setActiveDot(prev => (prev + 1) % 6);
        }
        if (!closeTimerRef.current) return;
        requestAnimationFrame(animateDots);
      };
      animateDots();

      // Timer para fechar - usa performance.now() para precisão
      const startTime = performance.now();
      const checkTime = () => {
        if (performance.now() - startTime >= 4000) {
          closeIntro();
        } else if (!closeTimerRef.current) {
          return;
        } else {
          requestAnimationFrame(checkTime);
        }
      };
      closeTimerRef.current = setTimeout(() => {
        checkTime();
      }, 0);
    });

    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (dotTimerRef.current) clearInterval(dotTimerRef.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <section 
      ref={introRef}
      className={`${styles.intro} ${isExiting ? styles.exit : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Introdução"
    >
      <div className={styles.noise}></div>
      <div className={styles.centerLight}></div>
      
      <div className={styles.portalRings}>
        <div className={styles.ring}></div>
        <div className={styles.ring}></div>
        <div className={styles.ring}></div>
      </div>
      
      <button 
        className={styles.skip} 
        onClick={handleSkip}
        type="button"
      >
        [SKIP]
      </button>
      
      <div className={styles.container}>
        <div className={styles.brackets}>
          <span className={`${styles.bracket} ${styles.left}`}>{'{'}</span>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="2" width="16" height="20" rx="2"/>
            <rect x="6" y="4" width="12" height="4" rx="1" fill="black" opacity="0.5"/>
            <circle cx="8" cy="12" r="1" fill="black" opacity="0.5"/>
            <circle cx="12" cy="12" r="1" fill="black" opacity="0.5"/>
            <circle cx="16" cy="12" r="1" fill="black" opacity="0.5"/>
            <circle cx="8" cy="16" r="1" fill="black" opacity="0.5"/>
            <circle cx="12" cy="16" r="1" fill="black" opacity="0.5"/>
            <circle cx="16" cy="16" r="1" fill="black" opacity="0.5"/>
          </svg>
          <span className={`${styles.bracket} ${styles.right}`}>{'}'}</span>
        </div>
        
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>
            <span className={styles.line1}>Calculadora</span>
            <span className={styles.line2}>
              <span className={styles.highlight}>ENTROPIA</span>
            </span>
          </h1>
        </div>
        
        <div className={styles.metadata}>
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>Author:</span>
            <span className={styles.metaValue}>Yvens Rabelo</span>
          </span>
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>Version:</span>
            <span className={styles.metaValue}>2.0.0</span>
          </span>
        </div>
      </div>
      
      <div className={styles.progressDots}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <span 
            key={index}
            className={`${styles.dot} ${activeDot === index ? styles.active : ''}`}
          />
        ))}
      </div>
    </section>
  );
}