import { NextRequest, NextResponse } from 'next/server'
import { getTicketById } from '@/lib/airtable'
import { authenticateRequest } from '@/lib/auth'
import { ApiResponse, TICKET_FIELDS } from '@/lib/types'

// GET - Récupérer un ticket spécifique par ID
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

    // Vérifier que l'utilisateur est bien un tenant
    if (auth.payload.role !== 'tenant') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Accès réservé aux locataires' },
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

    // NOTE: Tous les locataires peuvent voir tous les tickets (pas de vérification d'ownership)
    // Cette logique permet aux locataires de voir les tickets des autres pour la transparence

    const ticket = {
      id: ticketRecord.id,
      ...ticketRecord.fields,
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: ticket },
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
