import { NextRequest, NextResponse } from 'next/server'
import {
  getAllMessages,
  getMessagesByCategory,
  createMessage,
  findTenantByEmail,
  findProfessionalByEmail,
} from '@/lib/airtable'
import { authenticateRequest } from '@/lib/auth'
import { ApiResponse, MESSAGE_FIELDS, MessageCategory } from '@/lib/types'

// GET /api/messages - Récupérer les messages généraux
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const auth = authenticateRequest(authHeader)

    if (!auth.valid || !auth.payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Architecture mono-résidence : tous les utilisateurs voient tous les messages
    // Plus besoin de vérifier residence_name

    // Récupérer le paramètre de catégorie optionnel
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as MessageCategory | null

    // Récupérer les messages (tous ou filtrés par catégorie)
    let messagesRecords
    if (category && ['intervention', 'evenement', 'general'].includes(category)) {
      messagesRecords = await getMessagesByCategory(category)
    } else {
      messagesRecords = await getAllMessages()
    }

    // Récupérer la résidence de l'utilisateur connecté
    let userResidence = 'ResidConnect'
    if (auth.payload.role === 'tenant') {
      const tenantRecord = await findTenantByEmail(auth.payload.email)
      if (tenantRecord) {
        userResidence = tenantRecord.fields.residence_name || 'ResidConnect'
      }
    }

    // Enrichir chaque message avec created_by_name et residence_name
    const messages = messagesRecords.map((record) => ({
      id: record.id,
      ...record.fields,
      // Enrichissement côté API: utiliser le lookup email depuis TENANTS
      created_by_name: (record.fields[MESSAGE_FIELDS.email_from_tenants] as string[] || [])[0] || 'Utilisateur',
      residence_name: userResidence,
    }))

    return NextResponse.json<ApiResponse>(
      { success: true, data: messages },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erreur GET /api/messages:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/messages - Créer un nouveau message général
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const auth = authenticateRequest(authHeader)

    if (!auth.valid || !auth.payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { titre, message, categorie } = body

    // Validation
    if (!titre || !message || !categorie) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Titre, message et catégorie obligatoires' },
        { status: 400 }
      )
    }

    // Vérifier que la catégorie est valide
    if (!['intervention', 'evenement', 'general'].includes(categorie)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Catégorie invalide' },
        { status: 400 }
      )
    }

    // Règle de sécurité : Seuls les professionals de type "agency" peuvent créer des messages "intervention"
    if (categorie === 'intervention') {
      if (auth.payload.role !== 'professional') {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Seuls les gestionnaires peuvent créer des messages d\'intervention' },
          { status: 403 }
        )
      }

      const professionalRecord = await findProfessionalByEmail(auth.payload.email)
      if (!professionalRecord || professionalRecord.fields.type !== 'agency') {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Seuls les gestionnaires (agence) peuvent créer des messages d\'intervention' },
          { status: 403 }
        )
      }
    }

    // Trouver le record du tenant ou professional pour créer le lien
    let linkedRecordId: string | undefined

    if (auth.payload.role === 'tenant') {
      const tenantRecord = await findTenantByEmail(auth.payload.email)
      if (!tenantRecord) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Résident non trouvé' },
          { status: 404 }
        )
      }
      linkedRecordId = tenantRecord.id
    } else if (auth.payload.role === 'professional') {
      const professionalRecord = await findProfessionalByEmail(auth.payload.email)
      if (!professionalRecord) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Professionnel non trouvé' },
          { status: 404 }
        )
      }
      linkedRecordId = professionalRecord.id
    }

    // Créer le message dans Airtable avec le lien vers TENANTS ou PROFESSIONALS
    const messageFields: any = {
      [MESSAGE_FIELDS.titre]: titre,
      [MESSAGE_FIELDS.message]: message,
      [MESSAGE_FIELDS.categorie]: categorie,
      // Lier au tenant ou professional (format Airtable: array de record IDs)
      ...(auth.payload.role === 'tenant' && linkedRecordId && {
        [MESSAGE_FIELDS.TENANTS]: [linkedRecordId],
      }),
      ...(auth.payload.role === 'professional' && linkedRecordId && {
        [MESSAGE_FIELDS.PROFESSIONALS]: [linkedRecordId],
      }),
    }

    const newMessage = await createMessage(messageFields)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { id: newMessage.id, ...newMessage.fields },
        message: 'Message créé avec succès',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Erreur POST /api/messages:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
