'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TicketForm from '@/components/TicketForm'

export default function NewTicketPage() {
  const router = useRouter()
  const [userUnit, setUserUnit] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer l'unité de l'utilisateur
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserUnit(user.unit || '')
      } catch (error) {
        console.error('Erreur lors de la lecture des données utilisateur:', error)
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Créer un ticket</h1>
        <p className="text-gray-600 mt-1">
          Signalez un problème ou faites une demande de maintenance
        </p>
      </div>

      <TicketForm userUnit={userUnit} />
    </div>
  )
}
