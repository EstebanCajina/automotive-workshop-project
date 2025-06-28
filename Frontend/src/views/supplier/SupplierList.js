/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormLabel,
} from '@coreui/react'
import {
  getSuppliers,
  deleteSupplier,
  updateSupplier,
  searchSuppliersByProduct, // Cambio aquí
} from '../../services/SupplierService'

import Swal from 'sweetalert2'

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([])
  const [editSupplier, setEditSupplier] = useState(null)
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const data = await getSuppliers()
      setSuppliers(data)
    } catch (error) {
      console.error('Error al obtener la lista de proveedores:', error)
    }
  }

  const handleSearch = async (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim() === '') {
      fetchSuppliers() // Refresca la lista general si el campo está vacío
    } else {
      try {
        const filteredSuppliers = await searchSuppliersByProduct(value) // Actualizado para la búsqueda por producto
        setSuppliers(filteredSuppliers)
      } catch (error) {
        console.error('Error al buscar proveedores por producto:', error)
      }
    }
  }

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteSupplier(id)
          Swal.fire('¡Eliminado!', 'El proveedor ha sido eliminado.', 'success')
          fetchSuppliers() // Actualiza la lista después de eliminar
        } catch (error) {
          console.error('Error al eliminar el proveedor:', error)
          Swal.fire('Error', 'No se pudo eliminar el proveedor', 'error')
        }
      }
    })
  }

  const handleEdit = (supplier) => {
    setEditSupplier(supplier)
    setErrors({})
  }

  const validateForm = () => {
    let newErrors = {}

    if (!editSupplier.name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (!editSupplier.phone.trim()) newErrors.phone = 'El teléfono es obligatorio'
    else if (!/^\d{8,15}$/.test(editSupplier.phone))
      newErrors.phone = 'El teléfono debe tener entre 8 y 15 dígitos numéricos'

    if (!editSupplier.email.trim()) newErrors.email = 'El correo electrónico es obligatorio'
    else if (!/^\S+@\S+\.\S+$/.test(editSupplier.email))
      newErrors.email = 'El formato del correo es inválido'

    if (!editSupplier.address.trim()) newErrors.address = 'La dirección es obligatoria'
    if (!editSupplier.product_list.trim())
      newErrors.product_list = 'La lista de productos es obligatoria'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditSupplier({ ...editSupplier, [name]: value })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    Swal.fire({
      title: '¿Confirmar cambios?',
      text: '¿Está seguro de que desea guardar los cambios?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await updateSupplier(editSupplier.id, editSupplier)
          Swal.fire('¡Actualizado!', 'El proveedor ha sido actualizado correctamente.', 'success')
          setEditSupplier(null) // Cierra el formulario de edición
          fetchSuppliers() // Actualiza la lista
        } catch (error) {
          console.error('Error al actualizar el proveedor:', error)
          Swal.fire('Error', 'No se pudo actualizar el proveedor', 'error')
        }
      }
    })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Listado de Proveedores</strong>
          </CCardHeader>
          <CCardBody>
            {/* Campo de búsqueda */}
            <div className="mb-3">
              <CFormInput
                type="text"
                placeholder="Buscar proveedores por producto"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <CTable striped bordered hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Nombre</CTableHeaderCell>
                  <CTableHeaderCell>Teléfono</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Dirección</CTableHeaderCell>
                  <CTableHeaderCell>Productos</CTableHeaderCell>
                  <CTableHeaderCell>WhatsApp</CTableHeaderCell> {/* Nueva columna */}
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {suppliers
                  .filter((supplier) => supplier.is_active) // Filtrar solo proveedores activos
                  .map((supplier) => (
                    <CTableRow key={supplier.id}>
                      <CTableDataCell>{supplier.name}</CTableDataCell>
                      <CTableDataCell>{supplier.phone}</CTableDataCell>
                      <CTableDataCell>{supplier.email}</CTableDataCell>
                      <CTableDataCell>{supplier.address}</CTableDataCell>
                      <CTableDataCell>{supplier.product_list}</CTableDataCell>
                      <CTableDataCell>
                        {supplier.whatsapp_link ? (
                          <a
                            href={supplier.whatsapp_link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            WhatsApp
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(supplier)}
                        >
                          Editar
                        </CButton>
                        <CButton color="danger" size="sm" onClick={() => handleDelete(supplier.id)}>
                          Eliminar
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
              </CTableBody>
            </CTable>

            {/* Formulario de edición */}
            {editSupplier && (
              <div className="mt-4">
                <h5>Editar Proveedor</h5>
                <CForm onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <CFormLabel>Nombre del Proveedor</CFormLabel>
                    <CFormInput
                      type="text"
                      name="name"
                      value={editSupplier.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <span style={{ color: 'red', fontSize: 'small' }}>{errors.name}</span>
                    )}
                  </div>

                  <div className="mb-3">
                    <CFormLabel>Teléfono</CFormLabel>
                    <CFormInput
                      type="text"
                      name="phone"
                      value={editSupplier.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && (
                      <span style={{ color: 'red', fontSize: 'small' }}>{errors.phone}</span>
                    )}
                  </div>

                  <div className="mb-3">
                    <CFormLabel>WhatsApp Link</CFormLabel>
                    <CFormInput
                      type="text"
                      name="whatsapp_link"
                      value={editSupplier.whatsapp_link}
                      onChange={handleChange}
                    />
                    {errors.whatsapp_link && (
                      <span style={{ color: 'red', fontSize: 'small' }}>
                        {errors.whatsapp_link}
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    <CFormLabel>Correo Electrónico</CFormLabel>
                    <CFormInput
                      type="email"
                      name="email"
                      value={editSupplier.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <span style={{ color: 'red', fontSize: 'small' }}>{errors.email}</span>
                    )}
                  </div>

                  <div className="mb-3">
                    <CFormLabel>Dirección</CFormLabel>
                    <CFormInput
                      type="text"
                      name="address"
                      value={editSupplier.address}
                      onChange={handleChange}
                    />
                    {errors.address && (
                      <span style={{ color: 'red', fontSize: 'small' }}>{errors.address}</span>
                    )}
                  </div>

                  <div className="mb-3">
                    <CFormLabel>Lista de Productos</CFormLabel>
                    <CFormInput
                      type="text"
                      name="product_list"
                      value={editSupplier.product_list}
                      onChange={handleChange}
                    />
                    {errors.product_list && (
                      <span style={{ color: 'red', fontSize: 'small' }}>{errors.product_list}</span>
                    )}
                  </div>

                  <CButton color="primary" type="submit">
                    Guardar Cambios
                  </CButton>
                  <CButton color="secondary" className="ms-2" onClick={() => setEditSupplier(null)}>
                    Cancelar
                  </CButton>
                </CForm>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default SupplierList
