/* eslint-disable no-undef */
/* eslint-env node */
// Script pour uploader un APK vers Cloudinary et créer une release

require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema Release
const releaseSchema = new mongoose.Schema({
  appName: { type: String, required: true, default: 'Center App' },
  version: { type: String, required: true },
  versionCode: { type: Number, required: true },
  releaseDate: { type: Date, default: Date.now },
  apkUrl: { type: String, required: true },
  apkCloudinaryId: { type: String, required: true },
  apkSize: { type: Number },
  changelog: [{ type: String }],
  features: [{ type: String }],
  screenshots: [{
    url: String,
    cloudinaryId: String,
    caption: String
  }],
  iconUrl: { type: String },
  iconCloudinaryId: { type: String },
  downloadCount: { type: Number, default: 0 },
  isLatest: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  minAndroidVersion: { type: String, default: '5.0' },
  targetAndroidVersion: { type: String, default: '14' },
  permissions: [{ type: String }],
  packageName: { type: String, default: 'com.center.app' }
}, { timestamps: true });

const Release = mongoose.model('Release', releaseSchema);

// Fonction principale
async function uploadRelease(apkPath, releaseData) {
  try {
    console.log('🚀 Upload de la release vers Cloudinary...\n');

    // Vérifier que le fichier existe
    if (!fs.existsSync(apkPath)) {
      throw new Error(`Fichier APK introuvable: ${apkPath}`);
    }

    // Obtenir la taille du fichier
    const stats = fs.statSync(apkPath);
    const fileSizeInBytes = stats.size;
    console.log(`📦 Taille APK: ${(fileSizeInBytes / (1024 * 1024)).toFixed(2)} MB`);

    // Upload vers Cloudinary
    console.log('☁️  Upload vers Cloudinary...');
    const result = await cloudinary.uploader.upload(apkPath, {
      resource_type: 'raw',
      folder: 'center-app/releases',
      public_id: `center-app-v${releaseData.version}`,
      tags: ['apk', 'android', 'center-app']
    });

    console.log('✅ Upload réussi!');
    console.log('🔗 URL:', result.secure_url);

    // Désactiver "isLatest" pour les anciennes versions
    await Release.updateMany({}, { isLatest: false });

    // Créer la release dans MongoDB
    const newRelease = await Release.create({
      version: releaseData.version,
      versionCode: releaseData.versionCode,
      apkUrl: result.secure_url,
      apkCloudinaryId: result.public_id,
      apkSize: fileSizeInBytes,
      changelog: releaseData.changelog || [],
      features: releaseData.features || [],
      isLatest: true,
      isActive: true
    });

    console.log('\n✅ Release créée avec succès!');
    console.log('📋 ID:', newRelease._id);
    console.log('🔢 Version:', newRelease.version);
    console.log('📦 Taille:', (newRelease.apkSize / (1024 * 1024)).toFixed(2), 'MB');
    console.log('🔗 URL téléchargement:', newRelease.apkUrl);

    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Configuration de la release
const releaseData = {
  version: '1.0.0',
  versionCode: 1,
  changelog: [
    'Interface moderne et intuitive',
    'Gestion complète des employés',
    'Géolocalisation en temps réel',
    'Publications et stories',
    'Chat IA intégré',
    'Statistiques détaillées'
  ],
  features: [
    'Gestion des employés',
    'Géolocalisation',
    'Publications',
    'Chat IA',
    'Statistiques'
  ]
};

// Chemin vers votre APK (à modifier)
const apkPath = path.join(__dirname, '..', '..', 'CENTER', 'build', 'app', 'outputs', 'flutter-apk', 'app-release.apk');

console.log('📱 Center App - Upload Release\n');
console.log('APK Path:', apkPath);
console.log('Version:', releaseData.version);
console.log('Version Code:', releaseData.versionCode);
console.log('\n');

// Lancer l'upload
uploadRelease(apkPath, releaseData);
