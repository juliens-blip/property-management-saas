import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ResidConnect - Portail de Connexion',
  description: 'La plateforme qui connecte locataires et professionnels pour une gestion simplifiée de votre résidence. Accédez aux actualités, demandes de maintenance et communications en temps réel.',
  keywords: ['résidence', 'gestion immobilière', 'locataires', 'professionnels', 'maintenance', 'communication'],
  authors: [{ name: 'ResidConnect' }],
  openGraph: {
    title: 'ResidConnect - Portail de Connexion',
    description: 'Votre espace résidence en ligne',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
