import { Message } from '@/lib/types'

interface MessageCardProps {
  message: Message
}

// Mapping des catégories vers couleurs de badges
const CATEGORY_COLORS: Record<string, string> = {
  intervention: 'bg-red-100 text-red-800 border-red-200',
  evenement: 'bg-blue-100 text-blue-800 border-blue-200',
  general: 'bg-gray-100 text-gray-800 border-gray-200',
}

// Mapping des catégories vers labels français
const CATEGORY_LABELS: Record<string, string> = {
  intervention: 'Intervention',
  evenement: 'Événement',
  general: 'Général',
}

// Mapping des catégories vers emojis
const CATEGORY_ICONS: Record<string, string> = {
  intervention: '🔧',
  evenement: '🎉',
  general: '💬',
}

export default function MessageCard({ message }: MessageCardProps) {
  const categoryColor = CATEGORY_COLORS[message.categorie] || CATEGORY_COLORS.general
  const categoryLabel = CATEGORY_LABELS[message.categorie] || message.categorie
  const categoryIcon = CATEGORY_ICONS[message.categorie] || '📌'

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`
    } else if (diffDays < 7) {
      return `Il y a ${diffDays}j`
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      {/* Header avec catégorie et date */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{categoryIcon}</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryColor}`}
          >
            {categoryLabel}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {formatDate(message.created_at)}
        </span>
      </div>

      {/* Titre du message */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {message.titre}
      </h3>

      {/* Contenu du message */}
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{message.message}</p>

      {/* Footer avec auteur et résidence */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-medium text-xs">
            {message.created_by_name ? message.created_by_name.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{message.created_by_name}</p>
            {message.residence_name && (
              <p className="text-xs text-gray-500">{message.residence_name}</p>
            )}
          </div>
        </div>

        {/* Badge pour les messages d'intervention (prioritaires) */}
        {message.categorie === 'intervention' && (
          <div className="flex items-center space-x-1 text-red-600">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-medium">Important</span>
          </div>
        )}
      </div>
    </div>
  )
}
