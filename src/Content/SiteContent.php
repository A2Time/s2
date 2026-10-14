<?php

namespace App\Content;

/**
 * Données communes à toutes les pages : navbar, menu plein écran, réseaux, contact.
 *
 * Exposées dans Twig par la variable globale « site » (voir config/packages/twig.yaml),
 * par exemple {{ site.navLinks }} ou {{ site.emails }}.
 *
 * Les liens pointent volontairement vers « # » : remplacez-les par vos routes
 * (path('app_...')) ou vos URL quand les pages existeront.
 */
final class SiteContent
{
    public function name(): string
    {
        return 'S²';
    }

    /**
     * Liens de la navbar (comme sur noth.in : trois liens, tous en « # »).
     *
     * @return list<array{label: string, href: string}>
     */
    public function navLinks(): array
    {
        return [
            ['label' => 'projets', 'href' => '#projets'],
            ['label' => 'agence', 'href' => '#studio'],
            ['label' => 'contact', 'href' => '#contact'],
        ];
    }

    /**
     * Liens du menu plein écran.
     *
     * @return list<array{label: string, href: string}>
     */
    public function menuLinks(): array
    {
        return [
            ['label' => 'projets', 'href' => '#projets'],
            ['label' => 'agence', 'href' => '#studio'],
            ['label' => 'services', 'href' => '#services'],
            ['label' => 'processus', 'href' => '#processus'],
            ['label' => 'contact', 'href' => '#contact'],
        ];
    }

    /**
     * Réseaux : « short » sert dans la navbar et le hero, « label » dans le footer.
     *
     * @return list<array{short: string, label: string, href: string}>
     */
    public function socials(): array
    {
        return [
            // ['short' => 'lkdn', 'label' => 'LinkedIn', 'href' => '#'],
            ['short' => 'insta', 'label' => 'Instagram', 'href' => '#'],
            // ['short' => 'bhnc', 'label' => 'Behance', 'href' => '#'],
        ];
    }

    /**
     * @return list<array{code: string, href: string}>
     */
    public function languages(): array
    {
        return [
            ['code' => 'fr', 'href' => '#'],
            ['code' => 'en', 'href' => '#'],
        ];
    }

    /** Lien des boutons « prendre rendez-vous » (Calendly, Cal.com…). */
    public function bookingUrl(): string
    {
        return 'https://calendly.com/contact-s2-consulting/30min';
    }

    /** Lien des boutons « écrivez-nous @ » (mailto: ou page contact). */
    public function writeUrl(): string
    {
        return 'mailto:contact@s2-consulting.fr';
    }

    /**
     * @return list<array{label: string, address: string, href: string}>
     */
    public function emails(): array
    {
        return [
            ['label' => 'général', 'address' => 'bonjour@s2.studio', 'href' => '#'],
            ['label' => 'nouveaux projets', 'address' => 'projets@s2.studio', 'href' => '#'],
            ['label' => 'carrières', 'address' => 'carrieres@s2.studio', 'href' => '#'],
        ];
    }

    /**
     * @return list<string>
     */
    public function address(): array
    {
        return ['', '31000 Toulouse'];
    }

    public function hours(): string
    {
        return 'lun. → ven. · 9 h → 19 h';
    }

    public function foundedYear(): int
    {
        return 2026;
    }
}
