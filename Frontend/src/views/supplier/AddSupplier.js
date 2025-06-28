/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
} from '@coreui/react'
import { addSupplier } from '../../services/SupplierService'
import SupplierModel from '../../models/SupplierModel'
import Swal from 'sweetalert2'

const AddSupplier = () => {
  const [supplier, setSupplier] = useState({ ...SupplierModel })
  const [errors, setErrors] = useState({})

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setSupplier({ ...supplier, [name]: value })
  }

  // Validar los datos del formulario
  const validateForm = () => {
    let newErrors = {}

    if (!supplier.name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (!supplier.phone.trim()) newErrors.phone = 'El teléfono es obligatorio'
    else if (!/^\d{8,15}$/.test(supplier.phone))
      newErrors.phone = 'El teléfono debe tener entre 8 y 15 dígitos numéricos'

    if (!supplier.email.trim()) newErrors.email = 'El correo electrónico es obligatorio'
    else if (!/^\S+@\S+\.\S+$/.test(supplier.email))
      newErrors.email = 'El formato del correo es inválido'

    if (!supplier.address.trim()) newErrors.address = 'La dirección es obligatoria'
    if (!supplier.product_list.trim())
      newErrors.product_list = 'La lista de productos es obligatoria'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se agregará un nuevo proveedor',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, agregar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await addSupplier(supplier)
          Swal.fire('¡Agregado!', 'El proveedor ha sido agregado correctamente', 'success')
          setSupplier({ ...SupplierModel })
          setErrors({})
        } catch (error) {
          Swal.fire('Error', 'Ocurrió un error al agregar el proveedor', 'error')
          console.error('Error al agregar proveedor:', error)
        }
      }
    })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Agregar Nuevo Proveedor</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel>Nombre del Proveedor</CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={supplier.name}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre del proveedor"
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
                  value={supplier.phone}
                  onChange={handleChange}
                  placeholder="Ingrese el número de teléfono"
                />
                {errors.phone && (
                  <span style={{ color: 'red', fontSize: 'small' }}>{errors.phone}</span>
                )}
              </div>

              <div className="mb-3">
                <CFormLabel>Enlace de WhatsApp (Opcional)</CFormLabel>
                <CFormInput
                  type="text"
                  name="whatsapp_link"
                  value={supplier.whatsapp_link}
                  onChange={handleChange}
                  placeholder="Ingrese el enlace de WhatsApp"
                />
              </div>

              <div className="mb-3">
                <CFormLabel>Correo Electrónico</CFormLabel>
                <CFormInput
                  type="email"
                  name="email"
                  value={supplier.email}
                  onChange={handleChange}
                  placeholder="Ingrese el correo electrónico"
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
                  value={supplier.address}
                  onChange={handleChange}
                  placeholder="Ingrese la dirección del proveedor"
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
                  value={supplier.product_list}
                  onChange={handleChange}
                  placeholder="Ingrese los productos que ofrece el proveedor"
                />
                {errors.product_list && (
                  <span style={{ color: 'red', fontSize: 'small' }}>{errors.product_list}</span>
                )}
              </div>

              <CButton color="primary" type="submit">
                Agregar Proveedor
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AddSupplier
