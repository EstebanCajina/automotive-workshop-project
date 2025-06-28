/* eslint-disable prettier/prettier */
import api from '../components/Auth/AxiosConfig'

// Obtener todas las prórrogas asociadas a una entrada de mantenimiento
export const getMaintenanceEntryExtensions = async (entryId) => {
  try {
    const response = await api.get(`maintenance-entry-extensions/${entryId}`)
    return response.data
  } catch (error) {
    console.error(`Error al obtener las prórrogas para la entrada ${entryId}:`, error)
    throw error
  }
}

// Agregar una nueva prórroga
export const addMaintenanceEntryExtension = async (extension) => {
  try {
    const response = await api.post('maintenance-entry-extensions', extension)
    return response.data
  } catch (error) {
    console.error('Error al agregar la prórroga de entrada de mantenimiento:', error)
    throw error
  }
}

// Obtener una prórroga específica por su ID
export const getMaintenanceEntryExtensionById = async (id) => {
  try {
    const response = await api.get(`maintenance-entry-extensions/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error al obtener la prórroga con ID ${id}:`, error)
    throw error
  }
}

// Actualizar una prórroga existente
export const updateMaintenanceEntryExtension = async (id, updatedExtension) => {
  try {
    const response = await api.put(`maintenance-entry-extensions/${id}`, updatedExtension)
    return response.data
  } catch (error) {
    console.error(`Error al actualizar la prórroga con ID ${id}:`, error)
    throw error
  }
}

// Eliminar una prórroga
export const deleteMaintenanceEntryExtension = async (id) => {
  try {
    await api.delete(`maintenance-entry-extensions/${id}`)
  } catch (error) {
    console.error(`Error al eliminar la prórroga con ID ${id}:`, error)
    throw error
  }
}
