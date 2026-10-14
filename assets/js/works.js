import { gsap } from 'gsap';
import { FINE } from './motion.js';

/**
 * Projets : les lettres « p r o j e t s » montent au scroll ;
 * à la souris, un aperçu suit le curseur et change d'image par un volet à chaque ligne survolée.
 */
export function initWorks() {
    if (!document.querySelector('.works__letters')) {
        return; // page sans section projets (pages légales)
    }

    gsap.fromTo('.works__letters span', { yPercent: 100 }, {
        yPercent: 0,
        ease: 'none',
        stagger: 0.08,
        scrollTrigger: { trigger: '.works__letters', start: 'top 95%', end: 'top 45%', scrub: true },
    });

    if (!FINE) {
        return;
    }

    const wrap = document.querySelector('.works__wrap');
    const preview = document.querySelector('.works__preview');
    if (!wrap || !preview) {
        return;
    }

    const figures = gsap.utils.toArray('figure', preview);
    const xTo = gsap.quickTo(preview, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(preview, 'y', { duration: 0.6, ease: 'power3' });
    let active = -1;
    let z = 1;

    wrap.addEventListener('pointermove', (event) => {
        const rect = wrap.getBoundingClientRect();
        xTo(event.clientX - rect.left + 24);
        yTo(event.clientY - rect.top - preview.offsetHeight / 2);
    });
    wrap.addEventListener('pointerenter', () => gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power3.out' }));
    wrap.addEventListener('pointerleave', () => {
        gsap.to(preview, { autoAlpha: 0, scale: 0.9, duration: 0.3 });
        active = -1;
    });

    wrap.querySelectorAll('.work').forEach((row, i) => {
        row.addEventListener('pointerenter', () => {
            if (i === active || !figures[i]) {
                return;
            }
            active = i;
            gsap.set(figures[i], { zIndex: ++z });
            gsap.fromTo(figures[i], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power3.out', overwrite: true });
        });
    });
}
