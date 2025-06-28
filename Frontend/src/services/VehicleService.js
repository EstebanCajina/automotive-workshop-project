/* eslint-disable prettier/prettier */
import api from '../components/Auth/AxiosConfig'

// Obtener todos los vehículos activos
export const getVehicles = async (page, pageSize) => {

  try {
    const response = await api.get(`vehicles/?page=${page}&pageSize=${pageSize}`);

    console.log('API Response:', response.data); // Imprimir la respuesta de la API
    return {
      totalVehicles: response.data.totalVehicles,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage,
      pageSize: response.data.pageSize,
      vehicles: response.data.data, // Extraer solo la lista de vehículos
    };
  } catch (error) {
    console.error('Error al obtener los vehículos:', error);
    throw error;
  }
  
}

// Obtener un vehículo por su ID
export const getVehicleById = async (id) => {
  try {
    const response = await api.get(`vehicles/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error al obtener el vehículo con ID ${id}:`, error)
    throw error
  }
}

// Verificar si una placa ya existe en la base de datos
export const checkPlate = async (plate) => {
  try {
    const response = await api.get(`vehicles/check/${plate}`)
    return response.data
  } catch (error) {
    console.error(`Error al verificar la placa ${plate}:`, error)
    throw error
  }
}

// Agregar un nuevo vehículo
export const addVehicle = async (vehicle) => {
  try {
    const response = await api.post('vehicles', vehicle)
    return response.data
  } catch (error) {
    console.error('Error al agregar el vehículo:', error)
    throw error
  }
}

// Actualizar un vehículo existente
export const updateVehicle = async (id, updatedVehicle) => {
  try {
    const response = await api.put(`vehicles/${id}`, updatedVehicle)
    return response.data
  } catch (error) {
    console.error(`Error al actualizar el vehículo con ID ${id}:`, error)
    throw error
  }
}

// Eliminar un vehículo (eliminación lógica)
export const deleteVehicle = async (id) => {
  try {
    await api.delete(`vehicles/${id}`)
  } catch (error) {
    console.error(`Error al eliminar el vehículo con ID ${id}:`, error)
    throw error
  }
}
