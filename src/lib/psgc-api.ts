/**
 * PSGC (Philippine Standard Geographic Code) API Service
 * 
 * This service integrates with the official PSGC API to fetch
 * up-to-date Philippine geographic data including regions, provinces, etc.
 * 
 * API Documentation: https://psgc.rootscratch.com/
 * Data Source: Philippine Statistics Authority (PSA) Q4 2024
 */

export interface PSGCRegion {
  id: number
  name: string
  code: string
  created_at: string
  updated_at: string
}

export type APISource = 'auto' | 'gitlab' | 'cloud' | 'fallback'

export interface APIEndpoint {
  name: string
  url: string
  source: APISource
  description: string
}

export interface SimplifiedRegion {
  id: string
  name: string
  population: string
}

// Fallback regions data in case API is unavailable (matches PSGC Cloud API format)
const FALLBACK_REGIONS: SimplifiedRegion[] = [
  { id: "0100000000", name: "Region I (Ilocos Region)", population: "N/A" },
  { id: "0200000000", name: "Region II (Cagayan Valley)", population: "N/A" },
  { id: "0300000000", name: "Region III (Central Luzon)", population: "N/A" },
  { id: "0400000000", name: "Region IV-A (CALABARZON)", population: "N/A" },
  { id: "1700000000", name: "MIMAROPA Region", population: "N/A" },
  { id: "0500000000", name: "Region V (Bicol Region)", population: "N/A" },
  { id: "0600000000", name: "Region VI (Western Visayas)", population: "N/A" },
  { id: "0700000000", name: "Region VII (Central Visayas)", population: "N/A" },
  { id: "0800000000", name: "Region VIII (Eastern Visayas)", population: "N/A" },
  { id: "0900000000", name: "Region IX (Zamboanga Peninsula)", population: "N/A" },
  { id: "1000000000", name: "Region X (Northern Mindanao)", population: "N/A" },
  { id: "1100000000", name: "Region XI (Davao Region)", population: "N/A" },
  { id: "1200000000", name: "Region XII (SOCCSKSARGEN)", population: "N/A" },
  { id: "1300000000", name: "National Capital Region (NCR)", population: "N/A" },
  { id: "1400000000", name: "Cordillera Administrative Region (CAR)", population: "N/A" },
  { id: "1600000000", name: "Region XIII (Caraga)", population: "N/A" },
  { id: "1900000000", name: "Bangsamoro Autonomous Region In Muslim Mindanao (BARMM)", population: "N/A" }
]

class PSGCApiService {
  private static readonly CACHE_KEY = 'psgc_regions_cache'
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  
  // Available API endpoints (both working)
  private static readonly API_ENDPOINTS: APIEndpoint[] = [
    {
      name: 'GitLab PSGC API',
      url: 'https://psgc.gitlab.io/api/regions',
      source: 'gitlab',
      description: 'PSGC API hosted on GitLab (gitlab.io) - ✅ Working'
    },
    {
      name: 'PSGC Cloud API',
      url: 'https://psgc.cloud/api/regions',
      source: 'cloud',
      description: 'Official PSGC Cloud API (psgc.cloud) - ✅ Working'
    }
  ]
  
  /**
   * Get available API endpoints
   */
  static getAPIEndpoints(): APIEndpoint[] {
    return [...this.API_ENDPOINTS]
  }

  /**
   * Fetch all Philippine regions from PSGC API with endpoint selection
   * @param selectedSource - Optional source selection, defaults to 'auto' (tries all)
   * @returns Promise<SimplifiedRegion[]>
   */
  static async getRegions(selectedSource: APISource = 'auto'): Promise<SimplifiedRegion[]> {
    try {
      // Check cache first (unless we're testing a specific endpoint)
      if (selectedSource === 'auto') {
        const cachedData = this.getCachedRegions()
        if (cachedData) {
          console.log('📋 Using cached PSGC regions data (source: localStorage cache)')
          return cachedData
        }
      }

      if (selectedSource === 'auto') {
        // Try all endpoints in order
        console.log('🌐 Auto mode: trying all endpoints...')
        
        for (const endpoint of this.API_ENDPOINTS) {
          console.log(`🔄 Trying ${endpoint.name}...`)
          const regions = await this.fetchFromEndpoint(endpoint)
          if (regions.length > 0) {
            console.log(`✅ Success with ${endpoint.name}`)
            this.setCachedRegions(regions)
            return regions
          }
        }
        
        console.log('❌ All APIs failed, using fallback regions')
        return FALLBACK_REGIONS
      } else if (selectedSource === 'fallback') {
        console.log('📋 Using fallback hardcoded regions data (source: FALLBACK_REGIONS)')
        return FALLBACK_REGIONS
      } else {
        // Use specific endpoint
        const endpoint = this.API_ENDPOINTS.find(e => e.source === selectedSource)
        if (!endpoint) {
          throw new Error(`Unknown API source: ${selectedSource}`)
        }
        
        console.log(`🎯 Using selected endpoint: ${endpoint.name}`)
        const regions = await this.fetchFromEndpoint(endpoint)
        
        if (regions.length === 0) {
          console.log(`❌ Selected endpoint failed, using fallback regions`)
          return FALLBACK_REGIONS
        }
        
        // Don't cache when testing specific endpoints
        return regions
      }
    } catch (error) {
      console.error('💥 Error fetching regions from PSGC API:', error)
      console.log('📋 Using fallback hardcoded regions data (source: FALLBACK_REGIONS)')
      return FALLBACK_REGIONS
    }
  }

  /**
   * Fetch regions from a specific API endpoint
   * @param endpoint APIEndpoint
   * @returns Promise<SimplifiedRegion[]>
   */
  private static async fetchFromEndpoint(endpoint: APIEndpoint): Promise<SimplifiedRegion[]> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'LawBot-Web-App/1.0'
        },
        mode: 'cors', // Explicitly set CORS mode
        cache: 'default',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(`❌ ${endpoint.name} responded with status: ${response.status}`)
        return []
      }

      const data: any[] = await response.json()
      
      if (!Array.isArray(data) || data.length === 0) {
        console.warn(`❌ Invalid or empty response from ${endpoint.name}`)
        return []
      }

      // Transform to simplified format - handle different API response formats
      const simplifiedRegions: SimplifiedRegion[] = data.map(region => {
        if (endpoint.source === 'cloud') {
          // PSGC Cloud API format: {id: number, name: string, code: string}
          return {
            id: region.code || region.id?.toString() || 'unknown',
            name: region.name,
            population: 'N/A'
          }
        } else {
          // GitLab API format: {psgc_id: string, name: string, population: string}
          return {
            id: region.psgc_id || region.id?.toString() || 'unknown',
            name: region.name,
            population: region.population || 'N/A'
          }
        }
      })

      console.log(`✅ Successfully fetched ${simplifiedRegions.length} regions from ${endpoint.name}`)
      return simplifiedRegions

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`⏰ Request to ${endpoint.name} timed out`)
      } else {
        console.warn(`❌ Error fetching from ${endpoint.name}:`, error)
      }
      return []
    }
  }

  /**
   * Get cached regions data if available and not expired
   * @returns SimplifiedRegion[] | null
   */
  private static getCachedRegions(): SimplifiedRegion[] | null {
    try {
      if (typeof window === 'undefined') return null // SSR safety
      
      const cached = localStorage.getItem(this.CACHE_KEY)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      const now = new Date().getTime()
      
      // Check if cache is expired
      if (now - timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(this.CACHE_KEY)
        return null
      }

      return data
    } catch (error) {
      console.error('Error reading cached regions:', error)
      return null
    }
  }

  /**
   * Cache regions data in localStorage
   * @param regions SimplifiedRegion[]
   */
  private static setCachedRegions(regions: SimplifiedRegion[]): void {
    try {
      if (typeof window === 'undefined') return // SSR safety
      
      const cacheData = {
        data: regions,
        timestamp: new Date().getTime()
      }
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData))
      console.log('💾 Cached PSGC regions data')
    } catch (error) {
      console.error('Error caching regions:', error)
    }
  }

  /**
   * Clear cached regions data
   */
  static clearCache(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.CACHE_KEY)
        console.log('🗑️ Cleared PSGC regions cache')
      }
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  /**
   * Get a specific region by ID
   * @param regionId string
   * @param selectedSource Optional API source
   * @returns Promise<SimplifiedRegion | null>
   */
  static async getRegionById(regionId: string, selectedSource: APISource = 'auto'): Promise<SimplifiedRegion | null> {
    const regions = await this.getRegions(selectedSource)
    return regions.find(region => region.id === regionId) || null
  }

  /**
   * Search regions by name (case-insensitive)
   * @param searchTerm string
   * @param selectedSource Optional API source
   * @returns Promise<SimplifiedRegion[]>
   */
  static async searchRegions(searchTerm: string, selectedSource: APISource = 'auto'): Promise<SimplifiedRegion[]> {
    const regions = await this.getRegions(selectedSource)
    const lowercaseSearch = searchTerm.toLowerCase()
    
    return regions.filter(region =>
      region.name.toLowerCase().includes(lowercaseSearch)
    )
  }
}

export default PSGCApiService