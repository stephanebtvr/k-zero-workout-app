# 🏋️ IronPath — Suivi de Performances Musculaires

[![Kotlin](https://img.shields.io/badge/Kotlin-1.9-7F52FF?logo=kotlin&logoColor=white)](https://kotlinlang.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-18-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Application complète de suivi de performances musculaires.
Création de programmes, suivi de séances en temps réel, visualisation de la progression (1RM, volume, mensurations).
Design Apple épuré, dark mode, architecture Clean Architecture.

---

## 📐 Architecture

```
ironpath/
├── backend/                   ← Kotlin + Spring Boot 3.3
│   ├── src/main/kotlin/com/ironpath/
│   │   ├── auth/              ← Authentification JWT
│   │   ├── user/              ← Profil utilisateur
│   │   ├── exercise/          ← Catalogue d'exercices
│   │   ├── workout/           ← Séances & sets
│   │   ├── measurement/       ← Mensurations corporelles
│   │   ├── stats/             ← Statistiques & graphiques
│   │   └── common/            ← Config, exceptions, utilitaires
│   ├── Dockerfile             ← Multi-stage build (JDK 21)
│   └── build.gradle.kts
│
├── frontend/                  ← Angular 18 + Tailwind + PrimeNG
│   └── src/app/
│       ├── core/              ← Services, interceptors, guards
│       ├── shared/            ← Composants réutilisables
│       ├── features/          ← Modules lazy-loaded
│       └── layout/            ← Shell, navbar, sidebar
│
├── mobile/                    ← React Native 0.74 + Expo SDK 51
│   └── src/
│       ├── app/               ← Expo Router screens
│       ├── components/        ← Composants UI
│       ├── stores/            ← Zustand stores
│       └── services/          ← Appels API
│
├── docker-compose.yml         ← Backend + PostgreSQL + pgAdmin
├── render.yaml                ← Infrastructure Render (IaC)
├── .github/workflows/         ← CI/CD GitHub Actions
└── .env.example               ← Variables d'environnement
```

### Clean Architecture (Backend)

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation (Controllers)                │
│      REST endpoints, validation, Spring annotations          │
├─────────────────────────────────────────────────────────────┤
│                    Application (Services)                     │
│      Orchestration, DTOs, mappers, use cases                 │
├─────────────────────────────────────────────────────────────┤
│                    Domain (Models + Ports)                    │
│      Entités pures, interfaces, logique métier               │
│      ⚠ AUCUNE dépendance framework                          │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure (Adapters)                  │
│      JPA entities, Spring Config, implémentations            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Démarrage Rapide

### Prérequis

| Outil     | Version | Vérification            |
|-----------|---------|-------------------------|
| Java      | 21+     | `java --version`        |
| Node.js   | 20+     | `node --version`        |
| Docker    | 24+     | `docker --version`      |
| Expo CLI  | latest  | `npx expo --version`    |

### Installation en 3 commandes

```bash
# 1. Cloner le repo
git clone https://github.com/<username>/ironpath.git && cd ironpath

# 2. Configurer l'environnement
cp .env.example .env
# → Éditer .env : générer JWT_SECRET avec `openssl rand -base64 64`

# 3. Lancer les services (backend + PostgreSQL)
docker-compose up --build
```

L'API est accessible sur **http://localhost:8080/api/v1**
Swagger UI : **http://localhost:8080/api/v1/swagger-ui.html**

### Lancer le frontend Angular

```bash
cd frontend
npm install
npm run dev
# → http://localhost:4200
```

### Lancer l'app mobile

```bash
cd mobile
npm install
npx expo start
# → Scanner le QR code avec Expo Go
```

### pgAdmin (optionnel)

```bash
docker-compose --profile tools up
# → http://localhost:5050
# Email: admin@ironpath.dev | Password: admin
```

---

## 📱 Démo Recruteurs

L'app mobile est accessible **instantanément** via Expo Go — aucune installation depuis les stores requise.

1. **Installez [Expo Go](https://expo.dev/go)** sur votre téléphone
2. **Scannez le QR code** sur la page `/demo` du site web
3. **Explorez IronPath** directement sur votre appareil

### Liens de démo

| Plateforme | URL |
|------------|-----|
| 🌐 Web    | `https://ironpath.vercel.app` |
| 🔌 API    | `https://ironpath-api.onrender.com/api/v1/swagger-ui.html` |
| 📱 Mobile | Scannez le QR sur `/demo` |

> ⚠️ L'API sur Render (free tier) s'endort après 15 min d'inactivité.
> Le premier appel prend ~30 secondes (warm-up JVM). C'est normal.

---

## 🔐 Variables d'Environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `JWT_SECRET` | Secret HMAC-SHA256 (min 64 chars base64) | `openssl rand -base64 64` |
| `JWT_ACCESS_EXPIRATION` | Durée access token (ms) | `900000` (15 min) |
| `JWT_REFRESH_EXPIRATION` | Durée refresh token (ms) | `604800000` (7 jours) |
| `CORS_ORIGINS` | Origines autorisées (virgules) | `http://localhost:4200` |
| `POSTGRES_DB` | Nom de la base | `ironpath` |
| `POSTGRES_USER` | Utilisateur PostgreSQL | `ironpath` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `ironpath_dev` |
| `DATABASE_URL` | URL complète (prod Render) | fourni par Render |

---

## 🛠️ Stack Technique

| Couche | Technologie |
|--------|-------------|
| Backend | Kotlin 1.9 · Spring Boot 3.3 · Spring Security 6 · JPA · Flyway |
| Base de données | PostgreSQL 16 |
| Frontend Web | Angular 18 · Tailwind CSS 3.4 · PrimeNG 17 · NgRx Signals |
| Mobile | React Native 0.74 · Expo SDK 51 · NativeWind · Zustand |
| Auth | JWT (access + refresh tokens) |
| CI/CD | GitHub Actions |
| Déploiement | Render (API) · Vercel (Web) · Expo Go (Mobile) |
| Conteneurisation | Docker multi-stage · docker-compose |

---

## 📝 License

MIT © IronPath
