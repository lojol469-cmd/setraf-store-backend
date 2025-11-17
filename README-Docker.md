# Center Store Backend - Production Deployment

Backend API pour Center App Store avec téléchargement APK et gestion Cloudinary.

## 🚀 Déploiement Docker

### Prérequis

- Docker >= 20.10
- Docker Compose >= 2.0

### Configuration

1. **Variables d'environnement** : Copiez et modifiez `.env.production` selon vos besoins :
   ```bash
   cp .env.production .env
   # Éditez les valeurs sensibles
   ```

2. **Domaines** : Mettez à jour `FRONTEND_URL` dans `.env.production` avec votre domaine frontend.

### Déploiement Rapide

```bash
# Construire et démarrer tous les services
./deploy.sh build
./deploy.sh start

# Vérifier le statut
./deploy.sh status

# Voir les logs
./deploy.sh logs
```

### Commandes Disponibles

```bash
./deploy.sh build    # Construire les images Docker
./deploy.sh start    # Démarrer les services
./deploy.sh stop     # Arrêter les services
./deploy.sh restart  # Redémarrer les services
./deploy.sh logs     # Afficher les logs
./deploy.sh status   # Statut des services
./deploy.sh cleanup  # Nettoyer les ressources Docker
```

### Architecture

- **Backend** : API Node.js/Express (Port 5000)
- **MongoDB** : Base de données (Port 27017)
- **Volumes** :
  - `mongo_data` : Données persistantes MongoDB
  - `uploads` : Fichiers uploadés

### Sécurité

- Utilisateur non-root dans le conteneur
- Health checks automatiques
- Secrets externalisés
- Images Alpine légères

### Monitoring

- Health check endpoint : `GET /api/health`
- Logs Docker disponibles via `./deploy.sh logs`

### Variables d'Environnement Requises

| Variable | Description | Exemple |
|----------|-------------|---------|
| `MONGO_URI` | URI MongoDB Atlas | `mongodb+srv://...` |
| `CLOUDINARY_*` | Clés Cloudinary | - |
| `JWT_SECRET` | Secret JWT | - |
| `FRONTEND_URL` | URL du frontend | `https://domain.com` |

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/app/latest` - Dernière version APK
- `GET /api/app/download/:id` - Télécharger APK
- `POST /api/admin/release` - Créer une release (Admin)

### Troubleshooting

**Problèmes courants :**

1. **Port déjà utilisé** :
   ```bash
   ./deploy.sh stop
   ./deploy.sh start
   ```

2. **Erreur MongoDB** :
   ```bash
   ./deploy.sh logs mongo
   ```

3. **Erreur Backend** :
   ```bash
   ./deploy.sh logs backend
   ```

### Mise à jour

```bash
# Arrêter les services
./deploy.sh stop

# Pull des dernières images
docker-compose pull

# Redémarrer
./deploy.sh start
```

---

**⚠️ Sécurité** : Changez tous les secrets par défaut avant le déploiement en production !