
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { SupabaseIntegrationService } from './supabase-integration';
import { cmsServiceMock } from './cms-service-mock';
import * as path from 'path';

// Types de base de données
type DBContentItem = Database['public']['Tables']['content_items']['Row'];
type DBContentVersion = Database['public']['Tables']['content_versions']['Row'];
type DBContentTemplate = Database['public']['Tables']['content_templates']['Row'];

export interface ContentItem {
  id: string;
  key: string;
  title: string;
  content: string;
  type: 'text' | 'title' | 'description' | 'button' | 'link' | 'image' | 'video' | 'html';
  page: string;
  section: string;
  metadata?: {
    alt?: string;
    url?: string;
    target?: string;
    className?: string;
    style?: Record<string, string>;
    level?: string;
    format?: string;
    icon?: string;
    position?: string;
  };
  isPublished: boolean;
  published: boolean; // Alias pour compatibilité
  version: number;
  createdAt: string;
  updatedAt: string;
  lastModified: string; // Alias pour compatibilité
  createdBy: string;
  updatedBy: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  // Propriétés additionnelles pour compatibilité
  display?: string;
  main?: string;
  recentlyModified?: number;
  versions?: ContentVersion[];
  changes?: string[];
  // Propriétés SEO et status
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  status?: 'draft' | 'published' | 'archived';
  priority?: number;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  content: string;
  title: string;
  metadata?: Record<string, any>;
  createdAt: string;
  createdBy: string;
  changeNote?: string;
  changes?: string[]; // Propriété pour compatibilité
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  type: ContentItem['type'];
  defaultContent: string;
  defaultMetadata?: Record<string, any>;
  fields: {
    name: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'url' | 'image';
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
  }[];
  createdAt: string;
}

export interface CMSStats {
  totalContent: number;
  publishedContent: number;
  draftContent: number;
  totalPages: number;
  recentUpdates: number;
  recentlyModified: number; // Alias pour compatibilité
  contentByType: Record<string, number>;
  contentByPage: Record<string, number>;
}

// Fonction de validation des chemins sécurisés
function validateSecurePath(filePath: string): boolean {
  const normalizedPath = path.normalize(filePath);
  return !normalizedPath.includes('..');
}

class CMSService {
  private integrationService = new SupabaseIntegrationService();
  private useMockData = false;
  private supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  constructor() {
    // Détecter si Supabase est disponible
    this.checkSupabaseAvailability();
  }

  private async checkSupabaseAvailability() {
    try {
      const isConnected = await this.integrationService.checkConnection();
      this.useMockData = !isConnected;
    } catch (error) {
      this.useMockData = true;
    }
  }

  // Gestion du contenu
  async getContent(filters?: {
    page?: string;
    type?: string;
    section?: string;
    isPublished?: boolean;
    search?: string;
    tags?: string[];
  }): Promise<ContentItem[]> {
    // Utiliser les données mockées si Supabase n'est pas disponible
    if (this.useMockData) {
      return cmsServiceMock.getContent(filters);
    }

    try {
      // Utiliser Supabase pour récupérer le contenu
      let query = this.supabase.from('content_items').select('*');
      
      if (filters?.page) {
        query = query.eq('page', filters.page);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.section) {
        query = query.eq('section', filters.section);
      }
      if (filters?.isPublished !== undefined) {
        query = query.eq('is_published', filters.isPublished);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }
      
      const { data, error } = await query.order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transformer les données au format attendu
        return data.map((item: any) => ({
          id: String(item.id),
          key: item.key,
          title: item.title,
          content: item.content,
          type: item.type,
          page: item.page,
          section: item.section,
          metadata: item.metadata,
          isPublished: item.is_published,
          published: item.is_published,
          version: item.version || 1,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          lastModified: item.updated_at,
          createdBy: item.created_by || 'system',
          updatedBy: item.updated_by || 'system',
          tags: item.tags,
          seoTitle: item.seo_title,
          seoDescription: item.seo_description,
          seoKeywords: item.seo_keywords,
          status: item.status || 'published',
          priority: item.priority || 0
        }));
      }

      // Fallback vers les données mock
      return cmsServiceMock.getContent(filters);
    } catch (error) {
      console.error('Erreur lors de la récupération du contenu:', error);
      return cmsServiceMock.getContent(filters);
    }
  }

  async getContentByKey(key: string): Promise<ContentItem | null> {
    if (this.useMockData) {
      return cmsServiceMock.getContentByKey(key);
    }

    try {
      const { data, error } = await this.supabase
        .from('content_items')
        .select('*')
        .eq('key', key)
        .eq('isPublished', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du contenu avec la clé ${key}:`, error);
      return null;
    }
  }

  async createContent(content: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<ContentItem | null> {
    if (this.useMockData) {
      return cmsServiceMock.createContent(content);
    }

    try {
      const newContent = {
        ...content,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('content_items')
        .insert([newContent])
        .select()
        .single();

      if (error) throw error;

      // Créer la première version
      await this.createContentVersion({
        contentId: data.id,
        version: 1,
        content: content.content,
        title: content.title,
        metadata: content.metadata,
        createdBy: content.createdBy,
        changeNote: 'Création initiale'
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la création du contenu:', error);
      return null;
    }
  }

  async updateContent(id: string, updates: Partial<ContentItem>, changeNote?: string): Promise<ContentItem | null> {
    if (this.useMockData) {
      return cmsServiceMock.updateContent(id, updates, changeNote);
    }

    try {
      // Récupérer le contenu actuel
      const { data: currentContent, error: fetchError } = await this.supabase
        .from('content_items')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !currentContent) throw new Error('Contenu non trouvé');

      const updatedContent = {
        ...updates,
        version: currentContent.version + 1,
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('content_items')
        .update(updatedContent)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Créer une nouvelle version si le contenu a changé
      if (updates.content || updates.title || updates.metadata) {
        await this.createContentVersion({
          contentId: id,
          version: data.version,
          content: data.content,
          title: data.title,
          metadata: data.metadata,
          createdBy: updates.updatedBy || 'system',
          changeNote: changeNote || 'Mise à jour'
        });
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contenu:', error);
      return null;
    }
  }

  async deleteContent(id: string): Promise<boolean> {
    if (this.useMockData) {
      return cmsServiceMock.deleteContent(id);
    }

    try {
      // Supprimer les versions associées
      await this.supabase
        .from('content_versions')
        .delete()
        .eq('contentId', id);

      // Supprimer le contenu
      const { error } = await this.supabase
        .from('content_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du contenu:', error);
      return false;
    }
  }

  async publishContent(id: string): Promise<boolean> {
    if (this.useMockData) {
      return cmsServiceMock.publishContent(id);
    }

    try {
      const { error } = await this.supabase
        .from('content_items')
        .update({
          isPublished: true,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la publication du contenu:', error);
      return false;
    }
  }

  async unpublishContent(id: string): Promise<boolean> {
    if (this.useMockData) {
      return cmsServiceMock.unpublishContent(id);
    }

    try {
      const { error } = await this.supabase
        .from('content_items')
        .update({
          isPublished: false,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la dépublication du contenu:', error);
      return false;
    }
  }

  // Gestion des versions
  async createContentVersion(version: Omit<ContentVersion, 'id' | 'createdAt'>): Promise<ContentVersion | null> {
    try {
      const newVersion = {
        ...version,
        createdAt: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('content_versions')
        .insert([newVersion])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la version:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  async getContentVersions(contentId: string): Promise<ContentVersion[]> {
    try {
      const { data, error } = await this.supabase
        .from('content_versions')
        .select('*')
        .eq('content_id', contentId)
        .order('version', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des versions:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  async restoreContentVersion(contentId: string, version: number): Promise<boolean> {
    try {
      // Récupérer la version à restaurer
      const { data: versionData } = await this.supabase
        .from('content_versions')
        .select('*')
        .eq('contentId', contentId)
        .eq('version', version)
        .single();

      if (!versionData) throw new Error('Version non trouvée');

      // Mettre à jour le contenu avec les données de la version
      const { error } = await this.supabase
        .from('content_items')
        .update({
          content: versionData.content,
          title: versionData.title,
          metadata: versionData.metadata,
          updatedAt: new Date().toISOString()
        })
        .eq('id', contentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la restauration de la version:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  // Gestion des templates
  async getTemplates(): Promise<ContentTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from('content_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  async createTemplate(template: Omit<ContentTemplate, 'id' | 'createdAt'>): Promise<ContentTemplate | null> {
    try {
      const newTemplate = {
        ...template,
        createdAt: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('content_templates')
        .insert([newTemplate])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du template:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  // Statistiques
  async getCMSStats(): Promise<CMSStats> {
    if (this.useMockData) {
      return cmsServiceMock.getCMSStats();
    }

    try {
      const { data: allContent } = await this.supabase
        .from('content_items')
        .select('type, page, isPublished, updatedAt');

      if (!allContent) {
        return {
          totalContent: 0,
          publishedContent: 0,
          draftContent: 0,
          totalPages: 0,
          recentUpdates: 0,
          recentlyModified: 0,
          contentByType: {},
          contentByPage: {}
        };
      }

      const publishedContent = allContent.filter(item => item.isPublished).length;
      const draftContent = allContent.length - publishedContent;
      const uniquePages = new Set(allContent.map(item => item.page)).size;

      // Mises à jour récentes (dernières 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const recentUpdates = allContent.filter(item => 
        new Date(item.updatedAt) > yesterday
      ).length;

      // Contenu par type
      const contentByType = allContent.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Contenu par page
      const contentByPage = allContent.reduce((acc, item) => {
        acc[item.page] = (acc[item.page] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalContent: allContent.length,
        publishedContent,
        draftContent,
        totalPages: uniquePages,
        recentUpdates,
        recentlyModified: recentUpdates, // Alias pour compatibilité
        contentByType,
        contentByPage
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques CMS:', error instanceof Error ? error.message : String(error));
      return {
        totalContent: 0,
        publishedContent: 0,
        draftContent: 0,
        totalPages: 0,
        recentUpdates: 0,
        recentlyModified: 0,
        contentByType: {},
        contentByPage: {}
      };
    }
  }

  // Recherche avancée
  async searchContent(query: string, filters?: {
    type?: string;
    page?: string;
    tags?: string[];
    dateRange?: { start: string; end: string };
  }): Promise<ContentItem[]> {
    if (this.useMockData) {
      return cmsServiceMock.searchContent(query, filters);
    }

    try {
      let supabaseQuery = this.supabase
        .from('content_items')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,key.ilike.%${query}%,tags.cs.{"${query}"}`);

      if (filters?.type) {
        supabaseQuery = supabaseQuery.eq('type', filters.type);
      }

      if (filters?.page) {
        supabaseQuery = supabaseQuery.eq('page', filters.page);
      }

      if (filters?.tags && filters.tags.length > 0) {
        supabaseQuery = supabaseQuery.contains('tags', filters.tags);
      }

      if (filters?.dateRange) {
        supabaseQuery = supabaseQuery
          .gte('updatedAt', filters.dateRange.start)
          .lte('updatedAt', filters.dateRange.end);
      }

      const { data, error } = await supabaseQuery.order('updatedAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  // Export/Import
  async exportContent(format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const content = await this.getContent();
      
      if (format === 'json') {
        return JSON.stringify(content, null, 2);
      } else {
        // Format CSV
        const headers = ['id', 'key', 'title', 'content', 'type', 'page', 'section', 'isPublished'];
        const csvContent = [
          headers.join(','),
          ...content.map(item => [
            item.id,
            item.key,
            `"${item.title.replace(/"/g, '""')}"`,
            `"${item.content.replace(/"/g, '""')}"`,
            item.type,
            item.page,
            item.section,
            item.isPublished
          ].join(','))
        ].join('\n');
        
        return csvContent;
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error instanceof Error ? error.message : String(error));
      return '';
    }
  }

  async importContent(data: ContentItem[], replaceExisting = false): Promise<{ success: number; errors: number }> {
    let success = 0;
    let errors = 0;

    for (const item of data) {
      try {
        if (replaceExisting) {
          // Vérifier si le contenu existe déjà
          const existing = await this.getContentByKey(item.key);
          if (existing) {
            await this.updateContent(existing.id, item);
          } else {
            await this.createContent(item);
          }
        } else {
          await this.createContent(item);
        }
        success++;
      } catch (error) {
        console.error(`Erreur lors de l'import de ${item.key}:`, error instanceof Error ? error.message : String(error));
        errors++;
      }
    }

    return { success, errors };
  }
}

export const cmsService = new CMSService();
export default cmsService;