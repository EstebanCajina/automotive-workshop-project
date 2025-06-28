import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton } from '@coreui/react';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VehicleForm from '../../components/forms/Forms_Vehiculos';
import VehicleTable from '../../components/table/Vehicle_Table';
import { addVehicle, deleteVehicle, updateVehicle, getVehicles } from '../../services/VehicleService';
import alerts from '../../components/sweetalert/SweetAlert';
import ConfirmRole from '../../components/Auth/ConfirmRole';

const Vehicles = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userRole = ConfirmRole.getRoleFromToken(token);
    if (userRole !== 'Administrador') {
      navigate('/dashboard');
    } else {
      fetchVehicles(currentPage);
    }
  }, [navigate, currentPage]);

  const fetchVehicles = async (page) => {
    try {
      const response = await getVehicles(page, 5);
      setVehicles(response.vehicles);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error(error);
    }
  };
  const topNames = ['Region', 'Dependencia', 'placa', 'Codigo', 'Patrimonio', 'Marca', 'Estilo', 'Modelo'];

  const handleDeleteVehicle = async (vehicle) => {
    alerts.confirmAction({
      mode: 'warning',
      message: `¿Estás seguro de eliminar el vehículo ${vehicle.plate}?`,
      confirm: async () => {
        try {
          await deleteVehicle(vehicle.id);
          // Fetch vehicles after deletion
          const response = await getVehicles(currentPage, 5);
          setVehicles(response.vehicles);
          setTotalPages(response.totalPages);
          
          // Check if the current page is empty and adjust the page if necessary
          if (response.vehicles.length === 0 && currentPage > 1) {
            fetchVehicles(currentPage - 1);
            setCurrentPage(currentPage - 1);
          } else {
            fetchVehicles(currentPage);
          }
        } catch (error) {
          console.error('Error al eliminar el vehículo:', error.message);
        }
      },
      message2: 'Vehículo eliminado correctamente',
      valid: true,
    });
  };

  const handleSaveVehicle = async (vehicle) => {
    try {
      if (selectedVehicle) {
        alerts.confirmAction({
          mode: 'info',
          message: `¿Estás seguro de actualizar el vehículo ${selectedVehicle.plate}?`,
          confirm: async () => {
            await updateVehicle(selectedVehicle.id, vehicle);
            fetchVehicles(currentPage);
            handleCloseModal();
          },
          message2: 'Vehículo actualizado correctamente',
          valid: true,
        });
      } else {
        alerts.confirmAction({
          mode: 'info',
          message: `¿Estás seguro de guardar el vehículo ${vehicle.plate}?`,
          confirm: async () => {
            await addVehicle([vehicle]);
            fetchVehicles(currentPage);
            handleCloseModal();
          },
          message2: 'Vehículo guardado correctamente',
          valid: true,
        });
      }
    } catch (error) {
      console.error('Error al guardar el vehículo:', error.message);
    }
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsVisible(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCloseModal = () => {
    setIsVisible(false);
    setSelectedVehicle(null);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchVehicles(pageNumber);
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex w-100 justify-content-between align-items-center">
              <strong>Gestión de Vehículos</strong>
              <div className="d-flex align-items-center">
                <CButton
                  color="primary"
                  onClick={() => {
                    setIsVisible(true);
                    setTimeout(() => {
                      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                >
                  Agregar vehículo
                </CButton>
              </div>
            </div>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3" style={{ justifyContent: 'center', marginBottom: '20px' }}>
              <CCol>
                <VehicleTable
                  vehicles={vehicles}
                  titles={topNames}
                  onEdit={handleEditVehicle}
                  onDelete={handleDeleteVehicle}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
        {isVisible && (
          <CRow className="mb-3" ref={formRef}>
            <CCol>
              <VehicleForm
                vehicle={selectedVehicle}
                handleClose={handleCloseModal}
                onAdd={handleSaveVehicle}
              />
            </CCol>
          </CRow>
        )}
      </CCol>
    </CRow>
  );
};

export default Vehicles;