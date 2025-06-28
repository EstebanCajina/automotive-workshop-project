import React from 'react';
import {
  CAvatar,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPeople } from '@coreui/icons';
import ConfirmRole from '../Auth/ConfirmRole';

const Table = ({ tableExample, titles, onEdit, onDelete, isActive }) => {
  const token = localStorage.getItem('accessToken');
  const currentUser = ConfirmRole.getUserFromToken(token);

  const validateUsers = () => {
    return tableExample.some((item) => item.is_active === isActive);
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          {!validateUsers() ? (

<CCardHeader>
<strong>No hay usuarios {isActive ? 'Habilitados' : 'Deshabilitados'}</strong>
</CCardHeader>

          
          ):(

            <CCardHeader>
            <strong>Tabla de usuarios {isActive ? 'Habilitados' : 'Deshabilitados'}</strong>
          </CCardHeader>
         
          )}

          {validateUsers() && (
          <CCardBody>
            <div className='mb-3' style={{ justifyContent: 'center', maxHeight: tableExample.length > 5 ? '300px' : 'auto', overflowY: 'auto' }}>
              <CTable striped bordered hover responsive >
                <CTableHead >
                  <CTableRow>
                    <CTableHeaderCell>
                      <CIcon icon={cilPeople} />
                    </CTableHeaderCell>
                    {titles.map((title, index) => (
                      <CTableHeaderCell key={index}>
                        {title}
                      </CTableHeaderCell>
                    ))}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {tableExample
                    .filter(item => item.is_active === isActive)
                    .map((item, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>
                          <CAvatar size="md" src={"https://backend-gestion-de-proyectos.onrender.com/"+item.profile_picture} />
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className='mb-3'>{item.username}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className='mb-3'>{item.role}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className='mb-3'>{item.is_active ? 'activo' : 'inactivo'}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          {isActive && (
                            <CButton
                              color="warning"
                              size="xs"
                            
                              onClick={() => onEdit(item)}
                            >
                              Editar
                            </CButton>
                          )}
                          {currentUser?.id !== item.id ? (
                            <CButton
                              color={item.is_active ? "danger" : "success"}
                              size="xs"
                              onClick={() => onDelete(item)}
                            >
                              {item.is_active ? "Deshabilitar" : 'Habilitar'}
                            </CButton>
                          ):(
                            <span>Tu cuenta</span>
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
          )}
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Table;