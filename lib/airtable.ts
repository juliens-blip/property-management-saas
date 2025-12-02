import { TABLES, TENANT_FIELDS, PROFESSIONAL_FIELDS, TICKET_FIELDS, MESSAGE_FIELDS } from './types'

const AIRTABLE_API_TOKEN = process.env.AIRTABLE_API_TOKEN
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`

if (!AIRTABLE_API_TOKEN || !AIRTABLE_BASE_ID) {
  throw new Error('Variables d\'environnement Airtable manquantes')
}

// Headers communs pour toutes les requêtes Airtable
const headers = {
  'Authorization': `Bearer ${AIRTABLE_API_TOKEN}`,
  'Content-Type': 'application/json',
}

// Fonction utilitaire pour échapper les chaînes dans les formules Airtable
// Échappe les apostrophes en les doublant pour éviter les erreurs de syntaxe
function escapeAirtableString(str: string): string {
  if (!str) return ''
  // Échapper les apostrophes en les doublant
  return str.replace(/'/g, "''")
}

// Types pour les réponses Airtable
interface AirtableRecord<T = any> {
  id: string
  fields: T
  createdTime: string
}

interface AirtableListResponse<T = any> {
  records: AirtableRecord<T>[]
  offset?: string
}

// Fonction générique pour récupérer des enregistrements
export async function getRecords<T = any>(
  tableId: string,
  filterFormula?: string,
  sort?: { field: string; direction: 'asc' | 'desc' }[],
  options?: { returnFieldsByFieldId?: boolean; includeAllFields?: boolean }
): Promise<AirtableRecord<T>[]> {
  try {
    let url = `${AIRTABLE_API_URL}/${tableId}`
    const params = new URLSearchParams()

    if (filterFormula) {
      params.append('filterByFormula', filterFormula)
    }

    if (sort && sort.length > 0) {
      sort.forEach((s, index) => {
        params.append(`sort[${index}][field]`, s.field)
        params.append(`sort[${index}][direction]`, s.direction)
      })
    }

    // Forcer Airtable à retourner tous les champs, y compris les lookups
    if (options?.returnFieldsByFieldId !== undefined) {
      params.append('returnFieldsByFieldId', String(options.returnFieldsByFieldId))
    }

    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    // DEBUG: Afficher l'URL exacte appelée
    console.log('🌐 [getRecords] URL appelée:', url)
    console.log('📋 [getRecords] Table ID:', tableId)
    console.log('🔑 [getRecords] Base ID:', AIRTABLE_BASE_ID)

    const response = await fetch(url, { headers })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Erreur Airtable')
    }

    const data: AirtableListResponse<T> = await response.json()

    // DEBUG: Afficher les premiers tickets pour vérifier
    console.log('📊 [getRecords] Nombre de records:', data.records.length)
    if (tableId === TABLES.TICKETS && data.records.length > 0) {
      console.log('🎫 [getRecords] Premier ticket:', {
        id: data.records[0].id,
        title: data.records[0].fields.title,
        PROFESSIONALS: data.records[0].fields.PROFESSIONALS
      })
    }

    return data.records
  } catch (error) {
    console.error('Erreur getRecords:', error)
    throw error
  }
}

// Fonction pour récupérer un enregistrement par ID
export async function getRecordById<T = any>(
  tableId: string,
  recordId: string
): Promise<AirtableRecord<T> | null> {
  try {
    const url = `${AIRTABLE_API_URL}/${tableId}/${recordId}`
    const response = await fetch(url, { headers })

    if (!response.ok) {
      if (response.status === 404) return null
      const error = await response.json()
      throw new Error(error.error?.message || 'Erreur Airtable')
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur getRecordById:', error)
    throw error
  }
}

// Fonction pour créer un enregistrement
export async function createRecord<T = any>(
  tableId: string,
  fields: Partial<T>
): Promise<AirtableRecord<T>> {
  try {
    const url = `${AIRTABLE_API_URL}/${tableId}`
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ fields }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Erreur lors de la création')
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur createRecord:', error)
    throw error
  }
}

// Fonction pour mettre à jour un enregistrement
export async function updateRecord<T = any>(
  tableId: string,
  recordId: string,
  fields: Partial<T>
): Promise<AirtableRecord<T>> {
  try {
    const url = `${AIRTABLE_API_URL}/${tableId}/${recordId}`
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Erreur lors de la mise à jour')
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur updateRecord:', error)
    throw error
  }
}

// Fonction pour supprimer un enregistrement
export async function deleteRecord(
  tableId: string,
  recordId: string
): Promise<{ deleted: boolean; id: string }> {
  try {
    const url = `${AIRTABLE_API_URL}/${tableId}/${recordId}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Erreur lors de la suppression')
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur deleteRecord:', error)
    throw error
  }
}

// Fonctions spécifiques pour les tenants
export async function findTenantByEmail(email: string) {
  // Note: filterByFormula uses field NAMES, not field IDs
  // Récupérer tous les tenants et filtrer côté JS pour gérer la casse
  const allRecords = await getRecords(TABLES.TENANTS)
  const normalizedEmail = email.toLowerCase().trim()

  // Filtrer côté JavaScript pour comparaison insensible à la casse
  const matching = allRecords.filter(record => {
    const recordEmail = (record.fields.email || '').toLowerCase().trim()
    return recordEmail === normalizedEmail
  })

  return matching.length > 0 ? matching[0] : null
}

// Fonctions spécifiques pour les professionals
export async function findProfessionalByEmail(email: string) {
  // Note: filterByFormula uses field NAMES, not field IDs
  // Récupérer tous les professionals et filtrer côté JS pour gérer la casse
  const allRecords = await getRecords(TABLES.PROFESSIONALS)
  const normalizedEmail = email.toLowerCase().trim()

  // Filtrer côté JavaScript pour comparaison insensible à la casse
  const matching = allRecords.filter(record => {
    const recordEmail = (record.fields.email || '').toLowerCase().trim()
    return recordEmail === normalizedEmail
  })

  return matching.length > 0 ? matching[0] : null
}

// Fonctions spécifiques pour les tickets
export async function getTicketsByTenantEmail(email: string) {
  // Note: filterByFormula uses field NAMES, not field IDs
  // Récupérer tous les tickets et filtrer côté JS
  const allRecords = await getRecords(TABLES.TICKETS)
  const normalizedEmail = email.toLowerCase().trim()

  // Filtrer côté JavaScript pour comparaison insensible à la casse
  const matching = allRecords.filter(record => {
    const recordEmail = (record.fields.tenant_email || '').toLowerCase().trim()
    return recordEmail === normalizedEmail
  })

  // Trier par date de création décroissante
  return matching.sort((a, b) => {
    const dateA = new Date(a.fields.created_at || 0).getTime()
    const dateB = new Date(b.fields.created_at || 0).getTime()
    return dateB - dateA
  })
}

export async function getTicketsByAssignedTo(email: string) {
  // Récupérer tous les tickets
  console.log('🔍 [getTicketsByAssignedTo] Recherche des tickets pour:', email)

  const allRecords = await getRecords(TABLES.TICKETS)
  console.log('📊 [getTicketsByAssignedTo] Total tickets récupérés:', allRecords.length)

  // Récupérer tous les professionnels une seule fois pour éviter les appels multiples
  const allProfessionals = await getRecords(TABLES.PROFESSIONALS)
  console.log('👥 [getTicketsByAssignedTo] Total professionnels récupérés:', allProfessionals.length)

  // Créer un map email -> professionnel pour lookup rapide
  const professionalsByEmail = new Map<string, any>()
  const professionalsById = new Map<string, any>()

  allProfessionals.forEach(prof => {
    const profEmail = (prof.fields.email || '').toLowerCase().trim()
    professionalsByEmail.set(profEmail, prof)
    professionalsById.set(prof.id, prof)
  })

  const normalizedEmail = email.toLowerCase().trim()
  console.log('🎯 [getTicketsByAssignedTo] Email normalisé recherché:', normalizedEmail)

  // Filtrer et enrichir les tickets
  const matching = allRecords.filter(record => {
    // DEBUG: Afficher tous les champs du ticket
    console.log(`\n🔍 [Ticket ${record.id}] Champs disponibles:`, Object.keys(record.fields))
    console.log(`📝 [Ticket ${record.id}] Titre: ${record.fields.title}`)

    // Méthode 1: Vérifier le champ PROFESSIONALS (link field)
    const professionalIds = record.fields.PROFESSIONALS as string[] | undefined
    console.log(`🔗 [Ticket ${record.id}] PROFESSIONALS field value:`, professionalIds)

    if (professionalIds && professionalIds.length > 0) {
      const assignedProf = professionalsById.get(professionalIds[0])
      if (assignedProf) {
        const profEmail = (assignedProf.fields.email || '').toLowerCase().trim()
        console.log(`🔗 [Ticket ${record.id}] Professionnel lié: ${profEmail}`)

        if (profEmail === normalizedEmail) {
          console.log(`✅ [Ticket ${record.id}] MATCH par PROFESSIONALS link`)
          // Enrichir le ticket avec les infos du professionnel
          record.fields.professional_email = assignedProf.fields.email
          record.fields.professional_name = assignedProf.fields.name
          return true
        }
      }
    }

    // Méthode 2: Vérifier le lookup "email (from PROFESSIONALS)" si présent
    const emailsFromProfessionals = record.fields['email (from PROFESSIONALS)']
    if (Array.isArray(emailsFromProfessionals) && emailsFromProfessionals.length > 0) {
      const hasMatch = emailsFromProfessionals.some(profEmail =>
        (profEmail || '').toLowerCase().trim() === normalizedEmail
      )
      if (hasMatch) {
        console.log(`✅ [Ticket ${record.id}] MATCH par lookup field`)
        return true
      }
    }

    // Méthode 3: Fallback sur l'ancien champ assigned_to (backward compatibility)
    const assignedTo = (record.fields.assigned_to || '').toLowerCase().trim()
    if (assignedTo === normalizedEmail) {
      console.log(`✅ [Ticket ${record.id}] MATCH par assigned_to (deprecated)`)
      return true
    }

    return false
  })

  console.log('🎉 [getTicketsByAssignedTo] Tickets correspondants trouvés:', matching.length)

  // Trier par date de création décroissante
  return matching.sort((a, b) => {
    const dateA = new Date(a.fields.created_at || 0).getTime()
    const dateB = new Date(b.fields.created_at || 0).getTime()
    return dateB - dateA
  })
}

export async function getTicketById(ticketId: string) {
  return await getRecordById(TABLES.TICKETS, ticketId)
}

/**
 * Mapping entre catégorie de ticket et type de professionnel
 */
export function mapCategoryToProfessionalType(category: string): string | null {
  const mapping: Record<string, string> = {
    'plomberie': 'plumber',
    'électricité': 'electrician',
    'concierge': 'concierge',
    'autre': 'agency', // Les tickets "autre" vont à l'agence
  }
  return mapping[category.toLowerCase()] || null
}

/**
 * Trouve un professionnel disponible par type
 * Retourne le premier professionnel trouvé avec le type spécifié
 */
export async function findProfessionalByType(professionalType: string): Promise<AirtableRecord | null> {
  try {
    // Récupérer tous les professionnels
    const allProfessionals = await getRecords(TABLES.PROFESSIONALS)

    // Filtrer par type
    const matching = allProfessionals.filter(prof => {
      const profType = (prof.fields.type || '').toLowerCase()
      return profType === professionalType.toLowerCase()
    })

    // Retourner le premier professionnel trouvé
    return matching.length > 0 ? matching[0] : null
  } catch (error) {
    console.error(`Erreur lors de la recherche du professionnel type ${professionalType}:`, error)
    return null
  }
}

export async function createTicket(fields: any) {
  return await createRecord(TABLES.TICKETS, fields)
}

export async function updateTicket(ticketId: string, fields: any) {
  return await updateRecord(TABLES.TICKETS, ticketId, fields)
}

// Fonctions spécifiques pour les messages

// Récupère TOUS les messages (architecture mono-résidence)
export async function getAllMessages() {
  const allRecords = await getRecords(TABLES.MESSAGES)

  // Trier par date de création décroissante
  return allRecords.sort((a, b) => {
    const dateA = new Date(a.fields[MESSAGE_FIELDS.created_at] || 0).getTime()
    const dateB = new Date(b.fields[MESSAGE_FIELDS.created_at] || 0).getTime()
    return dateB - dateA
  })
}

// Filtre les messages par catégorie uniquement (architecture mono-résidence)
export async function getMessagesByCategory(category: string) {
  const allRecords = await getRecords(TABLES.MESSAGES)

  // Filtrer côté JavaScript uniquement par catégorie
  const matching = allRecords.filter(record => {
    const recordCategory = record.fields.categorie
    return recordCategory === category
  })

  // Trier par date de création décroissante
  return matching.sort((a, b) => {
    const dateA = new Date(a.fields[MESSAGE_FIELDS.created_at] || 0).getTime()
    const dateB = new Date(b.fields[MESSAGE_FIELDS.created_at] || 0).getTime()
    return dateB - dateA
  })
}

// @deprecated Fonction maintenue pour compatibilité - utiliser getAllMessages() à la place
export async function getMessagesByResidence(residenceName: string) {
  // Dans une architecture mono-résidence, retourne tous les messages
  return getAllMessages()
}

export async function createMessage(fields: any) {
  return await createRecord(TABLES.MESSAGES, fields)
}

export async function getMessageById(messageId: string) {
  return await getRecordById(TABLES.MESSAGES, messageId)
}
