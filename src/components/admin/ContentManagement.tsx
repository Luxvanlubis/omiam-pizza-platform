'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus, Edit, Trash2, Search, Eye, Save, FileText, History, RefreshCw, BarChart3,
  Globe, Archive, Clock, CheckCircle, XCircle, Menu as MenuIcon, Mail, MapPin,
  Home, Phone
} from 'lucide-react';
import { useCMS, useContentVersions, useContentTemplates, useCMSStats } from '@/hooks/useCMS';
import { ContentItem } from '@/lib/cms-service';

const pageOptions = [
  { value: "homepage", label: "Page d'accueil" },
  { value: "menu", label: "Menu" },
  { value: "gallery", label: "Galerie" },
  { value: "contact", label: "Contact" },
  { value: "footer", label: "Footer" },
  { value: "header", label: "Header" }
];

const typeOptions = [
  { value: "text", label: "Texte", icon: FileText },
  { value: "title", label: "Titre", icon: FileText },
  { value: "description", label: "Description", icon: FileText },
  { value: "button", label: "Bouton", icon: FileText },
  { value: "link", label: "Lien", icon: FileText }
];

// Composant pour afficher les versions
function ContentVersions({ contentId }: { contentId: string }) {
  const { versions, loading, restoreVersion } = useContentVersions(contentId);

  if (loading) {
    return <div className="p-4">Chargement des versions...</div>;
  }

  return (
    <div className="space-y-4">
      {versions?.map((version) => (
        <div key={version.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">Version {version.version}</h4>
              <p className="text-sm text-muted-foreground">
                {version.createdAt} par {version.createdBy}
              </p>
              {version.changeNote && (
                <p className="text-sm mt-1">{version.changeNote}</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => restoreVersion(version.id)}
            >
              Restaurer
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ContentManagement() {
  // Hooks CMS
  const {
    content: contentItems,
    loading,
    error,
    refresh,
    createContent,
    updateContent,
    deleteContent,
    publishContent,
    unpublishContent
  } = useCMS({
    autoRefresh: true,
    refreshInterval: 60000
  });
  
  const { stats: cmsStats } = useCMSStats();
  
  // États locaux
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPage, setFilterPage] = useState<string>("all");
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editForm, setEditForm] = useState({
    key: "",
    title: "",
    content: "",
    page: "",
    section: "",
    type: "text" as ContentItem['type']
  });
  const [showVersions, setShowVersions] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [bulkAction, setBulkAction] = useState('');
  const [showStats, setShowStats] = useState(false);

  const handleEdit = (item: ContentItem) => {
    setSelectedItem(item);
    setEditForm({
      key: item.key,
      title: item.title,
      content: item.content,
      page: item.page,
      section: item.section,
      type: item.type
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (selectedItem && editForm) {
      try {
        await updateContent(selectedItem.id, editForm);
        setIsEditing(false);
        setSelectedItem(null);
        await refresh();
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
      }
    }
  };

  const handleCreate = async () => {
    try {
      const newContent: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
        key: editForm.key,
        title: editForm.title,
        content: editForm.content,
        page: editForm.page,
        section: editForm.section,
        type: editForm.type,
        isPublished: false,
        published: false,
        lastModified: new Date().toISOString(),
        createdBy: 'admin',
        updatedBy: 'admin'
      };
      await createContent(newContent);
      setIsCreating(false);
      setEditForm({
        key: "",
        title: "",
        content: "",
        page: "",
        section: "",
        type: "text"
      });
      await refresh();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContent(id);
      await refresh();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleBulkAction = async () => {
    if (selectedItems.length === 0 || !bulkAction) return;
    
    try {
      switch (bulkAction) {
        case 'delete':
          await Promise.all(selectedItems.map(id => deleteContent(id)));
          break;
        case 'publish':
          await Promise.all(selectedItems.map(id => publishContent(id)));
          break;
        case 'unpublish':
          await Promise.all(selectedItems.map(id => unpublishContent(id)));
          break;
      }
      setSelectedItems([]);
      setBulkAction('');
      await refresh();
    } catch (error) {
      console.error('Erreur lors de l\'action groupée:', error);
    }
  };

  const filteredItems = useMemo(() => {
    if (!contentItems) return [];
    
    return contentItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.key.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPage = filterPage === "all" || item.page === filterPage;
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "published" && item.published) || 
        (filterStatus === "draft" && !item.published);
      
      return matchesSearch && matchesPage && matchesType && matchesStatus;
    });
  }, [contentItems, searchTerm, filterPage, filterType, filterStatus]);

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.page]) {
      acc[item.page] = [];
    }
    acc[item.page].push(item);
    return acc;
  }, {} as Record<string, ContentItem[]>);

  const getPageIcon = (page: string) => {
    switch (page) {
      case "homepage": return <Home className="h-4 w-4" />;
      case "menu": return <MenuIcon className="h-4 w-4" />;
      case "contact": return <Phone className="h-4 w-4" />;
      case "footer": return <MapPin className="h-4 w-4" />;
      case "header": return <Mail className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    const Icon = typeOptions.find(t => t.value === type)?.icon || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const getPageLabel = (page: string) => {
    return pageOptions.find(p => p.value === page)?.label || page;
  };

  const getTypeLabel = (type: string) => {
    return typeOptions.find(t => t.value === type)?.label || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement du contenu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement: {error}
          <Button onClick={refresh} variant="outline" size="sm" className="ml-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      {showStats && cmsStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{cmsStats.totalContent}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Publié</p>
                  <p className="text-2xl font-bold">{cmsStats.publishedContent}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Brouillons</p>
                  <p className="text-2xl font-bold">{cmsStats.draftContent}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Modifié récemment</p>
                  <p className="text-2xl font-bold">{cmsStats.recentlyModified}</p>
                </div>
                <History className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-red-800 dark:text-red-600 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Gestion du Contenu
              </CardTitle>
              <CardDescription>
                Modifiez les textes et contenus de votre site web
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowStats(!showStats)} variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistiques
              </Button>
              <Button onClick={refresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter du contenu
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau contenu</DialogTitle>
                    <DialogDescription>
                      Créez un nouveau contenu textuel pour votre site
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="create-key">Clé unique</Label>
                        <Input
                          id="create-key"
                          value={editForm.key}
                          onChange={(e) => setEditForm({...editForm, key: e.target.value})}
                          placeholder="ex: hero_title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="create-title">Titre</Label>
                        <Input
                          id="create-title"
                          value={editForm.title}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          placeholder="Titre du contenu"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="create-content">Contenu</Label>
                      <Textarea
                        id="create-content"
                        value={editForm.content}
                        onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                        placeholder="Contenu textuel"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="create-page">Page</Label>
                        <Select value={editForm.page} onValueChange={(value) => setEditForm({...editForm, page: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une page" />
                          </SelectTrigger>
                          <SelectContent>
                            {pageOptions.map((page) => (
                              <SelectItem key={page.value} value={page.value}>
                                {page.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="create-type">Type</Label>
                        <Select value={editForm.type} onValueChange={(value) => setEditForm({...editForm, type: value as ContentItem['type']})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                          <SelectContent>
                            {typeOptions.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="create-section">Section</Label>
                      <Input
                        id="create-section"
                        value={editForm.section}
                        onChange={(e) => setEditForm({...editForm, section: e.target.value})}
                        placeholder="ex: hero, header, footer"
                      />
                    </div>
                    <Button onClick={handleCreate} className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                      <Plus className="h-4 w-4 mr-2" />
                      {loading ? 'Création...' : 'Créer le contenu'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres et actions groupées */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher du contenu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={filterPage} onValueChange={setFilterPage}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les pages</SelectItem>
                    {pageOptions.map((page) => (
                      <SelectItem key={page.value} value={page.value}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions groupées */}
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedItems.length} élément(s) sélectionné(s)
                </span>
                <div className="flex gap-2">
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Action groupée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publish">Publier</SelectItem>
                      <SelectItem value="unpublish">Dépublier</SelectItem>
                      <SelectItem value="delete">Supprimer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleBulkAction} disabled={!bulkAction} size="sm">
                    Appliquer
                  </Button>
                  <Button onClick={() => setSelectedItems([])} variant="outline" size="sm">
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Contenu groupé par page */}
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([page, items]) => (
              <Card key={page}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getPageIcon(page)}
                    {getPageLabel(page)}
                    <Badge variant="outline">{items.length} éléments</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItems([...selectedItems, item.id]);
                                } else {
                                  setSelectedItems(selectedItems.filter(id => id !== item.id));
                                }
                              }}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{item.title}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {getTypeIcon(item.type)}
                                  <span className="ml-1">{getTypeLabel(item.type)}</span>
                                </Badge>
                                {item.published ? (
                                  <Badge className="text-xs bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Publié
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Brouillon
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Clé: {item.key} • Section: {item.section}
                              </p>
                              <p className="text-sm bg-gray-50 p-2 rounded">
                                {item.content}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedContentId(item.id);
                                setShowVersions(true);
                              }}
                            >
                              <History className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            {item.published ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => unpublishContent(item.id)}
                              >
                                <Archive className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => publishContent(item.id)}
                                className="text-green-600"
                              >
                                <Globe className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Dernière modification: {item.lastModified}</span>
                          {item.versions && (
                            <span>{item.versions.length} version(s)</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le contenu</DialogTitle>
            <DialogDescription>
              Modifiez le contenu textuel sélectionné
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-key">Clé unique</Label>
                <Input
                  id="edit-key"
                  value={editForm.key}
                  onChange={(e) => setEditForm({...editForm, key: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-title">Titre</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-content">Contenu</Label>
              <Textarea
                id="edit-content"
                value={editForm.content}
                onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-page">Page</Label>
                <Select value={editForm.page} onValueChange={(value) => setEditForm({...editForm, page: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageOptions.map((page) => (
                      <SelectItem key={page.value} value={page.value}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select value={editForm.type} onValueChange={(value) => setEditForm({...editForm, type: value as ContentItem['type']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-section">Section</Label>
              <Input
                id="edit-section"
                value={editForm.section}
                onChange={(e) => setEditForm({...editForm, section: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} className="bg-red-600 hover:bg-red-700" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog des versions */}
      <Dialog open={showVersions} onOpenChange={setShowVersions}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Historique des versions</DialogTitle>
            <DialogDescription>
              Consultez l'historique des modifications de ce contenu
            </DialogDescription>
          </DialogHeader>
          {selectedContentId && (
            <ContentVersions contentId={selectedContentId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}