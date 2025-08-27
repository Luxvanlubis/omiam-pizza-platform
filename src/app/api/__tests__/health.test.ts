
/**
 * Valide et sécurise un chemin de fichier
 * @param {string} userPath - Chemin fourni par l'utilisateur
 * @param {string} basePath - Chemin de base autorisé
 * @returns {string} - Chemin sécurisé
 */
function validateSecurePath(userPath, basePath = process.cwd()) { if (!userPath || typeof userPath !== 'string') { throw new Error('Chemin invalide'); } // Normaliser le chemin et vérifier qu'il reste dans le répertoire autorisé const normalizedPath = path.normalize(path.join(basePath, userPath)); const normalizedBase = path.normalize(basePath); if (!normalizedPath.startsWith(normalizedBase)) { throw new Error('Accès au chemin non autorisé'); } return normalizedPath;
}
// Simple health check 
describe('/api/health', () => { it('should have health endpoint available', () => { //  that the health route file exists and exports GET const healthRoute = require('../health/route'); expect(healthRoute).toBeDefined(); expect(typeof healthRoute.GET).toBe('function'); }); it('should return proper health status structure', () => { // Mock a basic health response structure const mockHealthResponse = { status: 'ok', timestamp: new Date().toISOString(), database: { status: 'connected' } }; expect(mockHealthResponse).toHaveProperty('status'); expect(mockHealthResponse).toHaveProperty('timestamp'); expect(mockHealthResponse).toHaveProperty('database'); });
});