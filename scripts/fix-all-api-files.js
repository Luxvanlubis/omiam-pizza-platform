/**
 * Script de correction complète de tous les fichiers API
 * Corrige le formatage et les erreurs de syntaxe
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

class APIFileFixer {
  constructor() {
    this.fixedFiles = []
    this.errors = []
    this.report = {
      timestamp: new Date().toISOString(),
      totalFiles: 0,
      fixedFiles: 0,
      errors: 0,
      details: []
    }
  }

  async findAllAPIFiles() {
    try {
      const pattern = 'src/app/api/**/route.ts'
      const files = await glob(pattern, { cwd: process.cwd() })
      console.log(`🔍 Trouvé ${files.length} fichiers API à vérifier`)
      return files.map(file => path.resolve(file))
    } catch (error) {
      console.error('❌ Erreur lors de la recherche des fichiers:', error)
      return []
    }
  }

  needsFormatting(content) {
    // Vérifier si le fichier a des lignes très longues (> 200 caractères)
    const lines = content.split('\n')
    const hasLongLines = lines.some(line => line.length > 200)
    
    // Vérifier si le code est compressé sur une seule ligne
    const hasCompressedCode = content.includes('} catch (error) { console.error(')
    
    return hasLongLines || hasCompressedCode
  }

  formatAPIFile(content) {
    try {
      // Remplacer les patterns communs de code compressé
      let formatted = content

      // Pattern 1: export async function avec try/catch compressé
      formatted = formatted.replace(
        /export async function (\w+)\([^)]*\)\s*\{\s*try\s*\{([^}]+)\}\s*catch\s*\([^)]*\)\s*\{([^}]+)\}\s*\}/g,
        (match, funcName, tryBlock, catchBlock) => {
          const formattedTry = this.formatBlock(tryBlock)
          const formattedCatch = this.formatBlock(catchBlock)
          return `export async function ${funcName}() {\n  try {${formattedTry}\n  } catch (error) {${formattedCatch}\n  }\n}`
        }
      )

      // Pattern 2: Corriger les lignes très longues
      const lines = formatted.split('\n')
      const reformattedLines = lines.map(line => {
        if (line.length > 200) {
          return this.breakLongLine(line)
        }
        return line
      })

      formatted = reformattedLines.join('\n')

      // Pattern 3: Corriger les erreurs de syntaxe communes
      formatted = formatted.replace(/process\.env\.NODE_ENV'development'/g, "process.env.NODE_ENV || 'development'")
      formatted = formatted.replace(/SUPABASE_SERVICE_ROLE_!/g, 'SUPABASE_SERVICE_ROLE_KEY!')

      return formatted
    } catch (error) {
      console.error('❌ Erreur lors du formatage:', error)
      return content
    }
  }

  formatBlock(block) {
    // Formater un bloc de code en ajoutant des retours à la ligne appropriés
    let formatted = block
      .replace(/;\s*/g, ';\n    ')
      .replace(/\{\s*/g, '{\n      ')
      .replace(/\}\s*/g, '\n    }')
      .replace(/,\s*/g, ',\n      ')
    
    return '\n    ' + formatted.trim()
  }

  breakLongLine(line) {
    // Casser les lignes très longues en plusieurs lignes
    if (line.includes('NextResponse.json(')) {
      return line.replace(
        /NextResponse\.json\(\s*\{([^}]+)\}\s*,?\s*\{?([^}]*)\}?\s*\)/g,
        (match, jsonContent, options) => {
          const formattedJson = jsonContent.split(',').map(item => '      ' + item.trim()).join(',\n')
          if (options) {
            return `NextResponse.json({\n${formattedJson}\n    }, { ${options.trim()} })`
          }
          return `NextResponse.json({\n${formattedJson}\n    })`
        }
      )
    }
    return line
  }

  async fixFile(filePath) {
    try {
      console.log(`🔧 Traitement: ${path.relative(process.cwd(), filePath)}`)
      
      const content = fs.readFileSync(filePath, 'utf8')
      
      if (!this.needsFormatting(content)) {
        console.log(`  ✅ Déjà formaté correctement`)
        return { success: true, changed: false }
      }

      // Créer une sauvegarde
      const backupPath = filePath + '.backup'
      fs.writeFileSync(backupPath, content)

      // Formater le contenu
      const formattedContent = this.formatAPIFile(content)
      
      // Écrire le fichier formaté
      fs.writeFileSync(filePath, formattedContent)
      
      console.log(`  ✅ Corrigé (backup: ${path.basename(backupPath)})`)
      this.fixedFiles.push({
        file: filePath,
        backup: backupPath,
        timestamp: new Date().toISOString()
      })
      
      return { success: true, changed: true }
    } catch (error) {
      console.error(`  ❌ Erreur: ${error.message}`)
      this.errors.push({
        file: filePath,
        error: error.message,
        timestamp: new Date().toISOString()
      })
      return { success: false, error: error.message }
    }
  }

  async fixAllFiles() {
    console.log('🚀 Démarrage de la correction complète des fichiers API\n')
    
    const files = await this.findAllAPIFiles()
    this.report.totalFiles = files.length
    
    if (files.length === 0) {
      console.log('❌ Aucun fichier API trouvé')
      return
    }

    for (const file of files) {
      const result = await this.fixFile(file)
      
      this.report.details.push({
        file: path.relative(process.cwd(), file),
        success: result.success,
        changed: result.changed || false,
        error: result.error || null
      })
      
      if (result.success && result.changed) {
        this.report.fixedFiles++
      } else if (!result.success) {
        this.report.errors++
      }
    }

    this.generateReport()
  }

  generateReport() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 RAPPORT DE CORRECTION')
    console.log('='.repeat(60))
    console.log(`📁 Fichiers traités: ${this.report.totalFiles}`)
    console.log(`✅ Fichiers corrigés: ${this.report.fixedFiles}`)
    console.log(`❌ Erreurs: ${this.report.errors}`)
    console.log(`📈 Taux de succès: ${Math.round((this.report.fixedFiles / this.report.totalFiles) * 100)}%`)
    
    if (this.fixedFiles.length > 0) {
      console.log('\n📝 Fichiers corrigés:')
      this.fixedFiles.forEach(item => {
        console.log(`  - ${path.relative(process.cwd(), item.file)} (backup: ${path.basename(item.backup)})`)
      })
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Erreurs rencontrées:')
      this.errors.forEach(item => {
        console.log(`  - ${path.relative(process.cwd(), item.file)}: ${item.error}`)
      })
    }

    // Sauvegarder le rapport
    const reportPath = path.join(process.cwd(), `api-complete-fix-${Date.now()}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2))
    console.log(`\n💾 Rapport sauvegardé: ${reportPath}`)
    
    console.log('\n🎉 Correction terminée!')
  }
}

// Exécution
if (require.main === module) {
  const fixer = new APIFileFixer()
  fixer.fixAllFiles().catch(console.error)
}

module.exports = APIFileFixer