import React, { useState, useEffect } from 'react';
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormCheck,
} from '@coreui/react';
import api from '../../components/Auth/AxiosConfig'; // Asegúrate de importar el módulo de API

const Forms_Maintenance = ({ maintenance, handleClose, onAdd }) => {
  const today = new Date().toISOString().split('T')[0];

  const initialFormData = {
    plate: '', // Cambiamos vehicle_id por plate
    issue_description: '',
    unit_mileage: '',
    mileage_date: today,
    requires_platform_transfer: false,
    under_warranty: false,
    mechanic_contact: '',
    mechanic_phone: '',
    observations: '',
    vehicle_id: null, // Agregamos vehicle_id al estado inicial
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [initialPlate, setInitialPlate] = useState(''); // Estado para almacenar la placa inicial

  const labels = {
    plate: "Placa", // Cambiamos vehicle_id por plate
    issue_description: "Descripción del Problema",
    unit_mileage: "Kilometraje",
    mileage_date: "Fecha de Medición",
    requires_platform_transfer: "Requiere Traslado",
    under_warranty: "En Garantía",
    mechanic_contact: "Contacto del Mecánico",
    mechanic_phone: "Teléfono del Mecánico",
    observations: "Observaciones",
  };

  useEffect(() => {
    if (maintenance) {
      setFormData({ ...initialFormData, ...maintenance });
      setInitialPlate(maintenance.plate || ''); // Guardar la placa inicial
    } else {
      setFormData(initialFormData);
      setInitialPlate(''); // Limpiar la placa inicial
    }
    setErrors({});
  }, [maintenance]);

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));

    let error = null;

    if (name === 'plate' && value !== initialPlate) {
      try {
        const response = await api.get(`vehicles/check/${value}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });

        if (!response.data.exists) {
          error = "La placa no existe.";
          setFormData((prevData) => ({
            ...prevData,
            vehicle_id: null, // Limpiar vehicle_id si la placa no existe
          }));
        } else {
          setFormData((prevData) => ({
            ...prevData,
            vehicle_id: response.data.id, // Asignar el vehicle_id si la placa existe
          }));
        }
      } catch (error) {
        console.error('Error al verificar la placa:', error);
        error = "Error al verificar la placa.";
      }
    }

    if (name === 'mileage_date' && value > today) {
      error = "No puedes seleccionar una fecha futura.";
    } else if (!value.trim() && name !== 'plate') {
      error = `${labels[name]} es obligatorio.`;
    } else if (name === 'unit_mileage' && value < 0) {
      error = `${labels[name]} no puede ser negativo.`;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
  
    // Validación de campos obligatorios, excepto placa si estamos editando
    Object.keys(formData).forEach((key) => {
      if (!formData[key] && typeof formData[key] !== 'boolean' && (key !== 'plate' || !maintenance)) {
        newErrors[key] = `${labels[key]} es obligatorio.`;
      }
    });
  
    // Validación de la fecha de kilometraje
    if (formData.mileage_date > today) {
      newErrors.mileage_date = "No puedes seleccionar una fecha futura.";
    }
  
    // Validación de la placa si no estamos editando
    if (!maintenance && errors.plate) {
      newErrors.plate = errors.plate;
    }
  
    setErrors(newErrors);
  
    if (Object.keys(newErrors).length === 0) {
      // Verificar que vehicle_id esté asignado
      if (!formData.vehicle_id) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          plate: "La placa no existe o no se ha asignado un vehicle_id.",
        }));
        return;
      }
  
      // Llamar a onAdd con el formData que incluye vehicle_id
      onAdd(formData);
    }
  };

  return (
    <CCard className="mb-3">
      <CCardHeader>
        <h4 style={{ textAlign: 'center' }}>{maintenance ? 'Editar' : 'Agregar'} Mantenimiento</h4>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          {Object.keys(initialFormData).map((key) => (
            <CRow className="mb-3" key={key}>
              <CCol>
                {/* No mostrar el campo de placa si se está editando */}
                {!maintenance && key === 'plate' && (
                  <>
                    <CFormLabel>{labels[key]}:</CFormLabel>
                    <CFormInput
                      type="text"
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      className={errors[key] ? 'is-invalid' : ''}
                    />
                    {errors[key] && <div className="invalid-feedback">{errors[key]}</div>}
                  </>
                )}

                {/* Mostrar los demás campos */}
                {key !== 'plate' && key !== 'vehicle_id' && (
                  <>
                    <CFormLabel>{labels[key]}:</CFormLabel>
                    {key === 'requires_platform_transfer' || key === 'under_warranty' ? (
                      <CFormCheck
                        name={key}
                        checked={formData[key]}
                        onChange={handleChange}
                        label={"\n"}
                      />
                    ) : key === 'mileage_date' ? (
                      <CFormInput
                        type="date"
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        max={today}
                        className={errors[key] ? 'is-invalid' : ''}
                      />
                    ) : key === 'unit_mileage' ? (
                      <CFormInput
                        type="number"
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        className={errors[key] ? 'is-invalid' : ''}
                      />
                    ) : (
                      <CFormInput
                        type="text"
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        className={errors[key] ? 'is-invalid' : ''}
                      />
                    )}
                    {errors[key] && <div className="invalid-feedback">{errors[key]}</div>}
                  </>
                )}
              </CCol>
            </CRow>
          ))}

          <CRow>
            <CCol>
              <CButton type="submit" color="primary" name='Add_Vehicle'>
                {maintenance ? 'Guardar Cambios' : 'Agregar Mantenimiento'}
              </CButton>
              {maintenance && (
                <CButton type="button" color="secondary" onClick={handleClose} className="ms-2">
                  Cancelar
                </CButton>
              )}
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default Forms_Maintenance;