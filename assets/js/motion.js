/**
 * Préférences de mouvement, point de rupture et couleurs partagés par les modules.
 */
export const DESKTOP = '(min-width: 900px)';
export const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const MOTION = !REDUCE;
export const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const isDesktop = () => window.matchMedia(DESKTOP).matches;
export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Lit un token CSS de :root (assets/styles/app.css). */
export function cssVar(name, fallback = '') {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** Couleurs d'accent, lues dans les tokens CSS pour n'avoir qu'une seule source. */
export function palette() {
    return {
        blue: cssVar('--blue', '#2b3cff'),
        pink: cssVar('--pink', '#ff4f9a'),
        lime: cssVar('--lime', '#c6f432'),
        orange: cssVar('--orange', '#ff6a1a'),
        lilac: cssVar('--lilac', '#a08cff'),
    };
}
