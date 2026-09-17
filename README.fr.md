# openXYOS

**Languages:** [簡體中文](README.md) · [繁體中文](README.zh-TW.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Français](README.fr.md) · [Español](README.es.md) · [Index d’installation](docs/i18n/README.md) · [Politique de localisation](docs/i18n/POLICY.md)

Dépôt source : [github.com/XYAIStudio/openXYOS](https://github.com/XYAIStudio/openXYOS)

openXYOS est un système d’exploitation open source pour les organisations humain–IA, dérivé et allégé depuis XYOS. Il conserve les organisations multi-niveaux, le multi-tenant, la modularité, la collaboration gouvernée, la personnalisation d’agents, le chat direct/groupe, et des modules d’exemple extensibles.

> Statut : candidat de publication communautaire pour le développement et l’évaluation locaux. **Il n’est pas présenté comme prêt pour la production.**

## Communauté développeurs

Rejoignez le groupe **XYAI Founders** (WeCom / 企业微信) pour échanger sur l’usage, l’extension et les contributions openXYOS. Scannez le QR avec WeCom ; s’il expire, voir [Discussions #12](https://github.com/XYAIStudio/openXYOS/discussions/12).

<p align="center">
  <img src="docs/community/assets/xyai-founders-wecom-qr.png" width="240" alt="QR WeCom XYAI Founders" />
</p>

## Périmètre d’exécution

Après connexion, douze modules : Espace de travail, Annonces, Organisation, Ressources humain–IA, Compétences & plugins, Collaboration, Agent Studio, Tâches, Connaissances, Réflexion, Gouvernance, Paramètres.

Les administrateurs de locataire peuvent activer/désactiver les modules configurables et renommer leurs libellés. Espace de travail et Paramètres sont des fondations non désactivables.

## Cycle de vie des agents

Définissez nom, positionnement, capacités et expérience ; importez des documents autorisés ; liez éventuellement une URL ima. Les fichiers sont contrôlés puis extraits dans le blueprint.

L’agent consultant généré entre automatiquement sur le Talent Market ; après recrutement il devient employé de réserve, avec responsabilités et département. Les sorties à haut risque exigent une revue humaine par défaut. Une URL ima reste « liée, non vérifiée » tant qu’un connecteur ne l’a pas validée.

## Démarrage rapide

Node.js 20.19 ou plus récent.

```bash
npm ci
cp .env.example .env
npm run dev
```

Remplacez les secrets avant le démarrage. Client : `http://localhost:5174` ; API : `http://localhost:3000/api`.

## Vérification

```bash
npm run lint
npm run typecheck
npm test
npm run verify:open-source
npm run build
```

Voir le [guide communauté](docs/community/README.md), [index des langues](docs/i18n/README.md), [périmètre open source](docs/open-source-scope.md), [sécurité](SECURITY.md), [contribution](CONTRIBUTING.md). Questions d’usage : [Discussions Q&A](https://github.com/XYAIStudio/openXYOS/discussions/new?category=q-a). Licence [Apache 2.0](LICENSE).
