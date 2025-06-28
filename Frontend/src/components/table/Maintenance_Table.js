import React, { useState } from 'react';
import moment from 'moment';
import {
  CCarousel,
  CCarouselItem,
  CCard,
  CCardBody,
  CCardHeader,
  CCardText,
  CCardTitle,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell
} from '@coreui/react';

const Maintenance_Cards = ({ maintenances, onEdit, onDelete }) => {
  const [visible, setVisible] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleShowDetails = (maintenance) => {
    setSelectedMaintenance(maintenance);
    setVisible(true);
  };

  const handleDelete = (maintenance) => {
    const index = maintenances.indexOf(maintenance);
    onDelete(maintenance);
    if (index === activeIndex && index === maintenances.length - 1) {
      setActiveIndex(activeIndex - 1);
    } else if (index <= activeIndex) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const fieldLabels = {
    vehicle_id: 'ID del Vehículo',
    issue_description: 'Descripción del Problema',
    unit_mileage: 'Kilometraje',
    mileage_date: 'Fecha de Kilometraje',
    requires_platform_transfer: 'Requiere Plataforma',
    under_warranty: 'En Garantía',
    mechanic_contact: 'Contacto del Mecánico',
    mechanic_phone: 'Teléfono del Mecánico',
    observations: 'Observaciones'
  };

  return (
    <>
      {maintenances.length > 0 && (
        <CCarousel activeIndex={activeIndex} onSlid={(index) => setActiveIndex(index)} controls>
          {maintenances.map((maintenance, index) => (
            <CCarouselItem key={index}>
              <CCard className="h-100 mx-auto" style={{ maxWidth: '500px' }}>
                <CCardHeader>{moment(maintenance.creation_date).format('DD/MM/YYYY')}</CCardHeader>
                <CCardBody className="d-flex flex-column">
                  <CCardTitle>Problema</CCardTitle>
                  <CCardText className="flex-grow-1" style={{ maxHeight: '70px', overflow: 'hidden' }}>
                    {truncateText(maintenance.issue_description, 100)}
                  </CCardText>
                  <div className="d-flex justify-content-center">
                    <CButton color="warning" size="sm" onClick={() => onEdit(maintenance)}>Editar</CButton>{' '}
                    <CButton color="danger" size="sm" onClick={() => handleDelete(maintenance)}>Eliminar</CButton>{' '}
                    <CButton color="info" size="sm" onClick={() => handleShowDetails(maintenance)}>Mostrar Detalles</CButton>
                  </div>
                </CCardBody>
              </CCard>
            </CCarouselItem>
          ))}
        </CCarousel>
      )}

      <style>
        {`
          .carousel-control-prev-icon, .carousel-control-next-icon {
            filter: invert(27%) sepia(98%) saturate(746%) hue-rotate(199deg) brightness(90%) contrast(95%);
          }
        `}
      </style>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg" backdrop="static">
        <CModalHeader>Detalles del Mantenimiento</CModalHeader>
        <CModalBody style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {selectedMaintenance && (
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Campo</CTableHeaderCell>
                  <CTableHeaderCell>Valor</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {Object.entries(selectedMaintenance)
                  .filter(([key]) => key !== 'is_active' && key !== 'creation_date' && key !== 'id' && key !== 'vehicle_id')
                  .map(([key, value], idx) => (
                    <CTableRow key={idx}>
                      <CTableDataCell>{fieldLabels[key] || key}</CTableDataCell>
                      <CTableDataCell>
                        {typeof value === 'boolean' ? (value ? 'Sí' : 'No') :
                          key === 'mileage_date' && value ? moment(value).format('DD/MM/YYYY') :
                          value?.toString() || 'N/A'}
                      </CTableDataCell>
                    </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CModalBody>
      </CModal>
    </>
  );
};

export default Maintenance_Cards;