/* eslint-disable prettier/prettier */
import React, { useState, useRef } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CRow,
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/react'
import { processExcelFiles } from '../../services/ExcelService'
import alert from '../../components/sweetalert/SweetAlert'
import { addMaintenances } from '../../services/MaintenanceService'
import { addVehicle } from '../../services/VehicleService'

const UploadExcel = () => {
  const [files, setFiles] = useState([])
  const [processedVehicles, setProcessedVehicles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [vehicleErrors, setVehicleErrors] = useState([])
  const [editedVehicles, setEditedVehicles] = useState({})
  const [isEditing, setIsEditing] = useState(false)

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files)
    const newFiles = selectedFiles.filter(
      (file) => !files.some((existingFile) => existingFile.name === file.name),
    )
    setFiles([...files, ...newFiles])
    setIsUploading(false)
  }

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    if (updatedFiles.length === 0) {
      setIsUploading(false)
    }
  }

  const handleEditField = (index, field, value) => {
    const updatedVehicles = { ...editedVehicles }
    if (!updatedVehicles[index]) {
      updatedVehicles[index] = { ...processedVehicles[index] }
    }
    updatedVehicles[index][field] = value
    setEditedVehicles(updatedVehicles)
  }

  const validateVehicle = (vehicle) => {
    const errors = {}
    if (!vehicle.dependency) {
      errors.dependency = 'La dependencia es obligatoria.'
    } else if (/^\s|\s$/.test(vehicle.dependency)) {
      errors.dependency = 'La dependencia no puede comenzar o terminar con espacios en blanco.'
    }
  
    if (!vehicle.plate) {
      errors.plate = 'La placa es obligatoria.'
    } else if (/^\s|\s$/.test(vehicle.plate)) {
      errors.plate = 'La placa no puede comenzar o terminar con espacios en blanco.'
    }
  
    if (!vehicle.code) {
      errors.code = 'El código es obligatorio.'
    } else if (/^\s|\s$/.test(vehicle.code)) {
      errors.code = 'El código no puede comenzar o terminar con espacios en blanco.'
    }
  
    if (!vehicle.assetCode) {
      errors.assetCode = 'El patrimonio es obligatorio.'
    } else if (/^\s|\s$/.test(vehicle.assetCode)) {
      errors.assetCode = 'El patrimonio no puede comenzar o terminar con espacios en blanco.'
    }
  
    if (!vehicle.brand) {
      errors.brand = 'La marca es obligatoria.'
    } else if (/^\s|\s$/.test(vehicle.brand)) {
      errors.brand = 'La marca no puede comenzar o terminar con espacios en blanco.'
    }
  
    if (!vehicle.style) {
      errors.style = 'El estilo es obligatorio.'
    } else if (/^\s|\s$/.test(vehicle.style)) {
      errors.style = 'El estilo no puede comenzar o terminar con espacios en blanco.'
    }
  
    if (!vehicle.modelYear || isNaN(vehicle.modelYear)) {
      errors.modelYear = 'El modelo (año) debe ser un número válido.'
    }
  
    return errors
  }

  const validateEditedVehicles = () => {
    const errors = processedVehicles.map((vehicle, index) => {
      if (editedVehicles[index]) {
        return validateVehicle(editedVehicles[index])
      }
      return {}
    })
    setVehicleErrors(errors)
    return errors.every((error) => Object.keys(error).length === 0)
  }

  const validateAllVehicles = () => {
    const errors = processedVehicles.map(validateVehicle)
    setVehicleErrors(errors)
  }

  const handleSaveChanges = () => {
    if (!validateEditedVehicles()) {
      alert.confirmAction({
        mode: 'warning',
        message: 'Corrija los errores antes de guardar los cambios.',
        confirm: () => {},
        valid: false,
      });
        return
    }
    const updatedVehicles = processedVehicles.map((vehicle, index) =>
      editedVehicles[index] ? editedVehicles[index] : vehicle
    )
    setProcessedVehicles(updatedVehicles)
    setEditedVehicles({})
    setIsEditing(false)
  }

  const toggleEditMode = () => {
    if (isEditing) {
      handleSaveChanges()
    } else {
      setIsEditing(true)
    }
  }


  const hasErrors = () => vehicleErrors.some((errors) => Object.keys(errors).length > 0)

  const ConfirmSave = () => {
    validateAllVehicles()
    if (hasErrors()) {
      alert.confirmAction({
        mode: 'warning',
        message: 'Corrija los errores antes de guardar.',
        confirm: () => {},
        valid: false,
      });
      return;
    }

    alert.confirmAction({
      mode: 'warning',
      message: '¿Está seguro de guardar los vehículos?',
      confirm: handleSaveVehicles,
      message2: 'Vehículos guardados exitosamente.',
      valid: true,
    });
  }

  const handleClearFiles = () => {
    setFiles([])
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      alert.confirmAction({
        mode: 'warning',
        message: 'Por favor, seleccione al menos un archivo.',
        confirm: () => {},
        valid: false,
      });
      return;
    }
    setIsUploading(true)
    try {
      const newVehicles = await processExcelFiles(files)
      setProcessedVehicles([...processedVehicles, ...newVehicles])
    } catch (error) {
      console.error('Error al procesar los archivos:', error)
      alert.confirmAction({
        mode: 'error',
        message: 'Ocurrió un error al procesar los archivos.',
        confirm: () => {},
        valid: false,
      });
       } finally {
      setFiles([])
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteVehicle = (index) => {
    const updatedVehicles = processedVehicles.filter((_, i) => i !== index)
    setProcessedVehicles(updatedVehicles)
  }

  const handleSaveVehicles = async () => {

    let vehiclesNotSave = []

    const vehicles = processedVehicles.map((vehicle) => ({
      region: vehicle.region,
      dependency: vehicle.dependency,
      plate: vehicle.plate,
      asset_code: vehicle.code,
      heritage: vehicle.assetCode,
      brand: vehicle.brand,
      style: vehicle.style,
      model_year: vehicle.modelYear,
      maintenances: vehicle.maintenances, // Vector de mantenimientos
    }))

    const maintenancesToSave = [] // Lista final de mantenimientos que se enviarán al backend


    try {
      // 1. Enviar la lista de vehículos al backend para guardarlos
      
      const response = await addVehicle(vehicles)

      const vehicleIds = response // Guardar la respuesta del backend

      if(response.message){
         alert.confirmAction({
        mode: 'warning',
        message: 'El vehiculo ya existe. solo se agregaran los mantenimientos',
        confirm: () => {},
        valid: false,
      });
      }

      
      // 2. Validar qué vehículos tienen éxito y cuáles no
      for (const vehicle of vehicles) {
        const matchingVehicle = vehicleIds.find((item) => item.plate === vehicle.plate)

        vehiclesNotSave = vehicleIds.filter((item) => item.message)

        if (matchingVehicle && matchingVehicle.id) {
          // 3. Asignar el ID del vehículo a los mantenimientos correspondientes
          vehicle.maintenances.forEach((maintenance) => {
            maintenance.vehicle_id = matchingVehicle.id
            maintenancesToSave.push(maintenance)
          })
        } else if (matchingVehicle && matchingVehicle.message) {
        }
      }

      // 4. Guardar la lista de mantenimientos en el backend
      if (maintenancesToSave.length > 0) {

        if(vehiclesNotSave.length > 0){

          for(const vehicle of vehiclesNotSave){
            alert.confirmAction({
              mode: 'warning',
              message: `El vehiculo ${vehicle.plate} ya existia. por lo que solo se agrego el mantenimiento`,
              confirm: () => {},
              valid: false,
            });
          }
          
        }


        await addMaintenances(maintenancesToSave)
      }
    } catch (error) { }
  }


  const handleBlur = (index, field) => {
    const updatedVehicles = { ...editedVehicles }
    if (!updatedVehicles[index]) {
      updatedVehicles[index] = { ...processedVehicles[index] }
    }
    const errors = validateVehicle(updatedVehicles[index])
    setVehicleErrors((prevErrors) => {
      const newErrors = [...prevErrors]
      newErrors[index] = errors
      return newErrors
    })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Carga de Archivos Excel</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <div className="mb-3">
                <CFormLabel htmlFor="fileInput">Seleccione uno o más archivos Excel</CFormLabel>
                <CFormInput
                  type="file"
                  id="fileInput"
                  multiple
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </div>
              <div className="mb-3 d-flex gap-2">
                <CButton color="primary" onClick={handleUpload} disabled={isUploading}>
                  Subir Archivos
                </CButton>
                <CButton color="danger" onClick={handleClearFiles} disabled={files.length === 0}>
                  Limpiar Lista
                </CButton>
              </div>
            </CForm>
            {files.length > 0 && (
              <div className="mt-3">
                <h5>Archivos Seleccionados:</h5>
                <ul>
                  {files.map((file, index) => (
                    <li key={index} className="d-flex justify-content-between align-items-center">
                      {file.name}
                      <CButton color="danger" size="xs" onClick={() => handleRemoveFile(index)}>
                        Eliminar
                      </CButton>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {processedVehicles.length > 0 && (
              <div className="mt-3">
                <h5>Vehículos Procesados:</h5>
                <CTable striped bordered hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Región</CTableHeaderCell>
                      <CTableHeaderCell>Dependencia</CTableHeaderCell>
                      <CTableHeaderCell>Placa</CTableHeaderCell>
                      <CTableHeaderCell>Código</CTableHeaderCell>
                      <CTableHeaderCell>Patrimonio</CTableHeaderCell>
                      <CTableHeaderCell>Marca</CTableHeaderCell>
                      <CTableHeaderCell>Estilo</CTableHeaderCell>
                      <CTableHeaderCell>Modelo (Año)</CTableHeaderCell>
                      <CTableHeaderCell>Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
  {processedVehicles.map((vehicle, index) => (
    <CTableRow key={index}>
      <CTableDataCell>
        <CFormInput
          value={editedVehicles[index]?.region ?? vehicle.region ?? ''}
          onChange={(e) => handleEditField(index, 'region', e.target.value)}
          onBlur={() => handleBlur(index, 'region')}
          disabled={!isEditing}
        />
        {vehicleErrors[index]?.region && (
          <div className="text-danger">{vehicleErrors[index].region}</div>
        )}
      </CTableDataCell>
      <CTableDataCell>
        <CFormInput
          value={editedVehicles[index]?.dependency ?? vehicle.dependency ?? ''}
          onChange={(e) => handleEditField(index, 'dependency', e.target.value)}
          onBlur={() => handleBlur(index, 'dependency')}
          disabled={!isEditing}
        />
        {vehicleErrors[index]?.dependency && (
          <div className="text-danger">{vehicleErrors[index].dependency}</div>
        )}
      </CTableDataCell>
      <CTableDataCell>
        <CFormInput
          value={editedVehicles[index]?.plate ?? vehicle.plate ?? ''}
          onChange={(e) => handleEditField(index, 'plate', e.target.value)}
          onBlur={() => handleBlur(index, 'plate')}
          disabled={!isEditing}
        />
        {vehicleErrors[index]?.plate && (
          <div className="text-danger">{vehicleErrors[index].plate}</div>
        )}
      </CTableDataCell>
      <CTableDataCell>
        <CFormInput
          value={editedVehicles[index]?.code ?? vehicle.code ?? ''}
          onChange={(e) => handleEditField(index, 'code', e.target.value)}
          onBlur={() => handleBlur(index, 'code')}
          disabled={!isEditing}
        />
        {vehicleErrors[index]?.code && (
          <div className="text-danger">{vehicleErrors[index].code}</div>
        )}
      </CTableDataCell>
      <CTableDataCell>
        <CFormInput
          value={editedVehicles[index]?.assetCode ?? vehicle.assetCode ?? ''}
          onChange={(e) => handleEditField(index, 'assetCode', e.target.value)}
          onBlur={() => handleBlur(index, 'assetCode')}
          disabled={!isEditing}
        />
        {vehicleErrors[index]?.assetCode && (
          <div className="text-danger">{vehicleErrors[index].assetCode}</div>
        )}
      </CTableDataCell>
      <CTableDataCell>
        <CFormInput
          value={editedVehicles[index]?.brand ?? vehicle.brand ?? ''}
          onChange={(e) => handleEditField(index, 'brand', e.target.value)}
          onBlur={() => handleBlur(index, 'brand')}
          disabled={!isEditing}
        />
        {vehicleErrors[index]?.brand && (
          <div className="text-danger">{vehicleErrors[index].brand}</div>
        )}
      </CTableDataCell>
      <CTableDataCell>
        <CFormInput
          value={editedVehicles[index]?.style ?? vehicle.style ?? ''}
          onChange={(e) => handleEditField(index, 'style', e.target.value)}
          onBlur={() => handleBlur(index, 'style')}
          disabled={!isEditing}
        />
        {vehicleErrors[index]?.style && (
          <div className="text-danger">{vehicleErrors[index].style}</div>
        )}
      </CTableDataCell>
      <CTableDataCell>
        <CFormInput
          value={editedVehicles[index]?.modelYear ?? vehicle.modelYear ?? ''}
          onChange={(e) => handleEditField(index, 'modelYear', e.target.value)}
          onBlur={() => handleBlur(index, 'modelYear')}
          disabled={!isEditing}
        />
        {vehicleErrors[index]?.modelYear && (
          <div className="text-danger">{vehicleErrors[index].modelYear}</div>
        )}
      </CTableDataCell>
      <CTableDataCell>
        <CButton
          color="danger"
          size="xs"
          onClick={() => handleDeleteVehicle(index)}
        >
          Eliminar
        </CButton>
      </CTableDataCell>
    </CTableRow>
  ))}
</CTableBody>
                </CTable>
                <CButton color="primary" className="mt-3" onClick={toggleEditMode}>
                  {isEditing ? 'Guardar cambios' : 'Editar'}
                </CButton>
                <CButton color="success" className="mt-3" onClick={ConfirmSave}
                  disabled={isEditing}>
                  Guardar Vehículos
                </CButton>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}
export default UploadExcel