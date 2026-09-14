# GoldenAccess — Site vitrine d'abonnements en ligne

Site vitrine 100 % statique présentant les outils du fichier `data/Outil.md` (catégories, outils, plans, durées, prix en Ariary), avec une allure premium or & clair. Toute commande passe par la page Facebook GoldenAccess.

## Fonctionnalités réalisées

- **Accueil (`index.html`)**
  - Hero : accroche, promesse « 100 % privé », délai 1h à 24h, boutons vers le catalogue et la page Facebook.
  - Recherche par nom d'outil (aussi sur catégorie et nom de plan), filtres par catégorie (avec compteurs), tri (A→Z, prix, catégorie) et compteur de résultats.
  - Grille de blocs, un par outil : catégorie, nom, logo officiel (favicon du site + repli initiale colorée), badge « 100 % Privée », **offre avantageuse** (meilleur prix ramené au mois parmi tous les plans/durées) avec sa durée, bouton « Voir tous les plans ».
  - Rappel de la marche à suivre (4 étapes) + liens paiement / Facebook.
  - État recherche/filtre/tri dans l'URL (`?q=…&cat=…&sort=…`) : partageable, bouton retour fonctionnel.
- **Page outil (`outil.html?outil=<slug>`)**
  - Logo, nom, catégorie, badge « 100 % Privée », tags (nb de plans, durées, délai).
  - **Un tableau par plan** : 1ʳᵉ colonne « Abonnement » (Outil — Plan), puis une colonne par durée disponible, prix à l'intersection (3 durées ⇒ 4 colonnes). La cellule de l'offre avantageuse est marquée ★.
  - Sur mobile (≤ 640 px) les tableaux deviennent des listes durée → prix.
  - Bloc « Paiement & commande » + bouton « Commander via Facebook », lien retour.
  - Titre et meta description générés par outil (SEO).
- **Paiement & contact (`paiement.html`)** : marche à suivre (nom + plan + durée ou capture d'écran), délai 1h à 24h, CTA Facebook, FAQ.
- En-tête / pied de page communs, responsive, accessibilité (labels, aria, sémantique).

## URIs

| Chemin | Description |
|---|---|
| `index.html` | Accueil — paramètres optionnels `q` (recherche), `cat` (catégorie exacte), `sort` (`name`, `price-asc`, `price-desc`, `category`) |
| `outil.html?outil=<slug>` | Page d'un outil (ex. `outil.html?outil=canva`, `outil.html?outil=chatgpt`) — slug = nom d'outil sans accents, minuscules, tirets |
| `paiement.html` | Paiement & contact |
| Facebook | https://www.facebook.com/profile.php?id=61594399318538 |

## Données & structure

- `data/Outil.md` : fichier source fourni (tableau Markdown).
- `js/data.js` : les 350 lignes du fichier sont embarquées et parsées côté client → `GA.offers` (catégorie, outil, plan, durée, prix), regroupées en `GA.tools` (outil → plans → durées triées du plus court au plus long), `GA.categories`. Durées normalisées (« 3 Month » → « 3 mois », « Lifetime » → « À vie », vide → « Sur demande »). Prix formatés `fr-FR` + « Ar ». Table de correspondance outil → domaine officiel pour les logos (service favicon Google, repli initiale colorée).
- `js/common.js` : helpers (échappement HTML, logo + fallback, catégories du footer).
- `js/home.js` : accueil (filtres, recherche, tri, grille).
- `js/tool.js` : page outil (tableaux par plan, version liste mobile).
- `css/style.css` : thème or & clair (Inter + Playfair Display, Font Awesome).
- Aucune base de données : site entièrement statique.

## Non implémenté / pistes

- Une URL « propre » `/outil/nom-de-loutil` nécessiterait des réécritures serveur ; le site statique utilise `outil.html?outil=slug` (un repli `outil.html#slug` est aussi supporté).
- Mise à jour des prix : éditer le bloc `RAW` dans `js/data.js` (copier/coller les lignes du fichier Markdown).
- Idées : tableau comparatif multi-outils, partage d'un plan précis par lien (`#plan-…` existe déjà comme ancre), version malgache/anglaise, images de logos hébergées localement pour supprimer la dépendance au service favicon.

## Publication

- Onglet **Publish** de l'éditeur (le plus simple), ou
- **GitHub Pages** : le site est prêt (`.nojekyll`, `404.html`, chemins relatifs). Pousser tous les fichiers dans un dépôt GitHub → Settings → Pages → Branch `main` / `/ (root)`. URL : `https://<utilisateur>.github.io/<depot>/`.
  Un domaine `.com` n'est jamais gratuit : GitHub ne fournit que le sous-domaine `github.io` sans frais.

## Historique des données

- Les offres « Oxaam — TradingView Premium » (3 mois 450 000 Ar, 1 an 900 000 Ar) ont été fusionnées dans **TradingView → plan Premium** ; l'outil Oxaam a été supprimé (97 outils).
