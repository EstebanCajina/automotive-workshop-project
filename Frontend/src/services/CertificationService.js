import api from '../components/Auth/AxiosConfig'

// Obtener todas las certificaciones
export const getCertifications = async (page, pageSize) => {
  try {

    const response = await api.get(`certificates/?page=${page}&pageSize=${pageSize}`)

    console.log('API Response:', response.data); // Imprimir la respuesta de la API
    return {
      totalCertifications: response.data.totalCertifications,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage,
      pageSize: response.data.pageSize,
      certifications: response.data.data, // Extraer solo la lista de certificaciones
    };
  
  }catch (error) {
    console.error('Error al obtener las certificaciones:', error);
    throw error;
}

}
// Agregar una nueva certificación
export const addCertification = async (formData) => {
  try {
      const response = await api.post('certificates', formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
          },
      });
      return response.data;
  } catch (error) {
      console.error('Error al agregar la certificación:', error.message);
      throw error;
  }
};

// Obtener una certificación específica por su ID
export const getCertificationById = async (id) => {
  try {
    const response = await api.get(`certificates/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error al obtener la certificación con ID ${id}:`, error)
    throw error
  }
}

// Actualizar una certificación existente

export const updateCertification = async (id, updatedCertification) => {
    try {
        const response = await api.put(`certificates/${id}`, updatedCertification,{
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    } catch (error) {
        console.error(`Error al actualizar la certificación con ID ${id}:`, error)
        throw error
    }
    }

// Eliminar una certificación
export const deleteCertification = async (id) => {
    try {
        await api.delete(`certificates/${id}`)
    } catch (error) {
        console.error(`Error al eliminar la certificación con ID ${id}:`, error)
        throw error
    }
}

export const getCertificationFile = async (id) => {
  try {
      const response = await api.get(`certificates/${id}/file`, {
          responseType: 'blob',
      });
      const fileName = response.headers['content-disposition']
          ? response.headers['content-disposition'].split('filename=')[1].replace(/"/g, '')
          : 'certification.pdf';
      return { data: response.data, name: fileName };
  } catch (error) {
      console.error(`Error al descargar la certificación con ID ${id}:`, error);
      throw error;
  }
};

  export const downloadCertification = async (id) => {
    try {
      const response = await api.get(`certificates/${id}/file`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'certification.pdf'); // or extract the file name from response headers
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Error al descargar la certificación con ID ${id}:`, error);
      throw error;
    }
  };
