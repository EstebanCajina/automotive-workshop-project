// src/utils/AxiosConfig.js
import axios from 'axios'
import Alerts from '../sweetalert/SweetAlert'

// Crear una instancia de Axios
const api = axios.create({
  baseURL: 'http://localhost:3000/api/', // Cambia esto a la URL base de tu backend
  withCredentials: true, // Para permitir el envío de cookies si es necesario
})

// Configuración del interceptor para incluir el `accessToken` en el encabezado
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
      console.log('El token en Axios es:', token)
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Interceptor para manejar errores en las respuestas
api.interceptors.response.use(
  (response) => response, // Si no hay errores, simplemente devuelve la respuesta
  (error) => {
    if (
      error.response &&
      error.response.data &&
      error.response.data.error === 'Sesión no válida o ha iniciado sesión en otro dispositivo.'
    ) {
      // Eliminar el token del almacenamiento local
      localStorage.removeItem('accessToken')
      Alerts.confirmAction({
        mode: 'warning',
        message: 'Sesión no válida o ha iniciado sesión en otro dispositivo.',
        confirm: () => {
          // Redirigir al inicio de sesión
          window.location.href = '/login'
        },
      })
      // Redirigir al inicio de sesión
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export default api
