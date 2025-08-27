
// Utilitaire de sécurité pour la validation des chemins
export function validateSecurePath(inputPath: string): string { if (!inputPath || typeof inputPath !== 'string') { throw new Error('Chemin invalide'); } // Bloquer les tentatives de path traversal if (inputPath.includes('..') || inputPath.includes('~') || inputPath.includes('\\')) { throw new Error('Chemin non autorisé - tentative de path traversal détectée'); } // Normaliser le chemin const normalizedPath = path.normalize(inputPath).replace(/\\/g, '/'); // Liste des chemins autorisés const allowedPaths = [ '/public', '/uploads', '/assets', '/api', '/images', 'public', 'uploads', 'assets', 'api', 'images' ]; // Vérifier que le chemin reste dans les limites autorisées const isAllowed = allowedPaths.some(allowed => normalizedPath.startsWith(allowed) || normalizedPath.startsWith('/' + allowed) || normalizedPath.startsWith('./' + allowed) ); if (!isAllowed && !normalizedPath.startsWith('/') && !normalizedPath.startsWith('./')) { // Permettre les chemins relatifs simples sans '..' if (!normalizedPath.includes('/') || normalizedPath.split('/').length <= 2) { return normalizedPath; } throw new Error('Accès au chemin non autorisé'); } return normalizedPath;
}

export function securePathJoin(...paths: string[]): string { const joinedPath = path.join(...paths); return validateSecurePath(joinedPath);
}
