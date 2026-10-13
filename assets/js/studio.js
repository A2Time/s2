import { gsap } from 'gsap';

/**
 * Studio (bureau) : les images partent empilées et inclinées au centre de la scène,
 * puis rejoignent leur place et leur taille finales (studio.css) pendant que la section est épinglée.
 */
export function initStudio() {
    const stage = document.querySelector('.studio__stage');
    if (!stage) {
        return;
    }

    const images = gsap.utils.toArray('.studio__img', stage);
    const rotations = [-7, 5, -3, 8, -5];

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: '+=150%',
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            refreshPriority: 8,
        },
    });

    images.forEach((el, i) => {
        tl.fromTo(el, {
            x: () => stage.clientWidth / 2 - (el.offsetLeft + el.offsetWidth / 2),
            y: () => stage.clientHeight / 2 - (el.offsetTop + el.offsetHeight / 2),
            scale: () => (stage.clientWidth * 0.26) / el.offsetWidth,
            rotation: rotations[i % rotations.length],
        }, { x: 0, y: 0, scale: 1, rotation: 0, ease: 'power3.inOut', duration: 1 }, i * 0.08);
    });

    tl.to({}, { duration: 0.3 });
}
