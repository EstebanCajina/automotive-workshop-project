/* eslint-disable prettier/prettier */
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/table/Table';
import Forms_Usuarios from '../../components/forms/Forms_Usuarios';
import alerts from '../../components/sweetalert/SweetAlert';
import ConfirmRole from '../../components/Auth/ConfirmRole';
import { getUsers } from '../../services/UserService';
import { addUser } from '../../services/UserService';
import { deleteUser } from '../../services/UserService';
import { updateUser } from '../../services/UserService';
import { verifyExistentUserName } from '../../services/UserService';
import { updateProfilePicture } from '../../services/UserService';


const Users = () => {
  const [showModal, setShowModal] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const formRef = useRef(null); // Referencia para el formulario

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userRole = ConfirmRole.getRoleFromToken(token);
    console.log('validando el rol', userRole);
    if (userRole !== 'Administrador') {
      navigate('/dashboard');
    } else {
      fetchUsers();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      console.log('El token obtenido es', localStorage.getItem('accessToken'));
      const response = await getUsers();
      setUsers(response);
    } catch (error) {
      console.error(error);
    }
  };

  const topNames = {
    names: ['Usuario', 'Rol', 'Estado', 'Acciones'],
  };

  const roles = ['Conserge', 'Cliente', 'Secretario', 'Mecanico', 'Administrador'];

  const verifyExistentUser = async (name) => {
    try {
      const response = await verifyExistentUserName(name);
      return response.isRepeat;
    } catch (error) {
      console.error('Error al verificar el usuario:', error.message);
      return false;
    }
  };

  const ConfirmDelete = (user) => {
    if (user.is_active) {
      alerts.confirmAction({
        mode: 'warning',
        message: `¿Estás seguro de deshabilitar al usuario ${user.username}?`,
        confirm: () => handleDeleteUser(user),
        message2: 'Usuario deshabilitado correctamente',
        valid: true,
      });
    } else {
      alerts.confirmAction({
        mode: 'warning',
        message: `¿Estás seguro de habilitar al usuario ${user.username}?`,
        confirm: () => handleRenewUser(user),
        message2: 'Usuario habilitado correctamente',
        valid: true,
      });
    }
  };

  const handleRenewUser = async (user) => {
    console.log('Renovando usuario', user.username);
    user.is_active = true;
    try {
      await updateUser(user.id, user);
      console.log('Usuario renovado correctamente');
      window.location.reload();
    } catch (error) {
      console.error('Error al renovar el usuario:', error.message);
    }
  };

  const ConfirmEditOrAdd = (verify, user) => {
    console.log('Verificando usuario', user);
    if (selectedUser) {
      alerts.confirmAction({
        mode: 'warning',
        message: `¿Estás seguro de editar a ${user.username}?`,
        confirm: () => handleAddUser(verify, user),
        message2: 'Usuario editado correctamente',
        valid: true,
      });
    } else {
      alerts.confirmAction({
        mode: 'warning',
        message: `¿Estás seguro de agregar a ${user.username}?`,
        confirm: () => handleAddUser(verify, user),
        message2: 'Usuario agregado correctamente',
        valid: true,
      });
    }
  };

  const handleDeleteUser = async (user) => {
    console.log('Eliminando usuario', user.username);
    try {
      await deleteUser(user.id);
     
      console.log('Usuario eliminado correctamente');
      window.location.reload();
    } catch (error) {
      console.error('Error al eliminar el usuario:', error.message);
    }
  };

  const handleAddUser = async (verify, user) => {
    if (verify) {
      if (selectedUser) {
        console.log('Editando usuario', selectedUser.username);
        try {
          await updateUser(selectedUser.id, user);
         

          if (user.profileFile) {
            const formData = new FormData();
            formData.append('profile_picture', user.profileFile);
await updateProfilePicture(selectedUser.id, user.profileFile);
           
          }

          window.location.reload();
        } catch (error) {
          console.error('Error al editar el usuario:', error.message);
        }
      } else {
        console.log('Agregando usuario');
        try {
          
          const response = await addUser(user);
          const newUserId = response.userId;

          if (user.profileFile) {
            const formData = new FormData();
            formData.append('profile_picture', user.profileFile);
await updateProfilePicture(newUserId, user.profileFile);
            
          }

          window.location.reload();
          console.log('Usuario agregado correctamente', response.data);
          setUsers([...users, response.data]);
        } catch (error) {
          console.error('Error al agregar el usuario:', error.message);
        }
      }
    } else {
      console.log('Error en la validación');
    }

  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
    console.log('Editando usuario', user);

    // Mueve el foco al formulario
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstInput = formRef.current.querySelector('input, select, textarea');
      if (firstInput) {
        firstInput.focus();
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(true);
    setSelectedUser(null);
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Gestión de Usuarios</strong>
          </CCardHeader>
          <CCardBody>
          <CRow className="mb-3" ref={formRef}>
              <CCol>
                <Forms_Usuarios
                  user={selectedUser}
                  handleClose={handleCloseModal}
                  allRols={roles}
                  onAdd={ConfirmEditOrAdd}
                  validName={verifyExistentUser}
                  
                />
              </CCol>
            </CRow>
            <CRow className="mb-3" style={{ marginTop: '120px', marginBottom: '120px', justifyContent: 'center' }}>
              <CCol>
                <Table tableExample={users} titles={topNames.names} onEdit={handleEditUser} onDelete={ConfirmDelete} isActive={true}/>
              </CCol>
            </CRow>
            <CRow className="mb-3" style={{ marginTop: '120px', marginBottom: '120px', justifyContent: 'center' }}>
              <CCol>
                <Table tableExample={users} titles={topNames.names} onEdit={handleEditUser} onDelete={ConfirmDelete} isActive={false}/>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Users;