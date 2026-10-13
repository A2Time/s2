<?php

namespace App\Content;

/**
 * Contenu de la page d'accueil : toutes les listes affichées en boucle dans templates/home/.
 *
 * Images : chaque « image » est soit un chemin AssetMapper relatif à assets/
 * (ex. 'images/services/architecture.jpg'), soit une URL absolue
 * (ex. 'https://picsum.photos/seed/s2/1000/1250'). Il suffit de changer la valeur.
 */
final class HomeContent
{
    /**
     * @return array<string, mixed>
     */
    public function all(): array
    {
        return [
            'reel' => $this->reel(),
            'studio_images' => $this->studioImages(),
            'disciplines' => $this->disciplines(),
            'services' => $this->services(),
            'projects' => $this->projects(),
            'projects_total' => 8,
            'steps' => $this->steps(),
            'outro_images' => $this->outroImages(),
        ];
    }

    /**
     * Toile de la section manifeste, en noir et blanc au départ (effets : assets/js/reel.js).
     * Le slogan noir est posé en haut de l'image : choisissez une image claire dans sa partie haute.
     * Une image carrée d'environ 2000 px convient à tous les écrans.
     *
     * @return array{image: string, alt: string, label: string}
     */
    public function reel(): array
    {
        return [
            'image' => 'images/studio/nik-cq0bIDFis48-unsplash.jpg',
            'alt' => 'Peinture abstraite au couteau : aplats bleus, blancs et orange sur toile',
            'label' => 'la toile · 2026',
        ];
    }

    /**
     * Images de la section studio. Leur position finale est réglée dans
     * assets/styles/sections/studio.css (une règle par image, :nth-child).
     *
     * @return list<array{image: string, alt: string}>
     */
    public function studioImages(): array
    {
        return [
            ['image' => 'images/studio/annie-spratt-0ahLNMHj-Cs-unsplash.jpg', 'alt' => 'Sphère rose brillante posée sur un fond gris clair'],
            ['image' => 'images/studio/carolin-thiergart-Q0GCvjG1ioA-unsplash.jpg', 'alt' => 'Coussin carré orange sur fond blanc'],
            ['image' => 'images/studio/egor-komarov-tC2r5C9Y6Og-unsplash.jpg', 'alt' => 'Mur de béton percé d’une arche, lumière rasante'],
            ['image' => 'images/studio/evie-s-NB0_Y_GMB4A-unsplash.jpg', 'alt' => 'Anneau bleu gonflable sur fond lilas'],
            ['image' => 'images/studio/farnaz-kohankhaki-m6GmxT5JsJw-unsplash.jpg', 'alt' => 'Gélule vert acide sur fond noir'],
        ];
    }

    /**
     * @return list<string>
     */
    public function disciplines(): array
    {
        return [
            'Identités visuelles',
            'Plateformes de marque',
            'Sites et landing pages',
            'Applications web & mobiles',
            'Boutiques en ligne',
            'Design systems',
        ];
    }

    /**
     * Section « savoir-faire » (inspirée de Santalarch).
     *
     * @return list<array{name: string, description: string, image: string, alt: string}>
     */
    public function services(): array
    {
        return [
            [
                'name' => 'Branding',
                'description' => 'Plateformes de marque, identités visuelles et chartes pensées pour durer et se décliner partout.',
                'image' => 'images/services/marcin-sajur-8K-7fnY0SYA-unsplash.jpg',
                'alt' => 'Mur clair percé d’une arche, lumière de fin de journée',
            ],
            [
                'name' => 'Stratégie digitale',
                'description' => 'Audit, positionnement, parcours et feuille de route : savoir quoi construire, pour qui et dans quel ordre.',
                'image' => 'images/services/pexels-marius-gabriel-241207761-16533085.jpg',
                'alt' => 'Intérieur rosé baigné de lumière',
            ],
            // [
            //     'name' => 'Sites marketing',
            //     'description' => 'Sites vitrines et pages de campagne rapides, bien référencés et pensés pour convertir.',
            //     'image' => 'images/services/identite.jpg',
            //     'alt' => 'Coussin carré bleu sur fond vert acide',
            // ],
            [
                'name' => 'SaaS, apps & sites',
                'description' => 'Applications web et mobiles, plateformes SaaS et sites sur mesure, du prototype à la mise en production.',
                'image' => 'images/studio/0x3d-xdAMJw7a4Dw-unsplash.jpg',
                'alt' => 'Deux sphères rose et orange sur fond rose',
            ],
            [
                'name' => 'E-commerce',
                'description' => 'Boutiques en ligne qui racontent la marque autant qu’elles vendent, du catalogue au paiement.',
                'image' => 'images/services/olumide-adekunle-LlsExicCGMQ-unsplash.jpg',
                'alt' => 'Anneau lilas sur fond noir',
            ],
            [
                'name' => 'Sites d’expérience',
                'description' => 'Sites immersifs, animations et interactions qui font d’une visite un moment dont on se souvient.',
                'image' => 'images/services/shubham-dhage-0RXyjTZM67U-unsplash.jpg',
                'alt' => 'Mur sombre et lumière froide, sphère vert acide',
            ],
        ];
    }

    /**
     * @return list<array{name: string, description: string, category: string, year: int, href: string, image: string}>
     */
    public function projects(): array
    {
        return [
            ['name' => 'Hedi Training', 'description' => 'Une maison suspendue entre lumière et béton.', 'category' => 'SaaS', 'year' => 2026, 'href' => '#', 'image' => 'images/projets/hedi.png'],
            ['name' => 'WhyNot Studio', 'description' => 'Identité et signalétique d’un hôtel de bord de mer.', 'category' => 'E-commerce', 'year' => 2026, 'href' => '#', 'image' => 'images/projets/whynot.png'],
            ['name' => 'Prestige Piscine', 'description' => 'Un showroom pensé comme une page blanche.', 'category' => 'Site', 'year' => 2025, 'href' => '#', 'image' => 'images/projets/prestige.png'],
            ['name' => 'DropTheKeys', 'description' => 'Lancement d’une maison de parfum indépendante.', 'category' => 'Site', 'year' => 2024, 'href' => '#', 'image' => 'images/projets/drop2.png'],
            // ['name' => 'Écho', 'description' => 'Une expérience digitale qui se touche presque.', 'category' => 'digital', 'year' => 2024, 'href' => '#', 'image' => 'images/projets/echo.jpg'],
        ];
    }

    /**
     * Section processus (inspirée de Santalarch) : textes en lorem, à remplacer.
     *
     * @return list<array{title: string, duration: string, text: string, scope: list<string>}>
     */
    public function steps(): array
    {
        return [
            [
                'title' => 'Découverte & stratégie',
                'duration' => '1 à 2 semaines',
                'text' => 'Ateliers, audit de l’existant et analyse de la concurrence pour fixer les objectifs, les cibles et les indicateurs de réussite.',
                'scope' => ['Ateliers de cadrage', 'Audit de marque et digital', 'Analyse concurrentielle', 'Personas et parcours', 'Objectifs et indicateurs'],
            ],
            [
                'title' => 'Session d’alignement',
                'duration' => '1 journée',
                'text' => 'Une journée avec vos équipes pour valider le positionnement, les priorités, le budget et le planning',
                'scope' => ['Positionnement', 'Priorités', 'Feuille de route ', 'Budget et planning'],
            ],
            [
                'title' => 'Identité & design system',
                'duration' => '3 à 4 semaines',
                'text' => 'Plateforme de marque, identité visuelle et design system : les règles qui donnent sa cohérence à chaque écran.',
                'scope' => ['Plateforme de marque', 'Logo et identité visuelle', 'Charte graphique', 'Design system', 'Ton et messages'],
            ],
            [
                'title' => 'Design & développement',
                'duration' => '6 à 16 semaines',
                'text' => 'Maquettes, prototype testé avec de vrais utilisateurs, puis développement par itérations, avec une version à valider à chaque étape',
                'scope' => ['UX et maquettes', 'Prototype testé', 'Développement front et back', 'Intégrations : paiement, CRM, API', 'Tests et recette'],
            ],
            [
                'title' => 'Lancement',
                'duration' => '1 à 2 semaines',
                'text' => 'Mise en ligne, référencement, mesure d’audience et prise en main de l’outil par vos équipes.',
                'scope' => [
                                'Mise en production',
                                'SEO technique',
                                'Mesure d’audience',
                                'Formation',
                                'Documentation',
                            ],
                          
            ],
            [
                'title' => 'Positionnement',
                'duration' => 'en continu',
                'text' => 'Optimisation, campagnes et nouvelles fonctionnalités : la marque et le produit continuent d’évoluer après le lancement.',
                'scope' => ['Maintenance et hébergement', 'Optimisation des conversions', 'Campagnes ', 'Nouvelles fonctionnalités', 'Suivi des indicateurs'],
            ],
        ];
    }

    /**
     * @return list<array{image: string, alt: string}>
     */
    public function outroImages(): array
    {
        return [
            ['image' => 'images/studio/hekuran-avdili-XeERG-TpSGc-unsplash.jpg', 'alt' => 'Intérieur rosé, arche et sphère bleue'],
            ['image' => 'images/studio/heather-green-P1_zvYcdVmA-unsplash.png', 'alt' => 'Sphères bleue et vert acide sur fond sable'],
        ];
    }
}
