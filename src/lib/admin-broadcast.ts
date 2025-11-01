// Utility to broadcast admin updates to all open tabs/pages

export function broadcastAdminUpdate(type: string, payload?: any) {
  // Broadcast to other tabs via localStorage
  const key = `admin-update-${type}-${Date.now()}`
  localStorage.setItem(key, JSON.stringify({ type, payload, timestamp: Date.now() }))
  
  // Remove after a short delay to prevent storage buildup
  setTimeout(() => {
    localStorage.removeItem(key)
  }, 1000)

  // Also dispatch a custom event for same-tab updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('admin-update', {
      detail: { type, payload }
    }))
  }
}

export const ADMIN_UPDATE_TYPES = {
  SERMON: 'sermon',
  EVENT: 'event',
  GALLERY: 'gallery',
  ORGANIZATION: 'organization',
  ABOUT: 'about',
  SETTINGS: 'settings',
  LEADERSHIP: 'leadership',
  CORE_BELIEF: 'core_belief'
} as const

