const fetchData = async (url: string | URL | Request, options = {}) => {
  const token = localStorage.getItem('token') // Retrieve your bearer token

  const headers = {
    ...options.headers,
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  return response
}

export default fetchData
