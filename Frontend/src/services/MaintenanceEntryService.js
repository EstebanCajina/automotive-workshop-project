/* eslint-disable prettier/prettier */
import api from '../components/Auth/AxiosConfig'
import MaintenanceModel from '../models/MaintenanceModel'
import UserModel from '../models/UserModel'

// Obtener todas las órdenes de trabajo
export const getMaintenanceEntries = async (page , pageSize = 10) => {

  try {
    const response = await api.get(`maintenance-entries/?page=${page}&pageSize=${pageSize}`);

    console.log('API Response:', response.data); // Imprimir la respuesta de la API
    return {
      totalEntries: response.data.totalEntries,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage,
      pageSize: response.data.pageSize,
      entries: response.data.data, // Extraer solo la lista de órdenes de trabajo
    };
  } catch (error) {
    console.error('Error al obtener las órdenes de trabajo:', error);
    throw error;
  }
};

//obtener una orden de trabajo por id
export const getMaintenanceEntryById = async (id) => {
  try {
    const response = await api.get(`maintenance-entries/${id}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener la orden de trabajo:', error)
    throw error
  }
}

// Agregar una nueva orden de trabajo
export const addMaintenanceEntry = async (entry) => {
  try {
    const response = await api.post('maintenance-entries', entry)
    return response.data
  } catch (error) {
    console.error('Error al agregar la orden de trabajo:', error)
    throw error
  }
}

// Editar una orden de trabajo existente
export const updateMaintenanceEntry = async (id, updatedEntry) => {
  try {
    const response = await api.put(`maintenance-entries/${id}`, updatedEntry)
    return response.data
  } catch (error) {
    console.error('Error al actualizar la orden de trabajo:', error)
    throw error
  }
}

// Eliminar una orden de trabajo
export const deleteMaintenanceEntry = async (id) => {
  try {
    await api.delete(`maintenance-entries/${id}`)
  } catch (error) {
    console.error('Error al eliminar la orden de trabajo:', error)
    throw error
  }
}

// Método para obtener el último mantenimiento por placa
export const getMaintenanceByPlate = async (plate) => {
  try {
    const response = await api.get(`/maintenances/plate/${plate}`)

    // Verificar si hay resultados
    const maintenances = response.data
    if (maintenances.length === 0) {
      console.warn(`No se encontraron mantenimientos para la placa ${plate}.`)
      return null
    }

    // Obtener el último mantenimiento de la lista
    const lastMaintenanceData = maintenances[maintenances.length - 1]

    // Asignar los datos al modelo
    const lastMaintenance = {
      ...MaintenanceModel,
      id: lastMaintenanceData.id || 0,
      plate: lastMaintenanceData.plate || '',
      issue_description: lastMaintenanceData.issue_description || '',
      unit_mileage: lastMaintenanceData.unit_mileage || '',
      mileage_date: lastMaintenanceData.mileage_date || '',
      requires_platform_transfer: lastMaintenanceData.requires_platform_transfer || false,
      under_warranty: lastMaintenanceData.under_warranty || false,
      mechanic_contact: lastMaintenanceData.mechanic_contact || '',
      mechanic_phone: lastMaintenanceData.mechanic_phone || '',
      observations: lastMaintenanceData.observations || '',
    }

    console.log('Último mantenimiento recuperado:', lastMaintenance)
    return lastMaintenance
  } catch (error) {
    console.error(`Error al obtener mantenimientos de la placa ${plate}:`, error)
    throw error
  }
}

// Obtener usuarios con el rol de mecánico
export const getMechanics = async () => {
  try {
    const response = await api.get('/users') // Llamada general a los usuarios
    const mechanics = response.data.filter((user) => user.role.toLowerCase() === 'mecanico')

    return mechanics.map((mechanic) => ({
      ...UserModel,
      id: mechanic.id,
      username: mechanic.username,
      role: mechanic.role,
      profile_picture: mechanic.profile_picture || '',
      is_active: mechanic.is_active,
    }))
  } catch (error) {
    console.error('Error al obtener la lista de mecánicos:', error)
    throw error
  }
}

