/**
 * Script de nettoyage du localStorage pour résoudre les erreurs JSON
 * Supprime toutes les données localStorage potentiellement corrompues
 */

const KEYS_TO_CLEAR = [
  // Clés OMIAM spécifiques
  'omiam-cookie-consent',
  'omiam-cookie-preferences',
  'omiam_last_sync',
  'omiam_offline_actions',
  
  // Clés de cache
  'cart-items',
  'user-preferences',
  'menu-cache',
  'offline-menu',
  'notifications',
  'push-subscription',
  
  // Clés génériques qui pourraient être corrompues
  'i18n-lang',
  'theme-preference',
  'gdpr-consent'
];

function clearCorruptedLocalStorage() {
  console.log('🧹 Nettoyage du localStorage...');
  
  let clearedCount = 0;
  let errorCount = 0;
  
  // Nettoyer les clés spécifiques
  KEYS_TO_CLEAR.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        // Tenter de parser pour détecter la corruption
        try {
          JSON.parse(value);
          console.log(`✅ ${key}: JSON valide`);
        } catch (parseError) {
          console.log(`❌ ${key}: JSON corrompu - suppression`);
          localStorage.removeItem(key);
          clearedCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors du nettoyage de ${key}:`, error.message);
      errorCount++;
    }
  });
  
  // Nettoyer les clés avec préfixes OMIAM
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.startsWith('omiam_cache_') || key.startsWith('omiam-') || key.startsWith('OMIAM_')) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            JSON.parse(value);
            console.log(`✅ ${key}: JSON valide`);
          } catch (parseError) {
            console.log(`❌ ${key}: JSON corrompu - suppression`);
            localStorage.removeItem(key);
            clearedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Erreur lors du nettoyage de ${key}:`, error.message);
        errorCount++;
      }
    }
  });
  
  console.log(`\n📊 Résumé du nettoyage:`);
  console.log(`   - Éléments supprimés: ${clearedCount}`);
  console.log(`   - Erreurs rencontrées: ${errorCount}`);
  console.log(`   - Éléments restants: ${Object.keys(localStorage).length}`);
  
  if (clearedCount > 0) {
    console.log('\n🔄 Redémarrez l\'application pour appliquer les changements.');
  } else {
    console.log('\n✨ Aucune donnée corrompue détectée.');
  }
}

// Exécuter le nettoyage
if (typeof window !== 'undefined' && window.localStorage) {
  clearCorruptedLocalStorage();
} else {
  console.log('❌ localStorage non disponible');
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { clearCorruptedLocalStorage };
}