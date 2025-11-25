import { createContext, useContext, useState, useCallback } from 'react'

const DataCacheContext = createContext()

export function DataCacheProvider({ children }) {
  const [cache, setCache] = useState({
    students: null,
    dashboard: null,
    justifications: null,
    attendance: null,
    reports: null,
    professors: null,
    lastUpdate: {}
  })

  // Guardar datos en caché
  const setCacheData = useCallback((key, data) => {
    setCache(prev => ({
      ...prev,
      [key]: data,
      lastUpdate: {
        ...prev.lastUpdate,
        [key]: Date.now()
      }
    }))
  }, [])

  // Obtener datos del caché
  const getCacheData = useCallback((key) => {
    return cache[key]
  }, [cache])

  // Verificar si el caché es válido (menos de 5 minutos)
  const isCacheValid = useCallback((key, maxAge = 5 * 60 * 1000) => {
    const lastUpdate = cache.lastUpdate[key]
    if (!lastUpdate) return false
    return Date.now() - lastUpdate < maxAge
  }, [cache.lastUpdate])

  // Invalidar caché específico
  const invalidateCache = useCallback((key) => {
    setCache(prev => ({
      ...prev,
      [key]: null,
      lastUpdate: {
        ...prev.lastUpdate,
        [key]: null
      }
    }))
  }, [])

  // Invalidar todo el caché
  const invalidateAllCache = useCallback(() => {
    setCache({
      students: null,
      dashboard: null,
      justifications: null,
      attendance: null,
      reports: null,
      professors: null,
      lastUpdate: {}
    })
  }, [])

  const value = {
    cache,
    setCacheData,
    getCacheData,
    isCacheValid,
    invalidateCache,
    invalidateAllCache
  }

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  )
}

export function useDataCache() {
  const context = useContext(DataCacheContext)
  if (!context) {
    throw new Error('useDataCache debe usarse dentro de DataCacheProvider')
  }
  return context
}
