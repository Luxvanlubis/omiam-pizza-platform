
/**
 * Middleware de validation JSON
 * Intercepte et valide les données JSON avant parsing
 */

export function safeJsonParse(jsonString: string, fallback: any = null) {
  if (!jsonString || typeof jsonString !== 'string') {
    console.warn('⚠️ safeJsonParse: Données invalides reçues');
    return fallback;
  }
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('❌ Erreur JSON parsing:', {
      error: error.message,
      position: error.message.match(/position (\d+)/)?.[1],
      context: jsonString.substring(0, 100) + '...'
    });
    
    // Tentative de correction automatique pour les erreurs courantes
    try {
      // Corriger les guillemets manquants
      let corrected = jsonString
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
        .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, ': "$1"$2');
      
      return JSON.parse(corrected);
    } catch (correctionError) {
      console.error('❌ Impossible de corriger automatiquement le JSON');
      return fallback;
    }
  }
}

export function safeLocalStorageGet(key: string, fallback: any = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? safeJsonParse(value, fallback) : fallback;
  } catch (error) {
    console.error('❌ Erreur localStorage:', error.message);
    return fallback;
  }
}

export function safeLocalStorageSet(key: string, value: any): boolean {
  try {
    const jsonString = JSON.stringify(value);
    localStorage.setItem(key, jsonString);
    return true;
  } catch (error) {
    console.error('❌ Erreur sauvegarde localStorage:', error.message);
    return false;
  }
}
