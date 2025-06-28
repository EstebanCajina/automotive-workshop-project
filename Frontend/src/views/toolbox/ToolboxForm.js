import React, { useState, useEffect } from 'react';
import { CCard, CCardHeader, CCardBody, CForm, CFormInput, CFormTextarea, CButton, CCol, CRow, CFormSelect } from '@coreui/react';
import { addToolbox, updateToolbox } from '../../services/ToolboxService';

const ToolboxForm = ({ onClose, onToolboxAdded, toolboxData = null }) => {
  const [mechanicName, setMechanicName] = useState('');
  const [boxNumber, setBoxNumber] = useState('');
  const [toolsList, setToolsList] = useState('');
  const [observations, setObservations] = useState('');
  const [isAssigned, setIsAssigned] = useState(false);

  useEffect(() => {
    if (toolboxData) {
      setMechanicName(toolboxData.mechanic_name);
      setBoxNumber(toolboxData.box_number);
      setToolsList(toolboxData.tools_list);
      setObservations(toolboxData.observations);
      setIsAssigned(toolboxData.is_assigned);
    }
  }, [toolboxData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toolbox = {
      mechanic_name: mechanicName,
      box_number: boxNumber,
      tools_list: toolsList,
      observations: observations,
      is_assigned: isAssigned ,
    };

    try {
      if (toolboxData) {
        // Si hay datos, estamos editando
        await updateToolbox(toolboxData.id, toolbox);
      } else {
        // Si no hay datos, estamos creando
        await addToolbox(toolbox);
      }
      onToolboxAdded();
      onClose();
    } catch (error) {
      console.error('Error al guardar la caja de herramientas:', error);
    }
  };

  return (
    <CCard>
      <CCardHeader>
        <strong>{toolboxData ? 'Editar' : 'Agregar'} Caja de Herramientas</strong>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <CRow>
            <CCol xs={12} md={6}>
              <CFormInput
                type="text"
                label="Nombre del Mecánico"
                value={mechanicName}
                onChange={(e) => setMechanicName(e.target.value)}
                required
              />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormInput
                type="text"
                label="Número de Caja"
                value={boxNumber}
                onChange={(e) => setBoxNumber(e.target.value)}
                required
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol xs={12}>
              <CFormTextarea
                label="Lista de Herramientas"
                value={toolsList}
                onChange={(e) => setToolsList(e.target.value)}
                rows="3"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol xs={12}>
              <CFormTextarea
                label="Observaciones"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows="3"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol xs={12} md={6}>
              <CFormSelect
                label="Estado de Asignación"
                value={isAssigned ? 'Asignada' : 'No asignada'}
                onChange={(e) => setIsAssigned(e.target.value === 'Asignada')}
              >
                <option value="Asignada">Asignada</option>
                <option value="No asignada">No asignada</option>
              </CFormSelect>
            </CCol>
          </CRow>
          <CRow className="mt-3">
            <CCol xs={12}>
              <CButton type="submit" color="primary" className="me-2">
                {toolboxData ? 'Actualizar' : 'Guardar'}
              </CButton>
              <CButton color="secondary" onClick={onClose}>
                Cancelar
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default ToolboxForm;
