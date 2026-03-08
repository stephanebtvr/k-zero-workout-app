import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

/**
 * build.gradle.kts — Configuration Gradle pour le backend IronPath.
 *
 * Stack : Kotlin 1.9 + Spring Boot 3.3 + JPA + PostgreSQL + Flyway + JWT.
 * Architecture Clean : le domaine ne dépend d'aucun framework.
 * Ce fichier regroupe toutes les dépendances avec des commentaires par groupe.
 */

plugins {
    // --- Plugin Spring Boot : packaging, run, gestion des versions starters ---
    id("org.springframework.boot") version "3.3.5"

    // --- Plugin de gestion des dépendances Spring (BOM automatique) ---
    id("io.spring.dependency-management") version "1.1.6"

    // --- Plugin Kotlin pour JVM : compilation Kotlin → bytecode JVM ---
    kotlin("jvm") version "1.9.25"

    // --- Plugin Spring pour Kotlin : rend les classes @Component open automatiquement ---
    // Spring nécessite des classes non-final pour créer des proxies (AOP, transactions).
    // Ce plugin évite de devoir ajouter `open` manuellement sur chaque classe Spring.
    kotlin("plugin.spring") version "1.9.25"

    // --- Plugin JPA pour Kotlin : génère les constructeurs no-arg pour les entités ---
    // JPA exige un constructeur sans argument sur les @Entity.
    // Ce plugin le génère au compile-time, sans polluer le code source.
    kotlin("plugin.jpa") version "1.9.25"
}

group = "com.ironpath"
version = "1.0.0"

java {
    // Java 21 LTS — version minimale requise pour Spring Boot 3.3
    sourceCompatibility = JavaVersion.VERSION_21
}

repositories {
    mavenCentral()
}

dependencies {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SPRING BOOT STARTERS — Modules principaux
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Web REST : Tomcat embarqué, Jackson JSON, MVC
    implementation("org.springframework.boot:spring-boot-starter-web")

    // Sécurité : authentification, autorisation, filtres de sécurité
    implementation("org.springframework.boot:spring-boot-starter-security")

    // JPA/Hibernate : ORM, gestion des entités, transactions
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")

    // Validation : Bean Validation (Jakarta), annotations @NotBlank, @Email, etc.
    implementation("org.springframework.boot:spring-boot-starter-validation")

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // BASE DE DONNÉES — PostgreSQL + Flyway
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Driver JDBC PostgreSQL
    runtimeOnly("org.postgresql:postgresql")

    // Flyway Core : migrations de schéma versionnées et reproductibles
    implementation("org.flywaydb:flyway-core")

    // Flyway PostgreSQL : support spécifique PostgreSQL (transactional DDL, etc.)
    implementation("org.flywaydb:flyway-database-postgresql")

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // JWT — Authentification stateless par tokens
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // JJWT API : interfaces pour créer et parser des JWT
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")

    // JJWT Impl : implémentation des algorithmes de signature (HMAC, RSA)
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")

    // JJWT Jackson : sérialisation/désérialisation JSON des claims JWT
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DOCUMENTATION API — OpenAPI / Swagger
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // SpringDoc : génération automatique de la spec OpenAPI 3.0
    // Interface Swagger UI accessible en dev sur /swagger-ui.html
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // KOTLIN — Support runtime
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Reflection Kotlin : requis par Spring pour l'injection de dépendances
    // et la résolution des paramètres de constructeur Kotlin
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TESTS — JUnit 5, MockK, Testcontainers
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Spring Boot Test : support JUnit 5, MockMvc, contexte Spring de test
    testImplementation("org.springframework.boot:spring-boot-starter-test")

    // Spring Security Test : utilitaires pour tester les endpoints sécurisés
    testImplementation("org.springframework.security:spring-security-test")

    // MockK : framework de mocking idiomatique Kotlin (remplace Mockito)
    // Syntaxe plus naturelle avec les coroutines et les data classes Kotlin
    testImplementation("io.mockk:mockk:1.13.12")

    // Testcontainers PostgreSQL : conteneur Docker PostgreSQL éphémère pour les tests d'intégration
    // Garantit des tests identiques en local et en CI (même version PG qu'en production)
    testImplementation("org.testcontainers:postgresql:1.20.3")
    testImplementation("org.testcontainers:junit-jupiter:1.20.3")
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        // Paramètres par défaut pour les fonctions Kotlin :
        // Active le support des valeurs par défaut dans les constructeurs,
        // nécessaire pour l'injection Spring via constructeur Kotlin
        freeCompilerArgs += "-Xjsr305=strict"
        jvmTarget = "21"
    }
}

tasks.withType<Test> {
    // Utilise JUnit Platform (JUnit 5) pour exécuter les tests
    useJUnitPlatform()
}
