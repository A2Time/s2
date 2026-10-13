import { gsap } from 'gsap';
import { scrollToY } from './smooth-scroll.js';

/**
 * Services (bureau) : section épinglée, un service par cran de scroll.
 * - l'intitulé actif se remplit de blanc de gauche à droite (clip-path de .svc__fill),
 *   le précédent s'efface vers la droite ;
 * - l'image suivante monte par un volet, la précédente glisse légèrement ;
 * - la description et le compteur 01 / 06 suivent.
 * Un clic sur un intitulé fait défiler jusqu'à lui. Retourne une fonction de nettoyage.
 */
export function initServices() {
    const stage = document.querySelector('.services__stage');
    if (!stage) {
        return null;
    }

    const items = gsap.utils.toArray('.svc', stage);
    const fills = items.map((item) => item.querySelector('.svc__fill'));
    const figures = gsap.utils.toArray('.svc-media figure', stage);
    const descriptions = gsap.utils.toArray('.svc-desc', stage);
    const current = stage.querySelector('[data-svc-current]');
    const n = items.length;
    if (n < 2) {
        return null;
    }

    gsap.set(fills, { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set(fills[0], { clipPath: 'inset(0% 0% 0% 0%)' });
    gsap.set(figures, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(figures[0], { clipPath: 'inset(0% 0% 0% 0%)' });
    gsap.set(descriptions, { autoAlpha: 0, y: 24 });
    gsap.set(descriptions[0], { autoAlpha: 1, y: 0 });

    const tail = 0.3;
    const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: () => `+=${(n - 1) * window.innerHeight * 0.8}`,
            pin: true,
            scrub: true,
            refreshPriority: 7,
            onUpdate: (self) => {
                const index = Math.min(n - 1, Math.max(0, Math.round(self.progress * (n - 1 + tail) - 0.1)));
                current.textContent = String(index + 1).padStart(2, '0');
            },
        },
    });

    for (let i = 1; i < n; i++) {
        const at = i - 1;
        const image = figures[i].querySelector('img');
        const previous = figures[i - 1].querySelector('img');

        tl.to(fills[i - 1], { clipPath: 'inset(0% 0% 0% 100%)', duration: 0.6 }, at + 0.2)
            .fromTo(fills[i], { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6 }, at + 0.3)
            .fromTo(figures[i], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power2.inOut' }, at + 0.15)
            .fromTo(image, { scale: 1.35, yPercent: 8 }, { scale: 1, yPercent: 0, duration: 0.8, ease: 'power2.out' }, at + 0.15)
            .to(previous, { scale: 1.12, yPercent: -6, duration: 0.8 }, at + 0.15)
            .to(descriptions[i - 1], { autoAlpha: 0, y: -24, duration: 0.25 }, at + 0.25)
            .fromTo(descriptions[i], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.25 }, at + 0.55);
    }
    tl.to({}, { duration: tail });

    const handlers = items.map((item, k) => {
        const onClick = () => {
            const st = tl.scrollTrigger;
            scrollToY(st.start + (st.end - st.start) * (k / (n - 1 + tail)) + 2);
        };
        item.addEventListener('click', onClick);

        return () => item.removeEventListener('click', onClick);
    });

    return () => handlers.forEach((off) => off());
}
