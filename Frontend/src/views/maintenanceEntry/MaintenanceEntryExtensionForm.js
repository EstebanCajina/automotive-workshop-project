/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */

import React, { useState, useEffect } from 'react'
import {
  CForm,
  CFormLabel,
  CFormTextarea,
  CFormInput,
  CButton,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CFormFeedback,
} from '@coreui/react'
import Swal from 'sweetalert2'
import { addMaintenanceEntryExtension } from '../../services/MaintenanceEntryExtensionService'
import { getMaintenanceEntryById } from '../../services/MaintenanceEntryService'

const MaintenanceEntryExtensionForm = ({ entryId, onClose, onExtensionAdded }) => {
  const [extensionReason, setExtensionReason] = useState('')
  const [extensionTime, setExtensionTime] = useState('')
  const [reasonError, setReasonError] = useState(false)
  const [dateError, setDateError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentEntry, setCurrentEntry] = useState(null)

  useEffect(() => {
    const fetchEntryData = async () => {
      try {
        const entryData = await getMaintenanceEntryById(entryId)
        setCurrentEntry(entryData)
        let estimatedCompletion = new Date(entryData.estimated_completion)
        estimatedCompletion = estimatedCompletion.setDate(estimatedCompletion.getDate() + 3)
        setExtensionTime(new Date(estimatedCompletion).toISOString().split('T')[0])
      } catch (error) {
        console.error('Error al obtener la entrada de mantenimiento:', error)
      }
    }

    fetchEntryData()

    // Establecer la fecha actual mas 10 dias adelante cuando se monta el componente
    
  }, [entryId])

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value)
    const currentEntryDate = new Date(currentEntry.estimated_completion)

    if (selectedDate > currentEntryDate) {
      setExtensionTime(e.target.value)
      setDateError(false)
    } else {
      setDateError(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!extensionReason.trim()) {
      setReasonError(true) // Mostrar mensaje de error si está vacío
      return
    }

    if (dateError) {
      Swal.fire('Error', 'La fecha de la prórroga debe ser mayor que la fecha actual del mantenimiento.', 'error')
      return
    }

    try {
      setIsSubmitting(true)
      await addMaintenanceEntryExtension({
        entry_id: entryId,
        extension_time: new Date(extensionTime).toISOString(),
        extension_reason: extensionReason,
      })

      const confirmResult = await Swal.fire({
        title: '¿Está seguro?',
        text: '¿Desea confirmar y guardar esta prórroga?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
      })

      if (confirmResult.isConfirmed) {
        Swal.fire('¡Prórroga agregada!', 'La prórroga ha sido registrada correctamente.', 'success')
        onExtensionAdded() // Refrescar la lista si es necesario
        onClose()
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo agregar la prórroga.', 'error')
      console.error('Error al agregar la prórroga:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CModal visible={true} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Agregar Prórroga</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <CFormLabel>Fecha de la prórroga</CFormLabel>
            <CFormInput
              type="date"
              value={extensionTime}
              onChange={handleDateChange}
              invalid={dateError}
            />
            {dateError && (
              <CFormFeedback invalid>La fecha de la prórroga debe ser mayor que la fecha actual del mantenimiento.</CFormFeedback>
            )}
          </div>
          <div className="mb-3">
            <CFormLabel>Razón de la prórroga</CFormLabel>
            <CFormTextarea
              rows="4"
              value={extensionReason}
              onChange={(e) => {
                setExtensionReason(e.target.value)
                setReasonError(false) // Limpiar el error si el usuario comienza a escribir
              }}
              invalid={reasonError}
              required
            ></CFormTextarea>
            {reasonError && (
              <CFormFeedback invalid>La razón de la prórroga es obligatoria.</CFormFeedback>
            )}
          </div>
          <CButton type="submit" color="success" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </CButton>
          <CButton color="secondary" onClick={onClose} className="ms-2">
            Cancelar
          </CButton>
        </CForm>
      </CModalBody>
    </CModal>
  )
}

export default MaintenanceEntryExtensionForm