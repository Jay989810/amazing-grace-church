import { ObjectId } from 'mongodb'

// MongoDB Document interfaces
export interface SermonDocument {
  _id?: ObjectId
  title: string
  speaker: string
  date: string
  category: 'Sunday Service' | 'Bible Study' | 'Mid-week'
  description?: string
  audio_url?: string
  video_url?: string
  notes_url?: string
  thumbnail?: string
  duration?: string
  created_at: string
  updated_at: string
}

export interface EventDocument {
  _id?: ObjectId
  title: string
  description: string
  date: string
  time: string
  venue: string
  type: 'Service' | 'Conference' | 'Crusade' | 'Youth Program' | 'Other'
  image?: string
  registration_required: boolean
  registration_url?: string
  created_at: string
  updated_at: string
}

export interface GalleryImageDocument {
  _id?: ObjectId
  title: string
  description?: string
  image_url: string
  album: string
  photographer?: string
  date: string
  created_at: string
  updated_at: string
}

export interface ContactMessageDocument {
  _id?: ObjectId
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  date: string
  status: 'new' | 'read' | 'replied'
  created_at: string
  updated_at: string
}

export interface UserDocument {
  _id?: ObjectId
  email: string
  name: string
  password: string
  role: 'admin' | 'user'
  created_at: string
  last_login?: string
}

export interface AboutPageDocument {
  _id?: ObjectId
  type: 'history' | 'mission' | 'vision' | 'values' | 'pastors_message'
  content: string // HTML or plain text content
  created_at: string
  updated_at: string
}

export interface CoreBeliefDocument {
  _id?: ObjectId
  title: string
  description: string
  icon: string // Icon name (e.g., 'Heart', 'BookOpen')
  order: number
  created_at: string
  updated_at: string
}

export interface LeadershipMemberDocument {
  _id?: ObjectId
  name: string
  role: string
  image: string
  bio: string
  email: string
  order: number
  created_at: string
  updated_at: string
}

export interface GivingTransactionDocument {
  _id?: ObjectId
  name: string
  email: string
  amount: number
  currency: string
  giving_type: 'Tithe' | 'Offering' | 'Building Fund' | 'Missions'
  message?: string
  payment_provider: 'flutterwave' | 'paystack'
  payment_reference: string
  transaction_id?: string
  status: 'pending' | 'successful' | 'failed' | 'cancelled'
  receipt_sent: boolean
  created_at: string
  updated_at: string
}

// Helper functions to convert between MongoDB documents and API types
export function sermonDocumentToApi(doc: SermonDocument) {
  return {
    id: doc._id?.toString() || '',
    title: doc.title,
    speaker: doc.speaker,
    date: doc.date,
    category: doc.category,
    description: doc.description,
    audioUrl: doc.audio_url,
    videoUrl: doc.video_url,
    notesUrl: doc.notes_url,
    thumbnail: doc.thumbnail,
    duration: doc.duration
  }
}

export function eventDocumentToApi(doc: EventDocument) {
  return {
    id: doc._id?.toString() || '',
    title: doc.title,
    description: doc.description,
    date: doc.date,
    time: doc.time,
    venue: doc.venue,
    type: doc.type,
    image: doc.image,
    registrationRequired: doc.registration_required,
    registrationUrl: doc.registration_url
  }
}

export function galleryImageDocumentToApi(doc: GalleryImageDocument) {
  return {
    id: doc._id?.toString() || '',
    title: doc.title,
    description: doc.description,
    imageUrl: doc.image_url,
    album: doc.album,
    date: doc.date,
    photographer: doc.photographer
  }
}

export function contactMessageDocumentToApi(doc: ContactMessageDocument) {
  return {
    id: doc._id?.toString() || '',
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    subject: doc.subject,
    message: doc.message,
    date: doc.date,
    status: doc.status
  }
}

export function userDocumentToApi(doc: UserDocument) {
  return {
    id: doc._id?.toString() || '',
    email: doc.email,
    name: doc.name,
    role: doc.role,
    createdAt: doc.created_at,
    lastLogin: doc.last_login
  }
}

export function aboutPageDocumentToApi(doc: AboutPageDocument) {
  return {
    id: doc._id?.toString() || '',
    type: doc.type,
    content: doc.content
  }
}

export function coreBeliefDocumentToApi(doc: CoreBeliefDocument) {
  return {
    id: doc._id?.toString() || '',
    title: doc.title,
    description: doc.description,
    icon: doc.icon,
    order: doc.order
  }
}

export function leadershipMemberDocumentToApi(doc: LeadershipMemberDocument) {
  return {
    id: doc._id?.toString() || '',
    name: doc.name,
    role: doc.role,
    image: doc.image,
    bio: doc.bio,
    email: doc.email,
    order: doc.order
  }
}

export function givingTransactionDocumentToApi(doc: GivingTransactionDocument) {
  return {
    id: doc._id?.toString() || '',
    name: doc.name,
    email: doc.email,
    amount: doc.amount,
    currency: doc.currency,
    givingType: doc.giving_type,
    message: doc.message,
    paymentProvider: doc.payment_provider,
    paymentReference: doc.payment_reference,
    transactionId: doc.transaction_id,
    status: doc.status,
    receiptSent: doc.receipt_sent,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at
  }
}

export interface OrganizationDocument {
  _id?: ObjectId
  name: string
  description: string
  leaderName: string
  leaderRole: string
  contactEmail?: string
  imageUrl?: string
  dateCreated: string
  created_at: string
  updated_at: string
}

export function organizationDocumentToApi(doc: OrganizationDocument) {
  return {
    id: doc._id?.toString() || '',
    name: doc.name,
    description: doc.description,
    leaderName: doc.leaderName,
    leaderRole: doc.leaderRole,
    contactEmail: doc.contactEmail,
    imageUrl: doc.imageUrl,
    dateCreated: doc.dateCreated,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at
  }
}
