import { NextRequest, NextResponse } from 'next/server'
import { findTenantByEmail, findProfessionalByEmail } from '@/lib/airtable'
import { verifyPassword, createToken } from '@/lib/auth'
import { AuthResponse, UserRole } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role } = body

    // Validation des champs requis
    if (!email || !password || !role) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          error: 'Email, mot de passe et rôle sont requis',
        },
        { status: 400 }
      )
    }

    // Vérifier que le rôle est valide
    if (role !== 'tenant' && role !== 'professional') {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          error: 'Rôle invalide',
        },
        { status: 400 }
      )
    }

    let userRecord
    let userRole: UserRole = role

    // Chercher l'utilisateur selon son rôle
    if (role === 'tenant') {
      userRecord = await findTenantByEmail(email)
    } else {
      userRecord = await findProfessionalByEmail(email)
    }

    // Vérifier si l'utilisateur existe
    if (!userRecord) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          error: 'Identifiants invalides',
        },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const passwordHash = userRecord.fields.password_hash
    if (!passwordHash) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          error: 'Compte non configuré',
        },
        { status: 500 }
      )
    }

    const isPasswordValid = await verifyPassword(password, passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          error: 'Identifiants invalides',
        },
        { status: 401 }
      )
    }

    // Créer le token JWT
    const token = createToken({
      userId: userRecord.id,
      email: userRecord.fields.email,
      role: userRole,
    })

    // Préparer les données utilisateur (sans le hash du mot de passe)
    const user = {
      id: userRecord.id,
      email: userRecord.fields.email,
      role: userRole,
      ...(role === 'tenant'
        ? {
            first_name: userRecord.fields.first_name,
            last_name: userRecord.fields.last_name,
            unit: userRecord.fields.unit,
          }
        : {
            name: userRecord.fields.name,
          }),
    }

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        token,
        user,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        error: 'Erreur serveur lors de la connexion',
      },
      { status: 500 }
    )
  }
}
