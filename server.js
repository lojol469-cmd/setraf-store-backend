require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// CLOUDINARY CONFIGURATION
// ========================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ========================================
// MIDDLEWARE
// ========================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// MONGODB CONNECTION
// ========================================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB connecté - Database:', process.env.MONGO_DB_NAME))
.catch(err => console.error('❌ Erreur MongoDB:', err));

// ========================================
// MODELS
// ========================================

// App Release Schema
const releaseSchema = new mongoose.Schema({
  appName: { type: String, required: true, default: 'Center App' },
  version: { type: String, required: true },
  versionCode: { type: Number, required: true },
  releaseDate: { type: Date, default: Date.now },
  
  // Cloudinary APK
  apkUrl: { type: String, required: true },
  apkCloudinaryId: { type: String, required: true },
  apkSize: { type: Number }, // en bytes
  
  // Métadonnées
  changelog: [{ type: String }],
  features: [{ type: String }],
  screenshots: [{
    url: String,
    cloudinaryId: String,
    caption: String
  }],
  iconUrl: { type: String },
  iconCloudinaryId: { type: String },
  
  // Stats
  downloadCount: { type: Number, default: 0 },
  isLatest: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  
  // Infos techniques
  minAndroidVersion: { type: String, default: '5.0' },
  targetAndroidVersion: { type: String, default: '14' },
  permissions: [{ type: String }],
  packageName: { type: String, default: 'com.center.app' }
}, { timestamps: true });

const Release = mongoose.model('Release', releaseSchema);

// Download Stats Schema
const downloadSchema = new mongoose.Schema({
  releaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Release', required: true },
  version: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  country: { type: String },
  downloadedAt: { type: Date, default: Date.now }
});

const Download = mongoose.model('Download', downloadSchema);

// ========================================
// ROUTES API
// ========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Center App Store API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    cloudinary: 'configured'
  });
});

// GET - Dernière version de l'app
app.get('/api/app/latest', async (req, res) => {
  try {
    const latestRelease = await Release.findOne({ isActive: true, isLatest: true })
      .sort({ versionCode: -1 });
    
    if (!latestRelease) {
      return res.status(404).json({ message: 'Aucune version disponible' });
    }

    res.json({
      success: true,
      release: latestRelease
    });
  } catch (error) {
    console.error('Erreur récupération dernière version:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET - Toutes les versions
app.get('/api/app/versions', async (req, res) => {
  try {
    const releases = await Release.find({ isActive: true })
      .sort({ versionCode: -1 })
      .limit(10);

    res.json({
      success: true,
      total: releases.length,
      releases
    });
  } catch (error) {
    console.error('Erreur récupération versions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET - Télécharger APK (avec tracking)
app.get('/api/app/download/:releaseId', async (req, res) => {
  try {
    const { releaseId } = req.params;
    
    const release = await Release.findById(releaseId);
    if (!release) {
      return res.status(404).json({ message: 'Version introuvable' });
    }

    // Tracker le téléchargement
    await Download.create({
      releaseId: release._id,
      version: release.version,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Incrémenter le compteur
    release.downloadCount += 1;
    await release.save();

    // Rediriger vers Cloudinary
    res.json({
      success: true,
      downloadUrl: release.apkUrl,
      version: release.version,
      size: release.apkSize,
      message: 'Téléchargement démarré'
    });

  } catch (error) {
    console.error('Erreur téléchargement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET - Statistiques des téléchargements
app.get('/api/stats/downloads', async (req, res) => {
  try {
    const totalDownloads = await Download.countDocuments();
    const downloadsByVersion = await Download.aggregate([
      {
        $group: {
          _id: '$version',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const recentDownloads = await Download.find()
      .sort({ downloadedAt: -1 })
      .limit(10)
      .populate('releaseId', 'version appName');

    res.json({
      success: true,
      stats: {
        total: totalDownloads,
        byVersion: downloadsByVersion,
        recent: recentDownloads
      }
    });
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST - Créer une nouvelle release (ADMIN)
app.post('/api/admin/release', async (req, res) => {
  try {
    const {
      version,
      versionCode,
      apkUrl,
      apkCloudinaryId,
      apkSize,
      changelog,
      features,
      screenshots,
      iconUrl,
      iconCloudinaryId,
      minAndroidVersion,
      targetAndroidVersion,
      permissions
    } = req.body;

    // Désactiver "isLatest" pour toutes les autres versions
    await Release.updateMany({}, { isLatest: false });

    const newRelease = await Release.create({
      version,
      versionCode,
      apkUrl,
      apkCloudinaryId,
      apkSize,
      changelog,
      features,
      screenshots,
      iconUrl,
      iconCloudinaryId,
      minAndroidVersion,
      targetAndroidVersion,
      permissions,
      isLatest: true,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Release créée avec succès',
      release: newRelease
    });

  } catch (error) {
    console.error('Erreur création release:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE - Supprimer une release (ADMIN)
app.delete('/api/admin/release/:releaseId', async (req, res) => {
  try {
    const { releaseId } = req.params;
    
    const release = await Release.findById(releaseId);
    if (!release) {
      return res.status(404).json({ message: 'Release introuvable' });
    }

    // Supprimer de Cloudinary
    if (release.apkCloudinaryId) {
      await cloudinary.uploader.destroy(release.apkCloudinaryId, { resource_type: 'raw' });
    }
    if (release.iconCloudinaryId) {
      await cloudinary.uploader.destroy(release.iconCloudinaryId);
    }

    // Supprimer de MongoDB
    await Release.findByIdAndDelete(releaseId);

    res.json({
      success: true,
      message: 'Release supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression release:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ========================================
// ERROR HANDLING
// ========================================
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

app.use((err, req, res, _next) => {
  console.error('Erreur:', err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
  console.log(`\n🚀 Server démarré sur le port ${PORT}`);
  console.log(`📦 MongoDB: ${process.env.MONGO_DB_NAME}`);
  console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}\n`);
});
