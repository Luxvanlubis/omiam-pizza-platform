"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { CheckCircle, XCircle, Clock, Star } from "lucide-react";

interface NotificationProps { type: "success" | "error" | "info" | "warning"; title: string; message: string; duration?: number;
}

export function useNotifications() { const showNotification = ({ type, title, message, duration = 3000 }: NotificationProps) => { const icon = { success: <CheckCircle className="w-5 h-5 text-green-500" />, error: <XCircle className="w-5 h-5 text-red-500" />, info: <Clock className="w-5 h-5 text-blue-500" />, warning: <Star className="w-5 h-5 text-yellow-500" /> }; toast.custom((t) => ( <div className={`flex items-center p-4 rounded-lg shadow-lg ${ type === "success" ? "bg-green-50 border border-green-200" : type === "error" ? "bg-red-50 border border-red-200" : type === "warning" ? "bg-yellow-50 border border-yellow-200" : "bg-blue-50 border border-blue-200" }`}> <div className="flex-shrink-0"> {icon[type]} </div> <div className="ml-3 flex-1"> <h4 className={`text-sm font-medium ${ type === "success" ? "text-green-800" : type === "error" ? "text-red-800" : type === "warning" ? "text-yellow-800" : "text-blue-800" }`}> {title} </h4> <p className={`text-sm ${ type === "success" ? "text-green-700" : type === "error" ? "text-red-700" : type === "warning" ? "text-yellow-700" : "text-blue-700" }`}> {message} </p> </div> <button onClick={() => toast.dismiss(t)} className="ml-4 text-gray-400 hover:text-gray-600" > × </button> </div> ), { duration: duration }); }; return { showNotification };
}

export function NotificationProvider() { return ( <Toaster position="top-right" expand={true} richColors closeButton /> );
}

// Notifications prédéfinies pour le restaurant
export const RestaurantNotifications = { orderSuccess: (orderNumber: string) => ({ type: "success" as const, title: "Commande confirmée !", message: `Votre commande #${orderNumber} a été enregistrée avec succès.` }), reservationSuccess: (date: string, time: string) => ({ type: "success" as const, title: "Réservation confirmée !", message: `Votre table pour le ${date} à ${time} est réservée.` }), addToCart: (itemName: string) => ({ type: "success" as const, title: "Ajouté au panier", message: `${itemName} a été ajouté à votre commande.` }), specialOffer: (offer: string) => ({ type: "warning" as const, title: "Offre spéciale !", message: offer }), orderReady: (orderNumber: string) => ({ type: "info" as const, title: "Commande prête !", message: `Votre commande #${orderNumber} est prête à être récupérée.` })
};