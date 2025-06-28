import React, { useState, useEffect } from 'react';
import api from '../../components/Auth/AxiosConfig'; // Asegúrate de importar el módulo de API
import { CForm, CFormInput, CFormLabel, CButton, CCard, CCardBody, 
  CCardHeader, CCol, CRow,} from '@coreui/react';

const Forms_Vehiculos = ({ vehicle, handleClose, onAdd }) => {
  const initialFormData = {
    region: '',
    dependency: '',
    plate: '',
    asset_code: '',
    heritage: '',
    brand: '',
    style: '',
    model_year: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [initialPlate, setInitialPlate] = useState(''); // Estado para almacenar la placa inicial

  const labels = {
    region: "Región",
    dependency: "Dependencia",
    plate: "Placa",
    asset_code: "Código",
    heritage: "Patrimonio",
    brand: "Marca",
    style: "Estilo",
    model_year: "Modelo"
  };

  useEffect(() => {
    if (vehicle) {
      setFormData({
        region: vehicle.region || '',
        dependency: vehicle.dependency || '',
        plate: vehicle.plate || '',
        asset_code: vehicle.asset_code || '',
        heritage: vehicle.heritage || '',
        brand: vehicle.brand || '',
        style: vehicle.style || '',
        model_year: vehicle.model_year || ''
      });
      setInitialPlate(vehicle.plate || ''); // Guardar la placa inicial
    } else {
      setFormData(initialFormData);
      setInitialPlate(''); // Guardar la placa inicial
    }
    setErrors({});
  }, [vehicle]);

  // Limpiar los errores
  const clearErrors = () => {
    setErrors({});
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    let error = null;

    if (value.trim() !== value) {
      error = `${labels[name]} no puede empezar o terminar con espacios en blanco.`;
    } else if (!value) {
      error = `${labels[name]} es obligatorio.`;
    } else {
      error = null;
    }

    if (name === 'plate' && value !== initialPlate) {
      try {
        const response = await api.get(`vehicles/check/${value}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });

        if (response.data.exists) {
          error = "La placa ya existe.";
        }
      } catch (error) {
        console.error('Error al verificar la placa:', error);
        error = "Error al verificar la placa.";
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = `${labels[key]} es obligatorio.`;
      }
    });
    const combinedErrors = { ...errors, ...newErrors };
    const filteredErrors = Object.fromEntries(
      Object.entries(combinedErrors).filter(([_, value]) => value !== null)
    );

    setErrors(filteredErrors);

    if (Object.keys(filteredErrors).length === 0) {
      onAdd(formData);
    }
  };

  const handleCloseModal = () => {
    handleClose();
    clearErrors(); // Limpiar los errores al cerrar el modal
    setFormData(initialFormData); // Limpiar los datos del formulario al cerrar el modal
  };

  return (
    <CCard className="mb-3">
      <CCardHeader>
        <h4 style={{ textAlign: 'center', width: '100%' }}>{vehicle ? 'Editar' : 'Agregar'} Vehículo</h4>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          {/* Región */}
          <CRow className="mb-3">
            <CCol>
              <CFormLabel>Región:</CFormLabel>
              <CFormInput
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className={errors.region ? 'is-invalid' : ''}
              />
              {errors.region && <div className="invalid-feedback">{errors.region}</div>}
            </CCol>
          </CRow>

          {/* Dependencia */}
          <CRow className="mb-3">
            <CCol>
              <CFormLabel>Dependencia:</CFormLabel>
              <CFormInput
                type="text"
                name="dependency"
                value={formData.dependency}
                onChange={handleChange}
                className={errors.dependency ? 'is-invalid' : ''}
              />
              {errors.dependency && <div className="invalid-feedback">{errors.dependency}</div>}
            </CCol>
          </CRow>

          {/* Placa */}
          <CRow className="mb-3">
            <CCol>
              <CFormLabel>Placa:</CFormLabel>
              <CFormInput
                type="text"
                name="plate"
                value={formData.plate}
                onChange={handleChange}
                className={errors.plate ? 'is-invalid' : ''}
              />
              {errors.plate && <div className="invalid-feedback">{errors.plate}</div>}
            </CCol>
          </CRow>

          {/* Código */}
          <CRow className="mb-3">
            <CCol>
              <CFormLabel>Código:</CFormLabel>
              <CFormInput
                type="text"
                name="asset_code"
                value={formData.asset_code}
                onChange={handleChange}
                className={errors.asset_code ? 'is-invalid' : ''}
              />
              {errors.asset_code && <div className="invalid-feedback">{errors.asset_code}</div>}
            </CCol>
          </CRow>

          {/* Patrimonio */}
          <CRow className="mb-3">
            <CCol>
              <CFormLabel>Patrimonio:</CFormLabel>
              <CFormInput
                type="text"
                name="heritage"
                value={formData.heritage}
                onChange={handleChange}
                className={errors.heritage ? 'is-invalid' : ''}
              />
              {errors.heritage && <div className="invalid-feedback">{errors.heritage}</div>}
            </CCol>
          </CRow>

          {/* Marca */}
          <CRow className="mb-3">
            <CCol>
              <CFormLabel>Marca:</CFormLabel>
              <CFormInput
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className={errors.brand ? 'is-invalid' : ''}
              />
              {errors.brand && <div className="invalid-feedback">{errors.brand}</div>}
            </CCol>
          </CRow>

          {/* Estilo */}
          <CRow className="mb-3">
            <CCol>
              <CFormLabel>Estilo:</CFormLabel>
              <CFormInput
                type="text"
                name="style"
                value={formData.style}
                onChange={handleChange}
                className={errors.style ? 'is-invalid' : ''}
              />
              {errors.style && <div className="invalid-feedback">{errors.style}</div>}
            </CCol>
          </CRow>

          {/* Modelo */}
          <CRow className="mb-3">
            <CCol>
              <CFormLabel>Modelo:</CFormLabel>
              <CFormInput
                type="text"
                name="model_year"
                value={formData.model_year}
                onChange={handleChange}
                className={errors.model_year ? 'is-invalid' : ''}
              />
              {errors.model_year && <div className="invalid-feedback">{errors.model_year}</div>}
            </CCol>
          </CRow>

          {/* Submit Button */}
          <CRow>
            <CCol>
              <CButton type="submit" color="primary">
                {vehicle ? 'Guardar Cambios' : 'Agregar Vehículo'}
              </CButton>
             
                <CButton type="button" color="secondary" onClick={handleCloseModal} className="ms-2">
                  Cancelar
                </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default Forms_Vehiculos;