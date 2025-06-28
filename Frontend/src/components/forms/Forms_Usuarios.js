import React, { useState, useEffect, useRef } from 'react';
import {
  CAvatar,
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

const Forms_Usuarios = ({ user, handleClose, allRols, onAdd, validName }) => {
  const [formData, setFormData] = useState({
    username: '',
    role: '',
    password: '',
    confirmPassword: '',
    profileFile: null,
    profile_picture: null,
    is_active: true,
  });

  const [initialUsername, setInitialUsername] = useState('');
  const [errors, setErrors] = useState({});
  const usernameRef = useRef(null);
  const roleRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const profileFileRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        role: user.role || '',
        password: '',
        confirmPassword: '',
        profileFile: user.profile_picture ? new File([user.profile_picture], 'avatar.jpg') : null,
        profilePicture: user.profile_picture || null,
        is_active: user.is_active || false,
      });
      console.log("la imagen es ", user.profile_picture)
      setInitialUsername(user.username || ''); // Guardar el nombre inicial
    } else {
      setFormData({
        username: '',
        role: '',
        password: '',
        confirmPassword: '',
        profileFile: null,
        profile_picture: null,
        is_active: true,
      });
      setInitialUsername(''); // Guardar el nombre inicial
    }
    
    setErrors({});
  }, [user]);

  const validateUsername = async (username) => {
    if (username.includes(' ')) {
      return 'El nombre de usuario no puede contener espacios en blanco.';
    } else if (username !== initialUsername) {
      try {
        const isValid = await validName(username);
        if (isValid) {
          return 'El nombre de usuario ya existe.';
        }
      } catch (error) {
        console.error('Error al verificar el nombre de usuario:', error);
        return 'Error al verificar el nombre de usuario.';
      }
    }
    return null;
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    } else if (password.includes(' ')) {
      return 'La contraseña no puede contener espacios en blanco.';
    }
    return null;
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden.';
    } else if (confirmPassword.includes(' ')) {
      return 'La contraseña no puede contener espacios en blanco.';
    }
    return null;
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    let error = null;
    if (name === 'username') {
      error = await validateUsername(value);
    } else if (name === 'password') {
      error = validatePassword(value);
    } else if (name === 'confirmPassword') {
      error = validateConfirmPassword(formData.password, value);
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedExtensions = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedExtensions.includes(file.type)) {
        setFormData((prevData) => ({
          ...prevData,
          profileFile: file,
          profile_picture: URL.createObjectURL(file),
        }));
        setErrors((prev) => ({ ...prev, profileFile: null }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          profileFile: null,
          profile_picture: null,
        }));
        setErrors((prev) => ({
          ...prev,
          profileFile: 'Solo se permiten archivos de imagen (JPG, PNG, GIF).',
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'El nombre de usuario es obligatorio.';
    if (!formData.role) newErrors.role = 'El rol es obligatorio.';
    if (!formData.profileFile) newErrors.profileFile = 'La foto de perfil es obligatoria.';

    if (!user) {
      if (!formData.password) newErrors.password = 'La contraseña es obligatoria.';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'La confirmación de la contraseña es obligatoria.';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden.';
      if (formData.password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Generar errores de validación del formulario
    const formErrors = validateForm();

    // Combinar los errores de eventos onBlur y los de validateForm
    const combinedErrors = { ...errors, ...formErrors };

    // Filtrar las claves con valores no nulos
    const filteredErrors = Object.fromEntries(
      Object.entries(combinedErrors).filter(([_, value]) => value !== null)
    );

    setErrors(filteredErrors); // Establecer solo los errores relevantes

    console.log("el valor de filteredErrors es ", filteredErrors);

    // Enfocar el primer input con error
    if (filteredErrors.username) {
      usernameRef.current.focus();
    } else if (filteredErrors.role) {
      roleRef.current.focus();
    } else if (filteredErrors.password) {
      passwordRef.current.focus();
    } else if (filteredErrors.confirmPassword) {
      confirmPasswordRef.current.focus();
    } else if (filteredErrors.profileFile) {
      profileFileRef.current.focus();
    }

    // Validar si todos los errores están vacíos
    if (Object.keys(filteredErrors).length === 0) {
      console.log('estoy vacio');
      onAdd(true, formData); // Llama a la función para agregar o editar el usuario
      console.log(formData); // Aquí puedes enviar los datos al backend o realizar la acción necesaria
    }
  };

  return (
    <CCard className="mb-3">
      <CCardHeader>
        <h4 style={{ textAlign: 'center' }}>{user ? 'Editar' : 'Agregar'} Usuario</h4>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-3">
            <CCol>
              <CFormLabel>Nombre de Usuario:</CFormLabel>
              <CFormInput
                type="text"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                value={formData.username}
                name="username"
                onChange={handleChange}
                ref={usernameRef}
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol>
              <CFormLabel>Rol:</CFormLabel>
              <CFormSelect
                className={`form-control ${errors.role ? 'is-invalid' : ''}`}
                value={formData.role}
                name="role"
                onChange={handleChange}
                ref={roleRef}
              >
                <option value="">Seleccione un rol</option>
                {allRols.map((rol, index) => (
                  <option key={index} value={rol}>
                    {rol}
                  </option>
                ))}
              </CFormSelect>
              {errors.role && <div className="invalid-feedback">{errors.role}</div>}
            </CCol>
          </CRow>

          {!user && (
            <>
              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Contraseña:</CFormLabel>
                  <CFormInput
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    value={formData.password}
                    name="password"
                    onChange={handleChange}
                    ref={passwordRef}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Confirmar Contraseña:</CFormLabel>
                  <CFormInput
                    type="password"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    value={formData.confirmPassword}
                    name="confirmPassword"
                    onChange={handleChange}
                    ref={confirmPasswordRef}
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </CCol>
              </CRow>
            </>
          )}

          <CRow className="mb-3">
            <CCol>
              <CFormLabel>Foto de Perfil:</CFormLabel>
              <CFormInput
                type="file"
                className={`form-control ${errors.profileFile ? 'is-invalid' : ''}`}
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
                ref={profileFileRef}
              />
              {errors.profileFile && <div className="invalid-feedback">{errors.profileFile}</div>}
            </CCol>
          </CRow>

          {formData.profile_picture ? (
            <CRow className="mb-3 text-center">
              <CCol>
                <CAvatar size="md" src={formData.profile_picture} status="success" />
              </CCol>
            </CRow>
          ) : user && user.profile_picture ? (
            <CRow className="mb-3 text-center">
              <CCol>
                <CAvatar size="md" src={"https://backend-gestion-de-proyectos.onrender.com/" + formData.profilePicture} status="success" />
              </CCol>
            </CRow>
          ) : null}

          <CRow>
            <CCol>
              <CButton type="submit" color="primary">
                {user ? 'Guardar Cambios' : 'Agregar Usuario'}
              </CButton>
              {user && (
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

export default Forms_Usuarios;