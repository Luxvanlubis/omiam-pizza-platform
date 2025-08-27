import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Identifiants admin par défaut (à remplacer par une vraie base de données)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      )
    }
    
    // Vérifier les identifiants admin
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Créer une session admin simple
      const adminSession = {
        id: 'admin-1',
        username: username,
        role: 'admin',
        loginTime: new Date().toISOString()
      }
      
      // Définir un cookie sécurisé pour l'admin
      const cookieStore = cookies()
      cookieStore.set('admin-session', JSON.stringify(adminSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 heures
      })
      
      return NextResponse.json({
        success: true,
        user: {
          id: adminSession.id,
          username: adminSession.username,
          role: adminSession.role
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Erreur login admin:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion admin' },
      { status: 500 }
    )
  }
}