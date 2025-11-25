import { useState, useEffect, useCallback } from 'react'
import { useDataCache } from '../context/DataCacheContext'

/**
 * Hook personalizado para hacer fetch con caché automático
 * @param {string} cacheKey - Clave única para identificar el caché
 * @param {Function} fetchFunction - Función async que obtiene los datos
 * @param {number} maxAge - Tiempo máximo de validez del caché en ms (default: 5 min)
 * @returns {Object} { data, loading, error, refetch, invalidate }
 */
export function useCachedFetch(cacheKey, fetchFunction, maxAge = 5 * 60 * 1000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getCacheData, setCacheData, isCacheValid, invalidateCache } = useDataCache()

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      // Si no es refresh forzado y hay caché válido, usarlo
      if (!forceRefresh) {
        const cachedData = getCacheData(cacheKey)
        if (cachedData && isCacheValid(cacheKey, maxAge)) {
          setData(cachedData)
          setLoading(false)
          return cachedData
        }
      }

      setLoading(true)
      setError(null)

      // Obtener datos frescos
      const result = await fetchFunction()
      
      setData(result)
      setCacheData(cacheKey, result)
      
      return result
    } catch (err) {
      console.error(`Error fetching ${cacheKey}:`, err)
      setError(err.message || 'Error al cargar datos')
      return null
    } finally {
      setLoading(false)
    }
  }, [cacheKey, fetchFunction, getCacheData, isCacheValid, maxAge, setCacheData])

  // Función para refrescar datos
  const refetch = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  // Función para invalidar caché
  const invalidate = useCallback(() => {
    invalidateCache(cacheKey)
  }, [invalidateCache, cacheKey])

  // Cargar datos al montar
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    invalidate
  }
}
