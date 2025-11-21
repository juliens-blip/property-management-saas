'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (!token || !userStr) {
      router.push('/')
      return
    }

    try {
      const user = JSON.parse(userStr)

      // Vérifier que l'utilisateur est bien un professional
      if (user.role !== 'professional') {
        router.push('/')
        return
      }

      setUserName(user.name)
      setLoading(false)
    } catch (error) {
      console.error('Erreur lors de la lecture des données utilisateur:', error)
      router.push('/')
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🏢</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} userRole="professional" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
