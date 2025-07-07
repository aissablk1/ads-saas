import React from 'react';
import { VersionedImage, VersionedAsset, useVersionedUrl, useVersionedUrls } from '../lib/versioned-asset';
import { useCacheBuster } from '../lib/cache-buster';

/**
 * Composant de démonstration du cache busting
 * Montre comment utiliser les différents composants et hooks
 */
export function CacheBusterDemo() {
  const { getVersion, updateVersion } = useCacheBuster();
  const versionedLogoUrl = useVersionedUrl('/images/logo.png');

  // Exemple d'assets avec versions
  const assets = {
    heroImage: '/images/hero.jpg',
    stylesheet: '/styles/main.css',
    script: '/scripts/analytics.js',
    font: '/fonts/custom-font.woff2'
  };

  const versionedAssets = useVersionedUrls(assets);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🔄 Démonstration Cache Busting</h2>
      
      {/* Informations sur la version */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Version actuelle</h3>
        <p className="text-sm text-gray-600">Version: <code className="bg-gray-200 px-2 py-1 rounded">{getVersion()}</code></p>
        <button 
          onClick={updateVersion}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          🔄 Mettre à jour la version
        </button>
      </div>

      {/* Exemples d'utilisation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Composant VersionedImage */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">📸 VersionedImage</h4>
          <VersionedImage
            src="/images/logo.png"
            alt="Logo avec cache busting"
            width={200}
            height={100}
            className="border rounded"
          />
          <p className="text-xs text-gray-500 mt-2">
            URL générée: {versionedLogoUrl}
          </p>
        </div>

        {/* Composant VersionedAsset */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">🎨 VersionedAsset</h4>
          <VersionedAsset
            src="/images/icon.svg"
            type="image"
            alt="Icône avec cache busting"
            className="w-16 h-16 border rounded"
          />
          <p className="text-xs text-gray-500 mt-2">
            Asset générique avec cache busting automatique
          </p>
        </div>

        {/* URLs versionnées */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">🔗 URLs Versionnées</h4>
          <div className="space-y-2">
            {Object.entries(versionedAssets).map(([key, url]) => (
              <div key={key} className="text-xs">
                <strong>{key}:</strong>
                <br />
                <code className="bg-gray-100 px-1 py-0.5 rounded break-all">
                  {url}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Scripts et styles */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">📜 Scripts & Styles</h4>
          <div className="space-y-2 text-xs">
            <div>
              <strong>CSS:</strong>
              <br />
              <code className="bg-gray-100 px-1 py-0.5 rounded">
                {useVersionedUrl('/styles/main.css')}
              </code>
            </div>
            <div>
              <strong>JS:</strong>
              <br />
              <code className="bg-gray-100 px-1 py-0.5 rounded">
                {useVersionedUrl('/scripts/analytics.js')}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions d'utilisation */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">📖 Comment utiliser</h3>
        <div className="text-sm space-y-2">
          <p><strong>1. Composants prêts à l'emploi:</strong></p>
          <code className="block bg-gray-100 p-2 rounded text-xs">
            {`import { VersionedImage, VersionedAsset } from '../lib/versioned-asset';

<VersionedImage src="/images/logo.png" alt="Logo" width={200} height={100} />
<VersionedAsset src="/styles/main.css" type="style" />`}
          </code>
          
          <p><strong>2. Hook pour URLs personnalisées:</strong></p>
          <code className="block bg-gray-100 p-2 rounded text-xs">
            {`import { useVersionedUrl } from '../lib/versioned-asset';

const versionedUrl = useVersionedUrl('/images/hero.jpg');`}
          </code>
          
          <p><strong>3. Configuration automatique:</strong></p>
          <code className="block bg-gray-100 p-2 rounded text-xs">
            {`// Variables d'environnement
NEXT_PUBLIC_VERSION_MODE=timestamp|hash|build|manual
NEXT_PUBLIC_APP_VERSION=1.0.0`}
          </code>
        </div>
      </div>
    </div>
  );
}

export default CacheBusterDemo; 