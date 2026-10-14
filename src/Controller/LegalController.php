<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Pages légales. Leurs textes sont dans templates/legal/, les informations (adresse, SIRET, hébergeur…)
 * dans src/Content/SiteContent.php, méthode legal().
 */
final class LegalController extends AbstractController
{
    #[Route('/mentions-legales', name: 'app_legal_notice', methods: ['GET'])]
    public function notice(): Response
    {
        return $this->render('legal/mentions_legales.html.twig');
    }

    #[Route('/confidentialite', name: 'app_privacy', methods: ['GET'])]
    public function privacy(): Response
    {
        return $this->render('legal/confidentialite.html.twig');
    }
}
