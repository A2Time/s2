# S² · site vitrine

Site du studio S², en Symfony 7.4 LTS avec Twig et AssetMapper (sans Node ni Webpack).
Les animations utilisent GSAP 3.13 (ScrollTrigger) et Lenis 1.3 pour le défilement doux.

## Installation

Prérequis : PHP 8.2 ou plus, Composer 2 et, de préférence, la [Symfony CLI](https://symfony.com/download).

```bash
composer install
symfony serve -d
```

Le site est alors sur https://127.0.0.1:8000.

`composer install` installe Symfony puis lance `php bin/console importmap:install`, qui télécharge GSAP et Lenis dans `assets/vendor/` (dossier ignoré par Git).

Sans la Symfony CLI, faites pointer Apache, Nginx ou Caddy sur le dossier `public/`.

## Où modifier quoi

| Je veux changer… | Fichier |
| --- | --- |
| Les services, les projets, les étapes du processus, les images | `src/Content/HomeContent.php` |
| Les liens de la navbar et du menu, les réseaux, les e-mails, l'adresse | `src/Content/SiteContent.php` |
| Les phrases fixes (hero, manifeste, studio, conclusion, footer) | `templates/home/_*.html.twig`, `templates/partials/_footer.html.twig` |
| Une image | remplacez le fichier dans `assets/images/`, ou changez son chemin dans `HomeContent.php` (une URL `https://…` fonctionne aussi) |
| La vidéo du showreel | déposez-la dans `assets/videos/` puis renseignez `video` dans `HomeContent::reel()` |
| Les couleurs, les polices, les espacements | les variables en haut de `assets/styles/app.css` |
| La place des images de la section studio | `assets/styles/sections/studio.css` |
| Le fond noir ou blanc d'une section | l'attribut `data-bg="light"` ou `data-bg="dark"` de la section |

Tous les liens pointent vers `#`, comme demandé. Quand les pages existeront, remplacez-les par `path('nom_de_route')` ou par vos URL, puis supprimez le bloc qui bloque les liens `#` dans `assets/js/nav.js`.

Les couleurs d'accent sont aussi lues par le JavaScript (peinture du hero, showreel) : gardez-les au format `#rrggbb`.

## Structure

```
assets/
  app.js                 point d'entrée : importe les CSS et lance assets/js/main.js
  images/                images de remplacement (services, studio, projets, conclusion)
  js/
    main.js              ordre de démarrage des effets
    smooth-scroll.js     Lenis synchronisé avec GSAP
    hero-paint.js        peinture du S² au scroll et traînée de carrés au survol
    reel.js              showreel qui passe de carte à plein écran
    studio.js            images qui changent de taille et de place
    services.js          section épinglée, intitulés qui se remplissent de gauche à droite
    process.js           étapes qui s'empilent
    works.js             lettres « projets » et aperçu qui suit le curseur
    outro.js             images qui grandissent et bandeau défilant
    text-fill.js         textes qui se remplissent ligne par ligne
    theme.js             bascule du fond noir / blanc
    nav.js               menu plein écran, retour en haut
    canvas-objects.js    objets dessinés du showreel de remplacement
    motion.js            préférences de mouvement et couleurs partagées
  styles/
    app.css              variables, grille en filets fins, typographie, boutons, navbar, menu
    sections/            un fichier CSS par section
src/
  Controller/HomeController.php
  Content/HomeContent.php    contenu de la page d'accueil
  Content/SiteContent.php    contenu commun, disponible dans Twig sous « site »
templates/
  base.html.twig
  home/index.html.twig       assemble les sections
  home/_hero.html.twig … _outro.html.twig
  partials/_nav.html.twig, _menu.html.twig, _footer.html.twig
  macros/ui.html.twig        lien qui roule au survol, bouton, image
```

## Comportement selon l'appareil

- Sur ordinateur (900 px et plus), le hero, le showreel, le studio et les services sont épinglés pendant le scroll.
- Sur mobile, le studio passe en grille, les services en cartes et les étapes du processus en liste.
- Si le système demande moins d'animations (`prefers-reduced-motion`), Lenis et les épinglages sont désactivés, la peinture du hero s'affiche terminée et les services s'affichent en cartes.

## Mise en production

```bash
composer install --no-dev --optimize-autoloader
php bin/console asset-map:compile
```

Définissez `APP_ENV=prod` et un `APP_SECRET` propre (variables d'environnement du serveur ou `.env.local`), puis faites pointer le serveur web sur `public/`.

## Versions

- Symfony 7.4 LTS : maintenu jusqu'en novembre 2028. Le passage à Symfony 8 demande PHP 8.4.
- GSAP 3.13.0, Lenis 1.3.17 : versions fixées dans `importmap.php`. `php bin/console importmap:outdated` liste les mises à jour.
- Polices Google Fonts (Archivo, Geist Mono, Instrument Serif), chargées dans `templates/base.html.twig`.
