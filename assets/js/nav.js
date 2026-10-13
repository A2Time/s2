import { getLenis, scrollToY } from './smooth-scroll.js';

/**
 * Menu plein écran, liens « # » et bouton « retour en haut ».
 */
export function initNav() {
    const root = document.documentElement;
    const button = document.querySelector('.nav__menu');
    const menu = document.getElementById('menu');

    if (button && menu) {
        const label = button.querySelector('.roll__in');
        menu.inert = true;

        const toggle = (open) => {
            root.classList.toggle('is-menu', open);
            button.setAttribute('aria-expanded', String(open));
            menu.setAttribute('aria-hidden', String(!open));
            menu.inert = !open;
            label.textContent = open ? 'fermer' : 'menu';
            label.dataset.text = label.textContent;

            const lenis = getLenis();
            if (lenis) {
                open ? lenis.stop() : lenis.start();
            }
        };

        button.addEventListener('click', () => toggle(!root.classList.contains('is-menu')));
        menu.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                toggle(false);
            }
        });
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && root.classList.contains('is-menu')) {
                toggle(false);
            }
        });
    }

    // Les liens sont en « # » pour l'instant : on évite le saut en haut de page.
    // À retirer quand les liens pointeront vers de vraies pages.
    document.addEventListener('click', (event) => {
        if (event.target.closest('a[href="#"]')) {
            event.preventDefault();
        }
    });

    document.querySelectorAll('[data-top]').forEach((el) => {
        el.addEventListener('click', () => scrollToY(0, 2));
    });
}
