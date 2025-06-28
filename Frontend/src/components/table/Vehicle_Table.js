import React from 'react';
import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CButton, 
  CCard, CCardBody, CCol, CRow, CPagination, CPaginationItem } from '@coreui/react';

const Vehicle_Table = ({ vehicles, titles, onEdit, onDelete, currentPage, totalPages, onPageChange }) => {

  const validateVehicles = () => {
    return vehicles.length > 0;
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          {validateVehicles() && (
            <CCardBody>
              <div className='mb-3' style={{ justifyContent: 'center'}}>
                <CTable striped bordered hover responsive>
                  <CTableHead>
                    <CTableRow>
                      {titles.map((title, index) => (
                        <CTableHeaderCell key={index}>{title}</CTableHeaderCell>
                      ))}
                      <CTableHeaderCell>Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {vehicles.map((vehicle, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{vehicle.region}</CTableDataCell>
                        <CTableDataCell>{vehicle.dependency}</CTableDataCell>
                        <CTableDataCell>{vehicle.plate}</CTableDataCell>
                        <CTableDataCell>{vehicle.asset_code}</CTableDataCell>
                        <CTableDataCell>{vehicle.heritage}</CTableDataCell>
                        <CTableDataCell>{vehicle.brand}</CTableDataCell>
                        <CTableDataCell>{vehicle.style}</CTableDataCell>
                        <CTableDataCell>{vehicle.model_year}</CTableDataCell>
                        <CTableDataCell>
                          <CButton color="warning" size="xs" onClick={() => onEdit(vehicle)} style={{ marginRight: '5px' }}>
                            Editar
                          </CButton>
                          <CButton
                            color={ "danger" }
                            size="xs"
                            onClick={() => onDelete(vehicle)}
                          >
                            Eliminar
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
                <CPagination aria-label="Page navigation">
                  <CPaginationItem
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </CPaginationItem>
                  {[...Array(totalPages)].map((_, index) => (
                    <CPaginationItem
                      key={index}
                      onClick={() => onPageChange(index + 1)}
                      active={index + 1 === currentPage}
                    >
                      {index + 1}
                    </CPaginationItem>
                  ))}
                  <CPaginationItem
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </CPaginationItem>
                </CPagination>
              </div>
            </CCardBody>
          )}
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Vehicle_Table;