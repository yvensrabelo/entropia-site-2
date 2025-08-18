'use client'

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  onComplete?: () => void;
  autoHideMs?: number; // default 4000
};

export default function LandingIntro({ onComplete, autoHideMs = 4000 }: Props) {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("intro_seen") !== "1";
  });
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const timerRef = useRef<number | null>(null);
  const particlesRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  // Auto-hide
  useEffect(() => {
    if (!show) return;
    if (prefersReduced) {
      timerRef.current = window.setTimeout(finish, 1800);
    } else {
      timerRef.current = window.setTimeout(finish, autoHideMs);
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Finish helper
  function finish() {
    try {
      localStorage.setItem("intro_seen", "1");
    } catch {}
    setShow(false);
    onComplete?.();
  }

  // Vibrate helper
  function vibrate(ms = 10) {
    try {
      if (navigator.vibrate) navigator.vibrate(ms);
    } catch {}
  }

  // Particles
  useEffect(() => {
    if (!show) return;
    const canvas = particlesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    ctx.scale(DPR, DPR);

    const COUNT = 20;
    const particles = Array.from({ length: COUNT }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1.5 + Math.random() * 2.5,
      a: 0.15 + Math.random() * 0.15, // opacity 0.15–0.30
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a})`;
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(draw);
    }

    const onResize = () => {
      if (!ctx) return;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.scale(DPR, DPR);
    };

    // Pause when tab hidden
    const onVis = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [show]);

  const stagger = prefersReduced ? 0.04 : 0.12;

  const variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 20 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.4 + i * stagger, duration: prefersReduced ? 0.2 : 0.5, ease: "easeOut" },
    }),
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_70%_20%,rgba(34,197,94,0.20),transparent)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-700" />

          {/* Particles */}
          <canvas
            ref={particlesRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          />

          {/* Parallax icons */}
          <FloatingIcon
            className="absolute top-10 left-8 text-white/30"
            depth={0.5}
            path={graduationCapPath}
            label="Ícone graduação"
          />
          <FloatingIcon
            className="absolute top-10 right-8 text-white/30"
            depth={0.3}
            reverse
            path={trophyPath}
            label="Ícone troféu"
          />

          {/* Center content */}
          <div className="relative z-10 flex h-full w-full items-center justify-center px-4">
            <motion.div
              className="flex flex-col items-center text-center select-none"
              initial="hidden"
              animate="show"
            >
              {/* Calculator + halo */}
              <div className="relative mb-6">
                <div className="absolute inset-0 -z-10 rounded-full blur-2xl bg-white/20 animate-[haloPulse_2.2s_ease-in-out_infinite]" />
                <motion.div
                  style={{ willChange: "transform, opacity" }}
                  initial={{
                    rotate: prefersReduced ? 0 : -180,
                    scale: prefersReduced ? 1 : 0,
                    opacity: 0,
                  }}
                  animate={{
                    rotate: 0,
                    scale: 1,
                    opacity: 1,
                    transition: prefersReduced
                      ? { duration: 0.25 }
                      : { type: "spring", stiffness: 160, damping: 14, delay: 0.2 },
                  }}
                >
                  <CalculatorIcon className="h-20 w-20 text-white" />
                </motion.div>
              </div>

              {/* Title */}
              <motion.h1
                custom={0}
                variants={variants}
                className="text-white font-extrabold text-5xl md:text-6xl leading-tight drop-shadow"
              >
                Calculadora de Notas
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                custom={1}
                variants={variants}
                className="mt-2 text-white/80 text-lg md:text-xl"
              >
                PSC • MACRO • SIS • ENEM
              </motion.p>

              {/* Credits glass card */}
              <motion.div
                custom={2}
                variants={variants}
                className="relative mt-8 w-[min(90vw,780px)]"
              >
                {/* golden glow behind */}
                <div className="pointer-events-none absolute -inset-8 -z-10 rounded-3xl bg-gradient-to-r from-yellow-400/35 via-yellow-300/25 to-yellow-400/35 blur-3xl" />
                {/* glass box */}
                <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6">
                  <div className="flex items-center justify-center gap-2 text-yellow-200">
                    <span className="animate-sparkle">✨</span>
                    <span className="tracking-widest text-xs md:text-sm font-semibold">
                      DESENVOLVIDO POR
                    </span>
                    <span className="animate-sparkle">✨</span>
                  </div>

                  <div className="mt-2 text-3xl md:text-4xl font-extrabold">
                    <span
                      className="bg-clip-text text-transparent shimmer-gold"
                      aria-label="Yvens Rabelo"
                    >
                      Yvens Rabelo
                    </span>
                  </div>

                  <div className="mt-2 text-white/60 text-sm md:text-base">
                    Criador &amp; Desenvolvedor Principal
                  </div>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div custom={3} variants={variants} className="mt-8">
                <button
                  onClick={() => {
                    vibrate(10);
                    finish();
                  }}
                  className="px-6 py-3 rounded-full bg-white text-green-900 font-semibold shadow transition-transform transform-gpu hover:scale-105 active:scale-95"
                >
                  Começar Cálculo
                </button>
              </motion.div>

              {/* Loading dots */}
              <motion.div
                custom={4}
                variants={variants}
                className="mt-8 flex items-center gap-2"
                aria-hidden="true"
              >
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="loading-dot" />
              </motion.div>

              {/* Skip button */}
              <motion.button
                custom={5}
                variants={variants}
                onClick={finish}
                className="mt-6 text-white/70 text-xs underline decoration-white/30 hover:text-white"
              >
                Pular intro
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** ---------- Helpers & Icons ---------- */

function FloatingIcon({
  className,
  depth = 0.5,
  reverse = false,
  path,
  label,
}: {
  className?: string;
  depth?: number; // 0..1 (slower when smaller)
  reverse?: boolean;
  path: string;
  label: string;
}) {
  // subtle bobbing + mouse parallax
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onMove(e: MouseEvent) {
      if (!el) return;
      const { innerWidth: w, innerHeight: h } = window;
      const dx = (e.clientX / w - 0.5) * 10 * depth * (reverse ? -1 : 1);
      const dy = (e.clientY / h - 0.5) * 10 * depth * (reverse ? -1 : 1);
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [depth, reverse]);

  return (
    <div
      ref={ref}
      className={`transform-gpu pointer-events-none ${className || ""}`}
      aria-hidden="true"
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="drop-shadow animate-[floatY_4.5s_ease-in-out_infinite]"
        role="img"
        aria-label={label}
      >
        <path d={path} />
      </svg>
    </div>
  );
}

function CalculatorIcon({ className = "h-20 w-20 text-white" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" role="img" aria-label="Calculadora">
      <path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v4h10V4H7zm2 8h2v2H9v-2zm0 4h2v2H9v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
    </svg>
  );
}

// simple SVG paths (material-like)
const graduationCapPath =
  "M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 10.2L4.24 9 12 4.8 19.76 9 12 13.2zM6 12v4c0 1.1 2.69 2 6 2s6-.9 6-2v-4l-6 3-6-3z";

const trophyPath =
  "M19 3h-2V2H7v1H5v4a5 5 0 0 0 4 4.9V17H8v2h8v-2h-1v-5.1A5 5 0 0 0 19 7V3zm-2 4a3 3 0 0 1-2 2.82V4h2v3zM9 4h6v5.82A3 3 0 0 1 13 7H9V4zm-2 0h2v3H7V4z";