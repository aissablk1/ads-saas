const fs = require('fs');
const path = require('path');

// Dépendances AdonisJS nécessaires
const adonisDependencies = {
  "@adonisjs/core": "^6.0.0",
  "@adonisjs/lucid": "^19.0.0",
  "@adonisjs/auth": "^9.0.0",
  "@adonisjs/session": "^7.0.0",
  "@adonisjs/validator": "^7.0.0",
  "@adonisjs/redis": "^7.0.0",
  "lucid": "^19.0.0",
  "sqlite3": "^5.1.6"
};

// Retirer la dépendance @adonisjs/test qui n'existe pas
const adonisDevDependencies = {};

// Lire le package.json existant à la racine
const expressPackage = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

// Fusionner les dépendances
const mergedDependencies = {
  ...expressPackage.dependencies,
  ...adonisDependencies
};

const mergedDevDependencies = {
  ...expressPackage.devDependencies,
  ...adonisDevDependencies
};

// Créer le nouveau package.json fusionné
const mergedPackage = {
  ...expressPackage,
  dependencies: mergedDependencies,
  devDependencies: mergedDevDependencies,
  scripts: {
    ...expressPackage.scripts,
    "adonis:dev": "adonis serve --dev",
    "adonis:build": "adonis build --production",
    "adonis:start": "adonis serve --production",
    "adonis:test": "adonis test",
    "adonis:migration:run": "adonis migration:run",
    "adonis:migration:rollback": "adonis migration:rollback",
    "adonis:db:seed": "adonis db:seed"
  }
};

// Sauvegarder le package.json fusionné à la racine
fs.writeFileSync(path.join(__dirname, '../package.json'), JSON.stringify(mergedPackage, null, 2));

console.log('✅ Package.json fusionné avec succès');
