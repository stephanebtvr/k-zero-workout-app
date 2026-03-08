package com.ironpath

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

/**
 * IronPathApplication — Point d'entrée de l'application Spring Boot.
 *
 * @SpringBootApplication combine :
 * - @Configuration : classe source de beans Spring
 * - @EnableAutoConfiguration : configuration automatique selon le classpath
 * - @ComponentScan : scan du package com.ironpath et ses sous-packages
 */
@SpringBootApplication
class IronPathApplication

/**
 * Fonction main Kotlin — démarre le conteneur Spring Boot.
 * Utilise la syntaxe Kotlin idiomatique `runApplication<T>()`.
 */
fun main(args: Array<String>) {
    runApplication<IronPathApplication>(*args)
}
