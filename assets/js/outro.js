import { gsap } from 'gsap';
import { getLenis } from './smooth-scroll.js';

/**
 * Conclusion : les deux images grandissent et se recalent en entrant à l'écran ;
 * le bandeau « nous sommes S² » défile, plus vite quand on scrolle, dans le sens du scroll.
 */
export function initOutro() {
    gsap.utils.toArray('.outro__img').forEach((el, i) => {
        gsap.fromTo(el, { scale: 0.55, xPercent: i ? -22 : 22, yPercent: i ? 30 : -12 }, {
            scale: 1,
            xPercent: 0,
            yPercent: 0,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom 45%', scrub: true },
        });
    });

    const track = document.querySelector('.marquee__track');
    if (!track) {
        return;
    }

    // La piste contient deux moitiés identiques : on boucle sur la largeur d'une moitié.
    const half = track.children.length / 2;
    let loop = 0;
    let x = 0;
    let direction = -1;
    // const measure = () => {
    //     loop = track.children[half].offsetLeft - track.children[0].offsetLeft;
    // };
    // measure();
    // window.addEventListener('resize', measure);

    gsap.ticker.add((time, deltaTime) => {
        if (!loop) {
            return;
        }
        const lenis = getLenis();
        const velocity = lenis ? Math.abs(lenis.velocity) : 0;
        if (lenis && lenis.direction) {
            direction = lenis.direction > 0 ? -1 : 1;
        }
        x += direction * (0.06 + Math.min(velocity * 0.02, 0.6)) * deltaTime;
        if (x <= -loop) {
            x += loop;
        }
        if (x > 0) {
            x -= loop;
        }
        track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    });
}
