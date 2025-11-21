'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TicketCard from '@/components/TicketCard'
import { Ticket, TicketStatus, TicketCategory } from '@/lib/types'

export default function TenantTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | 'all'>('all')

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [tickets, statusFilter, categoryFilter])

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

  const applyFilters = () => {
    let filtered = [...tickets]

    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((t) => t.category === categoryFilter)
    }

    setFilteredTickets(filtered)
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Chargement des tickets...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes tickets</h1>
          <p className="text-gray-600 mt-1">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
          </p>
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Filtres</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
            >
              <option value="all">Tous les statuts</option>
              <option value="open">Ouvert</option>
              <option value="assigned">Assigné</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolu</option>
              <option value="closed">Fermé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as TicketCategory | 'all')}
            >
              <option value="all">Toutes les catégories</option>
              <option value="plomberie">🔧 Plomberie</option>
              <option value="électricité">⚡ Électricité</option>
              <option value="concierge">🧹 Concierge</option>
              <option value="autre">📋 Autre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun ticket trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            {tickets.length === 0
              ? 'Créez votre premier ticket pour signaler un problème.'
              : 'Aucun ticket ne correspond aux filtres sélectionnés.'}
          </p>
          {tickets.length === 0 && (
            <Link
              href="/tenant/tickets/new"
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-medium hover:shadow-lg transition"
            >
              Créer un ticket
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} userRole="tenant" />
          ))}
        </div>
      )}
    </div>
  )
}
