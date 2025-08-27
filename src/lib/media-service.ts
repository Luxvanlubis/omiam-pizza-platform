import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Types pour le service média
export interface MediaItem {
  id: string;
  name: string;
  originalName: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'logo' | 'favicon';
  format: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  url: string;
  thumbnailUrl?: string;
  path: string;
  folderId?: string;
  tags: string[];
  altText: string;
  description: string;
  status: 'active' | 'processing' | 'error' | 'archived';
  uploadedAt: string;
  lastModified: string;
  uploadedBy: string;
  
  // Métadonnées avancées
  metadata: {
    exif?: Record<string, any>;
    colorPalette?: string[];
    dominantColor?: string;
    faces?: number;
    objects?: string[];
    text?: string;
  };
  
  // Optimisation
  optimization: {
    isOptimized: boolean;
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    formats: string[];
    webpUrl?: string;
    avifUrl?: string;
  };
  
  // CDN et performance
  cdn: {
    enabled: boolean;
    url?: string;
    cacheStatus: 'pending' | 'cached' | 'error';
    regions: string[];
  };
  
  // SEO et accessibilité
  seo: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  
  // Analytics
  analytics: {
    views: number;
    downloads: number;
    loadTime: number;
    bandwidth: number;
  };
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  path: string;
  itemCount: number;
  totalSize: number;
  createdAt: string;
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
}

export interface UploadProgress {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'processing' | 'optimizing' | 'complete' | 'error';
  error?: string;
  estimatedTime?: number;
}

export interface OptimizationSettings {
  autoOptimize: boolean;
  quality: number;
  formats: string[];
  responsive: boolean;
  webp: boolean;
  avif: boolean;
  lazy: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export interface CDNSettings {
  provider: 'cloudinary' | 'aws' | 'vercel' | 'custom';
  enabled: boolean;
  baseUrl?: string;
  transformations: {
    resize: boolean;
    crop: boolean;
    quality: boolean;
    format: boolean;
  };
}

export interface MediaStats {
  totalItems: number;
  totalSize: number;
  optimizedItems: number;
  savedSize: number;
  cdnItems: number;
  typeDistribution: Record<string, number>;
  monthlyUploads: Array<{ month: string; count: number; size: number }>;
  topPerformers: MediaItem[];
}

class MediaService {
  private supabase: any;
  private uploadPath: string;
  private cdnSettings: CDNSettings;
  private optimizationSettings: OptimizationSettings;

  constructor() {
    // Initialisation Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    this.uploadPath = process.env.UPLOAD_PATH || './uploads';
    
    // Configuration par défaut
    this.cdnSettings = {
      provider: 'vercel',
      enabled: false,
      transformations: {
        resize: true,
        crop: true,
        quality: true,
        format: true
      }
    };

    this.optimizationSettings = {
      autoOptimize: true,
      quality: 85,
      formats: ['webp', 'avif'],
      responsive: true,
      webp: true,
      avif: true,
      lazy: true,
      maxWidth: 1920,
      maxHeight: 1080
    };
  }

  // Gestion des médias
  async getMediaItems(folderId?: string, filters?: {
    type?: string;
    status?: string;
    search?: string;
    tags?: string[];
  }): Promise<MediaItem[]> {
    try {
      if (this.supabase) {
        let query = this.supabase
          .from('media_items')
          .select('*');

        if (folderId) {
          query = query.eq('folder_id', folderId);
        }

        if (filters?.type && filters.type !== 'all') {
          query = query.eq('type', filters.type);
        }

        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters?.search) {
          query = query.or(`name.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
        }

        const { data, error } = await query.order('uploaded_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      }

      // Données mock si pas de Supabase
      return this.getMockMediaItems();
    } catch (error) {
      console.error('Erreur lors de la récupération des médias:', error);
      return this.getMockMediaItems();
    }
  }

  async getMediaItem(id: string): Promise<MediaItem | null> {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('media_items')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        return data;
      }

      // Mock data
      const mockItems = this.getMockMediaItems();
      return mockItems.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du média:', error);
      return null;
    }
  }

  async uploadMedia(
    files: File[],
    options: {
      folderId?: string;
      tags?: string[];
      autoOptimize?: boolean;
      generateThumbnails?: boolean;
    } = {}
  ): Promise<{ success: MediaItem[]; errors: Array<{ file: string; error: string }> }> {
    const success: MediaItem[] = [];
    const errors: Array<{ file: string; error: string }> = [];

    for (const file of files) {
      try {
        // Validation du fichier
        const validation = this.validateFile(file);
        if (!validation.valid) {
          errors.push({ file: file.name, error: validation.error || 'Fichier invalide' });
          continue;
        }

        // Upload du fichier
        const uploadResult = await this.uploadSingleFile(file, options);
        
        if (uploadResult) {
          success.push(uploadResult);
        }
      } catch (error) {
        errors.push({ 
          file: file.name, 
          error: error instanceof Error ? error.message : 'Erreur inconnue' 
        });
      }
    }

    return { success, errors };
  }

  private async uploadSingleFile(
    file: File,
    options: {
      folderId?: string;
      tags?: string[];
      autoOptimize?: boolean;
      generateThumbnails?: boolean;
    }
  ): Promise<MediaItem | null> {
    try {
      // Génération d'un ID unique
      const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fileName = `${id}_${file.name}`;
      const filePath = path.join(this.uploadPath, fileName);

      // Extraction des métadonnées
      const metadata = await this.extractMetadata(file);
      
      // Création de l'objet MediaItem
      const mediaItem: MediaItem = {
        id,
        name: file.name,
        originalName: file.name,
        type: this.getFileType(file.type),
        format: file.type,
        size: file.size,
        dimensions: metadata.dimensions || { width: 0, height: 0 },
        url: `/uploads/${fileName}`,
        path: filePath,
        folderId: options.folderId,
        tags: options.tags || [],
        altText: '',
        description: '',
        status: 'active',
        uploadedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        uploadedBy: 'current_user',
        metadata: {
          exif: metadata.exif,
          colorPalette: metadata.colorPalette,
          dominantColor: metadata.dominantColor
        },
        optimization: {
          isOptimized: false,
          originalSize: file.size,
          optimizedSize: file.size,
          compressionRatio: 0,
          formats: []
        },
        cdn: {
          enabled: false,
          cacheStatus: 'pending',
          regions: []
        },
        seo: {
          score: 50,
          issues: ['Alt text manquant', 'Description manquante'],
          suggestions: ['Ajouter un texte alternatif', 'Ajouter une description']
        },
        analytics: {
          views: 0,
          downloads: 0,
          loadTime: 0,
          bandwidth: 0
        }
      };

      // Sauvegarde en base de données
      if (this.supabase) {
        const { error } = await this.supabase
          .from('media_items')
          .insert([mediaItem]);
        
        if (error) throw error;
      }

      // Optimisation automatique si activée
      if (options.autoOptimize && this.optimizationSettings.autoOptimize) {
        this.optimizeMedia(id).catch(console.error);
      }

      return mediaItem;
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      return null;
    }
  }

  async optimizeMedia(mediaId: string): Promise<boolean> {
    try {
      const mediaItem = await this.getMediaItem(mediaId);
      if (!mediaItem) return false;

      // Simulation d'optimisation
      const optimizedSize = Math.floor(mediaItem.size * 0.7);
      const compressionRatio = Math.floor(((mediaItem.size - optimizedSize) / mediaItem.size) * 100);

      const updatedItem = {
        ...mediaItem,
        optimization: {
          ...mediaItem.optimization,
          isOptimized: true,
          optimizedSize,
          compressionRatio,
          formats: ['webp', 'avif']
        },
        status: 'active' as const
      };

      if (this.supabase) {
        const { error } = await this.supabase
          .from('media_items')
          .update(updatedItem)
          .eq('id', mediaId);
        
        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
      return false;
    }
  }

  async deleteMedia(mediaIds: string[]): Promise<{ success: string[]; errors: string[] }> {
    const success: string[] = [];
    const errors: string[] = [];

    for (const id of mediaIds) {
      try {
        const mediaItem = await this.getMediaItem(id);
        if (!mediaItem) {
          errors.push(id);
          continue;
        }

        // Suppression de la base de données
        if (this.supabase) {
          const { error } = await this.supabase
            .from('media_items')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
        }

        success.push(id);
      } catch (error) {
        console.error(`Erreur lors de la suppression de ${id}:`, error);
        errors.push(id);
      }
    }

    return { success, errors };
  }

  // Gestion des dossiers
  async getFolders(): Promise<MediaFolder[]> {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('media_folders')
          .select('*')
          .order('name');
        
        if (error) throw error;
        return data || [];
      }

      // Mock data
      return [
        {
          id: 'folder_1',
          name: 'Menu',
          path: '/menu',
          itemCount: 15,
          totalSize: 2500000,
          createdAt: new Date().toISOString(),
          permissions: { read: true, write: true, delete: true }
        },
        {
          id: 'folder_2',
          name: 'Marketing',
          path: '/marketing',
          itemCount: 8,
          totalSize: 1200000,
          createdAt: new Date().toISOString(),
          permissions: { read: true, write: true, delete: true }
        }
      ];
    } catch (error) {
      console.error('Erreur lors de la récupération des dossiers:', error);
      return [];
    }
  }

  async createFolder(name: string, parentId?: string): Promise<MediaFolder | null> {
    try {
      const folder: MediaFolder = {
        id: `folder_${Date.now()}`,
        name,
        parentId,
        path: parentId ? `/parent/${name}` : `/${name}`,
        itemCount: 0,
        totalSize: 0,
        createdAt: new Date().toISOString(),
        permissions: { read: true, write: true, delete: true }
      };

      if (this.supabase) {
        const { error } = await this.supabase
          .from('media_folders')
          .insert([folder]);
        
        if (error) throw error;
      }

      return folder;
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
      return null;
    }
  }

  // Statistiques
  async getMediaStats(): Promise<MediaStats> {
    try {
      const items = await this.getMediaItems();
      
      const stats: MediaStats = {
        totalItems: items.length,
        totalSize: items.reduce((sum, item) => sum + item.size, 0),
        optimizedItems: items.filter(item => item.optimization.isOptimized).length,
        savedSize: items.reduce((sum, item) => 
          sum + (item.optimization.originalSize - item.optimization.optimizedSize), 0
        ),
        cdnItems: items.filter(item => item.cdn.enabled).length,
        typeDistribution: items.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        monthlyUploads: [],
        topPerformers: items
          .sort((a, b) => b.analytics.views - a.analytics.views)
          .slice(0, 5)
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        optimizedItems: 0,
        savedSize: 0,
        cdnItems: 0,
        typeDistribution: {},
        monthlyUploads: [],
        topPerformers: []
      };
    }
  }

  // Utilitaires privés
  private validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'application/pdf'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'Fichier trop volumineux (max 10MB)' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Type de fichier non supporté' };
    }

    return { valid: true };
  }

  private getFileType(mimeType: string): MediaItem['type'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  private async extractMetadata(file: File): Promise<{
    dimensions?: { width: number; height: number };
    exif?: Record<string, any>;
    colorPalette?: string[];
    dominantColor?: string;
  }> {
    // Simulation d'extraction de métadonnées
    if (file.type.startsWith('image/')) {
      return {
        dimensions: { width: 1920, height: 1080 },
        colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
        dominantColor: '#FF6B6B'
      };
    }

    return {};
  }

  private getMockMediaItems(): MediaItem[] {
    return [
      {
        id: 'media_1',
        name: 'pizza-margherita.jpg',
        originalName: 'pizza-margherita.jpg',
        type: 'image',
        format: 'image/jpeg',
        size: 245760,
        dimensions: { width: 1920, height: 1080 },
        url: '/images/pizza-margherita.jpg',
        path: '/uploads/pizza-margherita.jpg',
        tags: ['menu', 'pizza', 'margherita'],
        altText: 'Pizza Margherita fraîche',
        description: 'Délicieuse pizza Margherita avec tomates, mozzarella et basilic',
        status: 'active',
        uploadedAt: '2024-01-15T10:30:00Z',
        lastModified: '2024-01-15T10:30:00Z',
        uploadedBy: 'admin',
        metadata: {
          colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
          dominantColor: '#FF6B6B'
        },
        optimization: {
          isOptimized: true,
          originalSize: 245760,
          optimizedSize: 172032,
          compressionRatio: 30,
          formats: ['webp', 'avif']
        },
        cdn: {
          enabled: true,
          cacheStatus: 'cached',
          regions: ['eu-west', 'us-east']
        },
        seo: {
          score: 95,
          issues: [],
          suggestions: []
        },
        analytics: {
          views: 1250,
          downloads: 45,
          loadTime: 0.8,
          bandwidth: 215040
        }
      }
    ];
  }
}

// Instance singleton
const mediaService = new MediaService();
export default mediaService;

// Export des types
export type {
  MediaItem,
  MediaFolder,
  UploadProgress,
  OptimizationSettings,
  CDNSettings,
  MediaStats
};