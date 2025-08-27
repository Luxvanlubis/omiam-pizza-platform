import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Supprimer le cookie de session admin
    const cookieStore = cookies()
    cookieStore.delete('admin-session')
    
    return NextResponse.json({
      success: true,
      message: 'Déconnexion admin réussie'
    })
  } catch (error) {
    console.error('Erreur logout admin:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion admin' },
      { status: 500 }
    )
  }
}

// Méthode GET pour vérifier le statut de session admin
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const adminSession = cookieStore.get('admin-session')
    
    if (adminSession) {
      const sessionData = JSON.parse(adminSession.value)
      return NextResponse.json({
        authenticated: true,
        user: {
          id: sessionData.id,
          username: sessionData.username,
          role: sessionData.role
        }
      })
    } else {
      return NextResponse.json({
        authenticated: false
      })
    }
  } catch (error) {
    console.error('Erreur vérification session admin:', error)
    return NextResponse.json({
      authenticated: false,
      error: 'Erreur lors de la vérification de session'
    })
  }
}