import { useEffect, useRef } from 'react';

/**
 * AmbientForest — a canvas particle system that keeps the cyber forest alive.
 * Renders: animated fog layers, drifting leaves, glowing dust motes, fireflies,
 * butterflies, and angled light rays. The forest reacts to the org's ESG score:
 * high score = more fireflies, brighter rays, richer greens; low score = more
 * fog, dimmer light, fewer particles. Performance-tuned with capped particle
 * counts, DPR handling, and a visibility-aware RAF loop.
 */
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  type: 'firefly' | 'dust' | 'leaf' | 'butterfly';
  rotation: number;
  vr: number;
  hue: number;
  flap: number;
  flapSpeed: number;
};

type Ray = { x: number; angle: number; length: number; width: number; opacity: number; speed: number };
type FogBand = { y: number; drift: number; offset: number; speed: number; opacity: number; height: number };

type Props = {
  density?: number;
  showLeaves?: boolean;
  showRays?: boolean;
  showButterflies?: boolean;
  showFog?: boolean;
  /** 0–100 org ESG total score. Drives firefly count, fog, and ray intensity. */
  esgScore?: number;
  className?: string;
};

export default function AmbientForest({
  density = 1,
  showLeaves = true,
  showRays = true,
  showButterflies = true,
  showFog = true,
  esgScore = 78,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const rays = useRef<Ray[]>([]);
  const fogBands = useRef<FogBand[]>([]);
  const scoreRef = useRef(esgScore);
  scoreRef.current = esgScore;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const makeFirefly = (): Particle => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 2 + 1.2, hue: 130 + Math.random() * 30,
      life: Math.random() * 200, maxLife: 180 + Math.random() * 160,
      type: 'firefly', rotation: 0, vr: 0, flap: 0, flapSpeed: 0,
    });

    const makeDust = (): Particle => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.15, vy: -Math.random() * 0.12 - 0.03,
      size: Math.random() * 1.4 + 0.4, hue: 140,
      life: Math.random() * 300, maxLife: 400 + Math.random() * 300,
      type: 'dust', rotation: 0, vr: 0, flap: 0, flapSpeed: 0,
    });

    const makeLeaf = (): Particle => ({
      x: width + 40, y: Math.random() * height * 0.85,
      vx: -(0.4 + Math.random() * 0.7), vy: (Math.random() - 0.5) * 0.3,
      size: 6 + Math.random() * 8, hue: 120 + Math.random() * 40,
      life: 0, maxLife: width + 200,
      type: 'leaf', rotation: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.04,
      flap: 0, flapSpeed: 0,
    });

    const makeButterfly = (): Particle => ({
      x: Math.random() * width, y: height * 0.3 + Math.random() * height * 0.5,
      vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.4,
      size: 7 + Math.random() * 5, hue: 130 + Math.random() * 30,
      life: 0, maxLife: 600 + Math.random() * 400,
      type: 'butterfly', rotation: 0, vr: 0,
      flap: Math.random() * Math.PI * 2, flapSpeed: 0.18 + Math.random() * 0.12,
    });

    const initParticles = () => {
      const score = scoreRef.current;
      // ESG-driven multipliers: high score = more life, less fog
      const vitality = Math.max(0.3, Math.min(1.4, score / 78)); // 1.0 at 78
      const fogFactor = Math.max(0.4, Math.min(1.6, 1.4 - vitality)); // less fog when healthy

      particles.current = [];
      const flyCount = Math.floor(22 * density * vitality);
      const dustCount = Math.floor(38 * density * vitality);
      const leafCount = showLeaves ? Math.floor(5 * density * vitality) : 0;
      const butterflyCount = showButterflies ? Math.floor(3 * density * vitality) : 0;

      for (let i = 0; i < flyCount; i++) particles.current.push(makeFirefly());
      for (let i = 0; i < dustCount; i++) particles.current.push(makeDust());
      for (let i = 0; i < leafCount; i++) {
        const l = makeLeaf();
        l.x = Math.random() * width;
        particles.current.push(l);
      }
      for (let i = 0; i < butterflyCount; i++) particles.current.push(makeButterfly());

      rays.current = [];
      if (showRays) {
        const rayCount = 4;
        for (let i = 0; i < rayCount; i++) {
          rays.current.push({
            x: (width / (rayCount + 1)) * (i + 1) + (Math.random() - 0.5) * 120,
            angle: -0.12 + Math.random() * 0.24,
            length: height * (0.7 + Math.random() * 0.5),
            width: 80 + Math.random() * 120,
            opacity: (0.03 + Math.random() * 0.04) * vitality,
            speed: 0.0002 + Math.random() * 0.0004,
          });
        }
      }

      fogBands.current = [];
      if (showFog) {
        const bandCount = 3;
        for (let i = 0; i < bandCount; i++) {
          fogBands.current.push({
            y: height * (0.55 + i * 0.18), drift: 0, offset: Math.random() * 1000,
            speed: 0.15 + Math.random() * 0.2,
            opacity: (0.06 + Math.random() * 0.04) * fogFactor,
            height: 120 + Math.random() * 80,
          });
        }
      }
    };

    resize();
    initParticles();

    const handleResize = () => { resize(); initParticles(); };
    window.addEventListener('resize', handleResize);

    let frame = 0;
    let visible = true;
    const onVisibility = () => { visible = !document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    const draw = () => {
      if (!visible) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Fog bands
      for (const fog of fogBands.current) {
        fog.offset += fog.speed;
        const grad = ctx.createLinearGradient(0, fog.y - fog.height / 2, 0, fog.y + fog.height / 2);
        grad.addColorStop(0, 'rgba(82, 183, 136, 0)');
        grad.addColorStop(0.5, `rgba(82, 183, 136, ${fog.opacity})`);
        grad.addColorStop(1, 'rgba(82, 183, 136, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, fog.y);
        for (let x = 0; x <= width; x += 24) {
          const y = fog.y + Math.sin((x + fog.offset) * 0.008) * 18 + Math.cos((x + fog.offset) * 0.003) * 10;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, fog.y + fog.height);
        ctx.lineTo(0, fog.y + fog.height);
        ctx.closePath();
        ctx.fill();
      }

      // Light rays
      for (const ray of rays.current) {
        ray.angle += ray.speed;
        const cx = ray.x + Math.sin(ray.angle) * 40;
        const grad = ctx.createLinearGradient(cx, 0, cx + Math.sin(ray.angle) * ray.length, ray.length);
        grad.addColorStop(0, `rgba(82, 183, 136, ${ray.opacity})`);
        grad.addColorStop(0.5, `rgba(45, 106, 79, ${ray.opacity * 0.6})`);
        grad.addColorStop(1, 'rgba(82, 183, 136, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        const a = ray.angle;
        ctx.moveTo(cx - ray.width / 2, 0);
        ctx.lineTo(cx + ray.width / 2, 0);
        ctx.lineTo(cx + ray.width / 2 + Math.sin(a) * ray.length, ray.length);
        ctx.lineTo(cx - ray.width / 2 + Math.sin(a) * ray.length, ray.length);
        ctx.closePath();
        ctx.fill();
      }

      // Particles
      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];
        p.x += p.vx; p.y += p.vy; p.life++; p.rotation += p.vr; p.flap += p.flapSpeed;

        if (p.type === 'firefly') {
          p.vx += (Math.random() - 0.5) * 0.04;
          p.vy += (Math.random() - 0.5) * 0.04;
          p.vx = Math.max(-0.5, Math.min(0.5, p.vx));
          p.vy = Math.max(-0.5, Math.min(0.5, p.vy));
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;

          const twinkle = 0.5 + Math.sin((frame / 30) + i) * 0.5;
          const r = p.size * (3 + twinkle * 2);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
          g.addColorStop(0, `rgba(120, 200, 160, ${0.9 * twinkle})`);
          g.addColorStop(0.3, `rgba(82, 183, 136, ${0.5 * twinkle})`);
          g.addColorStop(1, 'rgba(82, 183, 136, 0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(140, 210, 170, ${twinkle})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2); ctx.fill();
        } else if (p.type === 'dust') {
          if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
          if (p.life > p.maxLife) { p.life = 0; p.x = Math.random() * width; p.y = height + 10; }
          const fade = Math.sin((p.life / p.maxLife) * Math.PI) * 0.5;
          ctx.fillStyle = `rgba(168, 179, 162, ${fade})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        } else if (p.type === 'leaf') {
          if (p.x < -60) { particles.current[i] = makeLeaf(); continue; }
          ctx.save();
          ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
          ctx.fillStyle = `rgba(45, 106, 79, 0.45)`;
          ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = `rgba(82, 183, 136, 0.27)`; ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(-p.size, 0); ctx.lineTo(p.size, 0); ctx.stroke();
          ctx.restore();
        } else if (p.type === 'butterfly') {
          p.vx += Math.sin(frame * 0.01 + i) * 0.02;
          p.vy += Math.cos(frame * 0.008 + i) * 0.015;
          p.vx = Math.max(-1, Math.min(1, p.vx));
          p.vy = Math.max(-0.8, Math.min(0.8, p.vy));
          if (p.x < -30) p.x = width + 30;
          if (p.x > width + 30) p.x = -30;
          if (p.y < 30) p.vy = Math.abs(p.vy);
          if (p.y > height - 30) p.vy = -Math.abs(p.vy);
          if (p.life > p.maxLife) { particles.current[i] = makeButterfly(); continue; }

          const wingOpen = Math.abs(Math.sin(p.flap));
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.scale(p.vx >= 0 ? 1 : -1, 1);
          const wingW = p.size * (0.6 + wingOpen * 0.8);
          const wingH = p.size * 0.7;
          ctx.fillStyle = `rgba(82, 183, 136, ${0.4 + wingOpen * 0.2})`;
          ctx.beginPath(); ctx.ellipse(-wingW * 0.5, -wingH * 0.3, wingW, wingH, -0.4, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(-wingW * 0.5, wingH * 0.3, wingW * 0.8, wingH * 0.7, 0.4, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(120, 200, 160, 0.7)';
          ctx.beginPath(); ctx.ellipse(0, 0, p.size * 0.15, p.size * 0.6, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [density, showLeaves, showRays, showButterflies, showFog]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
