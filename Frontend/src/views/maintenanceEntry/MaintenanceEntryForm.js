/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { CForm, CFormInput, CFormLabel, CButton, CRow, CCol, CFormFeedback, CModal, CModalHeader, CModalBody, CModalFooter } from '@coreui/react'
import {
  getMechanics,
  getMaintenanceByPlate,
  addMaintenanceEntry,
} from '../../services/MaintenanceEntryService'
import Swal from 'sweetalert2'

const MaintenanceEntryForm = ({ onClose, onEntryAdded }) => {
  const [plate, setPlate] = useState('')
  const [maintenance, setMaintenance] = useState(null)
  const [assignedMechanic, setAssignedMechanic] = useState('')
  const [mechanics, setMechanics] = useState([])
  const [plateError, setPlateError] = useState(false)
  const [mechanicError, setMechanicError] = useState(false)
  const [estimatedCompletion, setEstimatedCompletion] = useState('')
  const [dateError, setDateError] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const fetchMechanicsData = async () => {
      try {
        const data = await getMechanics()
        setMechanics(data)
      } catch (error) {
        console.error('Error al obtener mecánicos:', error)
      }
    }

    fetchMechanicsData()

    // Inicializar estimatedCompletion con una fecha 10 días adelante
    const initialDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    setEstimatedCompletion(initialDate.toISOString().split('T')[0])
  }, [])

  const handlePlateChange = async (e) => {
    const value = e.target.value
    setPlate(value)
    setPlateError(false)

    try {
      const maintenanceData = await getMaintenanceByPlate(value)
      if (maintenanceData) {
        setMaintenance(maintenanceData)
        setPlateError(false)
        
      } else {
        setMaintenance(null)
        setPlateError(true)
      }
    } catch (error) {
      console.error('Error al buscar el mantenimiento:', error)
      setPlateError(true)
    }
  }

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value)
    const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // Un día después de la fecha actual

    if (selectedDate >= minDate) {
      setEstimatedCompletion(e.target.value)
      setDateError(false)
    } else {
      setDateError(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!assignedMechanic) {
      setMechanicError(true)
      return
    }
    setMechanicError(false)

    if (!maintenance) {
      Swal.fire('Error', 'Debe seleccionar una placa válida primero.', 'error')
      return
    }

    if (dateError) {
      Swal.fire('Error', 'La fecha estimada de finalización debe ser al menos un día después de la fecha actual.', 'error')
      return
    }

    const newEntry = {
      maintenance_id: maintenance.id,
      entry_time: new Date().toISOString(),
      estimated_completion: new Date(estimatedCompletion).toISOString(),
      maintenance_status: 'Pendiente',
      assigned_mechanic: assignedMechanic,
      is_active: true,
    }

    try {
      await addMaintenanceEntry(newEntry)
      Swal.fire('¡Guardado!', 'La nueva orden de trabajo ha sido guardada exitosamente.', 'success')
      onEntryAdded()
      onClose()
    } catch (error) {
      console.error('Error al guardar la orden de trabajo:', error)
      Swal.fire('Error', 'No se pudo guardar la orden de trabajo.', 'error')
    }
  }

  return (
    <CForm onSubmit={handleSubmit}>
      <CRow className="mb-3">
        <CCol>
          <CFormLabel>Placa del vehículo</CFormLabel>
          <CFormInput
            type="text"
            placeholder="Ingrese la placa del vehículo"
            value={plate}
            onChange={handlePlateChange}
            invalid={plateError}
          />
          {plateError && (
            <CFormFeedback invalid>No se encontró un mantenimiento para esta placa.</CFormFeedback>
          )}
        </CCol>
      </CRow>

      {maintenance && (
        <>
          <CButton color="info" onClick={() => setShowDetails(true)}>
            Ver detalles del mantenimiento
          </CButton>
        </>
      )}

      <CRow className="mb-3">
        <CCol>
          <CFormLabel>Mecánico asignado</CFormLabel>
          <select
            className={`form-control ${mechanicError ? 'is-invalid' : ''}`}
            value={assignedMechanic}
            onChange={(e) => setAssignedMechanic(e.target.value)}
          >
            <option value="" disabled>
              Seleccione un mecánico
            </option>
            {mechanics.map((mechanic) => (
              <option key={mechanic.id} value={mechanic.username}>
                {mechanic.username}
              </option>
            ))}
          </select>
          {mechanicError && <CFormFeedback invalid>Debe seleccionar un mecánico.</CFormFeedback>}
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol>
          <CFormLabel>Fecha Estimada de Finalización</CFormLabel>
          <CFormInput
            type="date"
            value={estimatedCompletion}
            onChange={handleDateChange}
            min={new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          />
          {dateError && (
            <CFormFeedback invalid>La fecha debe ser al menos un día después de la fecha actual.</CFormFeedback>
          )}
        </CCol>
      </CRow>

      <CButton type="submit" color="success" disabled={!assignedMechanic}>
        Guardar orden de trabajo
      </CButton>
      <CButton color="secondary" onClick={onClose} className="ms-2">
        Cancelar
      </CButton>

      <CModal visible={showDetails} onClose={() => setShowDetails(false)}>
        <CModalHeader onClose={() => setShowDetails(false)}>
          <h5>Detalles del Mantenimiento</h5>
        </CModalHeader>
        <CModalBody>
          {maintenance && (
            <>
              <p><strong>Descripción del Problema:</strong> {maintenance.issue_description}</p>
              <p><strong>Kilometraje:</strong> {maintenance.unit_mileage}</p>
              <p><strong>Observaciones:</strong> {maintenance.observations}</p>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDetails(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </CForm>
  )
}

export default MaintenanceEntryForm