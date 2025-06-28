import React, { useState, useRef, useEffect } from 'react';
import { CButton, CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';
import { getCertifications, addCertification, updateCertification, deleteCertification, downloadCertification, getCertificationFile } from '../../services/CertificationService';

import Certification_Table from '../../components/table/Certification_Table';
import sAlert from '../../components/sweetalert/SweetAlert';
import Forms_Certifications from '../../components/forms/Forms_Certifications';

const Certifications = () => {
    const [isVisible, setIsVisible] = useState(false);
    const formRef = useRef(null);
    const [selectedCertification, setSelectedCertification] = useState(null);
    const [certifications, setCertifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchCertifications(currentPage);
    }, [currentPage]);

    const fetchCertifications = async (page) => {
        try {
            const response = await getCertifications(page, 5);
            const formattedCertifications = response.certifications.map(cert => {
                const issueDate = new Date(cert.emission_date);
                const expiryDate = new Date(cert.expiration_date);
    
                return {
                    ...cert,
                    emission_date: isNaN(issueDate.getTime()) ? '' : issueDate.toISOString().split('T')[0],
                    expiration_date: isNaN(expiryDate.getTime()) ? '' : expiryDate.toISOString().split('T')[0],
                };
            });
            setCertifications(formattedCertifications);
            setTotalPages(response.totalPages);
            console.log('Certificaciones:', formattedCertifications);
        } catch (error) {
            console.error('Error al obtener las certificaciones:', error.message);
        }
    };

    const handleAddorEdit = async (certification) => {
        if (selectedCertification) {
            console.log('Editando la certificación:', certification);
            // Actualizar la certificación en la base de datos


            await updateCertification(selectedCertification.id, certification);
            window.location.reload();
          
        } else {
            console.log('Agregando la certificación:', certification);
            // Agregar la certificación a la base de datos
            await addCertification(certification);
            window.location.reload();
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setSelectedCertification(null);
        setFile(null);
    };

    const handleConfirmEliminate = (certification) => {
        sAlert.confirmAction({
            mode: 'warning',
            message: `¿Estás seguro de eliminar la certificación ${certification.emisory_entity}?`,
            confirm: async () => {
                await handleEliminate(certification);
                window.location.reload();
            },
            message2: 'Certificación eliminada con éxito',
            valid: true,
        });
    };

    const handleSelectCertification = async (certification) => {
        setSelectedCertification(certification);
        setIsVisible(true);
        try {
            const fileData = await getCertificationFile(certification.id);
            setFile(fileData);
        } catch (error) {
            console.error('Error al obtener el archivo de la certificación:', error.message);
        }
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const handleEliminate = async (certification) => {
        try {
            console.log('Eliminando la certificación:', certification);
            await deleteCertification(certification.id);
        } catch (error) {
            console.error('Error al eliminar la certificación:', error.message);
        }
    };

    const handleConfirmEditOrAdd = (certification) => {
        sAlert.confirmAction({
            mode: 'info',
            message: `¿Estás seguro de ${selectedCertification ? 'editar' : 'agregar'} la certificación de tipo ${certification.type}?`,
            confirm: async () => {
                await handleAddorEdit(certification);
            },
            message2: 'Certificado actualizado correctamente',
            valid: true,
        });
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        fetchCertifications(pageNumber);
    };

    const handleDownload = async (id) => {
        try {
            await downloadCertification(id);
        } catch (error) {
            console.error('Error al descargar la certificación:', error.message);
        }
    };

    const types = [
        "Certificaciones de Seguridad y Medio Ambiente",
        "Certificaciones de Calidad y Servicio",
        "Certificaciones de Equipos y Herramientas",
        "Certificaciones de Personal",
        "Permisos y Certificaciones Gubernamentales"
    ];

    const topNames = ['Tipo', 'Fecha de emisión', 'Fecha de expiración', 'Entidad emisora', 'Archivo',];

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <div className="d-flex w-100 justify-content-between align-items-center">
                            <strong>Certificaciones</strong>
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
                                    Agregar certificación
                                </CButton>
                            </div>
                        </div>
                    </CCardHeader>
                    <CCardBody>
                        <CRow className="mb-3" style={{ justifyContent: 'center', marginBottom: '40px' }}>
                            <CCol>
                                <Certification_Table
                                    certifications={certifications}
                                    titles={topNames}
                                    onEdit={handleSelectCertification}
                                    onDelete={handleConfirmEliminate}
                                    onDownload={handleDownload}
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
                            <Forms_Certifications
                                certification={selectedCertification}
                                types={types}
                                addOrEdit={handleConfirmEditOrAdd}
                                onClose={handleClose}
                                file={file}
                            />
                        </CCol>
                    </CRow>
                )}
            </CCol>
        </CRow>
    );
};

export default Certifications;