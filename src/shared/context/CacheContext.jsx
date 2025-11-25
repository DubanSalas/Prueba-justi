import { createContext, useContext, useState, useCallback } from 'react'

const CacheContext = createContext()

// Duración del caché: 5 minutos
const CACHE_DURATION = 5 * 60 * 1000

export function CacheProvider({ children }) {
  const [cache, setCache] = useState({})

  // Obtener datos del caché
  const getCachedData = useCallback((key) => {
    const cached = cache[key]
    if (!cached) {
      console.log(`❌ No hay caché para: ${key}`)
      return null
    }

    const now = Date.now()
    const age = now - cached.timestamp
    
    if (age > CACHE_DURATION) {
      console.log(`⏰ Caché expirado para: ${key} (${Math.round(age / 1000)}s)`)
      return null
    }

    const remaining = Math.round((CACHE_DURATION - age) / 1000)
    console.log(`✅ Usando caché para: ${key} (válido por ${remaining}s más)`)
    return cached.data
  }, [cache])

  // Guardar datos en caché
  const setCachedData = useCallback((key, data) => {
    console.log(`💾 Guardando en caché: ${key}`)
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }))
  }, [])

  // Invalidar caché específico
  const invalidateCache = useCallback((key) => {
    console.log(`🗑️ Invalidando caché: ${key}`)
    setCache(prev => {
      const newCache = { ...prev }
      delete newCache[key]
      return newCache
    })
  }, [])

  // Limpiar todo el caché
  const clearAllCache = useCallback(() => {
    console.log('🧹 Limpiando todo el caché')
    setCache({})
  }, [])

  const value = {
    getCachedData,
    setCachedData,
    invalidateCache,
    clearAllCache
  }

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  )
}

export function useCache() {
  const context = useContext(CacheContext)
  if (!context) {
    throw new Error('useCache debe usarse dentro de CacheProvider')
  }
  return context
}
