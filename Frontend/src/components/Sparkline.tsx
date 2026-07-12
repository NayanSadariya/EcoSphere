import { useEffect, useId, useMemo, useRef } from 'react';

type Props = {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  fill?: boolean;
  className?: string;
};

/**
 * Sparkline — a lightweight SVG line chart. Animates the stroke drawing in
 * on mount. Optional gradient fill below the line. Responsive: uses viewBox
 * so it scales to container width when width is not explicitly set.
 */
export default function Sparkline({
  data,
  color = '#52B788',
  height = 60,
  width = 200,
  fill = true,
  className = '',
}: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const rawId = useId();
  const id = `spark-${rawId.replace(/:/g, '')}`;

  const { linePath, fillPath, lastPoint } = useMemo(() => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const pad = 4;
    const stepX = (width - pad * 2) / (data.length - 1);

    const points = data.map((d, i) => {
      const x = pad + i * stepX;
      const y = pad + (height - pad * 2) * (1 - (d - min) / range);
      return [x, y] as const;
    });

    const lp = points
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(' ');
    const fp = `${lp} L${points[points.length - 1][0].toFixed(1)},${height - pad} L${pad},${height - pad} Z`;
    return { linePath: lp, fillPath: fp, lastPoint: points[points.length - 1] };
  }, [data, width, height]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    const raf = requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 1.4s ease-out';
      path.style.strokeDashoffset = '0';
    });
    if (fillRef.current) {
      fillRef.current.style.opacity = '0';
      requestAnimationFrame(() => {
        fillRef.current!.style.transition = 'opacity 1.4s ease-out 0.3s';
        fillRef.current!.style.opacity = '1';
      });
    }
    return () => cancelAnimationFrame(raf);
  }, [linePath]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path ref={fillRef} d={fillPath} fill={`url(#${id})`} />}
      <path
        ref={pathRef}
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
      />
      <circle
        cx={lastPoint[0]}
        cy={lastPoint[1]}
        r="3"
        fill={color}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
}
