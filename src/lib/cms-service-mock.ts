import { ContentItem, ContentTemplate, ContentVersion, CMSStats } from '@/types/cms';

// Données mockées pour le développement
const mockContentItems: ContentItem[] = [
  {
    id: '1',
    key: 'hero.title',
    title: 'Titre Principal',
    content: 'Bienvenue chez OMIAM - Saveurs Authentiques du Maroc',
    type: 'title',
    page: 'homepage',
    section: 'hero',
    metadata: { level: 'h1', className: 'hero-title' },
    isPublished: true,
    published: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['homepage', 'hero'],
    seo: {
      title: 'OMIAM - Restaurant Marocain Authentique',
      description: 'Découvrez la cuisine marocaine authentique chez OMIAM',
      keywords: ['restaurant', 'marocain', 'authentique']
    },
    status: 'published' as const,
    priority: 1,
    versions: [],
    changes: []
  },
  {
    id: '2',
    key: 'hero.description',
    title: 'Description Hero',
    content: 'Découvrez nos plats traditionnels marocains préparés avec amour et des ingrédients frais.',
    type: 'description',
    page: 'homepage',
    section: 'hero',
    metadata: { format: 'paragraph', className: 'hero-description' },
    isPublished: true,
    published: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['homepage', 'hero'],
    display: 'block',
    main: 'false',
    recentlyModified: 0,
    versions: [],
    changes: []
  },
  {
    id: '3',
    key: 'hero.cta',
    title: 'Bouton CTA',
    content: 'Commander maintenant',
    type: 'button',
    page: 'homepage',
    section: 'hero',
    metadata: { url: '/menu', className: 'btn-primary', target: '_self' },
    isPublished: true,
    published: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['homepage', 'cta'],
    display: 'inline-block',
    main: 'false',
    recentlyModified: 0,
    versions: [],
    changes: []
  },
  {
    id: '4',
    key: 'about.title',
    title: 'Titre À propos',
    content: 'Notre Histoire',
    type: 'title',
    page: 'about',
    section: 'main',
    metadata: { level: 'h2', className: 'about-title' },
    isPublished: true,
    published: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['about'],
    display: 'block',
    main: 'true',
    recentlyModified: 0,
    versions: [],
    changes: []
  },
  {
    id: '5',
    key: 'about.content',
    title: 'Contenu À propos',
    content: 'OMIAM est né de la passion pour la cuisine marocaine authentique. Depuis 2020, nous servons des plats traditionnels dans une ambiance chaleureuse.',
    type: 'text',
    page: 'about',
    section: 'main',
    metadata: { format: 'paragraph', className: 'about-content' },
    isPublished: true,
    published: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['about'],
    display: 'block',
    main: 'false',
    recentlyModified: 0,
    versions: [],
    changes: []
  },
  {
    id: '6',
    key: 'contact.phone',
    title: 'Téléphone',
    content: '+33 1 23 45 67 89',
    type: 'text',
    page: 'contact',
    section: 'info',
    metadata: { format: 'phone', icon: 'phone' },
    isPublished: true,
    published: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['contact'],
    display: 'inline',
    main: 'false',
    recentlyModified: 0,
    versions: [],
    changes: []
  },
  {
    id: '7',
    key: 'contact.email',
    title: 'Email',
    content: 'contact@omiam.fr',
    type: 'text',
    page: 'contact',
    section: 'info',
    metadata: { format: 'email', icon: 'mail' },
    isPublished: true,
    published: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['contact'],
    display: 'inline',
    main: 'false',
    recentlyModified: 0,
    versions: [],
    changes: []
  },
  {
    id: '8',
    key: 'contact.address',
    title: 'Adresse',
    content: '123 Rue de la Paix, 75001 Paris',
    type: 'text',
    page: 'contact',
    section: 'info',
    metadata: { format: 'address', icon: 'map-pin' },
    isPublished: true,
    published: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['contact'],
    display: 'block',
    main: 'false',
    recentlyModified: 0,
    versions: [],
    changes: []
  },
  {
    id: '9',
    key: 'menu.featured.title',
    title: 'Nos Spécialités',
    content: 'Découvrez nos plats signature',
    type: 'title',
    page: 'menu',
    section: 'featured',
    metadata: { level: 'h2' },
    isPublished: true,
    published: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['menu', 'featured'],
    display: 'block',
    main: 'true',
    recentlyModified: 0,
    versions: [],
    changes: []
  },
  {
    id: '10',
    key: 'footer.copyright',
    title: 'Copyright',
    content: '© 2024 OMIAM. Tous droits réservés.',
    type: 'text',
    page: 'global',
    section: 'footer',
    metadata: { position: 'bottom' },
    isPublished: true,
    published: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
    tags: ['footer', 'global'],
    display: 'block',
    main: 'false',
    recentlyModified: 0,
    versions: [],
    changes: []
  }
];

const mockTemplates: ContentTemplate[] = [
  {
    id: '1',
    name: 'Page Title',
    description: 'Template pour les titres de page',
    type: 'title',
    defaultContent: 'Nouveau Titre',
    defaultMetadata: { level: 'h2' },
    fields: [
      { name: 'title', type: 'text', label: 'Titre', required: true },
      { name: 'level', type: 'select', label: 'Niveau', required: true, options: ['h1', 'h2', 'h3', 'h4'] }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Hero Section',
    description: 'Template pour les sections hero',
    type: 'description',
    defaultContent: 'Description de la section hero',
    defaultMetadata: { format: 'paragraph' },
    fields: [
      { name: 'title', type: 'text', label: 'Titre', required: true },
      { name: 'description', type: 'textarea', label: 'Description', required: true },
      { name: 'cta_text', type: 'text', label: 'Texte du bouton', required: false }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Contact Info',
    description: 'Template pour les informations de contact',
    type: 'text',
    defaultContent: 'Information de contact',
    defaultMetadata: { format: 'text' },
    fields: [
      { name: 'type', type: 'select', label: 'Type', required: true, options: ['phone', 'email', 'address'] },
      { name: 'value', type: 'text', label: 'Valeur', required: true }
    ],
    createdAt: new Date().toISOString()
  }
];

class CMSServiceMock {
  private content: ContentItem[] = [...mockContentItems];
  private templates: ContentTemplate[] = [...mockTemplates];
  private versions: ContentVersion[] = [];

  // Simulation d'un délai réseau
  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getContent(filters?: {
    page?: string;
    type?: string;
    section?: string;
    isPublished?: boolean;
    search?: string;
    tags?: string[];
  }): Promise<ContentItem[]> {
    await this.delay();
    let filteredContent = [...this.content];

    if (filters?.page) {
      filteredContent = filteredContent.filter(item => item.page === filters.page);
    }
    if (filters?.type) {
      filteredContent = filteredContent.filter(item => item.type === filters.type);
    }
    if (filters?.section) {
      filteredContent = filteredContent.filter(item => item.section === filters.section);
    }
    if (filters?.isPublished !== undefined) {
      filteredContent = filteredContent.filter(item => item.isPublished === filters.isPublished);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredContent = filteredContent.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.content.toLowerCase().includes(searchLower) ||
        item.key.toLowerCase().includes(searchLower)
      );
    }
    if (filters?.tags && filters.tags.length > 0) {
      filteredContent = filteredContent.filter(item =>
        item.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    return filteredContent.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getContentById(id: string): Promise<ContentItem | null> {
    await this.delay();
    return this.content.find(item => item.id === id) || null;
  }

  async getContentByKey(key: string): Promise<ContentItem | null> {
    await this.delay();
    return this.content.find(item => item.key === key) || null;
  }

  async createContent(newContent: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<ContentItem> {
    await this.delay();
    const content: ContentItem = {
      ...newContent,
      id: Date.now().toString(),
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.content.push(content);
    return content;
  }

  async updateContent(id: string, updates: Partial<ContentItem>, changeNote?: string): Promise<ContentItem | null> {
    await this.delay();
    const index = this.content.findIndex(item => item.id === id);
    if (index === -1) return null;

    const oldContent = this.content[index];

    // Créer une version de l'ancien contenu
    if (changeNote) {
      const version: ContentVersion = {
        id: Date.now().toString(),
        contentId: id,
        version: oldContent.version,
        content: oldContent.content,
        title: oldContent.title,
        metadata: oldContent.metadata,
        createdAt: new Date().toISOString(),
        createdBy: oldContent.updatedBy || 'admin',
        changeNote
      };
      this.versions.push(version);
    }

    const updatedContent = {
      ...oldContent,
      ...updates,
      version: oldContent.version + 1,
      updatedAt: new Date().toISOString()
    };

    this.content[index] = updatedContent;
    return updatedContent;
  }

  async deleteContent(id: string): Promise<boolean> {
    await this.delay();
    const index = this.content.findIndex(item => item.id === id);
    if (index === -1) return false;

    this.content.splice(index, 1);
    // Supprimer aussi les versions associées
    this.versions = this.versions.filter(version => version.contentId !== id);
    return true;
  }

  async publishContent(id: string): Promise<boolean> {
    const updated = await this.updateContent(id, { isPublished: true }, 'Publication du contenu');
    return updated !== null;
  }

  async unpublishContent(id: string): Promise<boolean> {
    const updated = await this.updateContent(id, { isPublished: false }, 'Dépublication du contenu');
    return updated !== null;
  }

  async searchContent(query: string, filters?: any): Promise<ContentItem[]> {
    return this.getContent({ ...filters, search: query });
  }

  async getCMSStats(): Promise<CMSStats> {
    await this.delay();
    const totalContent = this.content.length;
    const publishedContent = this.content.filter(item => item.isPublished).length;
    const draftContent = totalContent - publishedContent;

    const contentByType = this.content.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const contentByPage = this.content.reduce((acc, item) => {
      acc[item.page] = (acc[item.page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pages = new Set(this.content.map(item => item.page));
    const recentUpdates = this.content.filter(item => {
      const updatedAt = new Date(item.updatedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return updatedAt > weekAgo;
    }).length;

    return {
      totalContent,
      publishedContent,
      draftContent,
      totalPages: pages.size,
      recentUpdates,
      recentlyModified: recentUpdates,
      contentByType,
      contentByPage
    };
  }

  async getContentVersions(contentId: string): Promise<ContentVersion[]> {
    await this.delay();
    return this.versions
      .filter(version => version.contentId === contentId)
      .sort((a, b) => b.version - a.version);
  }

  async getContentTemplates(): Promise<ContentTemplate[]> {
    await this.delay();
    return [...this.templates];
  }

  async createTemplate(template: Omit<ContentTemplate, 'id' | 'createdAt'>): Promise<ContentTemplate> {
    await this.delay();
    const newTemplate: ContentTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    this.templates.push(newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: string, updates: Partial<ContentTemplate>): Promise<ContentTemplate | null> {
    await this.delay();
    const index = this.templates.findIndex(template => template.id === id);
    if (index === -1) return null;

    const updatedTemplate = { ...this.templates[index], ...updates };
    this.templates[index] = updatedTemplate;
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    await this.delay();
    const index = this.templates.findIndex(template => template.id === id);
    if (index === -1) return false;

    this.templates.splice(index, 1);
    return true;
  }

  // Méthodes utilitaires
  async exportContent(): Promise<string> {
    await this.delay();
    return JSON.stringify({
      content: this.content,
      templates: this.templates,
      versions: this.versions,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  async importContent(data: string): Promise<boolean> {
    await this.delay();
    try {
      const parsed = JSON.parse(data);
      if (parsed.content) this.content = parsed.content;
      if (parsed.templates) this.templates = parsed.templates;
      if (parsed.versions) this.versions = parsed.versions;
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }
}

// Export d'une instance singleton
export const cmsServiceMock = new CMSServiceMock();