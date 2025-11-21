import { NextRequest, NextResponse } from 'next/server'
import { getTicketById, updateTicket } from '@/lib/airtable'
import { authenticateRequest } from '@/lib/auth'
import { ApiResponse, TICKET_FIELDS } from '@/lib/types'

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
    const body = await request.json()
    const { status, resolution_notes, assigned_to } = body

    // Récupérer le ticket pour vérifier qu'il existe
    const ticketRecord = await getTicketById(ticketId)

    if (!ticketRecord) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ticket non trouvé' },
        { status: 404 }
      )
    }

    // Préparer les champs à mettre à jour
    const fieldsToUpdate: any = {
      // updated_at est un champ calculé automatique dans Airtable
    }

    if (status) {
      fieldsToUpdate[TICKET_FIELDS.status] = status
      // Note: resolved_at devrait être un champ calculé dans Airtable
      // Si ce n'est pas le cas, décommenter la ligne suivante:
      // if (status === 'resolved' || status === 'closed') {
      //   fieldsToUpdate[TICKET_FIELDS.resolved_at] = new Date().toISOString()
      // }
    }

    if (resolution_notes !== undefined) {
      fieldsToUpdate[TICKET_FIELDS.resolution_notes] = resolution_notes
    }

    if (assigned_to !== undefined) {
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
