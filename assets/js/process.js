import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Processus (bureau) : les étapes collent en haut de l'écran (CSS sticky) ;
 * quand la suivante arrive, le contenu de la précédente s'estompe et recule légèrement.
 */
export function initProcess() {
    const steps = gsap.utils.toArray('.step');

    steps.forEach((step, i) => {
        if (i === steps.length - 1) {
            return;
        }
        gsap.to(step.querySelector('.step__body'), {
            opacity: 0.15,
            scale: 0.97,
            ease: 'none',
            scrollTrigger: {
                trigger: steps[i + 1],
                start: 'top bottom',
                end: 'top 35%',
                scrub: true,
            },
        });
    });
}

/**
 * Processus (mobile) : accordéon. Le bouton + (ou un appui sur l'en-tête) déroule l'étape ;
 * l'animation est en CSS (process.css). Sur bureau, les boutons sont cachés et tout reste ouvert.
 */
export function initProcessAccordion() {
    const mobile = window.matchMedia('(max-width: 899px)');

    document.querySelectorAll('.step').forEach((step) => {
        const button = step.querySelector('.step__plus');
        const panel = step.querySelector('.step__panel');
        if (!button || !panel) {
            return;
        }
        const title = step.querySelector('.step__title')?.textContent.trim() ?? '';

        const toggle = () => {
            if (!mobile.matches) {
                return;
            }
            const open = !step.classList.contains('is-open');
            step.classList.toggle('is-open', open);
            button.setAttribute('aria-expanded', String(open));
            button.setAttribute('aria-label', `${open ? 'Masquer' : 'Afficher'} l’étape ${title}`);
        };

        button.addEventListener('click', (event) => {
            event.stopPropagation();
            toggle();
        });
        step.querySelector('.step__head').addEventListener('click', toggle);

        // la hauteur de la page change : les déclencheurs au scroll en dessous se recalent
        panel.addEventListener('transitionend', (event) => {
            if (event.propertyName === 'grid-template-rows') {
                ScrollTrigger.refresh();
            }
        });
    });
}
