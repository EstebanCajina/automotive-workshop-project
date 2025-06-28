/* eslint-disable prettier/prettier */
import api from '../components/Auth/AxiosConfig'

// Obtener todos los proveedores
export const getSuppliers = async () => {
  try {
    const response = await api.get('suppliers')
    return response.data
  } catch (error) {
    console.error('Error al obtener proveedores:', error)
    throw error
  }
}

// Agregar un nuevo proveedor
export const addSupplier = async (supplier) => {
  try {
    await api.post('suppliers', supplier)
  } catch (error) {
    console.error('Error al agregar proveedor:', error)
    throw error
  }
}

// Actualizar un proveedor existente
export const updateSupplier = async (id, supplier) => {
  try {
    await api.put(`suppliers/${id}`, supplier)
  } catch (error) {
    console.error('Error al actualizar proveedor:', error)
    throw error
  }
}

// Eliminar un proveedor (borrado lógico)
export const deleteSupplier = async (id) => {
  try {
    await api.delete(`suppliers/${id}`)
  } catch (error) {
    console.error('Error al eliminar proveedor:', error)
    throw error
  }
}

// Buscar proveedores por producto
export const searchSuppliersByProduct = async (searchTerm) => {
  try {
    const response = await api.get('suppliers/search', {
      params: { searchTerm },
    })
    return response.data
  } catch (error) {
    console.error('Error al buscar proveedores por producto:', error)
    throw error
  }
}
