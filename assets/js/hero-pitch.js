/**
 * Accroche du hero pendant la séquence d'images (le scroll est piloté par main.js) :
 * - elle s'écrit lettre par lettre, en grand au centre de l'écran (effet machine à écrire) ;
 * - quand le S² apparaît, elle rétrécit et rejoint sa place, au-dessus des boutons.
 * Sur mobile, les boutons et les étiquettes du bas descendent en bas de l'écran pendant l'écriture,
 * pour laisser la place au texte, et remontent avec lui.
 *
 * Le texte reste celui du template (_hero.html.twig) : chaque lettre est simplement enveloppée
 * dans un <span>, en gardant le <span class="serif"> de « au carré ».
 * Retourne { update({ type, move }) } (0 → 1), ou null.
 */
export function initHeroPitch() {
    const pitch = document.querySelector('[data-hero-pitch]');
    if (!pitch) {
        return null;
    }

    pitch.setAttribute('aria-label', pitch.textContent.replace(/\s+/g, ' ').trim());

    // Une <span> par lettre ; les espaces restent du texte pour que les lignes se coupent normalement.
    const chars = [];
    const walk = (node) => {
        [...node.childNodes].forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
                const frag = document.createDocumentFragment();
                [...child.textContent].forEach((c) => {
                    if (/\s/.test(c)) {
                        frag.append(c);
                    } else {
                        const span = document.createElement('span');
                        span.className = 'pitch__char';
                        span.setAttribute('aria-hidden', 'true');
                        span.textContent = c;
                        frag.append(span);
                        chars.push(span);
                    }
                });
                child.replaceWith(frag);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                walk(child);
            }
        });
    };
    walk(pitch);

    const caret = document.createElement('span');
    caret.className = 'pitch__caret';
    caret.setAttribute('aria-hidden', 'true');

    let shown = -1;
    let move = -1;

    const pinEl = pitch.closest('.hero__pin');
    const side = pinEl.querySelector('.hero__side');
    const mobile = window.matchMedia('(max-width: 899px)');

    // Mesures faites à la place normale (--pitch-p à 1) : décalage vers le centre de l'écran,
    // grossissement, et sur mobile, descente des boutons et étiquettes jusqu'en bas de l'écran.
    const measure = () => {
        const previous = pinEl.style.getPropertyValue('--pitch-p');
        pinEl.style.setProperty('--pitch-p', '1');
        const r = pitch.getBoundingClientRect();
        const pin = pinEl.getBoundingClientRect();
        const low = side ? side.getBoundingClientRect().bottom - pin.top : 0;
        pinEl.style.setProperty('--pitch-p', previous || '1');
        const scale = Math.max(1, Math.min(2.6, (pin.width * 0.8) / r.width));
        pitch.style.setProperty('--pitch-x', `${pin.width / 2 - (r.left - pin.left + r.width / 2)}px`);
        pitch.style.setProperty('--pitch-y', `${window.innerHeight / 2 - (r.top - pin.top + r.height / 2)}px`);
        pitch.style.setProperty('--pitch-s', scale);
        pinEl.style.setProperty('--hero-drop', mobile.matches ? `${Math.max(0, window.innerHeight - 16 - low)}px` : '0px');
    };

    measure();
    if ('ResizeObserver' in window) {
        new ResizeObserver(measure).observe(pinEl);
    } else {
        window.addEventListener('resize', measure);
    }

    return {
        measure,
        update({ type, move: m }) {
            const n = Math.round(Math.min(1, Math.max(0, type)) * chars.length);
            if (n !== shown) {
                shown = n;
                chars.forEach((c, i) => c.classList.toggle('is-hidden', i >= n));
                // le curseur suit la dernière lettre écrite
                if (n < chars.length) {
                    chars[n].before(caret);
                } else {
                    chars[n - 1].after(caret);
                }
            }
            const p = Math.min(1, Math.max(0, m));
            if (p !== move) {
                move = p;
                pinEl.style.setProperty('--pitch-p', p);
                caret.classList.toggle('is-off', p > 0);
            }
        },
    };
}
