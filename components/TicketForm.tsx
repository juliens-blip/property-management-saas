'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { TicketCategory, TicketPriority } from '@/lib/types'

interface TicketFormProps {
  userUnit?: string
}

export default function TicketForm({ userUnit }: TicketFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [imageError, setImageError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'autre' as TicketCategory,
    priority: 'medium' as TicketPriority,
    unit: userUnit || '',
  })

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setImageError('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.')
        return
      }

      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setImageError('Le fichier est trop volumineux. Taille maximale : 10MB')
        return
      }

      setSelectedFile(file)
      setImageError(null)

      // Créer une preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setImageError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      // Si une image est sélectionnée, envoyer FormData, sinon JSON
      let response
      if (selectedFile) {
        // === UPLOAD AVEC IMAGE - FormData ===
        const submitFormData = new FormData()
        submitFormData.append('title', formData.title)
        submitFormData.append('description', formData.description)
        submitFormData.append('category', formData.category)
        submitFormData.append('priority', formData.priority)
        submitFormData.append('unit', formData.unit)
        submitFormData.append('image', selectedFile)

        response = await fetch('/api/tenant/tickets', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: submitFormData,
        })
      } else {
        // === SANS IMAGE - JSON ===
        response = await fetch('/api/tenant/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        })
      }

      const data = await response.json()

      if (data.success) {
        router.push('/tenant/tickets')
      } else {
        setError(data.error || 'Erreur lors de la création du ticket')
      }
    } catch (err) {
      setError('Erreur serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Titre du ticket *
        </label>
        <input
          type="text"
          id="title"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: Fuite d'eau dans la salle de bain"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          required
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Décrivez le problème en détail..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie *
          </label>
          <select
            id="category"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as TicketCategory })}
          >
            <option value="plomberie">🔧 Plomberie</option>
            <option value="électricité">⚡ Électricité</option>
            <option value="concierge">🧹 Concierge</option>
            <option value="autre">📋 Autre</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
            Priorité *
          </label>
          <select
            id="priority"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
          >
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
          Unité
        </label>
        <input
          type="text"
          id="unit"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          placeholder="Ex: Appartement 12A"
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
          Ajouter une photo (optionnel)
        </label>

        {imageError && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {imageError}
          </div>
        )}

        <input
          type="file"
          id="image"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark"
          onChange={handleFileChange}
        />
        <p className="text-xs text-gray-500 mt-1">
          JPG, PNG, GIF ou WebP - Max 10MB. L&apos;image sera envoyée lors de la création du ticket.
        </p>

        {previewUrl && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Aperçu :</p>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Supprimer
              </button>
            </div>
            <img
              src={previewUrl}
              alt="Aperçu"
              className="max-w-xs rounded-lg border border-gray-300"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Créer le ticket'}
        </button>
      </div>
    </form>
  )
}
