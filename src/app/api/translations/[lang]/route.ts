
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabaseIntegrationService } from '@/lib/supabase-integration-service';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Valide et sécurise un chemin de fichier
 * @param {string} userPath - Chemin fourni par l'utilisateur
 * @param {string} basePath - Chemin de base autorisé
 * @returns {string} - Chemin sécurisé
 */
function validateSecurePath(userPath: string, basePath: string = process.cwd()): string {
  if (!userPath || typeof userPath !== 'string') {
    throw new Error('Chemin invalide');
  }
  // Normaliser le chemin et vérifier qu'il reste dans le répertoire autorisé
  const normalizedPath = path.normalize(path.join(basePath, userPath));
  const normalizedBase = path.normalize(basePath);
  if (!normalizedPath.startsWith(normalizedBase)) {
    throw new Error('Accès au chemin non autorisé');
  }
  return normalizedPath;
}

// Types pour les traductions
interface Translation {
  [key: string]: string | Translation;
}

// Cache des traductions en mémoire
const translationCache = new Map<string, Translation>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

// Langues supportées
const SUPPORTED_LANGUAGES = ['fr', 'en', 'es', 'de', 'it', 'ar'];

// Fonction pour charger les traductions depuis le fichier
async function loadTranslationsFromFile(lang: string): Promise<Translation | null> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'locales', `${lang}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Erreur lors du chargement des traductions pour ${lang}:`, error);
    return null;
  }
}

// Fonction pour charger les traductions depuis la base de données (à implémenter)
async function loadTranslationsFromDB(lang: string): Promise<Translation | null> {
  // TODO: Implémenter la récupération depuis Supabase
  // Cette fonction sera utilisée pour charger les traductions personnalisées
  // depuis la base de données, permettant aux administrateurs de modifier
  // les traductions via l'interface d'administration
  try {
    // Exemple d'implémentation avec Supabase
    // const { data, error } = await supabase
    //   .from('translations')
    //   .select('key, value')
    //   .eq('language', lang)
    //   .eq('active', true);
    // if (error) throw error;
    // const translations: Translation = {};
    // data?.forEach(item => {
    //   setNestedValue(translations, item.key, item.value);
    // });
    // return translations;
    return null;
  } catch (error) {
    console.error(`Erreur lors du chargement des traductions DB pour ${lang}:`, error);
    return null;
  }
}

// Fonction utilitaire pour définir une valeur imbriquée
function setNestedValue(obj: any, path: string, value: string) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

// Fonction pour fusionner les traductions
function mergeTranslations(base: Translation, override: Translation): Translation {
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
        result[key] = mergeTranslations(result[key] as Translation, value as Translation);
      } else {
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Fonction pour obtenir les traductions avec cache
async function getTranslations(lang: string): Promise<Translation> {
  const now = Date.now();
  const cacheKey = lang;
  const cachedTimestamp = cacheTimestamps.get(cacheKey);
  
  // Vérifier si le cache est valide
  if (cachedTimestamp && (now - cachedTimestamp) < CACHE_DURATION) {
    const cached = translationCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  // Charger les traductions de base depuis le fichier
  let baseTranslations = await loadTranslationsFromFile(lang);
  
  // Si la langue n'existe pas, utiliser le français par défaut
  if (!baseTranslations && lang !== 'fr') {
    baseTranslations = await loadTranslationsFromFile('fr');
  }
  
  if (!baseTranslations) {
    throw new Error('Aucune traduction trouvée');
  }
  
  // Charger les traductions personnalisées depuis la DB
  const dbTranslations = await loadTranslationsFromDB(lang);
  
  // Fusionner les traductions
  let finalTranslations = baseTranslations;
  if (dbTranslations) {
    finalTranslations = mergeTranslations(baseTranslations, dbTranslations);
  }
  
  // Mettre en cache
  translationCache.set(cacheKey, finalTranslations);
  cacheTimestamps.set(cacheKey, now);
  
  return finalTranslations;
}

// Handler GET pour récupérer les traductions
export async function GET(
  request: NextRequest,
  { params }: { params: { lang: string } }
) {
  try {
    const { lang } = params;

    // Valider la langue
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      return NextResponse.json(
        { error: 'Langue non supportée' },
        { status: 400 }
      );
    }

    // Récupérer les traductions
    const translations = await getTranslations(lang);

    // Headers pour le cache
    const headers = {
      'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minutes
      'Content-Type': 'application/json',
    };

    return NextResponse.json(translations, { headers });
  } catch (error) {
    console.error('Erreur lors de la récupération des traductions:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Handler POST pour mettre à jour les traductions (admin seulement)
export async function POST(
  request: NextRequest,
  { params }: { params: { lang: string } }
) {
  try {
    const { lang } = params;

    // Valider la langue
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      return NextResponse.json(
        { error: 'Langue non supportée' },
        { status: 400 }
      );
    }

    // Vérifier l'authentification avec Supabase
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Vérifier le rôle administrateur
    const { data: profile, error: profileError } = await supabaseIntegrationService
      .getSupabaseClient()
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé - Droits administrateur requis' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { key, value, action = 'update' } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'Clé de traduction requise' },
        { status: 400 }
      );
    }

    // TODO: Implémenter la sauvegarde en base de données
    // switch (action) {
    //   case 'update':
    //     await supabase
    //       .from('translations')
    //       .upsert({
    //         language: lang,
    //         key,
    //         value,
    //         updated_at: new Date().toISOString()
    //       });
    //     break;
    //
    //   case 'delete':
    //     await supabase
    //       .from('translations')
    //       .delete()
    //       .eq('language', lang)
    //       .eq('key', key);
    //     break;
    // }

    // Invalider le cache
    translationCache.delete(lang);
    cacheTimestamps.delete(lang);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des traductions:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Handler DELETE pour supprimer le cache
export async function DELETE(
  request: NextRequest,
  { params }: { params: { lang: string } }
) {
  try {
    const { lang } = params;

    // Invalider le cache pour la langue spécifiée ou toutes les langues
    if (lang === 'all') {
      translationCache.clear();
      cacheTimestamps.clear();
    } else {
      translationCache.delete(lang);
      cacheTimestamps.delete(lang);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du cache:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}