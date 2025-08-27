"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Users, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Smartphone, 
  Monitor, 
  Lock, 
  Unlock, 
  UserCheck, 
  UserX, 
  Activity, 
  Download, 
  Search, 
  Filter, 
  RefreshCw 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types pour la sécurité
interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'staff';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: Date;
  permissions: string[];
  createdAt: Date;
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning';
}

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
  };
  sessionSettings: {
    maxDuration: number;
    idleTimeout: number;
    maxConcurrentSessions: number;
  };
  loginSecurity: {
    maxFailedAttempts: number;
    lockoutDuration: number;
    twoFactorRequired: boolean;
  };
  auditSettings: {
    logRetentionDays: number;
    logLevel: 'basic' | 'detailed' | 'verbose';
    realTimeAlerts: boolean;
  };
}

// Données simulées
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin Principal',
    email: 'admin@omiam.fr',
    role: 'super_admin',
    status: 'active',
    lastLogin: new Date(Date.now() - 30 * 60 * 1000),
    permissions: ['all'],
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Marie Dupont',
    email: 'marie@omiam.fr',
    role: 'admin',
    status: 'active',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    permissions: ['orders', 'menu', 'customers', 'analytics'],
    createdAt: new Date('2024-01-15')
  },
  {
    id: '3',
    name: 'Jean Martin',
    email: 'jean@omiam.fr',
    role: 'manager',
    status: 'active',
    lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
    permissions: ['orders', 'menu'],
    createdAt: new Date('2024-02-01')
  },
  {
    id: '4',
    name: 'Sophie Bernard',
    email: 'sophie@omiam.fr',
    role: 'staff',
    status: 'inactive',
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    permissions: ['orders'],
    createdAt: new Date('2024-02-15')
  }
];

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Admin Principal',
    action: 'LOGIN',
    resource: 'System',
    details: 'Connexion réussie',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Marie Dupont',
    action: 'UPDATE',
    resource: 'Menu',
    details: 'Modification du prix de la Margherita Royale',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success'
  },
  {
    id: '3',
    userId: '3',
    userName: 'Jean Martin',
    action: 'DELETE',
    resource: 'Order',
    details: 'Tentative de suppression de commande #ORD-1245',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    status: 'failed'
  },
  {
    id: '4',
    userId: '4',
    userName: 'Sophie Bernard',
    action: 'LOGIN_FAILED',
    resource: 'System',
    details: 'Échec de connexion - mot de passe incorrect',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Android 13; Mobile)',
    status: 'failed'
  }
];

const defaultSecuritySettings: SecuritySettings = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90
  },
  sessionSettings: {
    maxDuration: 480, // 8 heures
    idleTimeout: 30, // 30 minutes
    maxConcurrentSessions: 3
  },
  loginSecurity: {
    maxFailedAttempts: 5,
    lockoutDuration: 15, // 15 minutes
    twoFactorRequired: false
  },
  auditSettings: {
    logRetentionDays: 365,
    logLevel: 'detailed',
    realTimeAlerts: true
  }
};

export function SecurityManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleUserStatusChange = (userId: string, newStatus: User['status']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleExportLogs = (format: 'csv' | 'json') => {
    console.log(`Exporting audit logs as ${format}`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredLogs = auditLogs.filter(log => 
    log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-600';
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-600';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-600';
      case 'staff':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-gray-600';
      case 'suspended':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getLogStatusIcon = (status: AuditLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'medium'
    }).format(timestamp);
  };

  return (
    <div className="space-y-6" data-id="security-management">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-600 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Sécurité & Permissions
          </h2>
          <p className="text-muted-foreground">Gestion des utilisateurs, permissions et audit de sécurité</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            data-id="refresh-security"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Actualiser
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" data-id="tab-users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="permissions" data-id="tab-permissions">Permissions</TabsTrigger>
          <TabsTrigger value="audit" data-id="tab-audit">Audit</TabsTrigger>
          <TabsTrigger value="settings" data-id="tab-security-settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-red-600" />
                    Gestion des utilisateurs
                  </CardTitle>
                  <CardDescription>Gérer les comptes utilisateurs et leurs statuts</CardDescription>
                </div>
                <Button data-id="add-user">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Ajouter utilisateur
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-id="search-users"
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="suspended">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className={cn("text-xs font-medium", getStatusColor(user.status))}>
                            {user.status === 'active' ? 'Actif' : user.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Dernière connexion: {formatTimestamp(user.lastLogin)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserStatusChange(
                            user.id,
                            user.status === 'active' ? 'inactive' : 'active'
                          )}
                          data-id={`toggle-user-${user.id}`}
                        >
                          {user.status === 'active' ? (
                            <><Lock className="h-3 w-3 mr-1" />Désactiver</>
                          ) : (
                            <><Unlock className="h-3 w-3 mr-1" />Activer</>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" data-id={`edit-user-${user.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          Détails
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Matrice des permissions
              </CardTitle>
              <CardDescription>Gérer les permissions par rôle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Permission</th>
                      <th className="text-center p-3 font-semibold">Super Admin</th>
                      <th className="text-center p-3 font-semibold">Admin</th>
                      <th className="text-center p-3 font-semibold">Manager</th>
                      <th className="text-center p-3 font-semibold">Staff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Gestion des commandes', key: 'orders' },
                      { name: 'Gestion du menu', key: 'menu' },
                      { name: 'Gestion des clients', key: 'customers' },
                      { name: 'Analytics', key: 'analytics' },
                      { name: 'Paramètres système', key: 'settings' },
                      { name: 'Gestion des utilisateurs', key: 'users' },
                      { name: 'Audit et sécurité', key: 'security' }
                    ].map((permission) => (
                      <tr key={permission.key} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3 font-medium">{permission.name}</td>
                        <td className="text-center p-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                        </td>
                        <td className="text-center p-3">
                          {['orders', 'menu', 'customers', 'analytics'].includes(permission.key) ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                          )}
                        </td>
                        <td className="text-center p-3">
                          {['orders', 'menu'].includes(permission.key) ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                          )}
                        </td>
                        <td className="text-center p-3">
                          {permission.key === 'orders' ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-red-600" />
                    Journal d'audit
                  </CardTitle>
                  <CardDescription>Historique des actions utilisateurs</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportLogs('csv')}>
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportLogs('json')}>
                    <Download className="h-4 w-4 mr-1" />
                    JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans les logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-id="search-logs"
                />
              </div>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getLogStatusIcon(log.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{log.userName}</span>
                          <Badge variant="outline" className="text-xs">{log.action}</Badge>
                          <span className="text-sm text-muted-foreground">{log.resource}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(log.timestamp)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {log.ipAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            {log.userAgent.includes('Mobile') ? (
                              <Smartphone className="h-3 w-3" />
                            ) : (
                              <Monitor className="h-3 w-3" />
                            )}
                            {log.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-red-600" />
                  Politique de mot de passe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Longueur minimale</Label>
                  <Input
                    type="number"
                    value={securitySettings.passwordPolicy.minLength}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      passwordPolicy: {
                        ...prev.passwordPolicy,
                        minLength: parseInt(e.target.value)
                      }
                    }))}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Majuscules requises</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireUppercase: checked
                        }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Chiffres requis</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireNumbers: checked
                        }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Caractères spéciaux requis</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireSpecialChars}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireSpecialChars: checked
                        }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Sécurité des connexions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tentatives max avant blocage</Label>
                  <Input
                    type="number"
                    value={securitySettings.loginSecurity.maxFailedAttempts}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      loginSecurity: {
                        ...prev.loginSecurity,
                        maxFailedAttempts: parseInt(e.target.value)
                      }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Durée de blocage (minutes)</Label>
                  <Input
                    type="number"
                    value={securitySettings.loginSecurity.lockoutDuration}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      loginSecurity: {
                        ...prev.loginSecurity,
                        lockoutDuration: parseInt(e.target.value)
                      }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Authentification à deux facteurs</Label>
                  <Switch
                    checked={securitySettings.loginSecurity.twoFactorRequired}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({
                      ...prev,
                      loginSecurity: {
                        ...prev.loginSecurity,
                        twoFactorRequired: checked
                      }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Button data-id="save-security-settings">
              <Shield className="h-4 w-4 mr-2" />
              Sauvegarder les paramètres
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}