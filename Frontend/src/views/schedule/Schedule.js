import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react';
import { getScheduleEntries, getSchedules, } from '../../services/SheduleService';
import React, { useState, useEffect, useRef } from 'react';


const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [entries, setEntries] = useState({});
  const [visibleEntries, setVisibleEntries] = useState({});
  const formRef = useRef(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await getSchedules();
      setSchedules(response);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchScheduleEntries = async (scheduleId) => {
    try {
      const response = await getScheduleEntries(scheduleId);
      setEntries((prevEntries) => ({
        ...prevEntries,
        [scheduleId]: response,
      }));
    } catch (error) {
      console.error('Error fetching schedule entries:', error);
    }
  };

  const handleToggleEntries = (scheduleId) => {
    if (visibleEntries[scheduleId]) {
      setVisibleEntries((prevVisibleEntries) => ({
        ...prevVisibleEntries,
        [scheduleId]: false,
      }));
    } else {
      fetchScheduleEntries(scheduleId);
      setVisibleEntries((prevVisibleEntries) => ({
        ...prevVisibleEntries,
        [scheduleId]: true,
      }));
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Gestión de Horarios</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3" ref={formRef}>
              <CCol>
                {schedules.map((schedule) => (
                  <CCard key={schedule.Id} className="mb-3">
                    <CCardHeader>
                      <strong>{schedule.name}</strong>
                    </CCardHeader>
                    <CCardBody>
                      <p>Identificación: {schedule.identification}</p>
                      <p>Cobro por Hora Ordinaria: {schedule.hourly_rate}</p>
                      <p>Costo por Hora Extra: {schedule.extra_hourly_rate}</p>
                      <CButton color="primary" onClick={() => handleToggleEntries(schedule.Id)}>
                        {visibleEntries[schedule.Id] ? 'Ocultar Entradas' : 'Ver Entradas'}
                      </CButton>
                      {visibleEntries[schedule.Id] && entries[schedule.Id] && entries[schedule.Id].length > 0 && (
                        <CTable striped bordered hover responsive className="mt-3">
                          <CTableHead>
                            <CTableRow>
                              <CTableHeaderCell>Fecha</CTableHeaderCell>
                              <CTableHeaderCell>Horas Trabajadas</CTableHeaderCell>
                              <CTableHeaderCell>Horas Extra</CTableHeaderCell>
                              <CTableHeaderCell>Salario</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {entries[schedule.Id].map((entry) => (
                              <CTableRow key={entry.id}>
                                <CTableDataCell>
                                  {new Date(entry.date).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })}
                                </CTableDataCell>
                                <CTableDataCell>{entry.hours_worked.toFixed(2)} horas</CTableDataCell>
                                <CTableDataCell>{entry.hours_extra.toFixed(2)} horas</CTableDataCell>
                                <CTableDataCell>₡{entry.salary.toFixed(2)}</CTableDataCell>
                              </CTableRow>
                            ))}
                          </CTableBody>
                        </CTable>
                      )}
                    </CCardBody>
                  </CCard>
                ))}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Schedules;