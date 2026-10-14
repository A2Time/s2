import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DESKTOP, MOTION } from './motion.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { initNav } from './nav.js';
import { initHeroFrames } from './hero-frames.js';
import { initHeroPitch } from './hero-pitch.js';
import { initReel } from './reel.js';
import { initStudio } from './studio.js';
import { initServices } from './services.js';
import { initProcess, initProcessAccordion } from './process.js';
import { initWorks } from './works.js';
import { initOutro } from './outro.js';
import { initTextFill } from './text-fill.js';
import { initTheme } from './theme.js';

gsap.registerPlugin(ScrollTrigger);

/*
 * Hero : tout se joue au scroll, pendant que la section est épinglée sur HERO_SCROLL
 * (1000 % = 10 hauteurs d'écran). Chaque phase est [début, fin], en part de ce scroll (0 → 1) :
 * - HERO_PLAY  : les images défilent en plein écran ;
 * - HERO_TYPE  : l'accroche s'écrit lettre par lettre, en grand au centre ;
 * - HERO_PITCH : quand le S² apparaît, elle rétrécit et rejoint sa place ;
 * - HERO_ZOOM  : recul (zoom out) : la vidéo rentre dans les lettres du S² ;
 * - HERO_FADE  : la vidéo s'efface, il reste le S² noir sur la page blanche ;
 * - HERO_FOLD  : le S² se plie en escalier ;
 * - HERO_SLIDE : le S² descend la marche, de STAIRS_SLIDE (en em) ;
 * - HERO_EXIT  : il continue de descendre (STAIRS_EXIT) et sort de l'écran en bas à gauche.
 * Footer : le S² revient quand on arrive en bas de la page. Pendant FOOTER_LAND, il arrive d'en haut
 * à gauche et descend un escalier tourné vers la droite (depuis FOOTER_SLIDE) ; ensuite il se déplie
 * et se pose droit en bas à gauche, comme le S² du hero.
 */
const HERO_SCROLL = '+=1000%';
const HERO_PLAY = [0, 0.6];
const HERO_TYPE = [0, 0.2];
const HERO_PITCH = [0.5, 0.66];
const HERO_ZOOM = [0.46, 0.68];
const HERO_FADE = [0.68, 0.72];
const HERO_FOLD = [0.73, 0.81];
const HERO_SLIDE = [0.79, 0.88];
const HERO_EXIT = [0.87, 0.99];
const STAIRS_SLIDE = 0.3;
const STAIRS_EXIT = 0.8;
const FOOTER_SLIDE = -1.2;
const FOOTER_LAND = 0.65;

/*
 * L'ordre compte : les sections épinglées (pin) sont créées d'abord, de haut en bas,
 * puis les déclencheurs simples, pour que ScrollTrigger mesure les bonnes positions.
 */
function start() {
    ScrollTrigger.config({ ignoreMobileResize: true });

    initSmoothScroll();
    initNav();

    // Hero (assets/js/hero-frames.js pour les images, hero.css pour l'escalier).
    // scrub: 1 lisse l'animation : elle rattrape le scroll en 1 seconde.
    const mark = document.querySelector('[data-hero-mark]');
    const showStairs = () => mark && gsap.set(mark, { '--fold': 1 });
    let heroTimeline = null;
    const hero = initHeroFrames({
        // Aucune image trouvée : on retire l'épinglage, le S² s'affiche directement en escalier.
        onFail: () => {
            heroTimeline?.scrollTrigger?.kill(true);
            heroTimeline?.kill();
            showStairs();
            ScrollTrigger.refresh();
        },
    });
    if (MOTION && hero) {
        const pitch = initHeroPitch();
        const state = { play: 0, zoom: 0, fade: 0, type: 0, move: 0 };
        const span = ([from, to]) => to - from;
        heroTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: HERO_SCROLL,
                pin: '.hero__pin',
                scrub: 1,
                refreshPriority: 10,
            },
            onUpdate: () => {
                hero.update(state);
                pitch?.update(state);
            },
        })
            .to(state, { play: 1, duration: span(HERO_PLAY), ease: 'none' }, HERO_PLAY[0])
            .to(state, { type: 1, duration: span(HERO_TYPE), ease: 'none' }, HERO_TYPE[0])
            .to(state, { move: 1, duration: span(HERO_PITCH), ease: 'power2.inOut' }, HERO_PITCH[0])
            .to(state, { zoom: 1, duration: span(HERO_ZOOM), ease: 'power2.inOut' }, HERO_ZOOM[0])
            .to(state, { fade: 1, duration: span(HERO_FADE), ease: 'none' }, HERO_FADE[0])
            .to(mark, { '--fold': 1, duration: span(HERO_FOLD), ease: 'power2.inOut' }, HERO_FOLD[0])
            .to(mark, { '--slide': STAIRS_SLIDE, duration: span(HERO_SLIDE), ease: 'power1.inOut' }, HERO_SLIDE[0])
            .to(mark, { '--slide': STAIRS_EXIT, '--away': 1, '--rise': -0.7, duration: span(HERO_EXIT), ease: 'power2.in' }, HERO_EXIT[0])
            .set({}, {}, 1);
        // accroche : vide et centrée dès le chargement ; recalée à chaque recalcul de la page
        pitch?.update(state);
        ScrollTrigger.addEventListener('refreshInit', () => pitch?.measure());
    } else if (MOTION) {
        showStairs();
    }

    initReel();

    if (MOTION) {
        // Effets épinglés réservés au bureau ; GSAP les retire et les recrée en franchissant 900px.
        gsap.matchMedia().add(DESKTOP, () => {
            initStudio();
            const stopServices = initServices();
            initProcess();

            return () => stopServices?.();
        });

        initWorks();
        initOutro();
        initTextFill();

        // Footer, créé en dernier (bas de page) : le S² arrive d'en haut à gauche en descendant
        // l'escalier vers la droite, puis se déplie et se pose droit en bas à gauche.
        const footerMark = document.querySelector('[data-footer-mark]');
        if (footerMark) {
            gsap.set(footerMark, { '--fold': 1 });
            gsap.timeline({
                scrollTrigger: {
                    trigger: footerMark,
                    start: 'top bottom',
                    endTrigger: '.footer',
                    end: 'bottom bottom',
                    scrub: 1,
                },
            })
                .fromTo(footerMark,
                    { '--rise': 1.1, '--away': 0.3, '--slide': FOOTER_SLIDE },
                    { '--rise': 0, '--away': 0, '--slide': 0, duration: FOOTER_LAND, ease: 'none' }, 0)
                .to(footerMark, { '--fold': 0, duration: 1 - FOOTER_LAND, ease: 'power2.inOut' }, FOOTER_LAND);
        }
    }

    initProcessAccordion();
    initTheme();
    ScrollTrigger.refresh();
}

export function boot() {
    if (!MOTION) {
        document.documentElement.classList.add('no-motion');
    }

    // On attend les polices : le découpage en lignes du texte en dépend.
    const fonts = document.fonts?.ready ?? Promise.resolve();
    Promise.race([fonts, new Promise((resolve) => setTimeout(resolve, 2000))]).then(start);
}
