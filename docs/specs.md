# Spécifications Fonctionnelles – État du 2025-04-23

## 1. Méthode de collecte
1. Vérification statique :
   - `npm run lint` (ESLint)
   - `npm test` (Jest)
   - Recherche IDE des composants de routage (`<Route`, `createStackNavigator`)

2. Vérification dynamique :
   - Lancement de l'application (`npm run dev`)
   - Navigation manuelle dans toutes les pages
   - Vérification du rendu et des fonctionnalités

3. Croisement avec les tests :
   - Association des pages avec les tests Jest/Detox correspondants
   - Vérification de la couverture de test

## 2. Contexte rapide
Ce fichier reflète le fonctionnement courant du projet de suivi de maintenance.

## 2. Fonctionnalités implantées
| Epic | Fonction | Status | Tests | Remarques |
|------|----------|--------|-------|-----------|
| Auth & Security | Login JWT + RLS Supabase | ✅ | jest-auth ✓ | - |
| Auth & Security | Register | ✅ | jest-auth ✓ | - |
| Calendar | FullCalendar intégration | 🟡 | - | Problème timezone |
| Tasks | Gestion des tâches | ✅ | jest-tasks ✓ | - |
| Reports | Génération PDF/Excel | ✅ | - | - |
| Sync | Synchronisation temps réel | 🟡 | - | Tests intermittents |

## 3. Fonctionnalités retirées / obsolètes
- Prototype Chatbot (retiré pour raisons de performance)

## 4. Routes complètes du système

### Routes principales
| Route | Méthode | Description | Statut |
|-------|---------|-------------|--------|
| / | GET | Page d'accueil (Dashboard) | ✅ |
| /login | GET/POST | Connexion utilisateur | ✅ |
| /register | GET/POST | Inscription utilisateur | ✅ |
| /calendar | GET | Calendrier des interventions | 🟡 |
| /tasks | GET | Liste des tâches | ✅ |
| /tasks/:id | GET | Détail d'une tâche | ✅ |
| /intervention-reports | GET | Liste des rapports | ✅ |
| /intervention-reports/new | GET/POST | Création rapport | ✅ |
| /intervention-reports/:id | GET/PUT/DELETE | Gestion rapport | ✅ |
| /teams | GET | Gestion des équipes | ✅ |
| /clients | GET | Liste des clients | ✅ |
| /equipment | GET | Inventaire équipements | ✅ |
| /statistics | GET | Statistiques | ✅ |
| /settings | GET | Paramètres utilisateur | ✅ |
| /test-task-sync | GET | Page de test synchronisation | 🟡 |

### Routes API
| Route | Méthode | Description |
|-------|---------|-------------|
| /api/auth/login | POST | Authentification |
| /api/auth/register | POST | Inscription |
| /api/tasks | GET/POST | Gestion tâches |
| /api/tasks/:id | GET/PUT/DELETE | Opérations sur tâche |
| /api/reports | GET/POST | Gestion rapports |
| /api/reports/:id | GET/PUT/DELETE | Opérations sur rapport |

## 5. Points techniques bloquants
1. **Erreur critique de test** : 
   - `TypeError: $ is not a function` dans core-js-pure
   - Bloque l'exécution de tous les tests
   - Cause probable : conflit de versions de dépendances

2. Problème timezone dans FullCalendar
3. Tests de synchronisation intermittents

## 6. Tâches immédiates (Priorité Maximum)
1. **Résolution erreur core-js-pure** :
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```
   - Vérifier que core-js-pure est en version ^3.30+ dans package.json
   - Si persiste, forcer la version :
   ```bash
   npm install core-js-pure@3.30.2
   ```

2. Corriger le timezone dans FullCalendar :
   - Vérifier la configuration du timezoneProvider
   - Forcer UTC dans les paramètres

3. Stabiliser les tests de synchronisation :
   - Ajouter des timeouts plus longs
   - Mocker les appels réseau dans les tests

## 7. Changelog
- 2025-04-23 : Documentation complète des dépendances et routes
- 2025-04-22 : Correction authentification JWT
- 2025-04-20 : Ajout génération PDF/Excel

## Annexes techniques

### Dépendances principales
- **Frontend** : React 18, TypeScript, TailwindCSS
- **State Management** : Zustand, React Query
- **Backend** : Express, Mongoose
- **Base de données** : Supabase (PostgreSQL)

### Architecture notable
- Système de state management hybride
- Intégration complète avec Supabase
- Support PDF/Excel
