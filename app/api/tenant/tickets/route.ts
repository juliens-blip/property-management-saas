import { NextRequest, NextResponse } from 'next/server'
import { getTicketsByTenantEmail, createTicket } from '@/lib/airtable'
import { authenticateRequest } from '@/lib/auth'
import { ApiResponse, TICKET_FIELDS } from '@/lib/types'

// GET - Récupérer tous les tickets d'un tenant
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

    // Récupérer les tickets du tenant
    const ticketsRecords = await getTicketsByTenantEmail(auth.payload.email)

    // Formater les données
    const tickets = ticketsRecords.map((record) => ({
      id: record.id,
      ...record.fields,
    }))

    return NextResponse.json<ApiResponse>(
      { success: true, data: tickets },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau ticket
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { title, description, category, priority, unit, images_urls } = body

    // Validation des champs requis
    if (!title || !description || !category) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Titre, description et catégorie sont requis' },
        { status: 400 }
      )
    }

    // Préparer les champs du ticket
    const ticketFields: any = {
      [TICKET_FIELDS.title]: title,
      [TICKET_FIELDS.description]: description,
      [TICKET_FIELDS.category]: category,
      [TICKET_FIELDS.priority]: priority || 'medium',
      [TICKET_FIELDS.status]: 'open',
      [TICKET_FIELDS.tenant_email]: auth.payload.email,
      [TICKET_FIELDS.unit]: unit || '',
    }

    // === GESTION DES IMAGES - FORMAT STRICT AIRTABLE ===
    if (images_urls && Array.isArray(images_urls) && images_urls.length > 0) {
      // Airtable est TRÈS strict: il faut un tableau d'objets {id: "attXXXX"}
      // Ne pas envoyer l'objet complet, juste l'ID !
      ticketFields[TICKET_FIELDS.images_urls] = images_urls.map((img: any) => ({
        id: img.id  // ← CLEF ABSOLUE: c'est ce que Airtable attend
      }))

      console.log("✅ Images_urls format Airtable:", JSON.stringify(ticketFields[TICKET_FIELDS.images_urls], null, 2))
    }

    // Debug: afficher le payload complet
    console.log("🔍 DEBUG - Body reçu:", images_urls)
    console.log("🔍 DEBUG - ID extrait:", images_urls?.[0]?.id)
    console.log("🔍 DEBUG - Payload complet à Airtable:", JSON.stringify(ticketFields, null, 2))

    // Créer le ticket
    const newTicket = await createTicket(ticketFields)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { id: newTicket.id, ...newTicket.fields },
        message: 'Ticket créé avec succès',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
