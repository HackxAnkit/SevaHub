const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

function buildApiUrl(pathname = '') {
  if (!pathname) {
    return API_BASE_URL || '/'
  }

  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath
}

export { API_BASE_URL, buildApiUrl }
