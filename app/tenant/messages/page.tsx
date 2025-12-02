'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Message, MessageCategory } from '@/lib/types'
import MessageCard from '@/components/MessageCard'
import MessageForm from '@/components/MessageForm'

type FilterTab = 'all' | 'intervention' | 'evenement' | 'general'

export default function MessagesPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    fetchMessages()
  }, [])

  useEffect(() => {
    applyFilter()
  }, [messages, activeFilter])

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token')

      const response = await fetch('/api/messages', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setMessages(data.data || [])
      } else {
        setError(data.error || 'Erreur lors du chargement des messages')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilter = () => {
    if (activeFilter === 'all') {
      setFilteredMessages(messages)
    } else {
      setFilteredMessages(
        messages.filter((msg) => msg.categorie === activeFilter)
      )
    }
  }

  const handleMessageCreated = () => {
    setShowForm(false)
    fetchMessages() // Recharger les messages
  }

  // Compter les messages par catégorie
  const counts = {
    all: messages.length,
    intervention: messages.filter((m) => m.categorie === 'intervention').length,
    evenement: messages.filter((m) => m.categorie === 'evenement').length,
    general: messages.filter((m) => m.categorie === 'general').length,
  }

  const tabs: { value: FilterTab; label: string; icon: string; color: string }[] = [
    { value: 'all', label: 'Tous', icon: '📋', color: 'text-gray-700' },
    { value: 'intervention', label: 'Interventions', icon: '🔧', color: 'text-red-600' },
    { value: 'evenement', label: 'Événements', icon: '🎉', color: 'text-blue-600' },
    { value: 'general', label: 'Général', icon: '💬', color: 'text-gray-600' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-600">Chargement des messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages de la résidence</h1>
          <p className="text-gray-600 mt-1">
            Communiquez avec vos voisins et restez informé des interventions
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-medium hover:shadow-lg transition flex items-center space-x-2"
        >
          <span>{showForm ? '✕ Fermer' : '+ Nouveau message'}</span>
        </button>
      </div>

      {/* Formulaire de création (conditionnel) */}
      {showForm && (
        <MessageForm
          onSuccess={handleMessageCreated}
          onCancel={() => setShowForm(false)}
          userRole="tenant"
        />
      )}

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Onglets de filtrage */}
      <div className="bg-white rounded-xl shadow-md p-2 flex space-x-2 border border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeFilter === tab.value
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeFilter === tab.value
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {counts[tab.value]}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Liste des messages */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">
            {activeFilter === 'intervention'
              ? '🔧'
              : activeFilter === 'evenement'
              ? '🎉'
              : activeFilter === 'general'
              ? '💬'
              : '📭'}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun message
          </h3>
          <p className="text-gray-600 mb-6">
            {activeFilter === 'all'
              ? 'Aucun message pour le moment. Soyez le premier à poster !'
              : `Aucun message dans la catégorie "${
                  tabs.find((t) => t.value === activeFilter)?.label
                }"`}
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition"
            >
              + Créer un message
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMessages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}
        </div>
      )}

      {/* Info sur les messages d'intervention */}
      {activeFilter === 'intervention' && filteredMessages.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
          <svg
            className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Messages d&apos;intervention</p>
            <p>
              Ces messages sont publiés par le gestionnaire de la résidence et
              concernent des interventions importantes (travaux, coupures, etc.)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
