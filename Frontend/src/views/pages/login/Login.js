import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../components/Auth/AxiosConfig'
import SweetAlert from '../../../components/sweetalert/SweetAlert'
import { login } from '../../../services/UserService'
import {
  CContainer,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CForm,
  CFormInput,
  CButton,
  CImage,
} from '@coreui/react'

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      await login(formData)
      navigate('/dashboard')
    } catch (error) {
      console.log(error)
      SweetAlert.confirmAction({
        mode: 'error',
        message: 'Error al iniciar sesión',
        confirm: () => {},
        message2: null,
        valid: false, 
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  return (
    <CContainer className="d-flex justify-content-center align-items-center vh-100">
      <CCard className="shadow-lg border-0" style={{ maxWidth: '900px', borderRadius: '15px' }}>
        <CRow className="g-0">
          {/* Imagen del lado izquierdo */}
          <CCol md={6}>
            <CImage
              src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
              alt="login form"
              className="w-100 h-100 rounded-start"
              style={{ objectFit: 'cover' }}
            />
          </CCol>

          {/* Formulario del lado derecho */}
          <CCol md={6}>
            <CCardBody className="d-flex flex-column">
              <div className="d-flex flex-row align-items-center mt-2 mb-4">
                <i className="bi bi-cube me-3" style={{ fontSize: '2rem', color: '#ff6219' }}></i>
                <h1 className="fw-bold mb-0">Logo</h1>
              </div>

              <h5 className="fw-normal my-4 pb-3" style={{ letterSpacing: '1px' }}>
                Ingresa con tu cuenta
              </h5>

              <CForm>
                <CFormInput
                  className="mb-4"
                  label="Nombre de usuario"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ingresa tu nombre de usuario"
                  size="lg"
                />
                <CFormInput
                  className="mb-4"
                  label="Contraseña"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  size="lg"
                />

                <CButton
                  className="mb-4 w-100"
                  color="primary"
                  size="lg"
                  onClick={handleLogin}
                  style={{ height: '50px' }}
                >
                  Login
                </CButton>
              </CForm>

              <a className="small text-muted" href="#!">
                ¿Olvidaste tu contraseña?
              </a>
            </CCardBody>
          </CCol>
        </CRow>
      </CCard>
    </CContainer>
  )
}

export default Login
