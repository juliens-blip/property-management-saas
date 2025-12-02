'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Ticket, TicketStatus } from '@/lib/types'

export default function ProfessionalTicketDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  // États pour l'édition
  const [status, setStatus] = useState<TicketStatus>('assigned')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)

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

      const response = await fetch(`/api/professional/tickets/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (data.success && data.data) {
        setTicket(data.data)
        setStatus(data.data.status || 'assigned')
        setResolutionNotes(data.data.resolution_notes || '')
      } else {
        setError(data.error || 'Erreur lors du chargement du ticket')
      }
    } catch (err) {
      setError('Erreur serveur')
    } finally {
      setLoading(false)
    }
  }

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Veuillez sélectionner un fichier PDF')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 10MB')
        return
      }
      setPdfFile(file)
      setPdfPreview(URL.createObjectURL(file))
    }
  }

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      const formData = new FormData()
      formData.append('status', status)
      formData.append('resolution_notes', resolutionNotes)
      if (pdfFile) {
        formData.append('invoice', pdfFile)
      }

      const response = await fetch(`/api/professional/tickets/${params.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        alert('Ticket mis à jour avec succès')
        fetchTicket() // Recharger le ticket
        setPdfFile(null)
        setPdfPreview(null)
      } else {
        alert(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      alert('Erreur serveur')
    } finally {
      setUpdating(false)
    }
  }

  // Couleurs pour les statuts
  const STATUS_COLORS: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800 border-blue-200',
    assigned: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
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

  const CATEGORY_ICONS: Record<string, string> = {
    plomberie: '🔧',
    électricité: '⚡',
    concierge: '🧹',
    autre: '📋',
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎫</div>
          <p className="text-gray-600">Chargement du ticket...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-6">{error || 'Ticket non trouvé'}</p>
          <Link
            href="/professional/tickets"
            className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition inline-block"
          >
            Retour aux tickets
          </Link>
        </div>
      </div>
    )
  }

  // Main content
  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between">
        <Link
          href="/professional/tickets"
          className="flex items-center text-primary hover:text-primary-dark transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux tickets
        </Link>
        <div className="text-sm text-gray-500">#{ticket.id.slice(-8)}</div>
      </div>

      {/* Card principale du ticket */}
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        {/* En-tête du ticket */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className="text-5xl">{CATEGORY_ICONS[ticket.category]}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
              <div className="flex items-center space-x-3 flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[ticket.status]}`}>
                  {STATUS_LABELS[ticket.status]}
                </span>
                <span className={`font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                  {ticket.priority === 'urgent' && '🔥 '}
                  Priorité: {ticket.priority}
                </span>
                <span className="text-gray-600">{ticket.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
        </div>

        {/* Images si présentes */}
        {ticket.images_urls && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Photos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ticket.images_urls.split(',').map((url, index) => (
                <img
                  key={index}
                  src={url.trim()}
                  alt={`Image ${index + 1}`}
                  className="rounded-lg border border-gray-200 max-w-full h-auto"
                />
              ))}
            </div>
          </div>
        )}

        {/* Informations détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Locataire</h3>
            <p className="text-gray-900 font-medium">{ticket.tenant_email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Unité</h3>
            <p className="text-gray-900 font-medium">{ticket.unit}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Créé le</h3>
            <p className="text-gray-900">{new Date(ticket.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
          {ticket.updated_at && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Mis à jour le</h3>
              <p className="text-gray-900">{new Date(ticket.updated_at).toLocaleDateString('fr-FR')}</p>
            </div>
          )}
        </div>

        {/* Section éditable: Statut */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mise à jour du ticket</h2>

          <div className="space-y-4">
            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="assigned">Assigné</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolu</option>
                <option value="closed">Fermé</option>
              </select>
            </div>

            {/* Notes de résolution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes de résolution
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
                placeholder="Ajoutez vos notes concernant la résolution de ce ticket..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Upload facture PDF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facture (PDF)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
              />
              {pdfFile && (
                <p className="mt-2 text-sm text-gray-600">
                  📄 Fichier sélectionné: {pdfFile.name} ({(pdfFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Bouton de sauvegarde */}
            <div className="flex justify-end">
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {updating ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Affichage de la facture existante */}
      {ticket.invoice_url && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Facture</h3>
          <embed
            src={ticket.invoice_url}
            type="application/pdf"
            width="100%"
            height="600px"
            className="rounded-lg border border-gray-200"
          />
          <a
            href={ticket.invoice_url}
            download
            className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            📥 Télécharger la facture
          </a>
        </div>
      )}

      {/* Preview du nouveau PDF avant upload */}
      {pdfPreview && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu de la nouvelle facture</h3>
          <embed
            src={pdfPreview}
            type="application/pdf"
            width="100%"
            height="600px"
            className="rounded-lg border border-gray-200"
          />
        </div>
      )}
    </div>
  )
}
