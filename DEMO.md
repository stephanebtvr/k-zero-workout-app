# 📽️ Guide de Démo — IronPath

Ce document guide un recruteur ou un développeur à travers les fonctionnalités clés d'IronPath.

---

## 🏃 Parcours Utilisateur Cible

### 1. Inscription & Onboarding
- Créez un compte sur le portail web ou l'app mobile.
- Les données sont synchronisées instantanément entre toutes les plateformes.

### 2. Démarrage d'une Séance
- Allez dans l'onglet **Entraînement**.
- Cliquez sur **Séance Libre** ou choisissez un **Programme** existant.
- Nommez votre séance.

### 3. Saisie de Performance (Live)
- **Ajouter un exercice** : Recherchez dans le catalogue (ex: "Développé couché").
- **Saisie des Sets** : Entrez le poids et les répétitions.
- **Temps de repos** : Un timer se déclenche automatiquement (Mobile).
- **Validation** : Cochez la case pour valider la série.
- **Calcul 1RM** : Le backend recalcule instantanément votre record théorique (formule d'Epley).

### 4. Analyse & Statistiques
- Finissez la séance.
- Consultez l'onglet **Statistiques**.
- Visualisez la courbe de votre **Volume Total** sur 30 jours.
- Comparez votre progression sur un exercice spécifique.

### 5. Export de Données
- Sur le dashboard web, utilisez le bouton **Exporter CSV**.
- Récupérez l'intégralité de vos performances pour une analyse Excel/Sheets poussée.

---

## 💡 Points d'Attention (Recruteurs)

- **Interface Responsive** : Le site web utilise une grille fluide s'adaptant des smartphones aux écrans 4K.
- **Performance** : Les requêtes sont optimisées avec des projections JPA pour minimiser le payload.
- **Expérience Mobile** : Utilisation de feedbacks haptiques et de gestes natifs (React Native).
- **Clean Code** : Explorez `backend/.../workout` pour voir l'implémentation propre des use cases.
