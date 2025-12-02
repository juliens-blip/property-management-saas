import { NextRequest, NextResponse } from 'next/server'
import { findTenantByEmail } from '@/lib/airtable'
import { authenticateRequest } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

// GET /api/tenant/me - Récupérer les informations du tenant connecté
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization')
    const auth = authenticateRequest(authHeader)

    if (!auth.valid || !auth.payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: auth.error || 'Non autorisé' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est bien un tenant
    if (auth.payload.role !== 'tenant') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Accès réservé aux locataires' },
        { status: 403 }
      )
    }

    // Récupérer les informations du tenant
    const tenantRecord = await findTenantByEmail(auth.payload.email)

    if (!tenantRecord) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Préparer les données du tenant
    const tenant = {
      id: tenantRecord.id,
      email: tenantRecord.fields.email,
      first_name: tenantRecord.fields.first_name,
      last_name: tenantRecord.fields.last_name,
      unit: tenantRecord.fields.unit,
      phone: tenantRecord.fields.phone,
      residence_name: tenantRecord.fields.residence_name,
      status: tenantRecord.fields.status,
      created_at: tenantRecord.fields.created_at,
      // Indicateurs de diagnostic
      hasResidence: !!(tenantRecord.fields.residence_name && tenantRecord.fields.residence_name.trim()),
      hasUnit: !!(tenantRecord.fields.unit && tenantRecord.fields.unit.trim()),
      hasPhone: !!(tenantRecord.fields.phone && tenantRecord.fields.phone.trim()),
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: tenant },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
