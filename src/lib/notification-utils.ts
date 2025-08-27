// Utilitaires pour les notifications SSE

// Map pour stocker les connexions actives
const connections = new Map<string, ReadableStreamDefaultController>();

// Fonction pour envoyer une notification à un utilisateur spécifique
export function sendNotificationToUser(userId: string, notification: any) { const controller = connections.get(userId); if (controller) { try { const data = `data: ${JSON.stringify(notification)}\n\n`; controller.enqueue(new TextEncoder().encode(data)); } catch (error) { console.error('Erreur lors de l\'envoi de la notification SSE:', error instanceof Error ? error.message : String(error)); // Nettoyer la connexion fermée connections.delete(userId); } }
}

// Fonction pour diffuser une notification à tous les utilisateurs connectés
export function broadcastNotification(notification: any) { connections.forEach((controller, userId) => { try { const data = `data: ${JSON.stringify(notification)}\n\n`; controller.enqueue(new TextEncoder().encode(data)); } catch (error) { console.error(`Erreur lors de l'envoi de la notification à ${userId}:`, error instanceof Error ? error.message : String(error)); // Nettoyer la connexion fermée connections.delete(userId); } });
}

// Fonction pour ajouter une connexion
export function addConnection(userId: string, controller: ReadableStreamDefaultController) { connections.set(userId, controller);
}

// Fonction pour supprimer une connexion
export function removeConnection(userId: string) { connections.delete(userId);
}

// Fonction pour obtenir le nombre de connexions actives
export function getActiveConnections(): number { return connections.size;
}

// Fonction pour nettoyer toutes les connexions
export function clearAllConnections() { connections.forEach((controller) => { try { controller.close(); } catch (error) { // Connexion déjà fermée } }); connections.clear();
}