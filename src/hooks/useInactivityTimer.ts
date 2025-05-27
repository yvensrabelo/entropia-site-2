import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimerOptions {
  timeoutMinutes?: number; // Tempo total em minutos (padrão: 30)
  warningMinutes?: number; // Minutos antes do timeout para mostrar aviso (padrão: 5)
  onWarning?: () => void; // Callback quando aviso é acionado
  onTimeout?: () => void; // Callback quando timeout é acionado
  enabled?: boolean; // Se o timer está ativo (padrão: true)
}

interface UseInactivityTimerReturn {
  isWarningShown: boolean;
  timeRemaining: number; // em segundos
  resetTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  isPaused: boolean;
}

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

export function useInactivityTimer({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onWarning,
  onTimeout,
  enabled = true
}: UseInactivityTimerOptions = {}): UseInactivityTimerReturn {
  const [isWarningShown, setIsWarningShown] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const updateTimeRemaining = useCallback(() => {
    if (isPaused) return;
    
    const now = Date.now();
    const elapsed = now - lastActivityRef.current;
    const remaining = Math.max(0, timeoutMs - elapsed);
    
    setTimeRemaining(Math.ceil(remaining / 1000));
    
    if (remaining <= 0 && onTimeout) {
      clearAllTimers();
      onTimeout();
    }
  }, [isPaused, timeoutMs, onTimeout, clearAllTimers]);

  const startTimer = useCallback(() => {
    if (!enabled || isPaused) return;
    
    clearAllTimers();
    lastActivityRef.current = Date.now();
    setIsWarningShown(false);
    setTimeRemaining(timeoutMinutes * 60);

    // Timer para mostrar aviso
    warningTimeoutRef.current = setTimeout(() => {
      if (!isPaused) {
        console.log('🚨 Aviso de inatividade acionado');
        setIsWarningShown(true);
        if (onWarning) {
          onWarning();
        }
      }
    }, warningMs);

    // Timer para logout automático
    timeoutRef.current = setTimeout(() => {
      if (!isPaused) {
        console.log('⏰ Timeout de inatividade acionado');
        clearAllTimers();
        if (onTimeout) {
          onTimeout();
        }
      }
    }, timeoutMs);

    // Interval para atualizar contador
    intervalRef.current = setInterval(updateTimeRemaining, 1000);
  }, [enabled, isPaused, timeoutMinutes, warningMs, timeoutMs, onWarning, onTimeout, clearAllTimers, updateTimeRemaining]);

  const resetTimer = useCallback(() => {
    console.log('🔄 Timer de inatividade resetado');
    setIsWarningShown(false);
    startTimer();
  }, [startTimer]);

  const pauseTimer = useCallback(() => {
    console.log('⏸️ Timer de inatividade pausado');
    setIsPaused(true);
    clearAllTimers();
  }, [clearAllTimers]);

  const resumeTimer = useCallback(() => {
    console.log('▶️ Timer de inatividade retomado');
    setIsPaused(false);
    startTimer();
  }, [startTimer]);

  const handleActivity = useCallback(() => {
    if (!enabled || isPaused) return;
    
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Só reseta se passou mais de 1 segundo desde a última atividade
    // Evita resets excessivos
    if (timeSinceLastActivity > 1000) {
      resetTimer();
    }
  }, [enabled, isPaused, resetTimer]);

  // Configurar listeners de atividade
  useEffect(() => {
    if (!enabled) return;

    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [handleActivity, enabled]);

  // Inicializar timer
  useEffect(() => {
    if (enabled && !isPaused) {
      startTimer();
    } else {
      clearAllTimers();
    }

    return () => {
      clearAllTimers();
    };
  }, [enabled, isPaused, startTimer, clearAllTimers]);

  return {
    isWarningShown,
    timeRemaining,
    resetTimer,
    pauseTimer,
    resumeTimer,
    isPaused
  };
}