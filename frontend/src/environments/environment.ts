/**
 * environment.ts — Configuration de l'environnement de développement.
 *
 * Ces valeurs sont utilisées lorsque l'application tourne en local (ng serve).
 * Les URLs pointent vers le backend Docker local.
 */
export const environment = {
    production: false,

    /** URL de base de l'API backend (Docker local) */
    apiUrl: 'http://localhost:8080/api/v1',

    /** URL Expo publiée pour le QR code de la page /demo */
    expoUrl: 'exp://expo.dev/@ironpath/ironpath',

    /** URL GitHub du projet */
    githubUrl: 'https://github.com/stephanebtvr/k-zero-workout-app',
};
