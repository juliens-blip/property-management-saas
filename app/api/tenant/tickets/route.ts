import { NextRequest, NextResponse } from 'next/server'
import { getTicketsByTenantEmail, createTicket, mapCategoryToProfessionalType, findProfessionalByType } from '@/lib/airtable'
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

    // Gérer FormData (pour fichiers) OU JSON
    let title, description, category, priority, unit, imageFile
    const contentType = request.headers.get('content-type')

    if (contentType?.includes('multipart/form-data')) {
      // Upload avec fichier
      const formData = await request.formData()
      title = formData.get('title') as string
      description = formData.get('description') as string
      category = formData.get('category') as string
      priority = formData.get('priority') as string
      unit = formData.get('unit') as string
      imageFile = formData.get('image') as File | null
    } else {
      // JSON simple (sans fichier)
      const body = await request.json()
      title = body.title
      description = body.description
      category = body.category
      priority = body.priority
      unit = body.unit
    }

    // Validation des champs requis
    if (!title || !description || !category) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Titre, description et catégorie sont requis' },
        { status: 400 }
      )
    }

    // === ASSIGNATION AUTOMATIQUE DU PROFESSIONNEL ===
    // Mapper la catégorie du ticket vers le type de professionnel
    const professionalType = mapCategoryToProfessionalType(category)
    let assignedProfessionalId: string | null = null

    if (professionalType) {
      const professional = await findProfessionalByType(professionalType)
      if (professional) {
        assignedProfessionalId = professional.id
        console.log(`✅ Professionnel assigné automatiquement: ${professional.fields.name} (${professionalType})`)
      } else {
        console.log(`⚠️ Aucun professionnel trouvé pour le type: ${professionalType}`)
      }
    }

    // Préparer les champs du ticket
    const ticketFields: any = {
      [TICKET_FIELDS.title]: title,
      [TICKET_FIELDS.description]: description,
      [TICKET_FIELDS.category]: category,
      [TICKET_FIELDS.priority]: priority || 'medium',
      [TICKET_FIELDS.status]: assignedProfessionalId ? 'assigned' : 'open', // Statut = assigned si professionnel trouvé
      [TICKET_FIELDS.tenant_email]: auth.payload.email,
      [TICKET_FIELDS.unit]: unit || '',
    }

    // Assigner le professionnel si trouvé
    if (assignedProfessionalId) {
      ticketFields[TICKET_FIELDS.PROFESSIONALS] = [assignedProfessionalId]
    }

    // === GESTION DES IMAGES - STOCKAGE LOCAL ===
    if (imageFile) {
      const { writeFile } = await import('fs/promises')
      const { join } = await import('path')

      // Générer un nom de fichier unique
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const extension = imageFile.name.split('.').pop()
      const filename = `ticket_${timestamp}_${randomString}.${extension}`

      // Sauvegarder dans /public/uploads/tickets/
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'tickets')
      const filepath = join(uploadDir, filename)

      await writeFile(filepath, buffer)

      // Stocker l'URL dans Airtable (champ texte)
      const imageUrl = `/uploads/tickets/${filename}`
      ticketFields[TICKET_FIELDS.images_urls] = imageUrl

      console.log("✅ Image sauvegardée:", imageUrl)
    }

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
