/**
 * Script de diagnostic pour vérifier les tickets assignés à un professionnel
 * Usage: npx tsx scripts/debug-tickets-pro.ts marc.electricien@residconnect.com
 */

// Charger les variables d'environnement depuis .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { getRecords } from '../lib/airtable'
import { TABLES } from '../lib/types'

const professionalEmail = process.argv[2]

if (!professionalEmail) {
  console.error('❌ Usage: npx tsx scripts/debug-tickets-pro.ts <email-professionnel>')
  process.exit(1)
}

async function debugTickets() {
  console.log('\n🔍 ===== DIAGNOSTIC TICKETS PROFESSIONNEL =====\n')
  console.log(`📧 Email recherché: ${professionalEmail}`)
  console.log(`📧 Email normalisé: ${professionalEmail.toLowerCase().trim()}\n`)

  // Récupérer tous les professionnels
  console.log('👥 Récupération des professionnels...')
  const allProfessionals = await getRecords(TABLES.PROFESSIONALS)
  console.log(`   ✅ ${allProfessionals.length} professionnels trouvés\n`)

  // Trouver le professionnel
  const targetProf = allProfessionals.find(
    p => (p.fields.email || '').toLowerCase().trim() === professionalEmail.toLowerCase().trim()
  )

  if (!targetProf) {
    console.error(`❌ Professionnel avec l'email "${professionalEmail}" non trouvé dans Airtable!`)
    console.log('\n📋 Professionnels disponibles:')
    allProfessionals.forEach(p => {
      console.log(`   - ${p.fields.name} (${p.fields.email}) [ID: ${p.id}]`)
    })
    process.exit(1)
  }

  console.log('✅ Professionnel trouvé:')
  console.log(`   - Nom: ${targetProf.fields.name}`)
  console.log(`   - Email: ${targetProf.fields.email}`)
  console.log(`   - Type: ${targetProf.fields.type}`)
  console.log(`   - Record ID: ${targetProf.id}`)
  console.log(`   - Champ TICKETS: ${JSON.stringify(targetProf.fields.TICKETS || [])}`)
  console.log()

  // Récupérer tous les tickets
  console.log('🎫 Récupération de tous les tickets...')
  const allTickets = await getRecords(TABLES.TICKETS)
  console.log(`   ✅ ${allTickets.length} tickets trouvés\n`)

  // Analyser chaque ticket
  console.log('🔍 Analyse des tickets:\n')

  let matchingTickets = 0
  const professionalsById = new Map(allProfessionals.map(p => [p.id, p]))

  allTickets.forEach((ticket, index) => {
    console.log(`--- Ticket ${index + 1}/${allTickets.length} ---`)
    console.log(`ID: ${ticket.id}`)
    console.log(`Titre: ${ticket.fields.title || 'N/A'}`)
    console.log(`Status: ${ticket.fields.status || 'N/A'}`)

    // Vérifier le champ PROFESSIONALS (link field)
    const professionalIds = ticket.fields.PROFESSIONALS as string[] | undefined
    console.log(`Champ PROFESSIONALS (link): ${JSON.stringify(professionalIds || [])}`)

    if (professionalIds && professionalIds.length > 0) {
      const linkedProf = professionalsById.get(professionalIds[0])
      if (linkedProf) {
        const linkedProfEmail = (linkedProf.fields.email || '').toLowerCase().trim()
        console.log(`  → Professionnel lié: ${linkedProf.fields.name} (${linkedProf.fields.email})`)

        if (linkedProfEmail === professionalEmail.toLowerCase().trim()) {
          console.log(`  ✅ MATCH! Ce ticket est assigné à ${professionalEmail}`)
          matchingTickets++
        } else {
          console.log(`  ❌ Pas de match (${linkedProfEmail} ≠ ${professionalEmail.toLowerCase().trim()})`)
        }
      }
    } else {
      console.log(`  ⚠️  Champ PROFESSIONALS vide`)
    }

    // Vérifier le lookup field
    const emailsFromProfessionals = ticket.fields['email (from PROFESSIONALS)']
    console.log(`Champ "email (from PROFESSIONALS)" (lookup): ${JSON.stringify(emailsFromProfessionals || [])}`)

    // Vérifier l'ancien champ assigned_to
    const assignedTo = ticket.fields.assigned_to
    console.log(`Champ assigned_to (deprecated): ${assignedTo || 'N/A'}`)

    console.log()
  })

  console.log('\n📊 ===== RÉSUMÉ =====')
  console.log(`Total tickets: ${allTickets.length}`)
  console.log(`Tickets correspondants à ${professionalEmail}: ${matchingTickets}`)

  if (matchingTickets === 0) {
    console.log('\n⚠️  PROBLÈME IDENTIFIÉ:')
    console.log('Aucun ticket ne correspond au professionnel!')
    console.log('\n💡 Solutions possibles:')
    console.log('1. Vérifier que les tickets ont le champ PROFESSIONALS (link) rempli')
    console.log('2. Vérifier que l\'email du professionnel correspond exactement')
    console.log('3. Créer un nouveau ticket pour tester l\'assignation automatique')
  } else {
    console.log('\n✅ Tickets trouvés! Le problème peut être:')
    console.log('1. L\'email dans le JWT ne correspond pas')
    console.log('2. Un problème de cache côté frontend')
    console.log('3. Une erreur d\'authentification')
  }

  console.log('\n')
}

debugTickets().catch(console.error)
