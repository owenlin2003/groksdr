/**
 * Utility functions for API calls with proper error handling and validation
 */

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
}

/**
 * Safely fetch and parse API response with error handling
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    // Check HTTP status before parsing
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch {
        // If JSON parsing fails, use status text
        const text = await response.text()
        if (text) errorMessage = text.substring(0, 200)
      }
      return {
        success: false,
        error: errorMessage,
      }
    }

    // Parse JSON response
    const data = await response.json()

    // Validate response structure
    if (data.success === false) {
      return {
        success: false,
        error: data.error || 'Request failed',
        details: data.details,
      }
    }

    return {
      success: true,
      data: data.data || data,
    }
  } catch (error) {
    // Handle network errors, timeouts, etc.
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error: Unable to connect to server',
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Display error message to user (can be replaced with toast/notification system)
 */
export function displayError(error: string, details?: unknown) {
  console.error('API Error:', error, details)
  // For now, use alert but this can be replaced with a toast notification system
  alert(`Error: ${error}`)
}

