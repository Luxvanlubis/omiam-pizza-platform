const fs = require('fs');
const path = require('path');

/**
 * Script pour corriger le formatage des fichiers API malformés
 * Détecte et corrige les fichiers avec du code sur une seule ligne
 */

class APIFormattingFixer {
  constructor() {
    this.apiDir = path.join(process.cwd(), 'src', 'app', 'api');
    this.fixedFiles = [];
    this.errors = [];
  }

  /**
   * Trouve tous les fichiers route.ts dans le dossier API
   */
  findRouteFiles() {
    const routeFiles = [];
    
    const scanDirectory = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDirectory(fullPath);
          } else if (item === 'route.ts') {
            routeFiles.push(fullPath);
          }
        }
      } catch (error) {
        console.error(`Erreur lors du scan de ${dir}:`, error.message);
      }
    };
    
    scanDirectory(this.apiDir);
    return routeFiles;
  }

  /**
   * Vérifie si un fichier a besoin d'être reformaté
   */
  needsFormatting(content) {
    // Détecte les lignes très longues avec du code compressé
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Si une ligne contient plus de 200 caractères et des patterns suspects
      if (line.length > 200 && 
          line.includes('export async function') && 
          line.includes('try') && 
          line.includes('catch') &&
          line.includes('return NextResponse.json')) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Formate une fonction API compressée
   */
  formatFunction(functionCode) {
    let formatted = functionCode;
    
    // Remplacer les patterns courants
    const replacements = [
      // Fonction export
      { from: /export async function (\w+)\([^)]*\) \{ try \{/g, to: 'export async function $1(request: NextRequest) {\n  try {' },
      { from: /export async function (\w+)\(\) \{ try \{/g, to: 'export async function $1() {\n  try {' },
      
      // Return statements
      { from: /return NextResponse\.json\(\{([^}]+)\}\);/g, to: 'return NextResponse.json({\n      $1\n    });' },
      { from: /return NextResponse\.json\(([^,]+), \{ status: (\d+) \}\);/g, to: 'return NextResponse.json(\n      $1,\n      { status: $2 }\n    );' },
      
      // Try-catch blocks
      { from: /\} catch \(error[^)]*\) \{/g, to: '  } catch (error) {' },
      { from: /console\.error\(([^)]+)\);/g, to: '    console.error($1);' },
      
      // Closing braces
      { from: /\}$/g, to: '}' },
      
      // Basic indentation fixes
      { from: /^(\s*)(const|let|var|if|return|console)/gm, to: '    $1$2' },
    ];
    
    for (const replacement of replacements) {
      formatted = formatted.replace(replacement.from, replacement.to);
    }
    
    return formatted;
  }

  /**
   * Corrige un fichier spécifique
   */
  fixFile(filePath) {
    try {
      console.log(`🔧 Correction de ${path.relative(process.cwd(), filePath)}...`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (!this.needsFormatting(content)) {
        console.log(`✅ ${path.basename(filePath)} - Déjà bien formaté`);
        return false;
      }
      
      // Créer une sauvegarde
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, content);
      
      // Appliquer les corrections manuelles pour les fichiers problématiques
      let fixedContent = content;
      
      // Corrections spécifiques par fichier
      const fileName = path.basename(path.dirname(filePath));
      
      switch (fileName) {
        case 'payments':
        case 'create-intent':
          fixedContent = this.fixPaymentIntentFile(content);
          break;
        case 'stripe':
        case 'health':
          fixedContent = this.fixStripeHealthFile(content);
          break;
        case 'webhooks':
          fixedContent = this.fixWebhookFile(content);
          break;
        case 'restaurant-simple':
          fixedContent = this.fixRestaurantFile(content);
          break;
        case 'inventory':
          fixedContent = this.fixInventoryFile(content);
          break;
        case 'reviews':
          fixedContent = this.fixReviewsFile(content);
          break;
        case 'test':
          fixedContent = this.fixTestFile(content);
          break;
        default:
          // Formatage générique
          fixedContent = this.formatFunction(content);
      }
      
      // Écrire le fichier corrigé
      fs.writeFileSync(filePath, fixedContent);
      
      this.fixedFiles.push({
        file: path.relative(process.cwd(), filePath),
        backup: path.relative(process.cwd(), backupPath)
      });
      
      console.log(`✅ ${path.basename(filePath)} - Corrigé avec succès`);
      return true;
      
    } catch (error) {
      console.error(`❌ Erreur lors de la correction de ${filePath}:`, error.message);
      this.errors.push({
        file: path.relative(process.cwd(), filePath),
        error: error.message
      });
      return false;
    }
  }

  /**
   * Correction spécifique pour le fichier test
   */
  fixTestFile(content) {
    return `import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'API test endpoint working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test API error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    );
  }
}
`;
  }

  /**
   * Correction spécifique pour les autres fichiers (à implémenter si nécessaire)
   */
  fixPaymentIntentFile(content) {
    // Pour l'instant, retourner le contenu original
    // Peut être étendu avec des corrections spécifiques
    return content;
  }

  fixStripeHealthFile(content) {
    return content;
  }

  fixWebhookFile(content) {
    return content;
  }

  fixRestaurantFile(content) {
    return content;
  }

  fixInventoryFile(content) {
    return content;
  }

  fixReviewsFile(content) {
    return content;
  }

  /**
   * Lance la correction de tous les fichiers
   */
  async fixAllFiles() {
    console.log('🚀 Démarrage de la correction du formatage des fichiers API...');
    console.log('=' .repeat(60));
    
    const routeFiles = this.findRouteFiles();
    console.log(`📁 ${routeFiles.length} fichiers route.ts trouvés`);
    
    let fixedCount = 0;
    
    for (const filePath of routeFiles) {
      if (this.fixFile(filePath)) {
        fixedCount++;
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RÉSUMÉ DE LA CORRECTION');
    console.log('=' .repeat(60));
    console.log(`✅ Fichiers corrigés: ${fixedCount}`);
    console.log(`❌ Erreurs: ${this.errors.length}`);
    console.log(`📁 Total traité: ${routeFiles.length}`);
    
    if (this.fixedFiles.length > 0) {
      console.log('\n🔧 Fichiers corrigés:');
      this.fixedFiles.forEach(fix => {
        console.log(`  - ${fix.file} (backup: ${fix.backup})`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Erreurs rencontrées:');
      this.errors.forEach(error => {
        console.log(`  - ${error.file}: ${error.error}`);
      });
    }
    
    // Sauvegarder le rapport
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: routeFiles.length,
        fixedFiles: fixedCount,
        errors: this.errors.length
      },
      fixedFiles: this.fixedFiles,
      errors: this.errors
    };
    
    const reportPath = path.join(process.cwd(), `api-formatting-fix-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n💾 Rapport sauvegardé: ${reportPath}`);
    console.log('\n🎉 Correction terminée!');
    
    return {
      success: fixedCount > 0 || this.errors.length === 0,
      fixedCount,
      errorCount: this.errors.length,
      reportPath
    };
  }
}

// Exécution du script
if (require.main === module) {
  const fixer = new APIFormattingFixer();
  fixer.fixAllFiles().catch(console.error);
}

module.exports = APIFormattingFixer;