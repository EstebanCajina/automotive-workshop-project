import React, { useEffect, useState, useRef } from 'react';
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CPagination,
  CPaginationItem,
  CFormSelect
} from '@coreui/react';
import {
  getMaintenanceEntries,
  deleteMaintenanceEntry,
  updateMaintenanceEntry,
} from '../../services/MaintenanceEntryService';
import Swal from 'sweetalert2';
import MaintenanceEntryForm from './MaintenanceEntryForm';
import MaintenanceEntryExtensionForm from './MaintenanceEntryExtensionForm';

const MaintenanceEntryList = () => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [totalPages, setTotalPages] = useState(1); // Total de páginas
  const [showForm, setShowForm] = useState(false);
  const [editEntryId, setEditEntryId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showExtensionForm, setShowExtensionForm] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState(null);
  const [statusFilter, setStatusFilter] = useState(''); // Filtro de estado
  const formRef = useRef(null);

  useEffect(() => {
    fetchMaintenanceEntries(currentPage);
  }, [currentPage]);

  useEffect(() => {
    // Aplicar el filtro de estado después de obtener las órdenes de mantenimiento
    if (statusFilter) {
      setFilteredEntries(entries.filter((entry) => entry.maintenance_status === statusFilter));
    } else {
      setFilteredEntries(entries);
    }
  }, [statusFilter, entries]);

  const fetchMaintenanceEntries = async (page) => {
    console.log('Fetching Entries:', page);

    try {
      const data = await getMaintenanceEntries(page, 10); // Obtener datos paginados del backend
      console.log('Fetched Entries:', data); // Imprimir los datos obtenidos
      const today = new Date();
      const entriesWithDaysLeft = data.entries.map((entry) => {
        const estimatedCompletionDate = new Date(entry.estimated_completion);
        const timeDiff = estimatedCompletionDate - today;
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return { ...entry, daysLeft };
      });
      setEntries(entriesWithDaysLeft);
      setFilteredEntries(entriesWithDaysLeft);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error al obtener las órdenes de trabajo:', error);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteMaintenanceEntry(id);
          Swal.fire('¡Eliminado!', 'La orden de trabajo ha sido eliminada.', 'success');
          fetchMaintenanceEntries(currentPage);
        } catch (error) {
          console.error('Error al eliminar la orden de trabajo:', error);
          Swal.fire('Error', 'No se pudo eliminar la orden de trabajo', 'error');
        }
      }
    });
  };

  const handleEditClick = (entry) => {
    setEditEntryId(entry.id);
    setNewStatus(entry.maintenance_status);
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleSave = async (entry) => {
    try {
      await updateMaintenanceEntry(entry.id, {
        ...entry,
        maintenance_status: newStatus,
      });
      Swal.fire('¡Guardado!', 'El estado de la orden de trabajo ha sido actualizado.', 'success');
      setEditEntryId(null);
      fetchMaintenanceEntries(currentPage);
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
    }
  };

  const handleAddExtension = (entryId) => {
    setCurrentEntryId(entryId);
    setShowExtensionForm(true);
  };

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex w-100 justify-content-between align-items-center">
              <strong>Listado de Órdenes de Trabajo</strong>
              <div className="d-flex align-items-center">
                <CFormSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="me-3"
                  style={{ width: '200px' }}
                >
                  <option value="">Todos los estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En progreso">En progreso</option>
                  <option value="Completado">Completado</option>
                  <option value="Cancelado">Cancelado</option>
                </CFormSelect>
                <CButton
                  color="primary"
                  onClick={() => {
                    setShowForm(true);
                    setTimeout(() => {
                      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                >
                  Agregar orden de trabajo
                </CButton>
              </div>
            </div>
          </CCardHeader>
          <CCardBody>
            <CTable striped bordered hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Placa</CTableHeaderCell>
                  <CTableHeaderCell>Fecha de Entrada</CTableHeaderCell>
                  <CTableHeaderCell>Fecha Estimada</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell>Mecánico Asignado</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredEntries.map((entry, index) => {
                  // Cálculo del número de fila
                  const rowNumber = (currentPage - 1) * 10 + index + 1; // Ajuste para numeración continua

                  let rowClass = '';
                  if (entry.daysLeft <= 3) {
                    rowClass = 'table-danger'; // Rojo
                  } else if (entry.daysLeft <= 7) {
                    rowClass = 'table-success'; // Amarillo
                  }

                  return (
                    <CTableRow key={entry.id} className={rowClass}>
                      <CTableDataCell>{rowNumber}</CTableDataCell> {/* Usamos rowNumber aquí */}
                      <CTableDataCell>{entry.vehicle_plate}</CTableDataCell>
                      <CTableDataCell>
                        {new Date(entry.entry_time).toLocaleDateString('es-ES')}
                      </CTableDataCell>
                      <CTableDataCell>
                        {entry.estimated_completion
                          ? new Date(entry.estimated_completion).toLocaleDateString('es-ES')
                          : 'Sin estimación'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {editEntryId === entry.id ? (
                          <select
                            value={newStatus}
                            onChange={handleStatusChange}
                            className="form-control"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En progreso">En progreso</option>
                            <option value="Completado">Completado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        ) : (
                          entry.maintenance_status
                        )}
                      </CTableDataCell>
                      <CTableDataCell>{entry.assigned_mechanic || 'No asignado'}</CTableDataCell>
                      <CTableDataCell>
                        {editEntryId === entry.id ? (
                          <>
                            <CButton
                              color="success"
                              size="sm"
                              className="me-2"
                              onClick={() => handleSave(entry)}
                            >
                              Guardar
                            </CButton>
                            <CButton
                              color="secondary"
                              size="sm"
                              onClick={() => setEditEntryId(null)}
                            >
                              Cancelar
                            </CButton>
                          </>
                        ) : (
                          <>
                            <CButton
                              color="warning"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditClick(entry)}
                            >
                              Actualizar estado
                            </CButton>
                            <CButton
                              color="info"
                              size="sm"
                              className="me-2"
                              onClick={() => handleAddExtension(entry.id)}
                            >
                              Agregar prórroga
                            </CButton>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => handleDelete(entry.id)}
                            >
                              Eliminar
                            </CButton>
                          </>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  );
                })}
              </CTableBody>
            </CTable>

            {/* Paginación */}
            <CPagination aria-label="Page navigation">
              <CPaginationItem
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </CPaginationItem>
              {[...Array(totalPages)].map((_, index) => (
                <CPaginationItem
                  key={index}
                  onClick={() => paginate(index + 1)}
                  active={index + 1 === currentPage}
                >
                  {index + 1}
                </CPaginationItem>
              ))}
              <CPaginationItem
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </CPaginationItem>
            </CPagination>
          </CCardBody>
        </CCard>
      </CCol>
      {showForm && (
        <div ref={formRef}>
          <MaintenanceEntryForm
            onClose={() => setShowForm(false)}
            onEntryAdded={() => fetchMaintenanceEntries(currentPage)}
          />
        </div>
      )}

      {showExtensionForm && (
        <MaintenanceEntryExtensionForm
          entryId={currentEntryId}
          onClose={() => setShowExtensionForm(false)}
          onExtensionAdded={() => fetchMaintenanceEntries(currentPage)}
        />
      )}
    </CRow>
  );
};

export default MaintenanceEntryList;
