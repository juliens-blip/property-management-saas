import { NextRequest, NextResponse } from 'next/server'
import { getTicketsByAssignedTo, getRecords } from '@/lib/airtable'
import { authenticateRequest } from '@/lib/auth'
import { ApiResponse, TABLES, TICKET_FIELDS } from '@/lib/types'

// GET - Récupérer tous les tickets assignés au professional
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

    // Vérifier que l'utilisateur est bien un professional
    if (auth.payload.role !== 'professional') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Accès réservé aux professionnels' },
        { status: 403 }
      )
    }

    // Récupérer les tickets assignés au professional
    const ticketsRecords = await getTicketsByAssignedTo(auth.payload.email)

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
