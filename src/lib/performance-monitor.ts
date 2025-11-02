// Performance monitoring utility to detect and handle slow-loading content
// This helps identify problematic files that cause site delays

interface PerformanceMetric {
  url: string
  loadTime: number
  fileSize?: number
  contentType?: string
  timestamp: string
  error?: string
}

interface PerformanceAlert {
  type: 'slow_load' | 'large_file' | 'failed_load' | 'corrupted_file'
  resourceUrl: string
  resourceType: 'image' | 'video' | 'audio' | 'document'
  message: string
  loadTime?: number
  fileSize?: number
  timestamp: string
}

// Thresholds for performance monitoring
const PERFORMANCE_THRESHOLDS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_AUDIO_SIZE: 20 * 1024 * 1024, // 20MB
  MAX_LOAD_TIME: 3000, // 3 seconds
  MAX_IMAGE_LOAD_TIME: 2000, // 2 seconds for images
  MAX_VIDEO_LOAD_TIME: 5000, // 5 seconds for videos
}

/**
 * Checks if a resource URL might be problematic
 */
export function checkResourcePerformance(
  url: string,
  resourceType: 'image' | 'video' | 'audio' | 'document' = 'image'
): Promise<PerformanceAlert | null> {
  return new Promise((resolve) => {
    // Skip data URLs and blob URLs
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      resolve(null)
      return
    }

    const startTime = Date.now()
    const img = new Image()
    const timeout = setTimeout(() => {
      resolve({
        type: 'slow_load',
        resourceUrl: url,
        resourceType,
        message: `Resource exceeded load timeout: ${url}`,
        loadTime: PERFORMANCE_THRESHOLDS.MAX_LOAD_TIME,
        timestamp: new Date().toISOString()
      })
    }, PERFORMANCE_THRESHOLDS.MAX_LOAD_TIME)

    img.onload = () => {
      clearTimeout(timeout)
      const loadTime = Date.now() - startTime
      
      // Check load time
      const maxLoadTime = resourceType === 'image' 
        ? PERFORMANCE_THRESHOLDS.MAX_IMAGE_LOAD_TIME
        : PERFORMANCE_THRESHOLDS.MAX_LOAD_TIME

      if (loadTime > maxLoadTime) {
        resolve({
          type: 'slow_load',
          resourceUrl: url,
          resourceType,
          message: `Resource loaded slowly (${loadTime}ms): ${url}`,
          loadTime,
          timestamp: new Date().toISOString()
        })
        return
      }

      // Try to get file size from Content-Length header
      fetch(url, { method: 'HEAD' })
        .then(response => {
          const contentLength = response.headers.get('content-length')
          if (contentLength) {
            const fileSize = parseInt(contentLength, 10)
            const maxSize = getMaxFileSize(resourceType)
            
            if (fileSize > maxSize) {
              resolve({
                type: 'large_file',
                resourceUrl: url,
                resourceType,
                message: `Large file detected (${formatFileSize(fileSize)}): ${url}`,
                loadTime,
                fileSize,
                timestamp: new Date().toISOString()
              })
              return
            }
          }
          resolve(null)
        })
        .catch(() => resolve(null))
    }

    img.onerror = () => {
      clearTimeout(timeout)
      resolve({
        type: 'failed_load',
        resourceUrl: url,
        resourceType,
        message: `Resource failed to load: ${url}`,
        loadTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      })
    }

    img.src = url
  })
}

/**
 * Gets maximum file size for resource type
 */
function getMaxFileSize(resourceType: string): number {
  switch (resourceType) {
    case 'image':
      return PERFORMANCE_THRESHOLDS.MAX_IMAGE_SIZE
    case 'video':
      return PERFORMANCE_THRESHOLDS.MAX_VIDEO_SIZE
    case 'audio':
      return PERFORMANCE_THRESHOLDS.MAX_AUDIO_SIZE
    default:
      return 10 * 1024 * 1024 // 10MB default
  }
}

/**
 * Formats file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * Checks multiple resources and collects alerts
 */
export async function checkMultipleResources(
  urls: string[],
  resourceType: 'image' | 'video' | 'audio' | 'document' = 'image'
): Promise<PerformanceAlert[]> {
  const alerts: PerformanceAlert[] = []
  
  // Check resources in parallel but limit concurrency
  const BATCH_SIZE = 5
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(url => checkResourcePerformance(url, resourceType))
    )
    
    alerts.push(...batchResults.filter((alert): alert is PerformanceAlert => alert !== null))
  }
  
  return alerts
}

/**
 * Sends performance alert to admin
 */
export async function sendPerformanceAlert(alert: PerformanceAlert): Promise<void> {
  try {
    // Store alert in database for admin to see
    const response = await fetch('/api/admin/performance-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    })
    
    if (!response.ok) {
      console.warn('Failed to send performance alert:', alert)
    }
  } catch (error) {
    console.error('Error sending performance alert:', error)
  }
}

/**
 * Optimized image loading with performance monitoring
 */
export async function loadImageWithMonitoring(
  url: string,
  onAlert?: (alert: PerformanceAlert) => void
): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const img = new Image()
    
    const timeout = setTimeout(() => {
      const alert: PerformanceAlert = {
        type: 'slow_load',
        resourceUrl: url,
        resourceType: 'image',
        message: `Image load timeout: ${url}`,
        loadTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
      
      if (onAlert) onAlert(alert)
      sendPerformanceAlert(alert)
      resolve(null)
    }, PERFORMANCE_THRESHOLDS.MAX_IMAGE_LOAD_TIME)

    img.onload = () => {
      clearTimeout(timeout)
      const loadTime = Date.now() - startTime
      
      if (loadTime > PERFORMANCE_THRESHOLDS.MAX_IMAGE_LOAD_TIME) {
        const alert: PerformanceAlert = {
          type: 'slow_load',
          resourceUrl: url,
          resourceType: 'image',
          message: `Slow image load (${loadTime}ms): ${url}`,
          loadTime,
          timestamp: new Date().toISOString()
        }
        
        if (onAlert) onAlert(alert)
        sendPerformanceAlert(alert)
      }
      
      resolve(img)
    }

    img.onerror = () => {
      clearTimeout(timeout)
      const alert: PerformanceAlert = {
        type: 'failed_load',
        resourceUrl: url,
        resourceType: 'image',
        message: `Image failed to load: ${url}`,
        loadTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
      
      if (onAlert) onAlert(alert)
      sendPerformanceAlert(alert)
      resolve(null)
    }

    img.src = url
  })
}

/**
 * Validates file size before upload
 */
export function validateFileSize(file: File, resourceType: 'image' | 'video' | 'audio' | 'document' = 'image'): {
  valid: boolean
  error?: string
} {
  const maxSize = getMaxFileSize(resourceType)
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`
    }
  }
  
  return { valid: true }
}

