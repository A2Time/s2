/*
 * Point d'entrée AssetMapper du site S² (déclaré dans importmap.php, rendu par {{ importmap('app') }}).
 * Chaque CSS importée ici devient une balise <link> dans le <head>.
 */
import './styles/app.css';
import './styles/sections/hero.css';
import './styles/sections/manifeste.css';
import './styles/sections/studio.css';
import './styles/sections/services.css';
import './styles/sections/projets.css';
import './styles/sections/process.css';
import './styles/sections/outro.css';
import './styles/sections/footer.css';

import { boot } from './js/main.js';

boot();
