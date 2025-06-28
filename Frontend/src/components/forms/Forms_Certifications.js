import React, { useState, useEffect } from 'react';
import {
    CFormSelect,
    CForm,
    CFormInput,
    CFormLabel,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
} from '@coreui/react';

const Forms_Certifications = ({ certification, types, addOrEdit, onClose, file }) => {

    const [formData, setFormData] = useState({
        type: '',
        emission_date: '',
        expiration_date: '',
        emisory_entity: '',
        certificate_file: null,
    });
    const [change, setChange] = useState(false);
    const [errors, setErrors] = useState({});
    const [fileName, setFileName] = useState('');

    const fieldNames = {
        type: 'Tipo',
        emission_date: 'Fecha de emisión',
        expiration_date: 'Fecha de expiración',
        emisory_entity: 'Entidad emisora',
        certificate_file: 'Archivo',
    };

    useEffect(() => {
        if (certification) {
            setFormData({
                ...certification,
                certificate_file: file || null, // Set file if provided
            });
            setFileName(file ? file.name : (certification.certificate_file ? certification.certificate_file.name : ''));
        } else {
            setFormData({
                type: '',
                emission_date: '',
                expiration_date: '',
                emisory_entity: '',
                certificate_file: null,
            });
            setFileName('');
        }
        console.log(fileName);
        setErrors({});
    }, [certification, file]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type !== 'application/pdf') {
            setErrors((prevErrors) => ({
                ...prevErrors,
                certificate_file: 'Solo se permiten archivos PDF.',
            }));
        } else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                certificate_file: null,
            }));
            setFormData((prevData) => ({
                ...prevData,
                certificate_file: file,
            }));
            setFileName(file ? file.name : '');
        }
        setChange(true);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        let error = null;

        if (!value) {
            error = `${fieldNames[name]} es obligatorio.`;
        } else if (name === 'expiration_date' && formData.emission_date && value <= formData.emission_date) {
            error = 'La fecha de expiración debe ser mayor a la fecha de emisión.';
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
            if (!formData[key] && key !== 'certificate_file') {
                newErrors[key] = `${fieldNames[key]} es obligatorio.`;
            }
        });
        if (formData.expiration_date && formData.emission_date && formData.expiration_date <= formData.emission_date) {
            newErrors.expiration_date = 'La fecha de expiración debe ser mayor a la fecha de emisión.';
        }
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            const dataToSubmit = { ...formData };
            if (!formData.certificate_file) {
                delete dataToSubmit.certificate_file;
              
            }

if(!change){
    dataToSubmit.certificate_file=null;
    console.log("borrando")
}

            addOrEdit(dataToSubmit);
        }
    };

    return (
        <CCard>
            <CCardHeader>
                <h4 style={{ textAlign: 'center' }}>{certification ? 'Editar' : 'Agregar'} una certificación</h4>
            </CCardHeader>
            <CCardBody>
                <CForm onSubmit={handleSubmit}>
                    <CRow>
                        <CCol>
                            <CFormLabel>Tipo</CFormLabel>
                            <CFormSelect
                                value={formData.type}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                name="type"
                                className={errors.type ? 'is-invalid' : ''}
                            >
                                <option value="">Seleccione un tipo</option>
                                {types.map((type, index) => (
                                    <option key={index} value={type}>{type}</option>
                                ))}
                            </CFormSelect>
                            {errors.type && <div className="invalid-feedback">{errors.type}</div>}
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol>
                            <CFormLabel>Fecha de emisión</CFormLabel>
                            <CFormInput
                                type="date"
                                value={formData.emission_date}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                name="emission_date"
                                className={errors.emission_date ? 'is-invalid' : ''}
                            />
                            {errors.emission_date && <div className="invalid-feedback">{errors.emission_date}</div>}
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol>
                            <CFormLabel>Fecha de expiración</CFormLabel>
                            <CFormInput
                                type="date"
                                value={formData.expiration_date}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                name="expiration_date"
                                className={errors.expiration_date ? 'is-invalid' : ''}
                            />
                            {errors.expiration_date && <div className="invalid-feedback">{errors.expiration_date}</div>}
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol>
                            <CFormLabel>Entidad emisora</CFormLabel>
                            <CFormInput
                                type="text"
                                value={formData.emisory_entity}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                name="emisory_entity"
                                className={errors.emisory_entity ? 'is-invalid' : ''}
                            />
                            {errors.emisory_entity && <div className="invalid-feedback">{errors.emisory_entity}</div>}
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol>
                            <CFormLabel>Archivo</CFormLabel>
                            <CFormInput
                                type="file"
                                onChange={handleFileChange}
                                name="certificate_file"
                                className={errors.certificate_file ? 'is-invalid' : ''}
                            />
                            {fileName && <div className="mt-2">Archivo seleccionado: {fileName}</div>}
                            {errors.certificate_file && <div className="invalid-feedback">{errors.certificate_file}</div>}
                        </CCol>
                    </CRow>
                    <br />
                    <CRow>
                        <CCol>
                            <CButton color="primary" type="submit">
                                {certification ? 'Editar' : 'Agregar'}
                            </CButton>
                            <CButton color="secondary" onClick={onClose} className="ms-2">
                                Cancelar
                            </CButton>
                        </CCol>
                    </CRow>
                </CForm>
            </CCardBody>
        </CCard>
    );
};

export default Forms_Certifications;