
import { useState, useEffect, useCallback } from 'react';
import { cmsService, ContentItem, ContentVersion, ContentTemplate, CMSStats } from '../lib/cms-service';

export interface UseCMSOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  filters?: {
    page?: string;
    type?: string;
    section?: string;
    isPublished?: boolean;
    search?: string;
    tags?: string[];
  };
}

export interface UseCMSReturn {
  content: ContentItem[];
  loading: boolean;
  error: string | null;
  stats: CMSStats | null;
  refresh: () => Promise<void>;
  createContent: (content: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<ContentItem | null>;
  updateContent: (id: string, updates: Partial<ContentItem>, changeNote?: string) => Promise<ContentItem | null>;
  deleteContent: (id: string) => Promise<boolean>;
  publishContent: (id: string) => Promise<boolean>;
  unpublishContent: (id: string) => Promise<boolean>;
  searchContent: (query: string, filters?: any) => Promise<ContentItem[]>;
}

export function useCMS(options: UseCMSOptions = {}): UseCMSReturn {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CMSStats | null>(null);

  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 secondes
    filters
  } = options;

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [contentData, statsData] = await Promise.all([
        cmsService.getContent(filters),
        cmsService.getCMSStats()
      ]);
      setContent(contentData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du contenu');
      console.error('Erreur CMS:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refresh = useCallback(async () => {
    await loadContent();
  }, [loadContent]);

  const createContent = useCallback(async (newContent: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    try {
      const result = await cmsService.createContent(newContent);
      if (result) {
        await refresh();
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du contenu');
      return null;
    }
  }, [refresh]);

  const updateContent = useCallback(async (id: string, updates: Partial<ContentItem>, changeNote?: string) => {
    try {
      const result = await cmsService.updateContent(id, updates, changeNote);
      if (result) {
        await refresh();
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du contenu');
      return null;
    }
  }, [refresh]);

  const deleteContent = useCallback(async (id: string) => {
    try {
      const result = await cmsService.deleteContent(id);
      if (result) {
        await refresh();
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du contenu');
      return false;
    }
  }, [refresh]);

  const publishContent = useCallback(async (id: string) => {
    try {
      const result = await cmsService.publishContent(id);
      if (result) {
        await refresh();
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la publication du contenu');
      return false;
    }
  }, [refresh]);

  const unpublishContent = useCallback(async (id: string) => {
    try {
      const result = await cmsService.unpublishContent(id);
      if (result) {
        await refresh();
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la dépublication du contenu');
      return false;
    }
  }, [refresh]);

  const searchContent = useCallback(async (query: string, searchFilters?: any) => {
    try {
      return await cmsService.searchContent(query, searchFilters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      return [];
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadContent();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadContent]);

  return {
    content,
    loading,
    error,
    stats,
    refresh,
    createContent,
    updateContent,
    deleteContent,
    publishContent,
    unpublishContent,
    searchContent
  };
}

// Hook spécialisé pour récupérer un contenu par clé
export function useContentBy(key: string): {
  content: ContentItem | null;
  loading: boolean;
  error: string | null;
} {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await cmsService.getContentByKey(key);
        setContent(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du contenu');
        console.error('Erreur CMS:', err);
      } finally {
        setLoading(false);
      }
    };

    if (key) {
      loadContent();
    }
  }, [key]);

  return {
    content,
    loading,
    error
  };
}

// Hook pour les versions de contenu
export function useContentVersions(contentId: string) {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVersions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cmsService.getContentVersions(contentId);
      setVersions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des versions');
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  const restoreVersion = useCallback(async (version: number) => {
    try {
      const result = await cmsService.restoreContentVersion(contentId, version);
      if (result) {
        await loadVersions();
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la restauration de la version');
      return false;
    }
  }, [contentId, loadVersions]);

  useEffect(() => {
    if (contentId) {
      loadVersions();
    }
  }, [contentId, loadVersions]);

  return {
    versions,
    loading,
    error,
    refresh: loadVersions,
    restoreVersion
  };
}

// Hook pour les templates
export function useContentTemplates() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cmsService.getTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (template: Omit<ContentTemplate, 'id' | 'createdAt'>) => {
    try {
      const result = await cmsService.createTemplate(template);
      if (result) {
        await loadTemplates();
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du template');
      return null;
    }
  }, [loadTemplates]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    loading,
    error,
    refresh: loadTemplates,
    createTemplate
  };
}

// Hook pour les statistiques CMS
export function useCMSStats() {
  const [stats, setStats] = useState<CMSStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cmsService.getCMSStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats
  };
}