import React, { useState, useEffect, useRef } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormInput,
  CButton,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react';
import { cilMagnifyingGlass } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { useNavigate } from 'react-router-dom';
import MaintenanceForm from '../../components/forms/Forms_Maintenance';
import alerts from '../../components/sweetalert/SweetAlert';
import ConfirmRole from '../../components/Auth/ConfirmRole';
import MaintenanceTable from '../../components/table/Maintenance_Table';
import {getMaintenanceByPlate} from '../../services/MaintenanceService';
import {addMaintenances} from '../../services/MaintenanceService';
import {updateMaintenance} from '../../services/MaintenanceService';
import {deleteMaintenance} from '../../services/MaintenanceService';

const Maintenance = () => {
  const [showModal, setShowModal] = useState(true);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [maintenances, setMaintenances] = useState([]);
  const [searchPlate, setSearchPlate] = useState('');
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userRole = ConfirmRole.getRoleFromToken(token);
    if (userRole !== 'Administrador') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSearch = async () => {
    if (!searchPlate) {
      alerts.confirmAction({
        mode: 'warning',
        message: 'Por favor, ingresa una placa para buscar.',
        confirm: () => {},
        valid: false,
      });
     
      return;
    } else{

    try {
      const response = await getMaintenanceByPlate(searchPlate);

      const formattedData = response.map((item) => ({
        ...item,
        mileage_date: item.mileage_date ? new Date(item.mileage_date).toISOString().split('T')[0] : '',
      }));
      setMaintenances(formattedData);

if(formattedData.length === 0){
        alerts.confirmAction({
          mode: 'error',
          message: 'No se encontraron mantenimientos para la placa ingresada.',
          confirm: () => {},
          valid: false,
        });
      }

    } catch (error) {
      console.error('Error al buscar mantenimientos:', error);
      alerts.confirmAction({
        mode: 'error',
        message: 'La placa ingresada no existe.',
        confirm: () => {},
        valid: false,
      });
    }
  }
  };

  const handleDeleteMaintenance = async (maintenance) => {
    console.log('maintenance', maintenance);
    alerts.confirmAction({
      mode: 'warning',
      message: `¿Estás seguro de eliminar el mantenimiento de este vehículo?`,
      confirm: async () => {
        try {
          await deleteMaintenance(maintenance.id);
          handleSearch();
        } catch (error) {
          console.error('Error al eliminar el mantenimiento:', error.message);
        }
      },
      message2: 'Mantenimiento eliminado correctamente',
      valid: true,
    });
  };

  const handleSaveMaintenance = async (maintenance) => {
    console.log('maintenance', maintenance);  
    try {
      // Asegurarse de que vehicle_id y unit_mileage sean enteros
      const maintenanceData = {
        ...maintenance,
        vehicle_id: parseInt(maintenance.vehicle_id, 10), // Convierte a entero
        unit_mileage: parseInt(maintenance.unit_mileage, 10), // Convierte a entero
      };

      if (selectedMaintenance) {
        alerts.confirmAction({
          mode: 'info',
          message: `¿Estás seguro de actualizar el mantenimiento del vehículo ${selectedMaintenance.vehicle_id}?`,
          confirm: async () => {
            await updateMaintenance(selectedMaintenance.id, maintenanceData);
            handleSearch();
            handleCloseModal();
          },
          message2: 'Mantenimiento actualizado correctamente',
          valid: true,
        });
      } else {
        alerts.confirmAction({
          mode: 'info',
          message: `¿Estás seguro de guardar este mantenimiento?`,
          confirm: async () => {
            await addMaintenances([maintenanceData]);
            handleSearch();
            handleCloseModal();
          },
          message2: 'Mantenimiento guardado correctamente',
          valid: true,
        });
      }
    } catch (error) {
      console.error('Error al guardar el mantenimiento:', error.message);
    }
  };

  const handleEditMaintenance = (maintenance) => {
    setSelectedMaintenance(maintenance);
    setShowModal(true);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMaintenance(null);
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
          <div className="d-flex w-100 justify-content-between align-items-center">
            <strong>Gestión de Mantenimientos</strong>
            <div className="d-flex align-items-center">
            <CInputGroup>
                  <CFormInput
                    type="text"
                    placeholder="Ingrese la placa"
                    value={searchPlate}
                    onChange={(e) => setSearchPlate(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()} // Permitir búsqueda al presionar Enter
                  />
                  <CInputGroupText>
                    <CButton color="primary" onClick={handleSearch} style={{ padding: '0.375rem 0.75rem' }}>
                      <CIcon icon={cilMagnifyingGlass} />
                    </CButton>
                  </CInputGroupText>
                </CInputGroup>
          </div>
          </div>
          </CCardHeader>
          <CCardBody>
           

            {/* Tabla de mantenimientos */}
            <CRow className="mb-3" style={{ justifyContent: 'center' }}>
              <CCol>
                <MaintenanceTable
                  maintenances={maintenances}
                  onEdit={handleEditMaintenance}
                  onDelete={handleDeleteMaintenance}
                />
              </CCol>
            </CRow>

            {/* Formulario de mantenimiento */}
            <CRow className="mb-3" ref={formRef}>
              <CCol>
                <MaintenanceForm
                  maintenance={selectedMaintenance}
                  handleClose={handleCloseModal}
                  onAdd={handleSaveMaintenance}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Maintenance;