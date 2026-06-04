# codechronicle

<!-- Badges Shields.io -->
![Taille du repo](https://img.shields.io/github/repo-size/AlexandreRichert/codechronicle?style=flat-square)
![Dernier commit](https://img.shields.io/github/last-commit/AlexandreRichert/codechronicle?style=flat-square)
![Étoiles](https://img.shields.io/github/stars/AlexandreRichert/codechronicle?style=flat-square)
![Workflows](https://img.shields.io/badge/workflows-2-blue?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18-green?style=flat-square&logo=node.js)
![Licence](https://img.shields.io/github/license/AlexandreRichert/codechronicle?style=flat-square)

<!-- Badges GitHub Actions -->
[![Générer un article IA](https://github.com/AlexandreRichert/codechronicle/actions/workflows/generate-article.yml/badge.svg)](https://github.com/AlexandreRichert/codechronicle/actions/workflows/generate-article.yml)
[![Build, Deploy & Notify Discord](https://github.com/AlexandreRichert/codechronicle/actions/workflows/deploy.yml/badge.svg)](https://github.com/AlexandreRichert/codechronicle/actions/workflows/deploy.yml)

---

## Présentation

**CodeChronicle** est un blog technique entièrement automatisé, conçu comme projet DevOps. Le principe est simple : un développeur ouvre une pull request contenant un fichier Markdown vide nommé selon le sujet souhaité (ex : `2026-06-04-docker-compose.md`). GitHub Actions prend ensuite le relais de façon autonome : génération de l'article par une IA, commentaire automatique sur la PR, puis publication du site web dès que la PR est mergée.

L'objectif pédagogique est de démontrer une chaîne CI/CD complète intégrant un LLM, depuis la rédaction du contenu jusqu'à la mise en production, sans intervention manuelle.

> 🌐 **Blog en ligne :** [codechronicle.free.je](https://codechronicle.free.je)

---

## Architecture du projet

```
codechronicle/
├── .github/
│   └── workflows/
│       ├── generate-article.yml   # Workflow 1 : génération IA sur PR
│       └── deploy.yml             # Workflow 2 : build, déploiement et notification
├── scripts/
│   ├── generate-article.js        # Script Node.js appelant l'API OpenAI
│   └── build.js                   # Script Node.js générant le HTML statique
├── blog/                          # Articles en Markdown (créés par l'IA)
├── public/                        # Site HTML généré (déployé via FTP)
└── package.json                   # Dépendances : openai, marked, front-matter
```

---

## Pipeline CI/CD détaillé

### Workflow 1 — Génération d'article IA (`generate-article.yml`)

**Déclencheur :** ouverture ou mise à jour d'une pull request vers `main`.

Ce workflow s'exécute sur chaque PR et suit ces étapes :

1. **Checkout** du code de la branche source de la PR.
2. **Installation des dépendances** Node.js (`npm install`).
3. **Génération de l'article** via `scripts/generate-article.js` :
   - Le script recherche dans le dossier `blog/` un fichier `.md` vide.
   - Il extrait le sujet depuis le nom du fichier (ex : `docker-compose` depuis `2026-06-04-docker-compose.md`).
   - Il envoie ce sujet comme prompt à l'API OpenAI (modèle `gpt-4o-mini`).
   - L'IA génère un article complet en Markdown avec un front matter YAML structuré (`title`, `summary`, `tags`).
   - Le contenu est écrit dans le fichier `.md` cible.
4. **Commentaire automatique sur la PR** via `actions/github-script` : le titre et le résumé de l'article généré sont postés en commentaire pour review.
5. **Commit et push** de l'article généré directement sur la branche de la PR.
6. **Sauvegarde en artifact** : le dossier `blog/` est archivé pour être consultable depuis l'onglet Actions de GitHub.

**Secrets requis :** `OPENAI_API_KEY`

---

### Workflow 2 — Build, déploiement et notification (`deploy.yml`)

**Déclencheur :** push sur la branche `main` (c'est-à-dire après chaque merge de PR).

Ce workflow assure la mise en production du site :

1. **Checkout** du code mis à jour.
2. **Setup Node.js 18** via `actions/setup-node`.
3. **Installation des dépendances** Node.js.
4. **Build du site statique** via `scripts/build.js` :
   - Le script lit tous les fichiers `.md` non vides du dossier `blog/`.
   - Il parse le front matter YAML (titre, résumé, tags) avec la librairie `front-matter`.
   - Il convertit le corps Markdown en HTML avec la librairie `marked`.
   - Il génère une page HTML par article dans le dossier `public/`, ainsi qu'une page d'index listant tous les articles.
   - Le HTML est stylisé avec un thème sombre inspiré de GitHub.
5. **Déploiement FTP** du dossier `public/` vers le serveur InfinityFree via `SamKirkland/FTP-Deploy-Action`.
6. **Notification Discord** : le titre, le résumé et l'URL de l'article mis en production sont envoyés sur un serveur Discord via webhook.

**Secrets requis :** `FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD`, `DISCORD_WEBHOOK_URL`

---

## Stack technique

| Composant | Technologie |
|---|---|
| Runtime | Node.js 18 |
| Génération de contenu | OpenAI API — `gpt-4o-mini` |
| Conversion Markdown → HTML | `marked` |
| Parsing front matter | `front-matter` |
| Hébergement | InfinityFree (FTP) |
| CI/CD | GitHub Actions |
| Notifications | Discord Webhooks |

---

## Variables d'environnement et secrets GitHub

| Secret | Utilisation |
|---|---|
| `OPENAI_API_KEY` | Authentification à l'API OpenAI pour la génération d'articles |
| `FTP_HOST` | Adresse du serveur FTP InfinityFree |
| `FTP_USERNAME` | Identifiant FTP |
| `FTP_PASSWORD` | Mot de passe FTP |
| `DISCORD_WEBHOOK_URL` | URL du webhook Discord pour les notifications de mise en production |
