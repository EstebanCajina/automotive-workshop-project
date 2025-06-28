import React from 'react';
import {
    CButton, CCard, CCardBody, CCardHeader, CCol, CRow, CTable,
    CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CPagination, CPaginationItem
} from '@coreui/react';

const Certification_Table = ({ certifications, titles, onEdit, onDelete, onDownload, currentPage, totalPages, onPageChange }) => {

    const validateCertifications = () => {
        return certifications.length > 0;
    };

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    {validateCertifications() && (
                        <CCardBody>
                            <div className='mb-3' style={{ justifyContent: 'center', maxHeight: certifications.length > 5 ? '300px' : 'auto', overflowY: 'auto' }}>
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
                                        {certifications.map((item, index) => (
                                            <CTableRow key={index}>
                                                <CTableDataCell>{item.type}</CTableDataCell>
                                                <CTableDataCell>{item.emission_date}</CTableDataCell>
                                                <CTableDataCell>{item.expiration_date}</CTableDataCell>
                                                <CTableDataCell>{item.emisory_entity}</CTableDataCell>
                                                <CTableDataCell>{item.file}</CTableDataCell>
                                                <CTableDataCell>
                                                    <CButton
                                                        color="warning"
                                                        size="xs"
                                                        onClick={() => onEdit(item)}
                                                        style={{ marginRight: '5px' }}
                                                    >
                                                        Editar
                                                    </CButton>
                                                    <CButton
                                                        color="danger"
                                                        size="xs"
                                                        onClick={() => onDelete(item)}
                                                        style={{ marginRight: '5px' }}
                                                    >
                                                        Eliminar
                                                    </CButton>
                                                    <CButton
                                                        color="info"
                                                        size="xs"
                                                        onClick={() => onDownload(item.id)}
                                                    >
                                                        Descargar
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

export default Certification_Table;