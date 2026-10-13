<?php

namespace App\Controller;

use App\Content\HomeContent;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home', methods: ['GET'])]
    public function index(HomeContent $content): Response
    {
        return $this->render('home/index.html.twig', $content->all());
    }
}
