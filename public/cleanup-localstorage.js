
// Script de nettoyage du localStorage
(function() {
  console.log('🧹 Nettoyage du localStorage...');
  
  const keysToClean = [
    'cart',
    'omiam_cache_menu-items',
    'cookie_preferences',
    'cookie_consent',
    'pwa_settings',
    'offline_actions'
  ];
  
  let cleaned = 0;
  
  keysToClean.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        // Tester si c'est du JSON valide
        JSON.parse(value);
        console.log('✅ ' + key + ' - JSON valide');
      }
    } catch (error) {
      console.log('❌ ' + key + ' - JSON corrompu, suppression...');
      localStorage.removeItem(key);
      cleaned++;
    }
  });
  
  console.log('🎉 Nettoyage terminé. ' + cleaned + ' entrées corrompues supprimées.');
  
  // Recharger la page si des corrections ont été faites
  if (cleaned > 0) {
    console.log('🔄 Rechargement de la page...');
    setTimeout(() => window.location.reload(), 1000);
  }
})();
