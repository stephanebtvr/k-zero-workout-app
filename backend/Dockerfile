# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Dockerfile — Build multi-stage pour le backend IronPath
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Stage 1 "builder" : compile le projet avec Gradle
# Stage 2 "runner"  : image minimale avec le JAR uniquement
#
# Avantages du multi-stage :
# - Image finale ~200 Mo au lieu de ~800 Mo (pas de JDK, pas de sources)
# - Surface d'attaque réduite (moins d'outils installés)
# - Builds reproductibles (Gradle et dépendances dans le cache Docker)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STAGE 1 : BUILD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FROM gradle:8.10-jdk21 AS builder

# Label de métadonnées OCI
LABEL maintainer="IronPath Team"
LABEL description="IronPath API - Backend Spring Boot"

WORKDIR /app

# Copie des fichiers de configuration Gradle en premier
# pour exploiter le cache Docker des couches (layer caching)
# Les dépendances ne sont re-téléchargées que si ces fichiers changent
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle

# Téléchargement des dépendances dans une couche séparée
# --no-daemon : évite de laisser un daemon Gradle en mémoire dans le conteneur
RUN gradle dependencies --no-daemon || true

# Copie du code source
COPY src ./src

# Build du projet sans exécuter les tests
# Les tests sont exécutés dans le pipeline CI/CD, pas lors du build Docker
# --no-daemon : important dans un container (pas de processus persistant)
RUN gradle build -x test --no-daemon

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STAGE 2 : RUNTIME
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FROM eclipse-temurin:21-jre-alpine AS runner

# Mise à jour des packages de sécurité
# Alpine Linux reçoit des patches fréquents
RUN apk --no-cache add curl

WORKDIR /app

# Création d'un utilisateur non-root pour exécuter l'application
# Pourquoi : principe du moindre privilège
# - Si l'application est compromise, l'attaquant n'a pas les droits root
# - Bonne pratique Docker recommandée par le CIS Benchmark
RUN addgroup -S ironpath && adduser -S ironpath -G ironpath

# Copie du JAR depuis le stage de build
# Le wildcard * capture le nom du JAR qui inclut la version
COPY --from=builder /app/build/libs/*.jar app.jar

# Changement vers l'utilisateur non-root
USER ironpath

# Port exposé par l'application Spring Boot
EXPOSE 8080

# Health check Docker : vérifie que le serveur répond
# --fail : curl renvoie un code d'erreur si HTTP != 2xx/3xx
# interval=30s : vérifie toutes les 30 secondes
# timeout=5s : abandonne si pas de réponse en 5 secondes
# retries=3 : marque "unhealthy" après 3 échecs consécutifs
# start-period=40s : laisse le temps au JVM de démarrer (warm-up)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=40s \
    CMD curl --fail http://localhost:8080/api/v1/health || exit 1

# Lancement de l'application avec le profil de production
# -Djava.security.egd : utilise /dev/urandom pour éviter les blocages
# sur la génération de nombres aléatoires (important pour BCrypt et JWT)
ENTRYPOINT ["java", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-Dspring.profiles.active=prod", \
    "-jar", "app.jar"]
