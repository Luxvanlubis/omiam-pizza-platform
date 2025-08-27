"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LogIn, Mail, Lock, User, AlertCircle, CheckCircle, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';

interface UnifiedLoginModalProps {
  children: React.ReactNode;
  onLoginSuccess?: () => void;
}

export function UnifiedLoginModal({ children, onLoginSuccess }: UnifiedLoginModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('client');
  const [clientCredentials, setClientCredentials] = useState({ email: '', password: '' });
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signIn(clientCredentials.email, clientCredentials.password);
      if (result.error) {
        setError(result.error.message || 'Erreur de connexion');
      } else {
        setSuccess('Connexion réussie ! Redirection en cours...');
        setTimeout(() => {
          setOpen(false);
          onLoginSuccess?.();
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      console.error('Erreur de connexion client:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
    }
    setIsLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: adminCredentials.username,
          password: adminCredentials.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Connexion admin réussie ! Redirection vers le dashboard...');
        // Définir un cookie d'authentification admin sécurisé
        document.cookie = `admin-auth=${data.token}; path=/; max-age=86400; secure; samesite=strict`;
        setTimeout(() => {
          setOpen(false);
          onLoginSuccess?.();
          // Utiliser window.location pour éviter les erreurs de hooks React
          window.location.href = '/admin/dashboard';
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Nom d\'utilisateur ou mot de passe incorrect');
      }
    } catch (error) {
      console.error('Erreur de connexion admin:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
    }
    setIsLoading(false);
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetForm = () => {
    setClientCredentials({ email: '', password: '' });
    setAdminCredentials({ username: '', password: '' });
    setError('');
    setSuccess('');
    setActiveTab('client');
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-primary">
            Connexion O'Miam
          </DialogTitle>
          <DialogDescription className="text-center">
            Choisissez votre type de connexion
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="client" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Client
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          {/* Messages d'erreur et de succès */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800 mt-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Connexion Client */}
          <TabsContent value="client" className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            
            <form onSubmit={handleClientLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="client-email"
                    name="email"
                    type="email"
                    value={clientCredentials.email}
                    onChange={handleClientChange}
                    placeholder="votre@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="client-password"
                    name="password"
                    type="password"
                    value={clientCredentials.password}
                    onChange={handleClientChange}
                    placeholder="Votre mot de passe"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
            
            <div className="text-center space-y-2 text-sm">
              <p className="text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium" onClick={() => setOpen(false)}>
                  Créer un compte
                </Link>
              </p>
              <p className="text-muted-foreground">
                <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium" onClick={() => setOpen(false)}>
                  Mot de passe oublié ?
                </Link>
              </p>
            </div>
          </TabsContent>

          {/* Connexion Admin */}
          <TabsContent value="admin" className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
            </div>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-username">Nom d'utilisateur</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-username"
                    name="username"
                    type="text"
                    value={adminCredentials.username}
                    onChange={handleAdminChange}
                    placeholder="Nom d'utilisateur admin"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    name="password"
                    type="password"
                    value={adminCredentials.password}
                    onChange={handleAdminChange}
                    placeholder="Mot de passe admin"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Connexion..." : "Accéder au Dashboard"}
              </Button>
            </form>
            
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Identifiants de test :</strong><br />
                Utilisateur : <code className="bg-background px-1 rounded">admin</code><br />
                Mot de passe : <code className="bg-background px-1 rounded">admin123</code>
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default UnifiedLoginModal;