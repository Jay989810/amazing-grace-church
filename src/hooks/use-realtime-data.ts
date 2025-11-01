"use client"

import { useEffect, useState, useCallback } from 'react'

interface UseRealtimeDataOptions {
  fetchFn: () => Promise<any>
  interval?: number // Refresh interval in milliseconds (default: 30 seconds)
  enabled?: boolean // Whether to enable real-time updates
  onUpdate?: (data: any) => void // Callback when data updates
}

export function useRealtimeData<T>(
  options: UseRealtimeDataOptions
) {
  const { fetchFn, interval = 30000, enabled = true, onUpdate } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled || !isOnline) return

    try {
      setError(null)
      const result = await fetchFn()
      setData(result)
      setLastUpdate(new Date())
      setLoading(false)
      
      if (onUpdate) {
        onUpdate(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'))
      setLoading(false)
    }
  }, [fetchFn, enabled, isOnline, onUpdate])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Set up interval for automatic refresh
  useEffect(() => {
    if (!enabled || !isOnline) return

    const intervalId = setInterval(() => {
      fetchData()
    }, interval)

    return () => clearInterval(intervalId)
  }, [enabled, interval, isOnline, fetchData])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Immediately fetch when connection is restored
      fetchData()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    // Check initial online status
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [fetchData])

  // Listen for storage events (cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('admin-update-')) {
        // Admin made a change, refresh data
        fetchData()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [fetchData])

  // Manual refresh function
  const refresh = useCallback(() => {
    return fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    isOnline,
    lastUpdate,
    refresh
  }
}

