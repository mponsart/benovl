export type UserRole = 'admin' | 'responsable' | 'benevole'
export type UserStatus = 'actif' | 'suspendu'
export type RegistrationStatus = 'inscrit' | 'confirme' | 'absent'
export type AnnouncementType = 'global' | 'pole'
export type DocumentType = 'attestation' | 'convention' | 'autre'
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'invite' | 'password_reset'

export interface Pole {
  id: number
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  email: string
  nom: string
  prenom: string
  telephone?: string | null
  role: UserRole
  status: UserStatus
  notesInternes?: string | null
  poleId?: number | null
  pole?: Pole | null
  lastLoginAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface PlanningSlot {
  id: number
  title: string
  description?: string | null
  startAt: string
  endAt: string
  location?: string | null
  maxCapacity: number
  poleId?: number | null
  pole?: Pole | null
  openForSelfRegistration: boolean
  createdAt: string
  updatedAt: string
  registrations?: PlanningRegistration[]
  _count?: { registrations: number }
}

export interface PlanningRegistration {
  id: number
  userId: number
  slotId: number
  status: RegistrationStatus
  user?: User
  slot?: PlanningSlot
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: number
  name: string
  filename: string
  type: DocumentType
  userId?: number | null
  user?: User | null
  size?: number | null
  mimeType?: string | null
  createdAt: string
  updatedAt: string
}

export interface Announcement {
  id: number
  title: string
  content: string
  type: AnnouncementType
  poleId?: number | null
  pole?: Pole | null
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: number
  actorId?: number | null
  actor?: User | null
  targetId?: number | null
  target?: User | null
  action: AuditAction
  entity: string
  entityId?: number | null
  details?: Record<string, unknown> | null
  ipAddress?: string | null
  createdAt: string
}

export interface AuthUser {
  id: number
  email: string
  nom: string
  prenom: string
  role: UserRole
  status: UserStatus
  poleId?: number | null
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalSlots: number
  upcomingSlots: number
  totalRegistrations: number
  confirmedRegistrations: number
  absentRegistrations: number
  recentAuditLogs: AuditLog[]
  announcements: Announcement[]
}

export interface ApiError {
  statusCode: number
  message: string
  data?: unknown
}
