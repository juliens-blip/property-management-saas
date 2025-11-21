import { TABLES, TENANT_FIELDS, PROFESSIONAL_FIELDS, TICKET_FIELDS } from './types'

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
  sort?: { field: string; direction: 'asc' | 'desc' }[]
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

    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Erreur Airtable')
    }

    const data: AirtableListResponse<T> = await response.json()
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
  const filter = `{email}='${email}'`
  const records = await getRecords(TABLES.TENANTS, filter)
  return records.length > 0 ? records[0] : null
}

// Fonctions spécifiques pour les professionals
export async function findProfessionalByEmail(email: string) {
  // Note: filterByFormula uses field NAMES, not field IDs
  const filter = `{email}='${email}'`
  const records = await getRecords(TABLES.PROFESSIONALS, filter)
  return records.length > 0 ? records[0] : null
}

// Fonctions spécifiques pour les tickets
export async function getTicketsByTenantEmail(email: string) {
  // Note: filterByFormula uses field NAMES, not field IDs
  const filter = `{tenant_email}='${email}'`
  const sort = [{ field: TICKET_FIELDS.created_at, direction: 'desc' as const }]
  return await getRecords(TABLES.TICKETS, filter, sort)
}

export async function getTicketsByAssignedTo(email: string) {
  // Note: filterByFormula uses field NAMES, not field IDs
  const filter = `{assigned_to}='${email}'`
  const sort = [{ field: TICKET_FIELDS.created_at, direction: 'desc' as const }]
  return await getRecords(TABLES.TICKETS, filter, sort)
}

export async function getTicketById(ticketId: string) {
  return await getRecordById(TABLES.TICKETS, ticketId)
}

export async function createTicket(fields: any) {
  return await createRecord(TABLES.TICKETS, fields)
}

export async function updateTicket(ticketId: string, fields: any) {
  return await updateRecord(TABLES.TICKETS, ticketId, fields)
}
