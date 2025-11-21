// User Types
export type UserRole = 'tenant' | 'professional'

export type ProfessionalType = 'plumber' | 'electrician' | 'concierge' | 'agency'

export type TenantStatus = 'active' | 'inactive'

// Ticket Types
export type TicketCategory = 'plomberie' | 'électricité' | 'concierge' | 'autre'

export type TicketStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

// Airtable Field IDs - TENANTS Table
export const TENANT_FIELDS = {
  email: 'fldg4xlUQGWAMa1vq',
  password_hash: 'fld1BkzQo0EqKUMVM',
  unit: 'fld9QHC92B3G3mEWn',
  phone: 'fldV1nK2VzfncFWIa',
  first_name: 'fldCjf3UHzuXYax8B',
  last_name: 'fldsGDRvealJ3yZdR',
  residence_name: 'fldEKoG8PUyQLCC37',
  status: 'fldK0XdnyBXTOkVfc',
  created_at: 'fldqd2KQ55XMKnF3R',
  TICKETS: 'fldoZAS0voQTlMBvx',
} as const

// Airtable Field IDs - PROFESSIONALS Table
export const PROFESSIONAL_FIELDS = {
  email: 'fldqgHmvZ7OFLCiBb',
  password_hash: 'fldk8Bk0F35G8I8jx',
  name: 'fldLZ9GvZ3MvLNUyP',
  type: 'fldNbHwBSYIaUON0b',
  phone: 'fldRilhbZ3K92MnN8',
  agency_email: 'fldVubvDazWwArvo9',
  specialties: 'fldNNWbU6lWIfx4Gt',
  created_at: 'fldCZ6frTyuEBy0v3',
} as const

// Airtable Field IDs - TICKETS Table
export const TICKET_FIELDS = {
  title: 'fld51ebPXV9129Tof',
  description: 'fldSs15cz93JSy6zO',
  category: 'fldx8DUYFYylqMyq1',
  status: 'fldT3OYmpscavHWgC',
  priority: 'fldx5UszT8duxQZyY',
  tenant_email: 'fldZGRcdiXnoNS5OL',
  unit: 'fldRj1kcmJSu4nQQ2',
  assigned_to: 'fld3bfcdn71PUNPZI',
  name: 'fld1jLo386MlJgxZr',
  created_at: 'fldDIUilSLOXpLuec',
  updated_at: 'fldwa2gEGI645x9FC',
  resolved_at: 'flddYiLBPnCYtBClV',
  resolution_notes: 'fldOWkLenvlefCm7Q',
  images_urls: 'flduOSxLcMx3dXktM',
} as const

// Airtable Field IDs - RESIDENCES Table
export const RESIDENCE_FIELDS = {
  name: 'fldSlMmH9nIEOMd4K',
  address: 'fldIM3LhtmNsOZfmS',
  agency_email: 'fldyD0amh4QP5ZUTG',
  total_units: 'fldSruKcnTtimCD39',
  created_at: 'fldCezs14akLI82ot',
  TICKETS: 'fldBirnOJrr1ivjUW',
} as const

// Airtable Table IDs
export const TABLES = {
  TENANTS: 'tbl18r4MzBthXlnth',
  PROFESSIONALS: 'tblIcANCLun1lb2Ap',
  TICKETS: 'tbl2qQrpJc4PC9yfk',
  RESIDENCES: 'tblx32X9SAlBpeB3C',
} as const

// Interface Definitions
export interface Tenant {
  id: string
  email: string
  password_hash?: string
  first_name: string
  last_name: string
  unit: string
  phone?: string
  residence_name?: string
  status: TenantStatus
  created_at?: string
}

export interface Professional {
  id: string
  email: string
  password_hash?: string
  name: string
  type: ProfessionalType
  phone?: string
  agency_email?: string
  specialties?: string
  created_at?: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  category: TicketCategory
  status: TicketStatus
  priority: TicketPriority
  tenant_email: string
  unit: string
  assigned_to?: string
  created_at: string
  updated_at?: string
  resolved_at?: string
  resolution_notes?: string
  images_urls?: string
}

export interface Residence {
  id: string
  name: string
  address: string
  agency_email: string
  total_units: number
  created_at?: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    email: string
    role: UserRole
    name?: string
    first_name?: string
    last_name?: string
    unit?: string
  }
  error?: string
}

// JWT Payload Type
export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}
