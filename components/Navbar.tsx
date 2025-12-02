'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface NavbarProps {
  userName: string
  userRole: 'tenant' | 'professional'
}

export default function Navbar({ userName, userRole }: NavbarProps) {
  const router = useRouter()

  const handleLogout = () => {
    // Supprimer le token du localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Rediriger vers la page de login
    router.push('/')
  }

  const dashboardPath = userRole === 'tenant' ? '/tenant/dashboard' : '/professional/dashboard'
  const ticketsPath = userRole === 'tenant' ? '/tenant/tickets' : '/professional/tickets'
  const messagesPath = '/tenant/messages'

  return (
    <nav className="bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={dashboardPath} className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-2xl">
                🏢
              </div>
              <span className="text-xl font-bold hidden sm:block">ResidConnect</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              href={dashboardPath}
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition"
            >
              Tableau de bord
            </Link>
            <Link
              href={ticketsPath}
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition"
            >
              Tickets
            </Link>
            {userRole === 'tenant' && (
              <Link
                href={messagesPath}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition"
              >
                Messages
              </Link>
            )}

            {/* User Info & Logout */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-white/30">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs opacity-75">
                  {userRole === 'tenant' ? 'Locataire' : 'Professionnel'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
