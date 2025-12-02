'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardCard from '@/components/DashboardCard'
import TicketCard from '@/components/TicketCard'
import { Ticket } from '@/lib/types'

export default function ProfessionalDashboard() {
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

      const response = await fetch('/api/professional/tickets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      // DEBUG: Afficher la réponse de l'API
      console.log('📊 [Dashboard] Réponse API tickets:', {
        success: data.success,
        ticketsCount: data.data?.length || 0,
        tickets: data.data,
        error: data.error
      })

      if (data.success) {
        setTickets(data.data || [])
        console.log('✅ [Dashboard] Tickets chargés:', data.data?.length || 0)
      } else {
        console.error('❌ [Dashboard] Erreur API:', data.error)
        setError(data.error || 'Erreur lors du chargement des tickets')
      }
    } catch (err) {
      setError('Erreur serveur')
    } finally {
      setLoading(false)
    }
  }

  const totalTickets = tickets.length
  const urgentTickets = tickets.filter((t) => t.priority === 'urgent').length
  const inProgressTickets = tickets.filter((t) => t.status === 'in_progress').length
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved').length

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord professionnel</h1>
        <p className="text-gray-600 mt-1">Vue d&apos;ensemble des tickets assignés</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Tickets assignés" value={totalTickets} icon="📋" />
        <DashboardCard title="Urgents" value={urgentTickets} icon="🔥" bgColor="bg-red-50" textColor="text-red-700" />
        <DashboardCard title="En cours" value={inProgressTickets} icon="⚙️" bgColor="bg-purple-50" textColor="text-purple-700" />
        <DashboardCard title="Résolus" value={resolvedTickets} icon="✅" bgColor="bg-green-50" textColor="text-green-700" />
      </div>

      {/* Recent Tickets */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Tickets récents</h2>
          <Link
            href="/professional/tickets"
            className="text-primary hover:text-primary-dark font-medium"
          >
            Voir tout →
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun ticket assigné
            </h3>
            <p className="text-gray-600">
              Vous n&apos;avez pas encore de tickets assignés.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} userRole="professional" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
