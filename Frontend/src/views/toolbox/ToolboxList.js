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
  CFormSelect
} from '@coreui/react';
import {
  getToolboxes,
  deleteToolbox,
  updateToolbox,
} from '../../services/ToolboxService';
import Swal from 'sweetalert2';
import ToolboxForm from './ToolboxForm';

const ToolboxList = () => {
  const [toolboxes, setToolboxes] = useState([]);
  const [filteredToolboxes, setFilteredToolboxes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editToolboxId, setEditToolboxId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // Filtro de estado
  const formRef = useRef(null);

  useEffect(() => {
    fetchToolboxes();
  }, []);

  useEffect(() => {
    // Aplicar el filtro de estado después de obtener las cajas de herramientas
    if (statusFilter) {
      setFilteredToolboxes(toolboxes.filter((toolbox) => (toolbox.is_assigned ? 'Asignada' : 'No asignada') === statusFilter));
    } else {
      setFilteredToolboxes(toolboxes);
    }
  }, [statusFilter, toolboxes]);

  const fetchToolboxes = async () => {
    try {
      const data = await getToolboxes(); // Obtener datos sin paginación del backend
      setToolboxes(data.data);
      console.log('sirvo')
      console.log(data)
      setFilteredToolboxes(data.data);
    } catch (error) {
      console.error('Error al obtener las cajas de herramientas:', error);
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
          await deleteToolbox(id);
          Swal.fire('¡Eliminado!', 'La caja de herramientas ha sido eliminada.', 'success');
          setToolboxes(toolboxes.filter(toolbox => toolbox.id !== id));
          setFilteredToolboxes(filteredToolboxes.filter(toolbox => toolbox.id !== id));
        } catch (error) {
          console.error('Error al eliminar la caja de herramientas:', error);
          Swal.fire('Error', 'No se pudo eliminar la caja de herramientas', 'error');
        }
      }
    });
  };

  const handleEditClick = (toolbox) => {
    setEditToolboxId(toolbox.id);
    setNewStatus(toolbox.is_assigned ? 'Asignada' : 'No asignada');
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleSave = async (toolbox) => {
    try {
      await updateToolbox(toolbox.id, {
        ...toolbox,
        is_assigned: newStatus === 'Asignada' ? 1 : 0,
      });
      Swal.fire('¡Guardado!', 'La caja de herramientas ha sido actualizada.', 'success');

      // Actualizar el estado localmente
      setToolboxes(toolboxes.map(tb =>
        tb.id === toolbox.id ? { ...tb, is_assigned: newStatus === 'Asignada' ? 1 : 0 } : tb
      ));
      setFilteredToolboxes(filteredToolboxes.map(tb =>
        tb.id === toolbox.id ? { ...tb, is_assigned: newStatus === 'Asignada' ? 1 : 0 } : tb
      ));

      setEditToolboxId(null);
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex w-100 justify-content-between align-items-center">
              <strong>Listado de Cajas de Herramientas</strong>
              <div className="d-flex align-items-center">
                <CFormSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="me-3"
                  style={{ width: '200px' }}
                >
                  <option value="">Todos los estados</option>
                  <option value="Asignada">Asignada</option>
                  <option value="No asignada">No asignada</option>
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
                  Agregar caja de herramientas
                </CButton>
              </div>
            </div>
          </CCardHeader>
          <CCardBody>
            <CTable striped bordered hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Nombre del Mecánico</CTableHeaderCell>
                  <CTableHeaderCell>Número de Caja</CTableHeaderCell>
                  <CTableHeaderCell>Lista de Herramientas</CTableHeaderCell>
                  <CTableHeaderCell>Observaciones</CTableHeaderCell>
                  <CTableHeaderCell>Fecha de Asignación</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredToolboxes.map((toolbox, index) => (
                  <CTableRow key={toolbox.id}>
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    <CTableDataCell>{toolbox.mechanic_name}</CTableDataCell>
                    <CTableDataCell>{toolbox.box_number}</CTableDataCell>
                    <CTableDataCell>{toolbox.tools_list}</CTableDataCell>
                    <CTableDataCell>{toolbox.observations}</CTableDataCell>
                    <CTableDataCell>{new Date(toolbox.assignment_date).toLocaleDateString('es-ES')}</CTableDataCell>
                    <CTableDataCell>
                      {editToolboxId === toolbox.id ? (
                        <select
                          value={newStatus}
                          onChange={handleStatusChange}
                          className="form-control"
                        >
                          <option value="Asignada">Asignada</option>
                          <option value="No asignada">No asignada</option>
                        </select>
                      ) : (
                        toolbox.is_assigned ? 'Asignada' : 'No asignada'
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {editToolboxId === toolbox.id ? (
                        <>
                          <CButton
                            color="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleSave(toolbox)}
                          >
                            Guardar
                          </CButton>
                          <CButton
                            color="secondary"
                            size="sm"
                            onClick={() => setEditToolboxId(null)}
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
                            onClick={() => handleEditClick(toolbox)}
                          >
                            Actualizar estado
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => handleDelete(toolbox.id)}
                          >
                            Eliminar
                          </CButton>
                        </>
                      )}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
      {showForm && (
        <div ref={formRef}>
          <ToolboxForm
            onClose={() => setShowForm(false)}
            onToolboxAdded={() => fetchToolboxes()}
          />
        </div>
      )}
    </CRow>
  );
};

export default ToolboxList;
