import { MOTION, clamp01 } from './motion.js';

// Nombre d'images chargées en même temps.
const PARALLEL = 6;

// Contour du monogramme S² dans la boîte .mark (1 em = 1000 unités, boîte de 1153 × 712),
// tiré des glyphes d'Archivo (largeur 125, graisse 800), comme le logo officiel.
const S2_OUTLINE = 'M401.6 712Q317.6 712 244.7 702Q171.8 691.9 117 666.9Q62.2 641.8 31.2 597Q0.3 552.2 0.3 483.2Q0.3 481.2 0.3 477.9Q0.3 474.6 1.3 471.6H200.8Q199.8 475.6 199.5 480Q199.3 484.4 199.3 489.2Q199.3 519.7 222.5 537.3Q245.7 554.9 288.1 562Q330.5 569.1 386.6 569.1Q410.2 569.1 434.8 567.6Q459.4 566.2 482.3 562.6Q505.2 559 523.5 552.1Q541.7 545.3 552.6 534.5Q563.5 523.7 563.5 508.5Q563.5 486.8 540.5 474.3Q517.5 461.8 478.4 454.2Q439.2 446.7 390.5 440.8Q341.9 434.9 289.8 426.6Q237.6 418.4 189 403.9Q140.3 389.4 101.1 365.3Q62 341.2 39 303.4Q16 265.5 16 210.9Q16 156.4 43.7 116.6Q71.3 76.9 121.2 51.1Q171.1 25.4 239 12.9Q307 0.5 387.1 0.5Q468.7 0.5 535.2 13.1Q601.6 25.7 649.3 51.2Q697 76.6 722.7 115.3Q748.4 154 748.4 206.1V219.9H550.9V211.8Q550.9 190.9 532.9 174.7Q514.9 158.5 480.4 148.8Q445.9 139 396.6 139Q337.6 139 299.7 146.4Q261.8 153.8 243.8 166.6Q225.8 179.4 225.8 194.5Q225.8 214.8 248.7 226.6Q271.7 238.5 310.9 245.4Q350 252.2 398.7 258.1Q447.3 264 499.5 272.2Q551.6 280.4 600.2 294.1Q648.9 307.9 688.1 331.6Q727.3 355.4 750.2 391.7Q773.2 428 773.2 481.1Q773.2 563.9 725.3 614.8Q677.4 665.7 593.5 688.9Q509.6 712 401.6 712ZM813.1 350V327.8Q813.1 303.1 825.1 282.9Q837 262.8 856.8 246.2Q876.5 229.6 900.2 215Q923.9 200.5 947.7 186.8Q974.4 171.6 998.1 158.7Q1021.7 145.8 1036.6 132.6Q1051.4 119.3 1051.4 104Q1051.4 92.2 1044.1 83.2Q1036.7 74.1 1021.5 69.2Q1006.4 64.2 982.1 64.2Q957.3 64.2 940.6 71Q923.9 77.8 915.6 89.3Q907.3 100.8 907.3 115.2V127H816Q815.5 123.6 815.3 120.7Q815.1 117.9 815.1 114.4Q815.1 78.7 835.7 53.3Q856.3 27.9 895.8 14Q935.3 0.2 991.8 0.2Q1027.3 0.2 1056.2 6.5Q1085.1 12.8 1106 25.4Q1126.8 38.1 1138 57.1Q1149.1 76.2 1149.1 101.4Q1149.1 126.1 1136.8 146Q1124.4 165.9 1104.1 182.2Q1083.8 198.5 1059.7 211.6Q1035.6 224.6 1011.8 235.7Q997.7 241.9 983.7 248.1Q969.7 254.4 958.3 260.6Q946.9 266.7 940.2 273.1H1153.2V350Z';
// Centre du recul : un point au plus épais du S, et le rayon du plus grand cercle qui y tient.
const ANCHOR = { u: 599, v: 396, r: 97.4 };
const BOX = { w: 1153, h: 712 };

/**
 * Séquence d'images du hero : une vidéo exportée en images, dessinée image par image
 * dans un canvas plein cadre au rythme du scroll (le ScrollTrigger est dans main.js).
 *
 * Fin de séquence, le recul (zoom out) : la vidéo rentre dans les lettres du S², qui reprennent
 * leur taille normale, puis elle s'efface et laisse le S² noir sur la page blanche.
 *
 * Réglages sur le canvas [data-hero-frames] (templates/home/_hero.html.twig) :
 * - data-count : nombre d'images ;
 * - data-src : chemin des images ; les # sont remplacés par le numéro (#### → 0001, 0002…) ;
 * - data-first : numéro de la première image (1 par défaut).
 *
 * Les images arrivent progressivement : la première, puis une sur 32, une sur 16… jusqu'à toutes.
 * Tant qu'une image manque, la plus proche déjà chargée s'affiche.
 * Sans animation (prefers-reduced-motion), rien n'est chargé : le hero reste blanc avec le S².
 *
 * Retourne { update({ play, zoom, fade }) } (valeurs de 0 à 1), ou null.
 * onFail est appelé si aucune image n'est trouvée.
 */
export function initHeroFrames({ onFail } = {}) {
    const canvas = document.querySelector('[data-hero-frames]');
    const count = canvas ? parseInt(canvas.dataset.count, 10) || 0 : 0;
    if (!canvas || count < 1 || !canvas.dataset.src) {
        return null;
    }
    if (!MOTION) {
        canvas.style.display = 'none';

        return null;
    }

    const ctx = canvas.getContext('2d');
    const mark = document.querySelector('[data-hero-mark]');
    const outline = mark && typeof Path2D === 'function' ? new Path2D(S2_OUTLINE) : null;
    const counter = document.querySelector('[data-frame-count]');
    const first = parseInt(canvas.dataset.first ?? '1', 10) || 0;
    const url = (i) => canvas.dataset.src.replace(/#+/, (hashes) => String(first + i).padStart(hashes.length, '0'));
    const images = new Array(count).fill(null);
    let current = 0;
    let zoom = 0;
    let failed = false;
    let drawn = -1;
    let drawnZoom = -1;
    let width = 0;
    let height = 0;
    let shape = null;

    const showNumber = () => {
        if (counter) {
            counter.textContent = String(current + 1).padStart(3, '0');
        }
    };

    // Le S² du HTML reste caché tant que la vidéo le couvre ; il réapparaît quand les lettres
    // de la vidéo ont repris sa taille exacte, juste avant qu'elle s'efface.
    const syncMark = () => {
        if (mark) {
            mark.style.opacity = !failed && drawn >= 0 && zoom < 1 ? '0' : '';
        }
    };

    // Position du S² dans le canvas, et échelle de départ : assez grande pour que le S couvre tout l'écran.
    const measure = () => {
        if (!outline) {
            shape = null;

            return;
        }
        const c = canvas.getBoundingClientRect();
        const m = mark.getBoundingClientRect();
        const dpr = width / c.width;
        const k = (parseFloat(getComputedStyle(mark).fontSize) / 1000) * dpr;
        const bx = (m.left - c.left) * dpr;
        const by = (m.top - c.top) * dpr;
        const px = bx + ANCHOR.u * k;
        const py = by + ANCHOR.v * k;
        const far = Math.max(Math.hypot(px, py), Math.hypot(width - px, py), Math.hypot(px, height - py), Math.hypot(width - px, height - py));
        shape = { k, bx, by, px, py, smax: (far / (ANCHOR.r * k)) * 1.08 };
    };

    // Image chargée la plus proche de celle demandée
    const nearest = (i) => {
        for (let d = 0; d < count; d += 1) {
            if (i - d >= 0 && images[i - d]) {
                return i - d;
            }
            if (i + d < count && images[i + d]) {
                return i + d;
            }
        }

        return -1;
    };

    const render = () => {
        if (!width) {
            return;
        }
        const i = nearest(current);
        if (i < 0 || (i === drawn && zoom === drawnZoom)) {
            return;
        }
        const img = images[i];
        // l'image remplit le canvas (« cover »), centrée, sans être déformée
        const fit = Math.max(width / img.naturalWidth, height / img.naturalHeight);
        const w = img.naturalWidth * fit;
        const h = img.naturalHeight * fit;
        const x = (width - w) / 2;
        const y = (height - h) / 2;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, width, height);

        if (shape && zoom > 0) {
            const { k, bx, by, px, py, smax } = shape;
            // La vidéo recule elle aussi, moins vite que les lettres, jusqu'à couvrir juste la boîte du S².
            const vEnd = Math.min(1, 1.02 * Math.max(
                (px - bx) / (px - x),
                (bx + BOX.w * k - px) / (x + w - px),
                (py - by) / (py - y),
                (by + BOX.h * k - py) / (y + h - py),
            ));
            const v = vEnd ** zoom;
            ctx.setTransform(v, 0, 0, v, px * (1 - v), py * (1 - v));
            ctx.drawImage(img, x, y, w, h);
            // Les lettres passent de très grandes (la vidéo plein écran) à leur taille normale.
            const s = smax ** (1 - zoom);
            ctx.setTransform(s * k, 0, 0, s * k, s * bx + (1 - s) * px, s * by + (1 - s) * py);
            ctx.globalCompositeOperation = 'destination-in';
            ctx.fill(outline);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
        } else {
            ctx.drawImage(img, x, y, w, h);
        }
        drawn = i;
        drawnZoom = zoom;
        syncMark();
    };

    const size = () => {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) {
            return;
        }
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);
        if (w !== width || h !== height) {
            width = w;
            height = h;
            canvas.width = w;
            canvas.height = h;
        }
        measure();
        drawn = -1;
        render();
    };

    const fail = () => {
        failed = true;
        canvas.style.display = 'none';
        syncMark();
        console.warn(`Séquence du hero : aucune image trouvée (par exemple ${url(0)}). Vérifiez le dossier dans public/ et data-src dans templates/home/_hero.html.twig.`);
        onFail?.();
    };

    // Ordre de chargement : la première et la dernière image (celle du recul), puis des passes de plus en plus fines.
    const order = [];
    const queued = new Uint8Array(count);
    const queue = (i) => {
        if (!queued[i]) {
            queued[i] = 1;
            order.push(i);
        }
    };
    queue(0);
    queue(count - 1);
    for (let step = 32; step >= 1; step = Math.floor(step / 2)) {
        for (let i = 0; i < count; i += step) {
            queue(i);
        }
    }

    let next = 0;
    let inFlight = 0;
    let loaded = 0;
    const pump = () => {
        while (!failed && inFlight < PARALLEL && next < order.length) {
            const i = order[next];
            next += 1;
            inFlight += 1;
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => {
                inFlight -= 1;
                images[i] = img;
                loaded += 1;
                render();
                pump();
            };
            img.onerror = () => {
                inFlight -= 1;
                // Aucune des premières images n'existe : mauvais chemin ou dossier vide.
                if (!loaded && !inFlight) {
                    fail();

                    return;
                }
                if (loaded) {
                    pump();
                }
            };
            img.src = url(i);
        }
    };

    showNumber();
    size();
    if ('ResizeObserver' in window) {
        new ResizeObserver(size).observe(canvas);
    } else {
        window.addEventListener('resize', size);
    }
    pump();

    return {
        update(state) {
            if (failed) {
                return;
            }
            const i = Math.round(clamp01(state.play) * (count - 1));
            if (i !== current) {
                current = i;
                showNumber();
            }
            zoom = clamp01(state.zoom);
            canvas.style.opacity = String(1 - clamp01(state.fade));
            render();
            syncMark();
        },
    };
}
