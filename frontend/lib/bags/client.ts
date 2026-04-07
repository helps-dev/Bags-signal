const DEFAULT_BASE = 'https://public-api-v2.bags.fm/api/v1'

export function getBagsBaseUrl(): string {
  const b = process.env.BAGS_API_BASE_URL?.trim()
  return b && b.length > 0 ? b.replace(/\/$/, '') : DEFAULT_BASE
}

export function getBagsApiKey(): string | undefined {
  const k = process.env.BAGS_API_KEY?.trim()
  return k && k.length > 0 ? k : undefined
}

type BagsEnvelope<T> = { success: boolean; response?: T; error?: string }

/**
 * Production-ready Bags API client with proper error handling
 */
export async function bagsGet<T>(path: string, apiKey: string, searchParams?: Record<string, string>): Promise<T> {
  const base = getBagsBaseUrl()
  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`)
  
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, v)
    }
  }

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store',
    })

    const text = await res.text()
    
    // Handle empty response
    if (!text || text.trim() === '') {
      throw new Error(`Bags API returned empty response (${res.status})`)
    }

    let json: BagsEnvelope<T>
    try {
      json = JSON.parse(text) as BagsEnvelope<T>
    } catch (parseError) {
      // If response is not JSON, it might be HTML error page
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        throw new Error(`Bags API returned HTML instead of JSON (${res.status}). Endpoint may not exist.`)
      }
      throw new Error(`Bags API invalid JSON (${res.status}): ${text.slice(0, 200)}`)
    }

    if (!res.ok) {
      throw new Error(json.error || `Bags API HTTP ${res.status}: ${text.slice(0, 200)}`)
    }

    if (!json.success) {
      throw new Error(json.error || 'Bags API success=false')
    }

    return json.response as T
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Bags API request failed: ${String(error)}`)
  }
}

/**
 * POST request to Bags API
 */
export async function bagsPost<T>(path: string, apiKey: string, body: any): Promise<T> {
  const base = getBagsBaseUrl()
  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`)

  try {
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const text = await res.text()
    
    if (!text || text.trim() === '') {
      throw new Error(`Bags API returned empty response (${res.status})`)
    }

    let json: BagsEnvelope<T>
    try {
      json = JSON.parse(text) as BagsEnvelope<T>
    } catch {
      throw new Error(`Bags API invalid JSON (${res.status}): ${text.slice(0, 200)}`)
    }

    if (!res.ok) {
      throw new Error(json.error || `Bags API HTTP ${res.status}`)
    }

    if (!json.success) {
      throw new Error(json.error || 'Bags API success=false')
    }

    return json.response as T
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Bags API request failed: ${String(error)}`)
  }
}
