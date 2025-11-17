# Setraf Store Backend

Backend API pour l'application mobile Setraf Store - Téléchargement APK avec Cloudinary.

## 🚀 Fonctionnalités

- ✅ API REST complète pour gestion des applications
- ✅ Téléchargement sécurisé d'APK avec tracking
- ✅ Stockage Cloudinary intégré
- ✅ Base de données MongoDB
- ✅ Authentification JWT
- ✅ Déploiement Docker prêt pour production
- ✅ Health checks automatiques
- ✅ Logs et monitoring

## 🐳 Déploiement sur Render

### Déploiement Automatique

Ce projet est configuré pour un déploiement automatique sur [Render](https://render.com) :

1. **Connecter le repository GitHub** à Render
2. **Render détecte automatiquement** le `render.yaml` et le `Dockerfile`
3. **Configuration automatique** des variables d'environnement
4. **Déploiement en un clic**

### Configuration Render

Le fichier `render.yaml` configure automatiquement :
- **Service Web** avec Docker
- **Port 5000** exposé
- **Health check** sur `/api/health`
- **Variables d'environnement** (à configurer dans le dashboard Render)

### Variables d'Environnement sur Render

Dans le dashboard Render, ajouter ces variables :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `NODE_ENV` | `production` | Environment |
| `PORT` | `5000` | Port d'écoute |
| `MONGO_URI` | `votre_mongo_uri` | URI MongoDB Atlas |
| `MONGO_DB_NAME` | `votre_db_name` | Nom de la base |
| `JWT_SECRET` | `votre_secret_jwt` | Secret JWT |
| `CLOUDINARY_*` | `vos_cles_cloudinary` | Clés Cloudinary |
| `FRONTEND_URL` | `https://votre-domaine.com` | URL du frontend |

### Avantages du Déploiement Render

- ✅ **Détection automatique** de Docker
- ✅ **SSL gratuit** et automatique
- ✅ **Scaling automatique**
- ✅ **Logs en temps réel**
- ✅ **Health monitoring**
- ✅ **Rollback facile**

---

## 🛠️ Technologies

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Cloudinary** - Stockage et gestion des médias
- **JWT** - Authentification
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration

## 📦 Installation & Développement

### Prérequis

- Node.js >= 18
- MongoDB (local ou Atlas)
- Docker & Docker Compose (optionnel)

### Installation

```bash
# Cloner le repository
git clone https://github.com/lojol469-cmd/setraf-store-backend.git
cd setraf-store-backend

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs
```

### Configuration

Créer un fichier `.env` basé sur `.env.example` :

```env
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/database
JWT_SECRET=votre_secret_jwt
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### Démarrage

```bash
# Développement
npm run dev

# Production
npm start
```

## 🐳 Déploiement Docker

### Build & Run

```bash
# Construire l'image
docker build -t setraf-store-backend .

# Démarrer avec Docker Compose
docker-compose up -d

# Ou utiliser le script de déploiement
./deploy.sh build
./deploy.sh start
```

### Variables d'environnement production

```bash
cp .env.production.example .env.production
# Configurer avec les vraies valeurs de production
```

## 📚 API Endpoints

### Health Check
- `GET /api/health` - État du service

### Applications
- `GET /api/app/latest` - Dernière version disponible
- `GET /api/app/versions` - Toutes les versions
- `GET /api/app/download/:id` - Télécharger APK

### Statistiques
- `GET /api/stats/downloads` - Statistiques de téléchargement

### Administration (protégé)
- `POST /api/admin/release` - Créer une nouvelle release
- `DELETE /api/admin/release/:id` - Supprimer une release

## 🔒 Sécurité

- Utilisateur non-root dans les conteneurs Docker
- Variables d'environnement pour les secrets
- Validation des entrées avec express-validator
- Headers de sécurité avec Helmet
- Compression des réponses
- CORS configuré

## 📊 Monitoring

- Health checks intégrés
- Logs structurés
- Métriques de performance
- Tracking des téléchargements

## 🏗️ Architecture

```
backend/
├── server.js              # Point d'entrée principal
├── package.json           # Dépendances et scripts
├── Dockerfile             # Configuration Docker
├── docker-compose.yml     # Orchestration services
├── .env.example           # Variables d'environnement exemple
└── README-Docker.md       # Documentation déploiement
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

**Développé avec ❤️ par l'équipe Setraf**
