import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { REDUCE, cssVar } from './motion.js';

/**
 * Fond noir / blanc piloté par les sections : chaque section porte data-bg="light" ou "dark".
 * Quand elle passe au milieu de l'écran, --bg et --fg basculent en fondu sur <html> ;
 * tout ce qui utilise ces tokens (texte, filets, boutons) suit.
 */
export function initTheme() {
    const paper = cssVar('--paper', '#ffffff');
    const ink = cssVar('--ink', '#0b0b0b');
    const snow = cssVar('--snow', '#f4f4f1');
    const themes = {
        light: { '--bg': paper, '--fg': ink },
        dark: { '--bg': ink, '--fg': snow },
    };
    let current = 'light';

    const apply = (name) => {
        if (name === current || !themes[name]) {
            return;
        }
        current = name;
        gsap.to(document.documentElement, { ...themes[name], duration: REDUCE ? 0 : 0.8, ease: 'power2.inOut', overwrite: true });
    };

    gsap.utils.toArray('[data-bg]').forEach((section) => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 50%',
            end: 'bottom 50%',
            onToggle: (self) => {
                if (self.isActive) {
                    apply(section.dataset.bg);
                }
            },
        });
    });
}
