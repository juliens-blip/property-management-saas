import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { getRecords } from '../lib/airtable'
import { TABLES } from '../lib/types'

async function checkAllTickets() {
  console.log('\n🎫 ===== VÉRIFICATION TOUS LES TICKETS =====\n')

  const allTickets = await getRecords(TABLES.TICKETS)
  const allProfessionals = await getRecords(TABLES.PROFESSIONALS)

  console.log(`📊 Total tickets: ${allTickets.length}`)
  console.log(`👥 Total professionnels: ${allProfessionals.length}\n`)

  const professionalsById = new Map(allProfessionals.map(p => [p.id, p]))

  let withProfessionals = 0
  let withoutProfessionals = 0

  allTickets.forEach((ticket, i) => {
    const hasProfessionals = ticket.fields.PROFESSIONALS && Array.isArray(ticket.fields.PROFESSIONALS) && ticket.fields.PROFESSIONALS.length > 0

    if (hasProfessionals) {
      withProfessionals++
      const profId = (ticket.fields.PROFESSIONALS as string[])[0]
      const prof = professionalsById.get(profId)
      console.log(`✅ [${i+1}] ${ticket.id} - "${ticket.fields.title}"`)
      console.log(`    → PROFESSIONALS: ${JSON.stringify(ticket.fields.PROFESSIONALS)}`)
      console.log(`    → Professionnel: ${prof?.fields.name} (${prof?.fields.email})`)
    } else {
      withoutProfessionals++
      console.log(`❌ [${i+1}] ${ticket.id} - "${ticket.fields.title}"`)
      console.log(`    → PROFESSIONALS: ${ticket.fields.PROFESSIONALS || 'undefined'}`)
      console.log(`    → Status: ${ticket.fields.status}`)
    }
    console.log()
  })

  console.log('\n📊 ===== RÉSUMÉ =====')
  console.log(`✅ Tickets AVEC PROFESSIONALS: ${withProfessionals}`)
  console.log(`❌ Tickets SANS PROFESSIONALS: ${withoutProfessionals}`)
  console.log(`📈 Pourcentage assignés: ${(withProfessionals / allTickets.length * 100).toFixed(1)}%`)

  if (withoutProfessionals > 0) {
    console.log('\n⚠️  PROBLÈME: Des tickets n\'ont pas de professionnel assigné!')
    console.log('💡 Solution: Créez de nouveaux tickets pour tester l\'assignation automatique')
  }
}

checkAllTickets().catch(console.error)
