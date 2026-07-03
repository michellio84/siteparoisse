# Déploiement de la refonte

## Aperçu Netlify

La branche `codex/refonte-site` doit être ouverte en Pull Request. Netlify créera alors un Deploy Preview séparé du domaine principal.

## Ressources YouTube

Deux variables doivent être configurées une seule fois dans **Netlify → Site configuration → Environment variables** :

- `YOUTUBE_API_KEY` : clé de l’API YouTube Data v3, utilisée uniquement pendant le build ;
- `NETLIFY_BUILD_HOOK` : URL d’un build hook Netlify pour l’actualisation quotidienne.

La fonction planifiée `refresh-videos` appelle ce hook chaque jour. Si l’API YouTube est indisponible, le dernier fichier `data/videos-cache.json` déjà généré reste publié.

L’administrateur continue à utiliser `/admin` :

- **Agenda → Mettre en avant sur la page d’accueil** pour prioriser un événement ;
- **Ressources – Sources vidéo** pour ajouter une chaîne ou une playlist ;
- **Ressources – Sélection de la paroisse** pour recommander une vidéo précise.

Toute modification enregistrée par l’administration crée un commit et déclenche le déploiement Netlify habituel.

## Publication

Ne pas fusionner la Pull Request dans `main` avant validation explicite du Deploy Preview. Le domaine `paroissesaintetienne.be` reste ainsi inchangé pendant la phase de validation.
