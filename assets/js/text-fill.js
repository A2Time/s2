import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isDesktop } from './motion.js';

/**
 * Textes [data-fill] : découpés en lignes, chaque ligne passe du gris au noir
 * (ou du gris au blanc sur fond noir) de gauche à droite, au rythme du scroll.
 * Les lignes sont recalculées quand la largeur de la fenêtre change.
 */
let timelines = [];

function splitLines(el) {
    if (el.dataset.fillSource === undefined) {
        el.dataset.fillSource = el.innerHTML;
    } else {
        el.innerHTML = el.dataset.fillSource;
    }

    // 1. Un <span> par mot, en gardant les classes des éléments d'origine (ex. .serif)
    const tokens = [];
    (function walk(node, classes) {
        node.childNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
                child.textContent.split(/([ \t\n\r]+)/).forEach((part) => {
                    if (!part) {
                        return;
                    }
                    tokens.push(/^[ \t\n\r]+$/.test(part) ? { space: true } : { text: part, classes });
                });
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                if (child.tagName === 'BR') {
                    tokens.push({ br: true });
                } else {
                    walk(child, [classes, child.className].filter(Boolean).join(' '));
                }
            }
        });
    })(el, '');

    el.textContent = '';
    const words = [];
    tokens.forEach((token) => {
        if (token.space) {
            el.appendChild(document.createTextNode(' '));
        } else if (token.br) {
            el.appendChild(document.createElement('br'));
        } else {
            const span = document.createElement('span');
            span.textContent = token.text;
            if (token.classes) {
                span.className = token.classes;
            }
            el.appendChild(span);
            words.push(span);
        }
    });

    // 2. Regroupement des mots par ligne affichée
    const lines = [];
    let top = null;
    words.forEach((word) => {
        const y = word.offsetTop;
        if (top === null || Math.abs(y - top) > word.offsetHeight * 0.5) {
            lines.push([]);
            top = y;
        }
        lines[lines.length - 1].push(word);
    });

    el.textContent = '';

    return lines.map((lineWords) => {
        const line = document.createElement('span');
        const inner = document.createElement('span');
        line.className = 'fl';
        inner.className = 'fl__in';
        lineWords.forEach((word, i) => {
            if (i) {
                inner.appendChild(document.createTextNode(' '));
            }
            inner.appendChild(word);
        });
        line.appendChild(inner);
        el.appendChild(line);

        return inner;
    });
}

function build() {
    timelines.forEach((tl) => {
        tl.scrollTrigger?.kill();
        tl.kill();
    });
    timelines = [];

    document.querySelectorAll('[data-fill]').forEach((el) => {
        const lines = splitLines(el);
        // Dans la section studio épinglée, le remplissage suit la durée de l'épinglage.
        const pinnedStage = isDesktop() ? el.closest('.studio__stage') : null;
        const scrollTrigger = pinnedStage
            ? { trigger: pinnedStage, start: 'top top', end: '+=150%', scrub: true }
            : { trigger: el, start: 'top 85%', end: 'bottom 55%', scrub: true };

        const tl = gsap.timeline({ scrollTrigger });
        lines.forEach((line, i) => {
            tl.fromTo(line, { backgroundPosition: '100% 0%' }, { backgroundPosition: '0% 0%', ease: 'none', duration: 1 }, i * 0.75);
        });
        if (pinnedStage) {
            tl.to({}, { duration: lines.length * 0.35 });
        }
        timelines.push(tl);
    });
}

export function initTextFill() {
    build();

    let lastWidth = window.innerWidth;
    let timer = 0;
    window.addEventListener('resize', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (window.innerWidth === lastWidth) {
                return;
            }
            lastWidth = window.innerWidth;
            build();
            ScrollTrigger.refresh();
        }, 300);
    });
}
