'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardCard from '@/components/DashboardCard'
import TicketCard from '@/components/TicketCard'
import { Ticket } from '@/lib/types'

export default function TenantDashboard() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      const response = await fetch('/api/tenant/tickets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setTickets(data.data || [])
      } else {
        setError(data.error || 'Erreur lors du chargement des tickets')
      }
    } catch (err) {
      setError('Erreur serveur')
    } finally {
      setLoading(false)
    }
  }

  const totalTickets = tickets.length
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'assigned').length
  const inProgressTickets = tickets.filter((t) => t.status === 'in_progress').length
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length

  const recentTickets = tickets.slice(0, 3)

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Chargement du tableau de bord...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Vue d&apos;ensemble de vos demandes</p>
        </div>
        <Link
          href="/tenant/tickets/new"
          className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-medium hover:shadow-lg transition"
        >
          + Nouveau ticket
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total" value={totalTickets} icon="📋" />
        <DashboardCard title="En attente" value={openTickets} icon="🕐" />
        <DashboardCard title="En cours" value={inProgressTickets} icon="⚙️" />
        <DashboardCard title="Résolus" value={resolvedTickets} icon="✅" />
      </div>

      {/* Recent Tickets */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Tickets récents</h2>
          <Link
            href="/tenant/tickets"
            className="text-primary hover:text-primary-dark font-medium"
          >
            Voir tout →
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun ticket pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Créez votre premier ticket pour signaler un problème ou une demande.
            </p>
            <Link
              href="/tenant/tickets/new"
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-medium hover:shadow-lg transition"
            >
              Créer un ticket
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} userRole="tenant" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
