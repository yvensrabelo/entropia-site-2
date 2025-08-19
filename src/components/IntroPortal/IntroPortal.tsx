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
  const [isMobile, setIsMobile] = useState(false);
  const introRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dotTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(userAgent) || 
                             (window.innerWidth <= 768);
      setIsMobile(isMobileDevice);
      
      // Adicionar classe ao body para CSS específico
      if (isMobileDevice) {
        document.body.classList.add('is-mobile');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const closeIntro = () => {
    setIsExiting(true);
    
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    if (dotTimerRef.current) {
      clearInterval(dotTimerRef.current);
    }
    
    // Tempo de saída ajustado para mobile
    const exitDuration = isMobile ? 1500 : 1000;
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, exitDuration);
  };

  const handleSkip = () => {
    onSkip?.();
    closeIntro();
  };

  useEffect(() => {
    if (isMobile !== null) {
      // Intervalo dos dots ajustado para mobile
      const dotInterval = isMobile ? 1200 : 800;
      dotTimerRef.current = setInterval(() => {
        setActiveDot(prev => (prev + 1) % 6);
      }, dotInterval);

      // Timer de fechamento ajustado para mobile
      const closeDuration = isMobile ? 6000 : 4000;
      closeTimerRef.current = setTimeout(closeIntro, closeDuration);
    }

    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (dotTimerRef.current) clearInterval(dotTimerRef.current);
    };
  }, [isMobile]);

  if (!isVisible) return null;

  return (
    <section 
      ref={introRef}
      className={`${styles.intro} ${isExiting ? styles.exit : ''} ${isMobile ? styles.mobile : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Introdução"
      data-mobile={isMobile}
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