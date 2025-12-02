'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Ticket, TicketStatus, TicketPriority } from '@/lib/types'

// Mapping des statuts
const STATUS_COLORS: Record<TicketStatus, string> = {
  open: 'bg-blue-100 text-blue-800 border-blue-200',
  assigned: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200',
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Ouvert',
  assigned: 'Assigné',
  in_progress: 'En cours',
  resolved: 'Résolu',
  closed: 'Fermé',
}

// Mapping des priorités
const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: 'text-gray-600',
  medium: 'text-blue-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
}

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
  urgent: 'Urgente',
}

// Mapping des catégories
const CATEGORY_ICONS: Record<string, string> = {
  plomberie: '🚰',
  'électricité': '⚡',
  concierge: '🧹',
  autre: '🔧',
}

const CATEGORY_LABELS: Record<string, string> = {
  plomberie: 'Plomberie',
  'électricité': 'Électricité',
  concierge: 'Concierge',
  autre: 'Autre',
}

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTicket()
  }, [params.id])

  const fetchTicket = async () => {
    try {
      const token = localStorage.getItem('token')

      if (!token) {
        router.push('/')
        return
      }

      const response = await fetch(`/api/tenant/tickets/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setTicket(data.data)
      } else {
        setError(data.error || 'Erreur lors du chargement du ticket')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🎫</div>
          <p className="text-gray-600">Chargement du ticket...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-6">{error || 'Ticket non trouvé'}</p>
          <Link
            href="/tenant/tickets"
            className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition inline-block"
          >
            ← Retour aux tickets
          </Link>
        </div>
      </div>
    )
  }

  const categoryIcon = CATEGORY_ICONS[ticket.category] || '🔧'
  const categoryLabel = CATEGORY_LABELS[ticket.category] || ticket.category
  const statusColor = STATUS_COLORS[ticket.status]
  const statusLabel = STATUS_LABELS[ticket.status]
  const priorityColor = PRIORITY_COLORS[ticket.priority]
  const priorityLabel = PRIORITY_LABELS[ticket.priority]

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between">
        <Link
          href="/tenant/tickets"
          className="flex items-center text-primary hover:text-primary-dark transition"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Retour aux tickets
        </Link>
        <div className="text-sm text-gray-500">Ticket #{ticket.id.slice(-8)}</div>
      </div>

      {/* Card principale du ticket */}
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className="text-5xl">{categoryIcon}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {ticket.title}
              </h1>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}
                >
                  {statusLabel}
                </span>
                <span className={`text-sm font-medium ${priorityColor}`}>
                  Priorité: {priorityLabel}
                </span>
                <span className="text-sm text-gray-500">{categoryLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </p>
        </div>

        {/* Image si présente */}
        {ticket.images_urls && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Photo jointe</h2>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img
                src={ticket.images_urls}
                alt="Photo du problème"
                className="w-full max-w-2xl h-auto"
              />
            </div>
          </div>
        )}

        {/* Informations complémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Unité</h3>
            <p className="text-gray-900 font-medium">{ticket.unit}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Date de création
            </h3>
            <p className="text-gray-900">{formatDate(ticket.created_at)}</p>
          </div>

          {ticket.assigned_to && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Assigné à
              </h3>
              <p className="text-gray-900">{ticket.assigned_to}</p>
            </div>
          )}

          {ticket.updated_at && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Dernière mise à jour
              </h3>
              <p className="text-gray-900">{formatDate(ticket.updated_at)}</p>
            </div>
          )}

          {ticket.resolved_at && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Date de résolution
              </h3>
              <p className="text-gray-900">{formatDate(ticket.resolved_at)}</p>
            </div>
          )}
        </div>

        {/* Notes de résolution */}
        {ticket.resolution_notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Notes de résolution
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {ticket.resolution_notes}
              </p>
            </div>
          </div>
        )}

        {/* Progression du statut */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Suivi</h2>
          <div className="flex items-center justify-between relative">
            {/* Ligne de progression */}
            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all"
                style={{
                  width:
                    ticket.status === 'open'
                      ? '0%'
                      : ticket.status === 'assigned'
                      ? '25%'
                      : ticket.status === 'in_progress'
                      ? '50%'
                      : ticket.status === 'resolved'
                      ? '75%'
                      : '100%',
                }}
              />
            </div>

            {/* Étapes */}
            {['open', 'assigned', 'in_progress', 'resolved', 'closed'].map(
              (status, index) => {
                const isActive =
                  ['open', 'assigned', 'in_progress', 'resolved', 'closed'].indexOf(
                    ticket.status
                  ) >= index
                return (
                  <div key={status} className="flex flex-col items-center z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary to-primary-dark border-primary text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {isActive ? '✓' : index + 1}
                    </div>
                    <span className="text-xs text-gray-600 mt-2 text-center">
                      {STATUS_LABELS[status as TicketStatus]}
                    </span>
                  </div>
                )
              }
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
