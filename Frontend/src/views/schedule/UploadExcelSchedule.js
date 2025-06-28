import React, { useState, useRef, useEffect } from 'react'
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
import {
  processConsistentExcelFiles,
  processInconsistentExcelFiles,
  GroupBYIdentification,
  calculateSalary,
  addSchedules,
  getSalaryData,
  UnifyByIdentification,
} from '../../services/SheduleService'
import alert from '../../components/sweetalert/SweetAlert'
import jsPDF from 'jspdf'
import colonSymbol from './../../assets/images/colon-symbol.png'
import taller from './../../assets/images/taller.png'
import Swal from 'sweetalert2'

const UploadExcelSchedule = () => {
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [processedSchedules, setProcessedSchedules] = useState([])
  const [editedSchedules, setEditedSchedules] = useState([])
  const [consistentSchedules, setConsistentSchedules] = useState([])
  const [unifiedSchedules, setUnifiedSchedules] = useState([])
  const [scheduleErrors, setScheduleErrors] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [lunchHours, setLunchHours] = useState({})
  const [salaryPerHour, setSalaryPerHour] = useState([])
  const [salaryExtra, setSalaryExtra] = useState([])
  const [salaryList, setSalaryList] = useState([])
  const fileInputRef = useRef(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [detailedSchedules, setDetailedSchedules] = useState({})
  const [tempDetailedSchedules, setTempDetailedSchedules] = useState({})
  const [detailErrors, setDetailErrors] = useState({})
  const [visibleDetails, setVisibleDetails] = useState({})
  const [initialLoad, setInitialLoad] = useState(true)

  const handleFileChange = (e) => {
    if (e.target.files.length === 0) return
    setFiles(Array.from(e.target.files))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('No hay archivos seleccionados', 'warning')
      return
    }

    setIsUploading(true)
    try {
      const inconsistentSchedules = await processInconsistentExcelFiles(files)
      const consistentSchedules = await processConsistentExcelFiles(files)
      if (!inconsistentSchedules || !consistentSchedules)
        throw new Error('No se pudieron procesar los archivos')

      setProcessedSchedules(inconsistentSchedules)
      setEditedSchedules(inconsistentSchedules)
      setConsistentSchedules(consistentSchedules)

      if (inconsistentSchedules.length === 0) {
        setFiles([])
        fileInputRef.current.value = ''
        const groupedSchedules = await GroupBYIdentification(
          consistentSchedules,
          inconsistentSchedules,
        )

        const unifiedSchedules = await UnifyByIdentification(groupedSchedules, 1.5)
        console.log('los horarios unificados cuando el archivo es correcto ', unifiedSchedules)
        setUnifiedSchedules(unifiedSchedules)
        setInitialLoad(true)
      }
    } catch (error) {
      console.error('Error al procesar archivos:', error)
      alert('Error al procesar archivos', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const fetchSalaryData = async (identification) => {
    try {
      const response = await getSalaryData(identification)

      if (response) {
        setSalaryPerHour((prevSalaryPerHour) => ({
          ...prevSalaryPerHour,
          [identification]: response.hourly_rate,
        }))
        setSalaryExtra((prevSalaryExtra) => ({
          ...prevSalaryExtra,
          [identification]: response.extra_hourly_rate,
        }))
      }
    } catch (error) {
      console.error(
        `Error al obtener los datos de salario para la identificación ${identification}:`,
        error,
      )
    }
  }

  useEffect(() => {
    if (initialLoad) {
      unifiedSchedules.forEach((schedule) => {
        fetchSalaryData(schedule.identification)
      })
      setInitialLoad(false)
    }
  }, [unifiedSchedules, initialLoad])

  const handleClearFiles = () => {
    fileInputRef.current.value = ''
    setFiles([])
    setProcessedSchedules([])
    setEditedSchedules([])
    setConsistentSchedules([])
    setUnifiedSchedules([])
  }

  const handleViewDetails = async (identification) => {
    if (tempDetailedSchedules[identification]) {
      // Si los detalles temporales ya están presentes, solo actualizar el estado de visibilidad
      setVisibleDetails((prevVisibleDetails) => ({
        ...prevVisibleDetails,
        [identification]: true,
      }))
      return
    }

    if (detailedSchedules[identification]) {
      // Si los detalles ya están presentes en el vector principal, cargar desde allí
      setTempDetailedSchedules((prevTempDetails) => ({
        ...prevTempDetails,
        [identification]: detailedSchedules[identification],
      }))
      setVisibleDetails((prevVisibleDetails) => ({
        ...prevVisibleDetails,
        [identification]: true,
      }))
      return
    }

    try {
      const groupedSchedules = await GroupBYIdentification(consistentSchedules, editedSchedules)
      const detailedSchedules = groupedSchedules[identification].map((detail) => {
        const checkInTime = new Date(`1970-01-01T${detail.check_in}Z`)
        const checkOutTime = new Date(`1970-01-01T${detail.check_out}Z`)
        const workedHours = (checkOutTime - checkInTime) / (1000 * 60 * 60)
        const netWorkedHours = workedHours - (detail.lunchHours || 1.5)

        return {
          ...detail,
          hoursWorked: netWorkedHours > 9.6 ? 9.6 : netWorkedHours,
          extraHours: netWorkedHours > 9.6 ? netWorkedHours - 9.6 : 0,
        }
      })

      setDetailedSchedules((prevDetails) => ({
        ...prevDetails,
        [identification]: detailedSchedules,
      }))
      setTempDetailedSchedules((prevTempDetails) => ({
        ...prevTempDetails,
        [identification]: detailedSchedules,
      }))
      setVisibleDetails((prevVisibleDetails) => ({
        ...prevVisibleDetails,
        [identification]: true,
      }))
    } catch (error) {
      console.error('Error al obtener el desglose:', error)
      alert('Error al obtener el desglose', 'error')
    }
  }

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index)
      if (updatedFiles.length === 0) {
        fileInputRef.current.value = ''
        setProcessedSchedules([])
      } else {
        const dataTransfer = new DataTransfer()
        updatedFiles.forEach((file) => dataTransfer.items.add(file))
        fileInputRef.current.files = dataTransfer.files
      }
      return updatedFiles
    })
  }

  const handleEditField = (index, field, value) => {
    setEditedSchedules((prevSchedules) => {
      const updatedSchedules = [...prevSchedules]
      updatedSchedules[index][field] = value
      return updatedSchedules
    })
    validateField(index, field, value)
  }

  const handleDeleteSchedule = (index) => {}

  const handleSaveSchedules = async () => {
    if (!validateFields(editedSchedules)) {
      alert('Corrija los errores antes de guardar.', 'warning')
      return
    }

    const schedules = [...consistentSchedules, ...editedSchedules].map((schedule) => ({
      identification: schedule.identification,
      name: schedule.name,
      date: schedule.date,
      check_in: schedule.check_in,
      check_out: schedule.check_out,
      delays: schedule.delays,
      early_release: schedule.early_release,
      misses: schedule.misses,
      extras: schedule.extras,
    }))

    let groupedSchedules = await GroupBYIdentification(consistentSchedules, editedSchedules)
    let unifiedSchedules = await UnifyByIdentification(groupedSchedules, 1.5)
    setUnifiedSchedules(unifiedSchedules)
    setInitialLoad(true)
    console.log('los horarios unificados son ', unifiedSchedules)

    setProcessedSchedules([])
    setFiles([])

    try {
      // const response = await api.post('schedules', schedules, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('session_token')}` },
      // })

      alert('Horarios guardados exitosamente.', 'success')
    } catch (error) {
      console.error('Error al guardar los horarios:', error)
      alert('Error al guardar los horarios', 'error')
    }
  }

  const toggleEditMode = () => {
    setIsEditing((prev) => !prev)
    if (!isEditing) {
      validateFields(editedSchedules)
    }
  }

  const validateFields = (schedules) => {
    const errors = []
    schedules.forEach((schedule, index) => {
      let errorObj = {}

      if (!schedule.identification) {
        errorObj.identification = 'Identificación es obligatoria'
      }

      if (!schedule.name) {
        errorObj.name = 'Nombre es obligatorio'
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!schedule.date) {
        errorObj.date = 'Fecha es obligatoria'
      } else if (!dateRegex.test(schedule.date)) {
        errorObj.date = 'Formato de fecha inválido (Debe ser YYYY-MM-DD)'
      }

      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/
      if (!schedule.check_in) {
        errorObj.check_in = 'Hora de entrada es obligatoria'
      } else if (!timeRegex.test(schedule.check_in)) {
        errorObj.check_in = 'Formato de hora inválido (Debe ser HH:mm:ss)'
      }

      if (!schedule.check_out) {
        errorObj.check_out = 'Hora de salida es obligatoria'
      } else if (!timeRegex.test(schedule.check_out)) {
        errorObj.check_out = 'Formato de hora inválido (Debe ser HH:mm:ss)'
      }

      if (
        schedule.check_in &&
        schedule.check_out &&
        new Date(`1970-01-01T${schedule.check_in}`) >= new Date(`1970-01-01T${schedule.check_out}`)
      ) {
        errorObj.timeOrder = 'La hora de salida debe ser posterior a la hora de entrada'
      }

      errors[index] = errorObj
    })

    setScheduleErrors(errors)
    return errors.every((err) => Object.keys(err).length === 0)
  }

  const validateField = (index, field, value) => {
    const updatedErrors = [...scheduleErrors]
    const errorObj = updatedErrors[index] || {}

    switch (field) {
      case 'identification':
        if (!value) {
          errorObj.identification = 'Identificación es obligatoria'
        } else {
          delete errorObj.identification
        }
        break
      case 'name':
        if (!value) {
          errorObj.name = 'Nombre es obligatorio'
        } else {
          delete errorObj.name
        }
        break
      case 'date':
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!value) {
          errorObj.date = 'Fecha es obligatoria'
        } else if (!dateRegex.test(value)) {
          errorObj.date = 'Formato de fecha inválido (Debe ser YYYY-MM-DD)'
        } else {
          delete errorObj.date
        }
        break
      case 'check_in':
      case 'check_out':
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/
        if (!value) {
          errorObj[field] = `Hora de ${field === 'check_in' ? 'entrada' : 'salida'} es obligatoria`
        } else if (!timeRegex.test(value)) {
          errorObj[field] = 'Formato de hora inválido (Debe ser HH:mm:ss)'
        } else {
          delete errorObj[field]
        }
        if (
          field === 'check_in' &&
          editedSchedules[index]?.check_out &&
          new Date(`1970-01-01T${value}:00`) >=
            new Date(`1970-01-01T${editedSchedules[index].check_out}:00`)
        ) {
          errorObj.timeOrder = 'La hora de salida debe ser posterior a la hora de entrada'
        } else if (
          field === 'check_out' &&
          editedSchedules[index]?.check_in &&
          new Date(`1970-01-01T${editedSchedules[index].check_in}:00`) >=
            new Date(`1970-01-01T${value}:00`)
        ) {
          errorObj.timeOrder = 'La hora de salida debe ser posterior a la hora de entrada'
        } else {
          delete errorObj.timeOrder
        }
        break
      default:
        break
    }

    updatedErrors[index] = errorObj
    setScheduleErrors(updatedErrors)
  }

  const ConfirmSave = () => {
    if (!validateFields(editedSchedules)) {
      alert.confirmAction({
        mode: 'warning',
        message: 'Corrija los errores antes de guardar.',
        confirm: () => {}, // No necesita confirmación en este caso
        message2: '',
        valid: false, // No mostrar botón de confirmación
      })
      return
    }

    alert.confirmAction({
      mode: 'warning',
      message: '¿Está seguro de guardar los horarios?',
      confirm: handleSaveSchedules,
      message2: 'Horarios guardados exitosamente.',
      valid: true,
    })
  }

  const handleBlur = (index, field) => {
    const updatedSchedules = [...editedSchedules]
    validateField(index, field, updatedSchedules[index][field])
  }

  const handleLunchHoursChange = (id, value) => {
    setLunchHours((prevLunchHours) => ({
      ...prevLunchHours,
      [id]: value,
    }))
  }

  const handleSalaryPerHourChange = (id, value) => {
    setSalaryPerHour((prevSalaryPerHour) => ({
      ...prevSalaryPerHour,
      [id]: value,
    }))
  }

  const handleSalaryExtraChange = (id, value) => {
    setSalaryExtra((prevSalaryExtra) => ({
      ...prevSalaryExtra,
      [id]: value,
    }))
  }

  const handleCalculateSalary = async () => {
    //validar en este metodo que todos los salarios tanto por hora normal como extra esten. de lo contrario presenta un sweetalert
    const allSalariesPerHourValid = unifiedSchedules.every(
      (schedule) => salaryPerHour[schedule.identification] > 0,
    )

    if (!allSalariesPerHourValid) {
      alert.confirmAction({
        mode: 'warning',
        message: 'Debe ingresar el salario por hora para todos los usuarios',
        confirm: () => {}, // No necesita confirmación en este caso
        message2: '',
        valid: false, // No mostrar botón de confirmación
      })
      return
    }

    try {
      const salaries = await calculateSalary(unifiedSchedules, salaryPerHour)
      setUnifiedSchedules(salaries)
      setIsCalculating(true)
      console.log('Salarios calculados:', salaries)
      //mostrar un sweetalert con el mensaje de que los salarios fueron calculados hazlo cn .fire

      Swal.fire({
        title: 'Salarios calculados correctamente',
        icon: 'success',
        timer: 1000,
      })
    } catch (error) {
      console.error('Error al calcular los salarios:', error)
      alert('Error al calcular los salarios', 'error')
    }
  }

  const handleSaveUnifiedSchedules = async () => {
    if (isCalculating) {
      alert.confirmAction({
        mode: 'warning',
        message: '¿Está seguro de guardar los horarios unificados?',
        confirm: async () => {
          generatePDF(unifiedSchedules, salaryPerHour)
          await saveUnifiedSchedules()
          
        },
        message2: 'Horarios unificados guardados exitosamente.',
        valid: true,
      })
    } else {
      alert.confirmAction({
        mode: 'warning',
        message: 'Primero debe calcular los salarios antes de guardar los horarios unificados',
        confirm: () => {}, // No necesita confirmación en este caso
        message2: '',
        valid: false, // No mostrar botón de confirmación
      })
    }
  }

  const generatePDF = (unifiedSchedules, salaryPerHour) => {
    const doc = new jsPDF()
  
    // Agregar el logo y el título
    doc.addImage(taller, 'PNG', 10, 10, 40, 10)
    doc.setFontSize(14)
    doc.setTextColor(40, 40, 40)
    doc.setFont('helvetica', 'bold')
    doc.text('Detalles de la Nómina', 80, 35)

    //fecha de emision
    doc.setFontSize(10)
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 150, 15)
  
    // Configuración de la tabla
    const startX = 10
    const startY = 50
    const rowHeight = 10
    const colWidths = [40, 33, 30, 30, 30, 35]
  
    // Encabezados de la tabla
    const headers = [
      'Nombre Usuario',
      'Horas Trabajadas',
      'Horas Extra',
      'C. Hora Ord.',
      'C. Hora Ext.',
      'Salario',
    ]
  
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
  
    let xPosition = startX
    doc.setFillColor(50, 50, 150) // Azul oscuro para encabezados
    doc.setTextColor(255, 255, 255) // Texto blanco
    doc.rect(startX, startY - rowHeight, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F') // Fondo
  
    headers.forEach((header, index) => {
      doc.text(header, xPosition + 2, startY - 2)
      xPosition += colWidths[index]
    })
  
    // Agregar filas de datos con estilo
    let yPosition = startY
    unifiedSchedules.forEach((schedule, rowIndex) => {
      if (yPosition > 290 - rowHeight) {
        doc.addPage()
        yPosition = 20
      }
  
      const isEvenRow = rowIndex % 2 === 0
      doc.setFillColor(isEvenRow ? 230 : 250, isEvenRow ? 230 : 250, 250) // Alternar colores de filas
      doc.rect(startX, yPosition, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F')
  
      doc.setTextColor(0, 0, 0) // Color negro para texto
      doc.setFont('helvetica', 'normal')
  
      const data = [
        schedule.name,
        schedule.hoursWorked.toFixed(2),
        schedule.extraHours.toFixed(2),
        salaryPerHour[schedule.identification]?.toFixed(0) || '0.00',
        ((salaryPerHour[schedule.identification] || 0) * 1.5).toFixed(0),
        schedule.salary ? schedule.salary.toFixed(2) : '0.00',
      ]
  
      xPosition = startX
      data.forEach((text, index) => {
        if (index >= 3 && index <= 5) {
          // Agregar la imagen del símbolo de colón antes del texto
          doc.addImage(colonSymbol, 'PNG', xPosition + 4, yPosition + 5.5, 3, 3)
          doc.text(text, xPosition + 8, yPosition + rowHeight - 2)
        } else {
          doc.text(text, xPosition + 2, yPosition + rowHeight - 2)
        }
        xPosition += colWidths[index]
      })
  
      yPosition += rowHeight
    })
  
    doc.save('nomina.pdf')
  }


  const saveUnifiedSchedules = async () => {
    try {
     const response = await addSchedules(unifiedSchedules, salaryPerHour)
      console.log('Horarios unificados guardados:', unifiedSchedules)
      alert('Horarios unificados guardados exitosamente.', 'success')
    } catch (error) {
      console.error('Error al guardar los horarios unificados:', error)
      alert('Error al guardar los horarios unificados', 'error')
    }
  }

  //nuevos handle-----------------------------------------------------------------------------------------------------------------------
  const handleEditDetailFieldTemp = (identification, detailIndex, field, value) => {
    setTempDetailedSchedules((prevDetails) => {
      const updatedDetails = { ...prevDetails }
      if (!updatedDetails[identification]) {
        updatedDetails[identification] = [...detailedSchedules[identification]]
      }
      updatedDetails[identification][detailIndex][field] = value

      // Validaciones
      const checkInTime = new Date(
        `1970-01-01T${updatedDetails[identification][detailIndex].check_in}Z`,
      )
      const checkOutTime = new Date(
        `1970-01-01T${updatedDetails[identification][detailIndex].check_out}Z`,
      )
      const workedHours = (checkOutTime - checkInTime) / (1000 * 60 * 60)
      const lunchHours =
        updatedDetails[identification][detailIndex].lunchHours !== undefined
          ? updatedDetails[identification][detailIndex].lunchHours
          : 1.5

      const errors = { ...detailErrors }
      if (checkOutTime <= checkInTime) {
        errors[identification] = errors[identification] || {}
        errors[identification][detailIndex] = errors[identification][detailIndex] || {}
        errors[identification][detailIndex].timeOrder =
          'La hora de salida debe ser posterior a la hora de entrada'
      } else {
        if (errors[identification] && errors[identification][detailIndex]) {
          delete errors[identification][detailIndex].timeOrder
          if (Object.keys(errors[identification][detailIndex]).length === 0) {
            delete errors[identification][detailIndex]
          }
        }
      }

      if (lunchHours > workedHours) {
        errors[identification] = errors[identification] || {}
        errors[identification][detailIndex] = errors[identification][detailIndex] || {}
        errors[identification][detailIndex].lunchHours =
          'Las horas de almuerzo no pueden ser superiores a las horas trabajadas'
      } else {
        if (errors[identification] && errors[identification][detailIndex]) {
          delete errors[identification][detailIndex].lunchHours
          if (Object.keys(errors[identification][detailIndex]).length === 0) {
            delete errors[identification][detailIndex]
          }
        }
      }

      setDetailErrors(errors)
      return updatedDetails
    })
  }

  const handleLunchHoursChangeDetailTemp = (identification, detailIndex, value) => {
    setTempDetailedSchedules((prevDetails) => {
      const updatedDetails = { ...prevDetails }
      if (!updatedDetails[identification]) {
        updatedDetails[identification] = [...detailedSchedules[identification]]
      }
      updatedDetails[identification][detailIndex].lunchHours = value

      // Validaciones
      const checkInTime = new Date(
        `1970-01-01T${updatedDetails[identification][detailIndex].check_in}Z`,
      )
      const checkOutTime = new Date(
        `1970-01-01T${updatedDetails[identification][detailIndex].check_out}Z`,
      )
      const workedHours = (checkOutTime - checkInTime) / (1000 * 60 * 60)

      const errors = { ...detailErrors }
      if (value > workedHours) {
        errors[identification] = errors[identification] || {}
        errors[identification][detailIndex] = errors[identification][detailIndex] || {}
        errors[identification][detailIndex].lunchHours =
          'Las horas de almuerzo no pueden ser superiores a las horas trabajadas'
      } else {
        if (errors[identification] && errors[identification][detailIndex]) {
          delete errors[identification][detailIndex].lunchHours
          if (Object.keys(errors[identification][detailIndex]).length === 0) {
            delete errors[identification][detailIndex]
          }
        }
      }

      setDetailErrors(errors)
      return updatedDetails
    })
  }

  const handleSaveDetailChanges = (identification) => {
    Swal.fire({
      title: '¿Desea guardar estos cambios?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedDetails = tempDetailedSchedules[identification].map((detail) => {
          const checkInTime = new Date(`1970-01-01T${detail.check_in}Z`)
          const checkOutTime = new Date(`1970-01-01T${detail.check_out}Z`)
          const workedHours = (checkOutTime - checkInTime) / (1000 * 60 * 60)
          const netWorkedHours =
            workedHours - (detail.lunchHours !== undefined ? detail.lunchHours : 1.5)

          return {
            ...detail,
            hoursWorked: netWorkedHours > 9.6 ? 9.6 : netWorkedHours,
            extraHours: netWorkedHours > 9.6 ? netWorkedHours - 9.6 : 0,
          }
        })

        setDetailedSchedules((prevDetails) => ({
          ...prevDetails,
          [identification]: updatedDetails,
        }))

        setTempDetailedSchedules((prevDetails) => ({
          ...prevDetails,
          [identification]: updatedDetails,
        }))

        setVisibleDetails((prevVisibleDetails) => ({
          ...prevVisibleDetails,
          [identification]: false,
        }))

        // Actualizar el vector principal
        // Limpiar el campo de salarios para que tenga que volver a pulsar el botón de calcular salario
        setIsCalculating(false)

        setUnifiedSchedules((prevSchedules) =>
          prevSchedules.map((schedule) =>
            schedule.identification === identification
              ? {
                  ...schedule,
                  hoursWorked: updatedDetails.reduce((acc, detail) => acc + detail.hoursWorked, 0),
                  extraHours: updatedDetails.reduce((acc, detail) => acc + detail.extraHours, 0),
                  salary: 0,
                }
              : schedule,
          ),
        )
      }
    })
  }

  const handleCloseDetail = (identification) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Limpiar el vector de errores de los detalles
        // setDetailErrors((prevErrors) => {
        //   const updatedErrors = { ...prevErrors }
        //   delete updatedErrors[identification]
        //   return updatedErrors
        // })

        console.log('cerrandooo detalleeees')

        // Vaciar el vector temporal para este identificador
        setTempDetailedSchedules((prevTempDetails) => {
          const updatedTempDetails = { ...prevTempDetails }
          delete updatedTempDetails[identification]
          return updatedTempDetails
        })

        // Actualizar el estado de visibilidad
        setVisibleDetails((prevVisibleDetails) => ({
          ...prevVisibleDetails,
          [identification]: false,
        }))
      }
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
                      <CButton color="danger" size="sm" onClick={() => handleRemoveFile(index)}>
                        Eliminar
                      </CButton>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {processedSchedules.length > 0 ? (
              <div className="mt-3">
                <h5>Horarios Procesados:</h5>
                <CTable striped bordered hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Identificación</CTableHeaderCell>
                      <CTableHeaderCell>Nombre Usuario</CTableHeaderCell>
                      <CTableHeaderCell>Fecha</CTableHeaderCell>
                      <CTableHeaderCell>Hora Entrada</CTableHeaderCell>
                      <CTableHeaderCell>Hora Salida</CTableHeaderCell>
                      <CTableHeaderCell>Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {processedSchedules.map((schedule, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>
                          <CFormInput
                            value={
                              editedSchedules[index]?.identification ??
                              schedule.identification ??
                              ''
                            }
                            onChange={(e) =>
                              handleEditField(index, 'identification', e.target.value)
                            }
                            onBlur={() => handleBlur(index, 'identification')}
                            className={
                              isEditing && scheduleErrors[index]?.identification ? 'is-invalid' : ''
                            }
                            disabled={!isEditing}
                          />
                          {scheduleErrors[index]?.identification && (
                            <div className="text-danger">
                              {scheduleErrors[index].identification}
                            </div>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CFormInput
                            value={editedSchedules[index]?.name ?? schedule.name ?? ''}
                            onChange={(e) => handleEditField(index, 'name', e.target.value)}
                            onBlur={() => handleBlur(index, 'name')}
                            className={isEditing && scheduleErrors[index]?.name ? 'is-invalid' : ''}
                            disabled={!isEditing}
                          />
                          {scheduleErrors[index]?.name && (
                            <div className="text-danger">{scheduleErrors[index].name}</div>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CFormInput
                            value={editedSchedules[index]?.date ?? schedule.date ?? ''}
                            onChange={(e) => handleEditField(index, 'date', e.target.value)}
                            onBlur={() => handleBlur(index, 'date')}
                            className={isEditing && scheduleErrors[index]?.date ? 'is-invalid' : ''}
                            disabled={!isEditing}
                          />
                          {scheduleErrors[index]?.date && (
                            <div className="text-danger">{scheduleErrors[index].date}</div>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CFormInput
                            value={editedSchedules[index]?.check_in ?? schedule.check_in ?? ''}
                            onChange={(e) => handleEditField(index, 'check_in', e.target.value)}
                            onBlur={() => handleBlur(index, 'check_in')}
                            className={
                              isEditing && scheduleErrors[index]?.check_in ? 'is-invalid' : ''
                            }
                            disabled={!isEditing}
                          />
                          {scheduleErrors[index]?.check_in && (
                            <div className="text-danger">{scheduleErrors[index].check_in}</div>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CFormInput
                            value={editedSchedules[index]?.check_out ?? schedule.check_out ?? ''}
                            onChange={(e) => handleEditField(index, 'check_out', e.target.value)}
                            onBlur={() => handleBlur(index, 'check_out')}
                            className={
                              isEditing && scheduleErrors[index]?.check_out ? 'is-invalid' : ''
                            }
                            disabled={!isEditing}
                          />
                          {scheduleErrors[index]?.check_out && (
                            <div className="text-danger">{scheduleErrors[index].check_out}</div>
                          )}
                          {scheduleErrors[index]?.timeOrder && (
                            <div className="text-danger">{scheduleErrors[index].timeOrder}</div>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="danger"
                            size="xs"
                            onClick={() => handleDeleteSchedule(index)}
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
                <CButton
                  color="success"
                  className="mt-3"
                  onClick={ConfirmSave}
                  disabled={isEditing}
                >
                  Guardar Horarios
                </CButton>
              </div>
            ) : (
              consistentSchedules.length > 0 && (
                <div className="mt-3">
                  <h5>No hay horarios incorrectos</h5>
                </div>
              )
            )}

            {unifiedSchedules.length > 0 && (
              <div className="mt-3" id="unified-schedules-table">
                <h5>Horarios Unificados:</h5>
                <CTable striped bordered hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Nombre Usuario</CTableHeaderCell>
                      <CTableHeaderCell>Horas Trabajadas Totales</CTableHeaderCell>
                      <CTableHeaderCell>Horas Extra Totales</CTableHeaderCell>
                      <CTableHeaderCell>Costo por Hora Ordinaria</CTableHeaderCell>
                      <CTableHeaderCell>Costo por Hora Extra</CTableHeaderCell>
                      <CTableHeaderCell>Salario</CTableHeaderCell>
                      <CTableHeaderCell>Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {unifiedSchedules.map((schedule, index) => (
                      <>
                        <CTableRow key={index}>
                          <CTableDataCell>{schedule.name}</CTableDataCell>
                          <CTableDataCell>{schedule.hoursWorked.toFixed(2)}</CTableDataCell>
                          <CTableDataCell>{schedule.extraHours.toFixed(2)}</CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              type="number"
                              min="0"
                              value={salaryPerHour[schedule.identification] || ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value)
                                handleSalaryPerHourChange(
                                  schedule.identification,
                                  value >= 0 ? value : 0,
                                )
                              }}
                              onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e') {
                                  e.preventDefault()
                                }
                              }}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            ₡{salaryPerHour[schedule.identification] * 1.5 || '0'}
                          </CTableDataCell>
                          <CTableDataCell>
                            ₡{schedule.salary ? schedule.salary.toFixed(2) : '0.00'}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              color="info"
                              onClick={() => handleViewDetails(schedule.identification)}
                            >
                              Ver Desgloce
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                        {visibleDetails[schedule.identification] && (
                          <CTableRow>
                            <CTableDataCell colSpan="8">
                              <CTable striped bordered hover responsive>
                                <CTableHead>
                                  <CTableRow>
                                    <CTableHeaderCell>Fecha</CTableHeaderCell>
                                    <CTableHeaderCell>Hora Entrada</CTableHeaderCell>
                                    <CTableHeaderCell>Hora Salida</CTableHeaderCell>
                                    <CTableHeaderCell>Horas Almuerzo</CTableHeaderCell>
                                    <CTableHeaderCell>Horas Trabajadas</CTableHeaderCell>
                                    <CTableHeaderCell>Horas Extra</CTableHeaderCell>
                                  </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                  {tempDetailedSchedules[schedule.identification]?.map(
                                    (detail, detailIndex) => (
                                      <CTableRow key={detailIndex}>
                                        <CTableDataCell>{detail.date}</CTableDataCell>
                                        <CTableDataCell>
                                          <CFormInput
                                            type="time"
                                            value={detail.check_in || ''}
                                            onChange={(e) =>
                                              handleEditDetailFieldTemp(
                                                schedule.identification,
                                                detailIndex,
                                                'check_in',
                                                e.target.value,
                                              )
                                            }
                                          />
                                          {detailErrors[schedule.identification]?.[detailIndex]
                                            ?.timeOrder && (
                                            <div className="text-danger">
                                              {
                                                detailErrors[schedule.identification][detailIndex]
                                                  .timeOrder
                                              }
                                            </div>
                                          )}
                                        </CTableDataCell>
                                        <CTableDataCell>
                                          <CFormInput
                                            type="time"
                                            value={detail.check_out || ''}
                                            onChange={(e) =>
                                              handleEditDetailFieldTemp(
                                                schedule.identification,
                                                detailIndex,
                                                'check_out',
                                                e.target.value,
                                              )
                                            }
                                          />
                                          {detailErrors[schedule.identification]?.[detailIndex]
                                            ?.timeOrder && (
                                            <div className="text-danger">
                                              {
                                                detailErrors[schedule.identification][detailIndex]
                                                  .timeOrder
                                              }
                                            </div>
                                          )}
                                        </CTableDataCell>
                                        <CTableDataCell>
                                          <CFormInput
                                            type="number"
                                            min="0"
                                            value={
                                              tempDetailedSchedules[schedule.identification]?.[
                                                detailIndex
                                              ]?.lunchHours !== undefined
                                                ? tempDetailedSchedules[schedule.identification][
                                                    detailIndex
                                                  ].lunchHours
                                                : 1.5
                                            }
                                            onChange={(e) =>
                                              handleLunchHoursChangeDetailTemp(
                                                schedule.identification,
                                                detailIndex,
                                                parseFloat(e.target.value),
                                              )
                                            }
                                          />
                                          {detailErrors[schedule.identification]?.[detailIndex]
                                            ?.lunchHours && (
                                            <div className="text-danger">
                                              {
                                                detailErrors[schedule.identification][detailIndex]
                                                  .lunchHours
                                              }
                                            </div>
                                          )}
                                        </CTableDataCell>
                                        <CTableDataCell>{detail.hoursWorked}</CTableDataCell>
                                        <CTableDataCell>{detail.extraHours}</CTableDataCell>
                                      </CTableRow>
                                    ),
                                  )}
                                </CTableBody>
                              </CTable>
                              <div className="mt-3">
                                <CButton
                                  color="success"
                                  onClick={() => handleSaveDetailChanges(schedule.identification)}
                                  disabled={Object.keys(detailErrors).some(
                                    (key) => Object.keys(detailErrors[key]).length > 0,
                                  )}
                                >
                                  Guardar cambios
                                </CButton>
                                <CButton
                                  color="danger"
                                  onClick={() => handleCloseDetail(schedule.identification)}
                                >
                                  Cerrar
                                </CButton>
                              </div>
                            </CTableDataCell>
                          </CTableRow>
                        )}
                      </>
                    ))}
                  </CTableBody>
                </CTable>
                <div className="mt-3">
                  <CButton color="success" onClick={handleSaveUnifiedSchedules}>
                    Guardar Horarios Unificados
                  </CButton>
                  <CButton color="primary" onClick={handleCalculateSalary}>
                    Calcular Salarios
                  </CButton>
                </div>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default UploadExcelSchedule
