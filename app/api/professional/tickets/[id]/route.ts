import { NextRequest, NextResponse } from 'next/server'
import { getTicketById, updateTicket } from '@/lib/airtable'
import { authenticateRequest } from '@/lib/auth'
import { ApiResponse, TICKET_FIELDS } from '@/lib/types'

// GET - Récupérer un ticket par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Vérifier que l'utilisateur est bien un professional
    if (auth.payload.role !== 'professional') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Accès réservé aux professionnels' },
        { status: 403 }
      )
    }

    const ticketId = params.id

    // Récupérer le ticket
    const ticketRecord = await getTicketById(ticketId)

    if (!ticketRecord) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ticket non trouvé' },
        { status: 404 }
      )
    }

    // Retourner le ticket avec tous ses champs
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { id: ticketRecord.id, ...ticketRecord.fields },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la récupération du ticket:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour un ticket (statut, notes de résolution, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Vérifier que l'utilisateur est bien un professional
    if (auth.payload.role !== 'professional') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Accès réservé aux professionnels' },
        { status: 403 }
      )
    }

    const ticketId = params.id

    // Récupérer le ticket pour vérifier qu'il existe
    const ticketRecord = await getTicketById(ticketId)

    if (!ticketRecord) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ticket non trouvé' },
        { status: 404 }
      )
    }

    // Déterminer le type de contenu (JSON ou FormData)
    const contentType = request.headers.get('content-type') || ''
    let status, resolution_notes, assigned_to
    const fieldsToUpdate: any = {}

    if (contentType.includes('multipart/form-data')) {
      // Traitement FormData (avec potentiel upload PDF)
      const formData = await request.formData()
      status = formData.get('status') as string | null
      resolution_notes = formData.get('resolution_notes') as string | null
      assigned_to = formData.get('assigned_to') as string | null
      const invoiceFile = formData.get('invoice') as File | null

      // Gestion de l'upload PDF
      if (invoiceFile && invoiceFile.size > 0) {
        // Validation du fichier PDF
        if (invoiceFile.type !== 'application/pdf') {
          return NextResponse.json<ApiResponse>(
            { success: false, error: 'Le fichier doit être un PDF' },
            { status: 400 }
          )
        }

        // Limite de taille: 10MB
        const MAX_SIZE = 10 * 1024 * 1024
        if (invoiceFile.size > MAX_SIZE) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: 'Le fichier PDF ne doit pas dépasser 10MB' },
            { status: 400 }
          )
        }

        // Sauvegarder le fichier localement
        const { writeFile } = await import('fs/promises')
        const { join } = await import('path')

        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 8)
        const filename = `ticket_${ticketId}_${timestamp}_${randomString}.pdf`

        const bytes = await invoiceFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'reports')
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)

        // Stocker l'URL dans Airtable
        const invoiceUrl = `/uploads/reports/${filename}`
        fieldsToUpdate[TICKET_FIELDS.invoice_url] = invoiceUrl
      }
    } else {
      // Traitement JSON classique
      const body = await request.json()
      status = body.status
      resolution_notes = body.resolution_notes
      assigned_to = body.assigned_to
    }

    // Ajouter les champs standard à mettre à jour
    if (status) {
      fieldsToUpdate[TICKET_FIELDS.status] = status
    }

    if (resolution_notes !== undefined && resolution_notes !== null) {
      fieldsToUpdate[TICKET_FIELDS.resolution_notes] = resolution_notes
    }

    if (assigned_to !== undefined && assigned_to !== null) {
      fieldsToUpdate[TICKET_FIELDS.assigned_to] = assigned_to
    }

    // Mettre à jour le ticket
    const updatedTicket = await updateTicket(ticketId, fieldsToUpdate)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { id: updatedTicket.id, ...updatedTicket.fields },
        message: 'Ticket mis à jour avec succès',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la mise à jour du ticket:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
