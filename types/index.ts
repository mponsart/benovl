export type UserRole = 'admin' | 'responsable' | 'benevole'
export type UserStatus = 'actif' | 'suspendu'
export type UserLifecycle = 'actif' | 'pause' | 'suspendu' | 'sorti'
export type RegistrationStatus = 'inscrit' | 'confirme' | 'absent'
export type AnnouncementType = 'global' | 'pole'
export type DocumentType = 'attestation' | 'convention' | 'autre'
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'invite' | 'password_reset'
export type SkillLevel = 'debutant' | 'intermediaire' | 'avance' | 'expert'
export type InterviewType = 'annuel' | 'sixmois' | 'depart' | 'autre'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type JobPostingStatus = 'draft' | 'published' | 'closed'
export type ApplicationStatus = 'new' | 'reviewing' | 'interview' | 'accepted' | 'rejected'
export type DocumentTemplateCategory = 'convention' | 'attestation' | 'contrat' | 'autre'
export type SignatureStatus = 'pending' | 'signed' | 'expired' | 'revoked'
export type TimeEntryStatus = 'pending' | 'validated' | 'anomaly'
export type TransactionType = 'credit' | 'debit'
export type BlogPostStatus = 'draft' | 'published'

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
  lifecycle: UserLifecycle
  notesInternes?: string | null
  poleId?: number | null
  pole?: Pole | null
  lastLoginAt?: string | null
  dateEntree?: string | null
  dateSortie?: string | null
  bio?: string | null
  adresse?: string | null
  dateNaissance?: string | null
  numeroUrgence?: string | null
  contactUrgence?: string | null
  photoUrl?: string | null
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
  signatures?: DocumentSignature[]
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

// ─── Skills ────────────────────────────────────────────────────────────────

export interface Skill {
  id: number
  userId: number
  user?: User
  name: string
  level: SkillLevel
  category?: string | null
  obtainedAt?: string | null
}

// ─── Interviews ────────────────────────────────────────────────────────────

export interface UserInterview {
  id: number
  userId: number
  user?: User
  conductedById?: number | null
  conductedBy?: User | null
  date: string
  type: InterviewType
  notes?: string | null
  rating?: number | null
  createdAt: string
  updatedAt: string
}

// ─── Lifecycle Events ──────────────────────────────────────────────────────

export interface LifecycleEvent {
  id: number
  userId: number
  user?: User
  fromStatus: string
  toStatus: string
  reason?: string | null
  changedById?: number | null
  changedBy?: User | null
  createdAt: string
}

// ─── Tasks ─────────────────────────────────────────────────────────────────

export interface Task {
  id: number
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  assignedToId?: number | null
  assignedTo?: User | null
  createdById: number
  createdBy?: User
  dueDate?: string | null
  poleId?: number | null
  pole?: Pole | null
  isCollective: boolean
  createdAt: string
  updatedAt: string
  comments?: TaskComment[]
  attachments?: TaskAttachment[]
}

export interface TaskComment {
  id: number
  taskId: number
  task?: Task
  userId: number
  user?: User
  content: string
  createdAt: string
  updatedAt: string
}

export interface TaskAttachment {
  id: number
  taskId: number
  task?: Task
  userId: number
  user?: User
  filename: string
  originalName: string
  size?: number | null
  mimeType?: string | null
  createdAt: string
}

// ─── Job Postings & Applications ──────────────────────────────────────────

export interface JobPosting {
  id: number
  title: string
  description: string
  status: JobPostingStatus
  poleId?: number | null
  pole?: Pole | null
  slots: number
  publishedAt?: string | null
  closedAt?: string | null
  createdById: number
  createdBy?: User
  createdAt: string
  updatedAt: string
  applications?: Application[]
  _count?: { applications: number }
}

export interface Application {
  id: number
  jobPostingId: number
  jobPosting?: JobPosting
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  coverLetter?: string | null
  status: ApplicationStatus
  notes?: string | null
  assignedToId?: number | null
  assignedTo?: User | null
  createdAt: string
  updatedAt: string
  documents?: ApplicationDocument[]
  history?: ApplicationHistory[]
}

export interface ApplicationDocument {
  id: number
  applicationId: number
  application?: Application
  filename: string
  originalName: string
  size?: number | null
  mimeType?: string | null
  createdAt: string
}

export interface ApplicationHistory {
  id: number
  applicationId: number
  application?: Application
  userId?: number | null
  user?: User | null
  fromStatus?: string | null
  toStatus?: string | null
  note?: string | null
  createdAt: string
}

// ─── Document Templates & Signatures ──────────────────────────────────────

export interface DocumentTemplate {
  id: number
  name: string
  category: DocumentTemplateCategory
  /** HTML template content */
  content: string
  /** JSON array of variable names */
  variables: string
  createdById: number
  createdBy?: User
  createdAt: string
  updatedAt: string
}

export interface DocumentSignature {
  id: number
  documentId: number
  document?: Document
  signerUserId?: number | null
  signerUser?: User | null
  signerEmail?: string | null
  signerName: string
  token: string
  status: SignatureStatus
  signedAt?: string | null
  ipAddress?: string | null
  createdAt: string
  updatedAt: string
}

// ─── Messaging ─────────────────────────────────────────────────────────────

export interface MessageThread {
  id: number
  subject?: string | null
  createdAt: string
  updatedAt: string
  participants?: MessageParticipant[]
  messages?: Message[]
}

export interface MessageParticipant {
  id: number
  threadId: number
  thread?: MessageThread
  userId: number
  user?: User
  lastReadAt?: string | null
  createdAt: string
}

export interface Message {
  id: number
  threadId: number
  thread?: MessageThread
  senderId: number
  sender?: User
  content: string
  isRead: boolean
  createdAt: string
}

// ─── Notifications ─────────────────────────────────────────────────────────

export interface Notification {
  id: number
  userId: number
  user?: User
  type: string
  title: string
  body: string
  link?: string | null
  isRead: boolean
  createdAt: string
}

// ─── Time Tracking ─────────────────────────────────────────────────────────

export interface TimeEntry {
  id: number
  userId: number
  user?: User
  clockIn: string
  clockOut?: string | null
  breakMinutes: number
  note?: string | null
  status: TimeEntryStatus
  createdAt: string
  updatedAt: string
}

// ─── Points / Gamification ────────────────────────────────────────────────

export interface PointTransaction {
  id: number
  userId: number
  user?: User
  amount: number
  type: TransactionType
  reason: string
  /** YYYY-MM */
  month: string
  validatedById?: number | null
  validatedBy?: User | null
  validatedAt?: string | null
  createdAt: string
}

// ─── Blog ──────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: number
  title: string
  slug: string
  content: string
  excerpt?: string | null
  publishedAt?: string | null
  status: BlogPostStatus
  authorId: number
  author?: User
  createdAt: string
  updatedAt: string
  comments?: BlogComment[]
  _count?: { comments: number }
}

export interface BlogComment {
  id: number
  postId: number
  post?: BlogPost
  userId?: number | null
  user?: User | null
  authorName?: string | null
  content: string
  isApproved: boolean
  createdAt: string
}

// ─── Help Center ───────────────────────────────────────────────────────────

export interface HelpArticle {
  id: number
  title: string
  slug: string
  content: string
  category?: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

