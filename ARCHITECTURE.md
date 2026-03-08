# 🏗️ IronPath Architecture

IronPath suit les principes de la **Clean Architecture** et du **Domain-Driven Design (DDD)** pour garantir une base de code maintenable, testable et évolutive.

---

## 층 Layers Management

### 1. Domain Layer (The Heart)
- **Entities**: Modèles de données purement métier (Workout, Exercise, Set).
- **Repositories (Ports)**: Interfaces définissant comment les données sont accédées.
- **Logic**: Aucune dépendance externe (Spring, JPA, etc.).

### 2. Application Layer (Orchestration)
- **Services**: Use cases orchestrant la logique métier.
- **DTOs**: Objets de transfert pour l'API.
- **Mappers**: Conversion entre Entités et DTOs.

### 3. Presentation Layer (API)
- **Controllers**: Points d'entrée REST.
- **Security**: Configuration Spring Security + JWT Interceptors.
- **Swagger**: Documentation OpenAPI 3.

### 4. Infrastructure Layer (Implementation)
- **Persistence**: Implémentation des repositories avec Spring Data JPA.
- **External Services**: Services tiers (génération de CSV, etc.).

---

## 🔐 Security Flow (JWT)

1. **Login**: L'utilisateur envoie ses credentials.
2. **Token Generation**: Le back génère un Access Token (court) et un Refresh Token (long).
3. **Authorized Requests**: Le client envoie l'Access Token dans le header `Authorization: Bearer <token>`.
4. **Validation**: Un filtre personnalisé intercepte la requête, valide le JWT et injecte le principal dans le SecurityContext.

---

## 📱 Frontend & Mobile Patterns

### Angular (Web)
- **Signals**: Gestion réactive de l'état (Angular 18+).
- **Standalone Components**: Architecture moderne sans NgModules.
- **Interceptors**: Ajout automatique du JWT et gestion des erreurs 401.

### React Native (Mobile)
- **Zustand**: State management ultra-léger et performant.
- **Expo Router**: Navigation basée sur les fichiers (semblable à Next.js).
- **NativeWind**: Styling utilitaire (Tailwind) compilé nativement.

---

## 💾 Database Schema (PostgreSQL)

- **users**: Informations profil + password hashé.
- **exercises**: Catalogue (statique + custom).
- **workouts**: Séances avec stats agrégées (durée, volume).
- **workout_session_exercises**: Lien entre une séance et un exercice.
- **workout_sets**: Données brutes de chaque série (poids, reps, RPE).
- **measurements**: Suivi des mensurations.
