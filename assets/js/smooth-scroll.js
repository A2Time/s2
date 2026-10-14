import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION } from './motion.js';

let lenis = null;

/**
 * Défilement doux avec Lenis, synchronisé avec GSAP/ScrollTrigger.
 * Désactivé si l'utilisateur demande moins d'animations.
 */
export function initSmoothScroll() {
    if (!MOTION) {
        return null;
    }

    lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return lenis;
}

export const getLenis = () => lenis;

export function scrollToY(y, duration = 1.4) {
    if (lenis) {
        lenis.scrollTo(y, { duration });
    } else {
        window.scrollTo({ top: y, behavior: 'auto' });
    }
}

/**
 * Fait défiler jusqu'à une section. Une section épinglée (pin GSAP) est mesurée par son « pin-spacer »,
 * qui reste à sa place dans la page même quand la section est fixée à l'écran.
 */
export function scrollToElement(el, immediate = false) {
    const box = el.closest('.pin-spacer') ?? el;
    const y = Math.max(0, box.getBoundingClientRect().top + window.scrollY);
    if (lenis) {
        lenis.resize(); // la page a pu s'allonger (épinglages) depuis la dernière mesure de Lenis
        lenis.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: 1.6, force: true });
    } else {
        window.scrollTo({ top: y, behavior: 'auto' });
    }
}
