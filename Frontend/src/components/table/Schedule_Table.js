import React from 'react';
import {
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

const ScheduleTable = ({ schedules, onEdit, onDelete }) => {
  const validateSchedules = () => {
    return schedules.length > 0;
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          {!validateSchedules() ? (
            <CCardHeader>
              <strong>No hay horarios disponibles</strong>
            </CCardHeader>
          ) : (
            <CCardHeader>
              <strong>Tabla de Horarios</strong>
            </CCardHeader>
          )}

          {validateSchedules() && (
            <CCardBody>
              <div className='mb-3' style={{ justifyContent: 'center', maxHeight: schedules.length > 5 ? '300px' : 'auto', overflowY: 'auto' }}>
                <CTable striped bordered hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Identificación</CTableHeaderCell>
                      <CTableHeaderCell>Nombre Usuario</CTableHeaderCell>
                      <CTableHeaderCell>Fecha</CTableHeaderCell>
                      <CTableHeaderCell>Hora Entrada</CTableHeaderCell>
                      <CTableHeaderCell>Hora Salida</CTableHeaderCell>
                      <CTableHeaderCell>Retardos (Min)</CTableHeaderCell>
                      <CTableHeaderCell>Salida Temprano (Min)</CTableHeaderCell>
                      <CTableHeaderCell>Falta (Min)</CTableHeaderCell>
                      <CTableHeaderCell>Total (Min)</CTableHeaderCell>
                      <CTableHeaderCell>Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {schedules.map((schedule, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{schedule.id}</CTableDataCell>
                        <CTableDataCell>{schedule.userName}</CTableDataCell>
                        <CTableDataCell>{schedule.date}</CTableDataCell>
                        <CTableDataCell>{schedule.entryTime}</CTableDataCell>
                        <CTableDataCell>{schedule.exitTime}</CTableDataCell>
                        <CTableDataCell>{schedule.delays}</CTableDataCell>
                        <CTableDataCell>{schedule.earlyExit}</CTableDataCell>
                        <CTableDataCell>{schedule.absences}</CTableDataCell>
                        <CTableDataCell>{schedule.totalMinutes}</CTableDataCell>
                        <CTableDataCell>
                          <CButton color="warning" size="xs" onClick={() => onEdit(schedule)} style={{ marginRight: '5px' }}>
                            Editar
                          </CButton>
                          <CButton color="danger" size="xs" onClick={() => onDelete(schedule)}>
                            Eliminar
                          </CButton>
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

export default ScheduleTable;

