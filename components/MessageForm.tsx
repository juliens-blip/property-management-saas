'use client'

import { useState, FormEvent } from 'react'
import { MessageCategory } from '@/lib/types'

interface MessageFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  userRole?: 'tenant' | 'professional'
}

export default function MessageForm({ onSuccess, onCancel, userRole = 'tenant' }: MessageFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    titre: '',
    message: '',
    categorie: 'general' as MessageCategory,
  })

  // Catégories disponibles selon le rôle
  const availableCategories: { value: MessageCategory; label: string; description: string }[] =
    userRole === 'professional'
      ? [
          { value: 'intervention', label: '🔧 Intervention', description: 'Message important du gestionnaire' },
          { value: 'evenement', label: '🎉 Événement', description: 'Annonce d\'un événement' },
          { value: 'general', label: '💬 Général', description: 'Message général' },
        ]
      : [
          { value: 'evenement', label: '🎉 Événement', description: 'Annonce d\'un événement (ex: fête)' },
          { value: 'general', label: '💬 Général', description: 'Message général aux voisins' },
        ]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        setError('Vous devez être connecté')
        setLoading(false)
        return
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // Réinitialiser le formulaire
        setFormData({
          titre: '',
          message: '',
          categorie: 'general',
        })

        // Callback de succès
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError(data.error || 'Erreur lors de la création du message')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Nouveau message</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <svg
            className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Catégorie */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de message *
        </label>
        <div className="space-y-2">
          {availableCategories.map((cat) => (
            <label
              key={cat.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                formData.categorie === cat.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="categorie"
                value={cat.value}
                checked={formData.categorie === cat.value}
                onChange={(e) =>
                  setFormData({ ...formData, categorie: e.target.value as MessageCategory })
                }
                className="mr-3 h-4 w-4 text-primary focus:ring-primary"
              />
              <div>
                <div className="font-medium text-gray-900">{cat.label}</div>
                <div className="text-sm text-gray-500">{cat.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Titre */}
      <div>
        <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-2">
          Titre du message *
        </label>
        <input
          type="text"
          id="titre"
          required
          maxLength={100}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          value={formData.titre}
          onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
          placeholder="Ex: Fête samedi soir, Coupure d'eau programmée..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.titre.length}/100 caractères
        </p>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message *
        </label>
        <textarea
          id="message"
          required
          rows={6}
          maxLength={1000}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Décrivez votre message en détail..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.message.length}/1000 caractères
        </p>
      </div>

      {/* Info pour les messages d'intervention */}
      {formData.categorie === 'intervention' && userRole === 'professional' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
          <svg
            className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5"
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
            <p className="font-medium">Message d&apos;intervention</p>
            <p>
              Ce message sera marqué comme important et visible par tous les
              résidents de la résidence.
            </p>
          </div>
        </div>
      )}

      {/* Boutons */}
      <div className="flex justify-end space-x-4 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Envoi en cours...
            </span>
          ) : (
            'Publier le message'
          )}
        </button>
      </div>
    </form>
  )
}
