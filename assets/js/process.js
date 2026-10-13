import { gsap } from 'gsap';

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
