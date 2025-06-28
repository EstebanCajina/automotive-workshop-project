/* eslint-disable prettier/prettier */
import api from '../components/Auth/AxiosConfig'

// Obtener todas las cajas de herramientas
export const getToolboxes = async () => {
  try {
    const response = await api.get('toolboxes')
    return response.data
  } catch (error) {
    console.error('Error al obtener las cajas de herramientas:', error)
    throw error
  }
}

// Agregar una nueva caja de herramientas
export const addToolbox = async (toolbox) => {
  try {
    console.log('Cajaaaaa:', toolbox)
    const response = await api.post('toolboxes', toolbox)
    // Aquí puedes manejar la respuesta, si es necesario
    return response.data // Por ejemplo, podrías devolver el objeto de la caja de herramientas creada
  } catch (error) {
    console.error('Error al agregar caja de herramientas:', error)
    throw error
  }
}

// Actualizar una caja de herramientas existente
export const updateToolbox = async (id, toolbox) => {
  try {
    const response = await api.put(`toolboxes/${id}`, toolbox)
    return response.data // Retornar la respuesta si es necesario
  } catch (error) {
    console.error('Error al actualizar caja de herramientas:', error)
    throw error
  }
}

// Eliminar una caja de herramientas (borrado lógico)
export const deleteToolbox = async (id) => {
  try {
    await api.delete(`toolboxes/${id}`)
  } catch (error) {
    console.error('Error al eliminar caja de herramientas:', error)
    throw error
  }
}
