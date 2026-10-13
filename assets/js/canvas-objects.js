/**
 * Outils de dessin canvas : objets « studio » brillants (sphère, anneau, gélule, coussin),
 * ombres douces et grain. Utilisés par l'animation de remplacement du showreel.
 */
const TAU = Math.PI * 2;

if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, w, h, r) {
        const radius = Math.min(r, w / 2, h / 2);
        this.moveTo(x + radius, y);
        this.arcTo(x + w, y, x + w, y + h, radius);
        this.arcTo(x + w, y + h, x, y + h, radius);
        this.arcTo(x, y + h, x, y, radius);
        this.arcTo(x, y, x + w, y, radius);
        this.closePath();
    };
}

const hexToRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);

    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Mélange deux couleurs #rrggbb (t = 0 donne a, t = 1 donne b). */
export function mix(a, b, t) {
    const A = hexToRgb(a);
    const B = hexToRgb(b);

    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

/** Générateur pseudo-aléatoire déterministe (mulberry32) : même graine, même dessin. */
export function rand(seed) {
    let a = seed >>> 0;

    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

let grainCanvas = null;

function grainTile() {
    if (grainCanvas) {
        return grainCanvas;
    }
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const data = ctx.createImageData(128, 128);
    const R = rand(7);
    for (let i = 0; i < data.data.length; i += 4) {
        const v = (R() * 255) | 0;
        data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
        data.data[i + 3] = 255;
    }
    ctx.putImageData(data, 0, 0);
    grainCanvas = c;

    return c;
}

export function addGrain(ctx, w, h, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(grainTile(), 'repeat');
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
}

export function shadowBlob(ctx, x, y, rx, ry, a) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(0,0,0,${a})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, TAU);
    ctx.fill();
    ctx.restore();
}

export function sphere(ctx, x, y, r, hue) {
    let g = ctx.createRadialGradient(x - r * 0.32, y - r * 0.38, r * 0.06, x, y, r * 1.02);
    g.addColorStop(0, mix(hue, '#ffffff', 0.62));
    g.addColorStop(0.48, hue);
    g.addColorStop(1, mix(hue, '#000000', 0.6));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.clip();
    g = ctx.createLinearGradient(x, y + r * 0.3, x, y + r);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,255,255,.22)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y, r * 2, r);
    ctx.restore();

    g = ctx.createRadialGradient(x - r * 0.36, y - r * 0.42, 0, x - r * 0.36, y - r * 0.42, r * 0.3);
    g.addColorStop(0, 'rgba(255,255,255,.95)');
    g.addColorStop(0.45, 'rgba(255,255,255,.3)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x - r * 0.36, y - r * 0.42, r * 0.3, 0, TAU);
    ctx.fill();
}

export function ring(ctx, x, y, R, thickness, hue, tilt) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, tilt);
    const g = ctx.createRadialGradient(-R * 0.35, -R * 0.6, R * 0.1, 0, 0, R + thickness);
    g.addColorStop(0, mix(hue, '#ffffff', 0.6));
    g.addColorStop(0.55, hue);
    g.addColorStop(1, mix(hue, '#000000', 0.55));
    ctx.lineWidth = thickness;
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.stroke();
    ctx.lineWidth = thickness * 0.16;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,.75)';
    ctx.beginPath();
    ctx.arc(0, 0, R - thickness * 0.18, Math.PI * 1.08, Math.PI * 1.5);
    ctx.stroke();
    ctx.restore();
}

export function pill(ctx, x, y, length, r, angle, hue) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const g = ctx.createLinearGradient(0, -r, 0, r);
    g.addColorStop(0, mix(hue, '#ffffff', 0.55));
    g.addColorStop(0.3, hue);
    g.addColorStop(1, mix(hue, '#000000', 0.58));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(-length / 2, -r, length, r * 2, r);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath();
    ctx.roundRect(-length / 2 + r * 0.7, -r * 0.66, length - r * 1.4, r * 0.2, r * 0.1);
    ctx.fill();
    ctx.restore();
}

export function cushion(ctx, x, y, size, hue, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const g = ctx.createRadialGradient(-size * 0.22, -size * 0.26, size * 0.04, 0, 0, size * 0.78);
    g.addColorStop(0, mix(hue, '#ffffff', 0.55));
    g.addColorStop(0.5, hue);
    g.addColorStop(1, mix(hue, '#000000', 0.5));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, size, size * 0.3);
    ctx.fill();
    const h = ctx.createRadialGradient(-size * 0.2, -size * 0.24, 0, -size * 0.2, -size * 0.24, size * 0.24);
    h.addColorStop(0, 'rgba(255,255,255,.85)');
    h.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = h;
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, size, size * 0.3);
    ctx.fill();
    ctx.restore();
}
