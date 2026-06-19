import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const getPhotoUrl = (path) => {
  if (!path) return ''
  return `/api/photos/${path}`
}

export const computeFileMd5 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const spark = new SparkMD5.ArrayBuffer()
      spark.append(e.target.result)
      resolve(spark.end())
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export const uploadPhotoWithRetry = async (file, prefix, onProgress, maxRetries = 3) => {
  let lastError = null
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('prefix', prefix)

      const response = await api.post('/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percent)
          }
        },
        timeout: 300000,
      })

      return response.data
    } catch (error) {
      lastError = error
      const isNetworkError = !error.response || error.code === 'ERR_NETWORK'
      if (isNetworkError && attempt < maxRetries) {
        const delay = attempt * 2000
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        break
      }
    }
  }
  throw lastError
}

export const uploadPhotosBatch = async (files, prefix, onProgress) => {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  formData.append('prefix', prefix)

  const response = await api.post('/photos/batch-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      }
    },
    timeout: 600000,
  })

  return response.data
}

export const uploadDocument = async (file, prefix, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('prefix', prefix)

  const response = await api.post('/photos/upload-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      }
    },
    timeout: 300000,
  })

  return response.data
}

export default api
