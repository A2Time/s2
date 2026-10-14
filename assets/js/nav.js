import { getLenis, scrollToElement, scrollToY } from './smooth-scroll.js';

/**
 * Menu plein écran, liens « # », ancres vers les sections et bouton « retour en haut ».
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

    // Ancre d'une section présente sur cette page (« #projets », ou « /#contact » depuis une autre page) :
    // défilement doux au lieu du saut du navigateur. Sinon, le lien charge l'accueil (voir revealHash).
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href*="#"]');
        if (!link || link.getAttribute('href') === '#' || event.metaKey || event.ctrlKey || event.shiftKey) {
            return;
        }
        const url = new URL(link.href, location.href);
        const target = url.pathname === location.pathname && url.hash.length > 1 && document.getElementById(url.hash.slice(1));
        if (!target) {
            return;
        }
        event.preventDefault();
        history.replaceState(null, '', url.hash === '#top' ? location.pathname : url.hash);
        scrollToElement(target);
    });

    document.querySelectorAll('[data-top]').forEach((el) => {
        el.addEventListener('click', () => scrollToY(0, 2));
    });
}

/**
 * Arrivée sur l'accueil avec une ancre (« /#projets » depuis les mentions légales) : le navigateur a sauté
 * à la section avant que les épinglages GSAP n'allongent la page. Une fois tout mesuré, on s'y recale.
 */
export function revealHash() {
    const target = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) {
        requestAnimationFrame(() => scrollToElement(target, true));
    }
}
