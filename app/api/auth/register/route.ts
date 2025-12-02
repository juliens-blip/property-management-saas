import { NextRequest, NextResponse } from 'next/server'
import { createRecord, findTenantByEmail } from '@/lib/airtable'
import { hashPassword, createToken } from '@/lib/auth'
import { AuthResponse, TABLES, TENANT_FIELDS } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, first_name, last_name, unit, phone, residence_name } = body

    // Validation des champs requis
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          error: 'Email, mot de passe, prénom et nom sont requis',
        },
        { status: 400 }
      )
    }

    // Validation de la résidence (obligatoire)
    if (!residence_name || residence_name.trim() === '') {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          error: 'La résidence est obligatoire',
        },
        { status: 400 }
      )
    }

    // Vérifier que l'email n'existe pas déjà
    const existingTenant = await findTenantByEmail(email)
    if (existingTenant) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          error: 'Un compte avec cet email existe déjà',
        },
        { status: 409 }
      )
    }

    // Hacher le mot de passe
    const password_hash = await hashPassword(password)

    // Créer le nouveau tenant dans Airtable
    const newTenantRecord = await createRecord(TABLES.TENANTS, {
      [TENANT_FIELDS.email]: email,
      [TENANT_FIELDS.password_hash]: password_hash,
      [TENANT_FIELDS.first_name]: first_name,
      [TENANT_FIELDS.last_name]: last_name,
      [TENANT_FIELDS.unit]: unit || '',
      [TENANT_FIELDS.phone]: phone || '',
      [TENANT_FIELDS.residence_name]: residence_name.trim(),
      [TENANT_FIELDS.status]: 'active',
      // created_at est un champ calculé automatique dans Airtable, on ne l'envoie pas
    })

    // Créer le token JWT
    const token = createToken({
      userId: newTenantRecord.id,
      email: email,
      role: 'tenant',
    })

    // Préparer les données utilisateur
    const user = {
      id: newTenantRecord.id,
      email: email,
      role: 'tenant' as const,
      first_name: first_name,
      last_name: last_name,
      unit: unit || '',
    }

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        token,
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        error: 'Erreur serveur lors de l\'inscription',
      },
      { status: 500 }
    )
  }
}
