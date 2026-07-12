import { useEffect, useRef, useState } from 'react';

type Props = {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  delay?: number;
};

/**
 * AnimatedNumber — counts up from 0 to `value` using an easing curve when it
 * enters the viewport. Re-runs when `value` changes. Optional `delay` defers
 * the start of the animation.
 */
export default function AnimatedNumber({
  value,
  duration = 1400,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
  delay = 0,
}: Props) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(value * eased);
        if (t < 1) requestAnimationFrame(tick);
        else setDisplay(value);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          if (delay > 0) setTimeout(run, delay * 1000);
          else run();
        }
      }),
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration, delay]);

  useEffect(() => {
    started.current = false;
  }, [value]);

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
