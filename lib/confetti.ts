// Tiny dependency-free confetti on a full-screen canvas that removes itself when done.

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  shape: "rect" | "circle" | "star";
  life: number;
  /** Gravity per frame: bursts drop fast, rain floats down. */
  g: number;
};

const COLORS = ["#f2a93b", "#e0607e", "#3fa874", "#1f9aa8", "#2a5bd7", "#8a56d6", "#ffd54a"];
const DRAG = 0.985;

let canvas: HTMLCanvasElement | null = null;
let pieces: Piece[] = [];
let frame = 0;

export function motionAllowed() {
  return typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ensureCanvas() {
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "50" });
  document.body.appendChild(canvas);
  return canvas;
}

function star(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const d = i % 2 ? r * 0.45 : r;
    ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d);
  }
  ctx.closePath();
  ctx.fill();
}

function tick() {
  const c = canvas!;
  const ctx = c.getContext("2d")!;
  const dpr = window.devicePixelRatio || 1;
  if (c.width !== innerWidth * dpr || c.height !== innerHeight * dpr) {
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  pieces = pieces.filter((p) => p.life > 0 && p.y < innerHeight + 40);
  for (const p of pieces) {
    p.vx *= DRAG;
    p.vy = p.vy * DRAG + p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life--;
    ctx.save();
    ctx.globalAlpha = Math.min(1, p.life / 30);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === "star") star(ctx, p.size * 0.8);
    else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  }
  if (pieces.length) frame = requestAnimationFrame(tick);
  else {
    canvas?.remove();
    canvas = null;
    frame = 0;
  }
}

function add(list: Piece[]) {
  if (!motionAllowed()) return;
  ensureCanvas();
  pieces.push(...list);
  if (!frame) frame = requestAnimationFrame(tick);
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

/** A small burst from a point, e.g. the button the child just pressed. */
export function burst(x: number, y: number, count = 36) {
  add(
    Array.from({ length: count }, () => {
      const a = rand(0, Math.PI * 2);
      const speed = rand(3, 9);
      return {
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 4,
        rot: rand(0, Math.PI),
        vr: rand(-0.3, 0.3),
        size: rand(7, 12),
        color: pick(COLORS),
        shape: pick(["rect", "circle", "star"] as const),
        life: rand(60, 90),
        g: 0.25,
      };
    }),
  );
}

/** Burst from the centre of an element. */
export function burstFrom(el: Element, count?: number) {
  const r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, count);
}

/** Confetti falling from the top of the screen, for a finished quiz. */
export function rain(count = 160) {
  add(
    Array.from({ length: count }, () => ({
      x: rand(0, innerWidth),
      y: rand(-innerHeight * 0.6, -10),
      vx: rand(-2, 2),
      vy: rand(1, 4),
      rot: rand(0, Math.PI),
      vr: rand(-0.2, 0.2),
      size: rand(8, 13),
      color: pick(COLORS),
      shape: pick(["rect", "rect", "circle", "star"] as const),
      life: rand(220, 320),
      g: 0.05,
    })),
  );
}
