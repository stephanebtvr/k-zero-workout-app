/**
 * environment.prod.ts — Configuration de l'environnement de production.
 *
 * Ces valeurs sont utilisées lors du build production (ng build --configuration production).
 * Les URLs pointent vers les services déployés (Render, Vercel).
 */
export const environment = {
    production: true,

    /** URL de base de l'API backend déployée sur Render */
    apiUrl: 'https://ironpath-api.onrender.com/api/v1',

    /** URL Expo publiée pour le QR code mobile */
    expoUrl: 'exp://expo.dev/@ironpath/ironpath',

    /** URL GitHub du projet */
    githubUrl: 'https://github.com/stephanebtvr/k-zero-workout-app',
};
