import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

type Props = {
  score: number;
  grade: string;
  trend: number;
};

/**
 * MotherTree — the animated SVG centerpiece of the Command Center. A stylized
 * tree whose canopy glows and breathes with the org's ESG score. Canvas
 * particles orbit the canopy (pollen/spores). The score counts up in the
 * center. Higher ESG = brighter glow, more particles, richer green.
 */
export default function MotherTree({ score, grade, trend }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Score-driven vitality (0..1)
  const vitality = Math.max(0.3, Math.min(1.3, score / 78));
  const glowStrength = 0.3 + vitality * 0.5;
  const particleCount = Math.floor(16 * vitality);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const motes = Array.from({ length: particleCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 60 + Math.random() * 80,
      speed: 0.002 + Math.random() * 0.004,
      size: 0.8 + Math.random() * 2,
      yOff: (Math.random() - 0.5) * 100,
      twinkle: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    let visible = true;
    const onVis = () => { visible = !document.hidden; };
    document.addEventListener('visibilitychange', onVis);

    const draw = () => {
      if (!visible) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      frame++;
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      for (const m of motes) {
        m.angle += m.speed;
        m.twinkle += 0.04;
        const x = cx + Math.cos(m.angle) * m.radius;
        const y = cy + Math.sin(m.angle) * m.radius * 0.5 + m.yOff + Math.sin(frame * 0.01 + m.twinkle) * 6;
        const tw = 0.4 + Math.abs(Math.sin(m.twinkle)) * 0.6;
        const r = m.size * (2 + tw * 2);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(120, 200, 160, ${0.8 * tw})`);
        g.addColorStop(0.4, `rgba(82, 183, 136, ${0.3 * tw})`);
        g.addColorStop(1, 'rgba(82, 183, 136, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [particleCount]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Ambient glow behind tree */}
      <motion.div
        className="absolute top-8 h-72 w-72 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(82,183,136,${glowStrength * 0.4}) 0%, rgba(45,106,79,${glowStrength * 0.15}) 40%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Particle canvas overlay */}
      <canvas ref={canvasRef} className="absolute top-0 h-80 w-80 pointer-events-none" style={{ width: 320, height: 320 }} />

      {/* Tree SVG */}
      <motion.svg
        width="220"
        height="280"
        viewBox="0 0 220 280"
        className="relative z-10"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <radialGradient id="canopy" cx="40%" cy="35%">
            <stop offset="0%" stopColor={`rgba(120,200,160,${0.5 + vitality * 0.3})`} />
            <stop offset="60%" stopColor="rgba(45,106,79,0.6)" />
            <stop offset="100%" stopColor="rgba(2,48,32,0.4)" />
          </radialGradient>
          <linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1B4332" />
            <stop offset="50%" stopColor="#2D6A4F" />
            <stop offset="100%" stopColor="#1B4332" />
          </linearGradient>
          <filter id="treeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Trunk */}
        <path d="M108 280 L104 170 L116 170 L112 280 Z" fill="url(#trunk)" />
        {/* Branches */}
        <path d="M110 180 Q90 160 70 150" stroke="#2D6A4F" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M110 175 Q130 155 150 145" stroke="#2D6A4F" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />

        {/* Canopy layers */}
        <motion.ellipse
          cx="110" cy="110" rx="85" ry="70"
          fill="url(#canopy)"
          filter="url(#treeGlow)"
          animate={{ rx: [85, 88, 85], ry: [70, 72, 70] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.ellipse
          cx="80" cy="80" rx="50" ry="42"
          fill="url(#canopy)"
          filter="url(#treeGlow)"
          animate={{ rx: [50, 53, 50], ry: [42, 44, 42] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        <motion.ellipse
          cx="140" cy="85" rx="45" ry="38"
          fill="url(#canopy)"
          filter="url(#treeGlow)"
          animate={{ rx: [45, 48, 45], ry: [38, 40, 38] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {/* Small accent leaves */}
        <circle cx="60" cy="60" r="4" fill="rgba(82,183,136,0.5)" />
        <circle cx="160" cy="55" r="3" fill="rgba(82,183,136,0.4)" />
        <circle cx="100" cy="40" r="3.5" fill="rgba(120,200,160,0.5)" />
      </motion.svg>

      {/* Score display */}
      <motion.div
        className="absolute top-[78px] z-20 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="rounded-2xl px-5 py-2.5 text-center" style={{ background: 'rgba(4,4,4,0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="font-display text-5xl font-bold gradient-text" style={{ filter: 'drop-shadow(0 0 12px rgba(82,183,136,0.4))' }}>
            <AnimatedNumber value={score} decimals={1} />
          </div>
          <div className="mt-0.5 text-sm font-medium text-accent-glow">Grade {grade}</div>
          <div className="mt-0.5 flex items-center justify-center gap-1 text-xs text-mist">
            <motion.span
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ▲
            </motion.span>
            {trend}% this quarter
          </div>
        </div>
      </motion.div>
    </div>
  );
}
