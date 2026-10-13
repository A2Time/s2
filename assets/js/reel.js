import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FINE, MOTION, isDesktop } from './motion.js';

/**
 * La toile du manifeste.
 *
 * Au scroll, la section est épinglée : la carte part des colonnes 3-4 (1-2 sur mobile),
 * s'agrandit jusqu'au plein écran, puis le slogan monte et le texte apparaît.
 *
 * La peinture est en noir et blanc au départ :
 * - tablette et ordinateur (BRUSH) : la souris ou le doigt y peint la couleur, qui s'efface ensuite ;
 * - mobile : toute la toile reprend ses couleurs en fondu quand elle arrive en plein écran.
 */

// Pinceau à partir de 700 px de large ; fondu en dessous et sur un téléphone tenu à l'horizontale.
const BRUSH = '(min-width: 700px) and (min-height: 480px)';
// Fondu : la couleur arrive à 60 % du scroll épinglé, quand la toile est en plein écran.
const COLOR_AT = 0.6;
// Pinceau au doigt : la couleur reste 1,2 s quand le doigt quitte l'écran, puis s'efface.
const TOUCH_HOLD = 1.2;
// Durée de l'effacement de la couleur peinte, en secondes.
const FADE = 1.4;

export function initReel() {
    const reel = document.querySelector('[data-reel]');
    if (!reel) {
        return;
    }

    const frame = reel.querySelector('.reel__frame');
    const media = reel.querySelector('.reel__media');
    const meta = reel.querySelector('.reel__meta');
    const caption = reel.querySelector('.reel__caption');
    const lines = reel.querySelectorAll('.reel__line > span');
    const hint = reel.querySelector('[data-reel-hint]');
    const brushQuery = window.matchMedia(BRUSH);
    const brush = createBrush(frame, reel.querySelector('.reel__img'), reel.querySelector('.reel__paint'));

    // Fondu : la couleur arrive avec le scroll ; sans animation, elle est là tout de suite.
    let inView = !MOTION;
    let effect = '';

    const applyColor = () => reel.classList.toggle('is-color', effect === 'fondu' && inView);

    // Les textes d'aide sont dans le template (attributs data-mouse, data-touch, data-fade).
    const setEffect = () => {
        const next = brushQuery.matches ? 'pinceau' : 'fondu';
        if (next === effect) {
            return;
        }
        effect = next;
        reel.dataset.effect = effect;
        brush.enable(effect === 'pinceau');
        if (hint) {
            hint.textContent = effect === 'fondu' ? hint.dataset.fade : (FINE ? hint.dataset.mouse : hint.dataset.touch);
        }
        applyColor();
    };
    setEffect();
    brushQuery.addEventListener('change', setEffect);

    if (!MOTION) {
        return;
    }

    // Rectangle de départ : aligné sur les filets de la grille (.lines)
    const card = () => {
        const grid = document.querySelectorAll('.lines i');
        const desktop = isDesktop();
        const from = (desktop ? grid[2] : grid[0]).getBoundingClientRect();
        const to = (desktop ? grid[3] : grid[1]).getBoundingClientRect();
        const pad = 12;
        const vw = window.innerWidth;
        const vh = reel.offsetHeight;
        const left = from.left + pad;
        const right = vw - to.right + pad;
        const w = vw - left - right;
        const h = desktop ? w * 0.64 : w * 1.15;
        const top = desktop ? vh * 0.2 : vh * 0.16;

        return { left, right, top, bottom: Math.max(0, vh - top - h), w };
    };

    const placeMeta = () => {
        const r = card();
        reel.style.setProperty('--mt', `${r.top - 26}px`);
        reel.style.setProperty('--ml', `${r.left}px`);
        reel.style.setProperty('--mw', `${r.w}px`);
    };
    placeMeta();
    ScrollTrigger.addEventListener('refreshInit', placeMeta);

    gsap.set(caption, { autoAlpha: 0, y: 30 });
    gsap.set(lines, { yPercent: 110 });

    gsap.timeline({
        scrollTrigger: {
            trigger: reel,
            start: 'top top',
            end: '+=150%',
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            refreshPriority: 9,
            onUpdate: (self) => {
                const reached = self.progress >= COLOR_AT;
                if (reached !== inView) {
                    inView = reached;
                    applyColor();
                }
            },
        },
    })
        .fromTo(frame, {
            clipPath: () => {
                const r = card();

                return `inset(${r.top}px ${r.right}px ${r.bottom}px ${r.left}px round 2px)`;
            },
        }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', ease: 'power2.inOut', duration: 1 }, 0)
        .fromTo(media, { scale: 1.3 }, { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
        .to(meta, { autoAlpha: 0, y: -16, duration: 0.2, ease: 'none' }, 0)
        .to(lines, { yPercent: 0, duration: 0.3, stagger: 0.08, ease: 'power3.out' }, 0.78)
        .to(caption, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 0.95)
        .to({}, { duration: 0.3 }, 1.2);
}

/**
 * Pinceau : les traits sont dessinés dans un masque (canvas hors écran) ; la couleur de l'image,
 * découpée par ce masque, est posée sur le canvas .reel__paint, par-dessus l'image en noir et blanc.
 * La couleur s'efface quand la souris quitte la toile, ou peu après que le doigt a quitté l'écran.
 * Le doigt peint aussi pendant qu'il fait défiler la page : les écouteurs sont passifs, le scroll n'est jamais bloqué.
 */
function createBrush(frame, img, canvas) {
    const ctx = canvas.getContext('2d');
    const mask = document.createElement('canvas');
    const m = mask.getContext('2d');
    let enabled = false;
    let running = false;
    let w = 0;
    let h = 0;
    let cover = { dx: 0, dy: 0, dw: 0, dh: 0 };
    let painted = false;
    let active = false;
    let dirty = false;
    let hold = 0;
    let fading = 0;
    let last = null;
    let touchId = null;

    // Canvas à la taille de la toile ; l'image y est calée comme en object-fit: cover.
    const size = () => {
        const rect = frame.getBoundingClientRect();
        if (!rect.width) {
            return;
        }
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        w = Math.round(rect.width * dpr);
        h = Math.round(rect.height * dpr);
        canvas.width = w;
        canvas.height = h;
        mask.width = w;
        mask.height = h;
        const iw = img.naturalWidth || 1;
        const ih = img.naturalHeight || 1;
        const s = Math.max(w / iw, h / ih);
        cover = { dw: iw * s, dh: ih * s, dx: (w - iw * s) / 2, dy: (h - ih * s) / 2 };
        painted = false;
        dirty = true;
        start();
    };

    // Un trait aux bords irréguliers : un passage principal adouci et quelques poils plus fins.
    const stroke = (a, b) => {
        const r = Math.min(w, h) * 0.075;
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        m.save();
        m.lineCap = 'round';
        m.lineJoin = 'round';
        m.strokeStyle = '#000';
        m.shadowColor = 'rgba(0,0,0,.85)';
        m.shadowBlur = r * 0.45;
        m.globalAlpha = 0.95;
        m.lineWidth = r * 1.45;
        m.beginPath();
        m.moveTo(a[0], a[1]);
        m.lineTo(b[0] + 0.01, b[1]);
        m.stroke();
        m.shadowBlur = 0;
        for (let i = 0; i < 14; i += 1) {
            const o = (Math.random() - 0.5) * r * 2.4;
            m.globalAlpha = 0.2 + Math.random() * 0.55;
            m.lineWidth = r * (0.04 + Math.random() * 0.16);
            m.beginPath();
            m.moveTo(a[0] + nx * o, a[1] + ny * o);
            m.lineTo(b[0] + nx * o + 0.01, b[1] + ny * o);
            m.stroke();
        }
        m.restore();
        painted = true;
        fading = 0;
        dirty = true;
    };

    const compose = () => {
        ctx.clearRect(0, 0, w, h);
        if (!enabled || !painted) {
            return;
        }
        ctx.drawImage(mask, 0, 0);
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(img, cover.dx, cover.dy, cover.dw, cover.dh);
        ctx.globalCompositeOperation = 'source-over';
    };

    // Boucle sur le ticker de GSAP, seulement tant qu'il y a de la couleur à afficher ou à effacer.
    const loop = (time, deltaTime) => {
        const dt = Math.min(0.05, deltaTime / 1000);
        if (painted && !active) {
            if (hold > 0) {
                hold -= dt;
            } else {
                fading += dt;
                m.save();
                m.globalCompositeOperation = 'destination-out';
                m.globalAlpha = Math.min(1, dt * 3.2);
                m.fillRect(0, 0, w, h);
                m.restore();
                if (fading > FADE) {
                    m.clearRect(0, 0, w, h);
                    painted = false;
                }
                dirty = true;
            }
        }
        if (dirty) {
            compose();
            dirty = false;
        }
        if (!painted && !active) {
            running = false;
            gsap.ticker.remove(loop);
        }
    };

    function start() {
        if (!running) {
            running = true;
            gsap.ticker.add(loop);
        }
    }

    const toCanvas = (point) => {
        const rect = canvas.getBoundingClientRect();

        return [((point.clientX - rect.left) / rect.width) * w, ((point.clientY - rect.top) / rect.height) * h];
    };

    const paintAt = (point) => {
        if (!w) {
            return;
        }
        const p = toCanvas(point);
        stroke(last || p, p);
        last = p;
        active = true;
        start();
    };

    const release = (delay) => {
        active = false;
        last = null;
        hold = delay;
    };

    // Souris
    frame.addEventListener('pointermove', (event) => {
        if (enabled && event.pointerType === 'mouse') {
            paintAt(event);
        }
    });
    frame.addEventListener('pointerleave', (event) => {
        if (event.pointerType === 'mouse' && active) {
            release(0);
        }
    });

    // Doigt (et stylet)
    const own = (list) => {
        for (let i = 0; i < list.length; i += 1) {
            if (list[i].identifier === touchId) {
                return list[i];
            }
        }

        return null;
    };
    frame.addEventListener('touchstart', (event) => {
        if (!enabled || touchId !== null) {
            return;
        }
        const touch = event.changedTouches[0];
        touchId = touch.identifier;
        last = null;
        paintAt(touch);
    }, { passive: true });
    frame.addEventListener('touchmove', (event) => {
        const touch = touchId === null ? null : own(event.changedTouches);
        if (touch) {
            paintAt(touch);
        }
    }, { passive: true });
    const lift = (event) => {
        if (touchId !== null && own(event.changedTouches)) {
            touchId = null;
            release(TOUCH_HOLD);
        }
    };
    frame.addEventListener('touchend', lift, { passive: true });
    frame.addEventListener('touchcancel', lift, { passive: true });

    if (img.complete) {
        size();
    } else {
        img.addEventListener('load', size, { once: true });
    }
    if ('ResizeObserver' in window) {
        new ResizeObserver(size).observe(frame);
    } else {
        window.addEventListener('resize', size);
    }

    return {
        enable(on) {
            enabled = on;
            active = false;
            last = null;
            touchId = null;
            painted = false;
            if (w) {
                m.clearRect(0, 0, w, h);
            }
            dirty = true;
            start();
        },
    };
}
