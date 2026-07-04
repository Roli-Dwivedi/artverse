import { useEffect, useRef } from "react";

// Static (non-animated) pastel brush-stroke background used behind the
// gallery hero in the Light Canvas theme. Draws 3-4 tapered, ribbon-shaped
// strokes with their own gradient, ridge highlights/shadows following the
// stroke's own curve, and stippled paint texture — not a repeating pattern.
export default function BrushStrokeHero({ style }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let resizeTimeout;

    function pseudoRandom(seed) {
      const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    }

    const STROKES = [
      {
        p0: { x: 0.0, y: 0.1 },
        p1: { x: 0.25, y: -0.05 },
        p2: { x: 0.4, y: 0.25 },
        p3: { x: 0.65, y: 0.05 },
        widthFrac: 0.22,
        colors: ["#F6D9A9", "#F0C2A0", "#F0A7AC"],
        seed: 11,
      },
      {
        p0: { x: 0.15, y: 0.55 },
        p1: { x: 0.4, y: 0.85 },
        p2: { x: 0.6, y: 0.35 },
        p3: { x: 1.0, y: 0.7 },
        widthFrac: 0.28,
        colors: ["#F0A7AC", "#D6BEEA", "#A9DDD8"],
        seed: 47,
      },
      {
        p0: { x: 0.78, y: 0.05 },
        p1: { x: 0.9, y: -0.05 },
        p2: { x: 0.95, y: 0.2 },
        p3: { x: 1.05, y: 0.12 },
        widthFrac: 0.12,
        colors: ["#C7C0EA", "#BFE1EC"],
        seed: 129,
      },
    ];

    function bezierPoint(p0, p1, p2, p3, t) {
      const mt = 1 - t;
      const x =
        mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
      const y =
        mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
      return { x, y };
    }

    function drawStroke(stroke, w, h) {
      const diag = Math.sqrt(w * w + h * h);
      const maxWidth = diag * stroke.widthFrac;
      const N = 40;
      const centers = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const pt = bezierPoint(stroke.p0, stroke.p1, stroke.p2, stroke.p3, t);
        centers.push({ x: pt.x * w, y: pt.y * h, t });
      }

      function widthAt(t, seedOffset) {
        const taper = Math.sin(Math.PI * Math.min(Math.max(t, 0.03), 0.97));
        const wobble = 0.85 + pseudoRandom(stroke.seed + seedOffset + Math.floor(t * 10)) * 0.3;
        return maxWidth * taper * wobble;
      }

      const left = [];
      const right = [];
      for (let i = 0; i < centers.length; i++) {
        const c = centers[i];
        const prev = centers[Math.max(0, i - 1)];
        const next = centers[Math.min(centers.length - 1, i + 1)];
        let tx = next.x - prev.x;
        let ty = next.y - prev.y;
        const len = Math.sqrt(tx * tx + ty * ty) || 1;
        tx /= len;
        ty /= len;
        const px = -ty;
        const py = tx;
        const width = widthAt(c.t, 0);
        left.push({ x: c.x + px * width * 0.5, y: c.y + py * width * 0.5 });
        right.push({ x: c.x - px * width * 0.5, y: c.y - py * width * 0.5 });
      }

      function buildPath() {
        ctx.beginPath();
        ctx.moveTo(left[0].x, left[0].y);
        for (let i = 1; i < left.length; i++) ctx.lineTo(left[i].x, left[i].y);
        for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
        ctx.closePath();
      }

      const gradStart = centers[0];
      const gradEnd = centers[centers.length - 1];
      const grad = ctx.createLinearGradient(gradStart.x, gradStart.y, gradEnd.x, gradEnd.y);
      stroke.colors.forEach((c, i) => grad.addColorStop(i / (stroke.colors.length - 1), c));
      buildPath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.save();
      buildPath();
      ctx.clip();

      const ridgeCount = 9;
      for (let r = 0; r < ridgeCount; r++) {
        const frac = r / (ridgeCount - 1) - 0.5;
        ctx.beginPath();
        for (let i = 0; i < centers.length; i++) {
          const c = centers[i];
          const prev = centers[Math.max(0, i - 1)];
          const next = centers[Math.min(centers.length - 1, i + 1)];
          let tx = next.x - prev.x;
          let ty = next.y - prev.y;
          const len = Math.sqrt(tx * tx + ty * ty) || 1;
          tx /= len;
          ty /= len;
          const px = -ty;
          const py = tx;
          const width = widthAt(c.t, r * 3);
          const x = c.x + px * frac * width;
          const y = c.y + py * frac * width;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const isHighlight = frac < -0.05;
        const strength = Math.abs(frac);
        ctx.strokeStyle = isHighlight
          ? `rgba(255,255,255,${0.15 + strength * 0.5})`
          : `rgba(60,45,40,${0.05 + strength * 0.18})`;
        ctx.lineWidth = 1.4 + strength * 2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      const dotCount = 220;
      for (let d = 0; d < dotCount; d++) {
        const tIdx = Math.floor(pseudoRandom(stroke.seed + d) * centers.length);
        const c = centers[Math.min(tIdx, centers.length - 1)];
        const width = widthAt(c.t, d);
        const offsetFrac = (pseudoRandom(stroke.seed + d + 500) - 0.5) * 0.9;
        const prev = centers[Math.max(0, tIdx - 1)];
        const next = centers[Math.min(centers.length - 1, tIdx + 1)];
        let tx = next.x - prev.x;
        let ty = next.y - prev.y;
        const len = Math.sqrt(tx * tx + ty * ty) || 1;
        const px = -ty / len;
        const py = tx / len;
        const dx = c.x + px * offsetFrac * width;
        const dy = c.y + py * offsetFrac * width;
        const shade = pseudoRandom(stroke.seed + d + 900);
        const size = 0.6 + pseudoRandom(stroke.seed + d + 1300) * 1.3;
        ctx.beginPath();
        ctx.arc(dx, dy, size, 0, Math.PI * 2);
        ctx.fillStyle =
          shade > 0.5 ? `rgba(255,255,255,${0.08 + shade * 0.28})` : `rgba(45,35,30,${0.06 + shade * 0.2})`;
        ctx.fill();
      }

      ctx.restore();
    }

    function draw() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      STROKES.forEach((s) => drawStroke(s, w, h));
    }

    function resize() {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      draw();
    }

    function debouncedResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 120);
    }

    resize();
    window.addEventListener("resize", debouncedResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...style }}
    />
  );
}