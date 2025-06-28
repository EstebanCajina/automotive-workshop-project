/* eslint-disable prettier/prettier */
import api from '../components/Auth/AxiosConfig'

// Obtener todos los mantenimientos
export const getMaintenances = async () => {
  try {
    const response = await api.get('maintenances')
    return response.data
  } catch (error) {
    console.error('Error al obtener los mantenimientos:', error)
    throw error
  }
}

// Obtener mantenimiento por ID
export const getMaintenanceById = async (id) => {
  try {
    const response = await api.get(`maintenances/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error al obtener el mantenimiento con ID ${id}:`, error)
    throw error
  }
}

// Obtener mantenimientos por placa
export const getMaintenanceByPlate = async (plate) => {
  try {
    const response = await api.get(`maintenances/plate/${plate}`)
    return response.data
  } catch (error) {
    console.error(`Error al obtener mantenimientos por placa ${plate}:`, error)
    throw error
  }
}

// Agregar nuevos mantenimientos (puede aceptar múltiples mantenimientos)
export const addMaintenances = async (maintenances) => {
  try {
    const response = await api.post('maintenances', maintenances)

    return response.data
  } catch (error) {
    console.error('Error al agregar los mantenimientos:', error)
    throw error
  }
}

// Actualizar un mantenimiento existente
export const updateMaintenance = async (id, maintenance) => {
  try {
    const response = await api.put(`maintenances/${id}`, maintenance)
    return response.data
  } catch (error) {
    console.error(`Error al actualizar el mantenimiento con ID ${id}:`, error)
    throw error
  }
}

// Eliminar un mantenimiento (borrado lógico)
export const deleteMaintenance = async (id) => {
  try {
    await api.delete(`maintenances/${id}`);
  } catch (error) {
    console.error(`Error al eliminar el mantenimiento con ID ${id}:`, error)
    throw error
  }
}
