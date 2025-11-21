import { Ticket } from '@/lib/types'
import Link from 'next/link'

interface TicketCardProps {
  ticket: Ticket
  userRole: 'tenant' | 'professional'
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  assigned: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Ouvert',
  assigned: 'Assigné',
  in_progress: 'En cours',
  resolved: 'Résolu',
  closed: 'Fermé',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Haute',
  urgent: 'Urgente',
}

const CATEGORY_ICONS: Record<string, string> = {
  plomberie: '🔧',
  électricité: '⚡',
  concierge: '🧹',
  autre: '📋',
}

export default function TicketCard({ ticket, userRole }: TicketCardProps) {
  const statusColor = STATUS_COLORS[ticket.status] || STATUS_COLORS.open
  const priorityColor = PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.medium
  const categoryIcon = CATEGORY_ICONS[ticket.category] || CATEGORY_ICONS.autre

  const detailsPath =
    userRole === 'tenant'
      ? `/tenant/tickets/${ticket.id}`
      : `/professional/tickets/${ticket.id}`

  return (
    <Link href={detailsPath}>
      <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{categoryIcon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
              <p className="text-sm text-gray-500">#{ticket.id.substring(0, 8)}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {STATUS_LABELS[ticket.status]}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ticket.description}</p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className={`font-medium ${priorityColor}`}>
              🔥 {PRIORITY_LABELS[ticket.priority]}
            </span>
            {ticket.unit && (
              <span className="text-gray-500">📍 Unité {ticket.unit}</span>
            )}
          </div>
          <span className="text-gray-400">
            {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
          </span>
        </div>

        {ticket.assigned_to && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Assigné à: <span className="font-medium text-gray-700">{ticket.assigned_to}</span>
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}
