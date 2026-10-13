import { gsap } from 'gsap';
import { FINE, MOTION, clamp01, palette } from './motion.js';
import { mix, rand } from './canvas-objects.js';

const TAU = Math.PI * 2;

/*
 * Coups de pinceau, en coordonnées relatives à la boîte du monogramme (0 → 1).
 * w : épaisseur relative à la hauteur ; a → b : portion du scroll pendant laquelle le trait se dessine.
 */
const STROKES = [
    { color: 'blue', w: 0.21, a: 0, b: 0.36, pts: [[-0.06, 0.3], [0.2, 0.1], [0.46, 0.22], [0.74, 0.08], [1.05, 0.26]] },
    { color: 'pink', w: 0.17, a: 0.2, b: 0.58, pts: [[0.62, 0.28], [0.32, 0.33], [0.12, 0.48], [0.38, 0.6], [0.6, 0.74], [0.32, 0.92], [-0.05, 0.88]] },
    { color: 'lime', w: 0.15, a: 0.42, b: 0.7, pts: [[0.99, 0.04], [0.92, 0.2], [0.8, 0.38], [0.7, 0.52]] },
    { color: 'orange', w: 0.16, a: 0.58, b: 0.88, pts: [[-0.05, 0.8], [0.22, 0.96], [0.52, 0.86], [0.74, 1.04]] },
    { color: 'lilac', w: 0.11, a: 0.76, b: 1, pts: [[0.02, 0.52], [0.34, 0.44], [0.67, 0.5]] },
];

/**
 * Monogramme S² du hero : peinture au scroll + traînée de carrés au survol.
 *
 * Le canvas est posé en mix-blend-mode: lighten sur des lettres noires et un fond blanc :
 * la peinture n'apparaît donc que dans les lettres, sans calcul de masque.
 * Retourne { setProgress(0 → 1) }, piloté par le ScrollTrigger du hero (main.js).
 */
export function initHeroPaint(mark = document.querySelector('[data-mark]')) {
    if (!mark) {
        return null;
    }

    const canvas = mark.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const counter = document.querySelector('[data-paint-count]');
    const colors = palette();
    const tileColors = [colors.blue, colors.pink, '#ffffff', colors.lime, colors.orange, '#ffffff', colors.lilac];

    let width = 0;
    let height = 0;
    let dpr = 1;
    let strokes = [];
    let progress = MOTION ? 0 : 1;
    let dirty = true;
    let tiles = [];
    let hadTiles = false;
    let cell = 40;
    let lastCell = '';
    let colorIndex = 0;

    function build(def, mw, mh, ox, oy, R) {
        const color = colors[def.color];
        const P = def.pts.map(([x, y]) => [ox + x * mw, oy + y * mh]);

        // Spline de Catmull-Rom passant par les points de contrôle
        const S = [];
        for (let i = 0; i < P.length - 1; i++) {
            const p0 = P[i - 1] || P[i];
            const p1 = P[i];
            const p2 = P[i + 1];
            const p3 = P[i + 2] || P[i + 1];
            for (let k = 0; k < 28; k++) {
                const t = k / 28;
                const t2 = t * t;
                const t3 = t2 * t;
                S.push([
                    0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                    0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
                ]);
            }
        }
        S.push(P[P.length - 1]);

        let length = 0;
        const pts = S.map((p, i) => {
            if (i) {
                length += Math.hypot(p[0] - S[i - 1][0], p[1] - S[i - 1][1]);
            }

            return { x: p[0], y: p[1], l: length };
        });

        const base = def.w * mh;
        const seed = R() * 10;
        pts.forEach((p, i) => {
            const a = pts[Math.max(0, i - 1)];
            const b = pts[Math.min(pts.length - 1, i + 1)];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const n = Math.hypot(dx, dy) || 1;
            p.nx = -dy / n;
            p.ny = dx / n;
            p.t = length ? p.l / length : 0;
            // Pression du pinceau : attaque, léger gonflement, fin qui s'effile
            const tin = Math.min(1, p.t / 0.07);
            const tout = Math.min(1, (1 - p.t) / 0.14);
            p.w = base * (0.84 + 0.16 * Math.sin(Math.PI * p.t) + 0.07 * Math.sin(p.t * 19 + seed)) * (0.5 + 0.5 * Math.sqrt(tin)) * (0.3 + 0.7 * Math.sqrt(tout));
        });

        // Poils du pinceau : traits fins décalés, plus clairs ou plus sombres, parfois interrompus
        const K = 30;
        const bristles = [];
        for (let k = 0; k < K; k++) {
            const o = (k / (K - 1)) * 2 - 1;
            const edge = Math.abs(o) > 0.72;
            bristles.push({
                o: o * (1.02 + R() * 0.06),
                lw: Math.max(0.6, (base / K) * (0.7 + R() * 1.8)),
                alpha: 0.28 + R() * 0.6,
                col: mix(color, R() < 0.5 ? '#ffffff' : '#000000', R() * 0.3),
                start: R() * 0.05,
                end: 1 - Math.pow(R(), 1.6) * (edge ? 0.45 : 0.2),
                dash: R() < (edge ? 0.7 : 0.25) ? [base * (0.3 + R() * 1.6), base * (0.04 + R() * 0.3)] : null,
            });
        }

        const drops = [];
        const count = 6 + ((R() * 10) | 0);
        for (let i = 0; i < count; i++) {
            drops.push({ t: R(), side: R() < 0.5 ? -1 : 1, dist: 0.55 + R() * 0.9, r: base * (0.012 + R() * 0.05) });
        }

        return { pts, length, bristles, drops, color, a: def.a, b: def.b };
    }

    function layout() {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width) {
            return;
        }
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        const mw = mark.clientWidth;
        const mh = mark.clientHeight;
        const R = rand(11);
        cell = Math.max(16, mh / 13);
        strokes = STROKES.map((def) => build(def, mw, mh, (width - mw) / 2, (height - mh) / 2, R));
        dirty = true;
    }

    function drawStroke(s, q) {
        if (q <= 0) {
            return;
        }
        const P = s.pts;
        const limit = q * s.length;
        let n = 0;
        while (n < P.length - 1 && P[n + 1].l <= limit) {
            n++;
        }
        const a = P[n];
        const b = P[Math.min(P.length - 1, n + 1)];
        const f = clamp01((limit - a.l) / (b.l - a.l || 1));
        const path = P.slice(0, n + 1);
        path.push({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, nx: a.nx, ny: a.ny, w: a.w + (b.w - a.w) * f, t: q });

        // Corps du trait
        ctx.globalAlpha = 0.94;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        path.forEach((p, i) => {
            const hw = p.w * 0.44;
            const x = p.x + p.nx * hw;
            const y = p.y + p.ny * hw;
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        for (let i = path.length - 1; i >= 0; i--) {
            const p = path[i];
            const hw = p.w * 0.44;
            ctx.lineTo(p.x - p.nx * hw, p.y - p.ny * hw);
        }
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(path[0].x, path[0].y, path[0].w * 0.44, 0, TAU);
        ctx.fill();

        // Poils
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        s.bristles.forEach((br) => {
            const end = Math.min(q, br.end);
            if (end <= br.start) {
                return;
            }
            ctx.globalAlpha = br.alpha;
            ctx.strokeStyle = br.col;
            ctx.lineWidth = br.lw;
            ctx.setLineDash(br.dash || []);
            ctx.beginPath();
            let started = false;
            for (const p of path) {
                if (p.t < br.start) {
                    continue;
                }
                if (p.t > end) {
                    break;
                }
                const off = br.o * p.w * 0.5;
                const x = p.x + p.nx * off;
                const y = p.y + p.ny * off;
                if (started) {
                    ctx.lineTo(x, y);
                } else {
                    ctx.moveTo(x, y);
                    started = true;
                }
            }
            ctx.stroke();
        });
        ctx.setLineDash([]);

        // Projections
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = s.color;
        s.drops.forEach((d) => {
            if (d.t > q) {
                return;
            }
            const p = P[Math.min(P.length - 1, Math.round(d.t * (P.length - 1)))];
            const off = d.side * p.w * 0.5 * (1 + d.dist * 0.35);
            ctx.beginPath();
            ctx.arc(p.x + p.nx * off, p.y + p.ny * off, d.r, 0, TAU);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    function render() {
        const now = performance.now();
        if (tiles.length) {
            tiles = tiles.filter((t) => now - t.born < 900);
        }
        const live = tiles.length > 0;
        if (!dirty && !live && !hadTiles) {
            return;
        }
        hadTiles = live;
        dirty = false;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        strokes.forEach((s) => drawStroke(s, clamp01((progress - s.a) / (s.b - s.a))));
        tiles.forEach((t) => {
            ctx.globalAlpha = Math.min(1, (1 - (now - t.born) / 900) * 1.6);
            ctx.fillStyle = t.color;
            ctx.fillRect(t.x, t.y, cell + 0.5, cell + 0.5);
        });
        ctx.globalAlpha = 1;
    }

    function setProgress(value) {
        progress = value;
        dirty = true;
        if (counter) {
            counter.textContent = String(Math.round(value * 100)).padStart(3, '0');
        }
    }

    // Survol : des carrés de couleur s'allument dans la grille sous le curseur, puis s'éteignent.
    if (FINE) {
        mark.addEventListener('pointermove', (event) => {
            const rect = canvas.getBoundingClientRect();
            const cx = Math.floor((event.clientX - rect.left) / cell);
            const cy = Math.floor((event.clientY - rect.top) / cell);
            const key = `${cx}:${cy}`;
            if (key === lastCell) {
                return;
            }
            lastCell = key;
            const add = (gx, gy) => tiles.push({ x: gx * cell, y: gy * cell, color: tileColors[colorIndex++ % tileColors.length], born: performance.now() });
            add(cx, cy);
            if (Math.random() < 0.5) {
                add(cx + (Math.random() < 0.5 ? -1 : 1), cy);
            }
            if (Math.random() < 0.3) {
                add(cx, cy + (Math.random() < 0.5 ? -1 : 1));
            }
            if (tiles.length > 160) {
                tiles.splice(0, tiles.length - 160);
            }
        });
    }

    if ('ResizeObserver' in window) {
        new ResizeObserver(layout).observe(mark);
    }
    layout();
    setProgress(progress);
    gsap.ticker.add(render);

    return { setProgress };
}
