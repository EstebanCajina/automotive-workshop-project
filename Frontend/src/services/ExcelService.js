/* eslint-disable prettier/prettier */
import * as XLSX from 'xlsx';

// Encabezados esperados para validar el formato del archivo (primeras 3 columnas de la fila 3, índice 2)
const expectedHeaders = ['Región', 'Dependencia', 'Placa'];

export const processExcelFiles = async (files) => {
  const vehicleList = [];
  const invalidFiles = []; // Lista para almacenar archivos no procesados por mal formato

  const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const fractional_day = serial - Math.floor(serial) + 0.0000001;

    let total_seconds = Math.floor(86400 * fractional_day);

    const seconds = total_seconds % 60;

    total_seconds -= seconds;

    const hours = Math.floor(total_seconds / (60 * 60));
    const minutes = Math.floor(total_seconds / 60) % 60;

    const jsDate = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
    jsDate.setDate(jsDate.getDate() + 1); // Ajustar la fecha sumando un día

    return jsDate;
  };

  for (const file of files) {
    const reader = new FileReader();

    try {
      // Leer archivo como binario
      const fileData = await new Promise((resolve, reject) => {
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
      });

      const workbook = XLSX.read(fileData, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Validación del formato del archivo (primeras 3 celdas de la fila 3, índice 2)
      const fileHeaders = jsonData[2].slice(0, 3).map((header) => header?.toString().trim() || '');
      const isValidFormat = expectedHeaders.every(
        (expected, index) => expected === fileHeaders[index],
      );

      if (!isValidFormat) {
        invalidFiles.push(file.name); // Agregar archivo a la lista de no procesados
        continue; // Saltar a la siguiente iteración
      }

      // Extraer información validando campos requeridos
      const plate = jsonData[3][2]?.toString().trim() || 'NAC'; // Placa
      const brand = jsonData[3][5]?.toString().trim() || 'NAC'; // Marca
      const style = jsonData[3][6]?.toString().trim() || 'NAC'; // Estilo
      const modelYear = jsonData[3][7]?.toString().trim() || 'NAC'; // Modelo (año)

      // Validar si los campos obligatorios están vacíos
      if (plate === 'NAC' || brand === 'NAC' || style === 'NAC' || modelYear === 'NAC') {
        invalidFiles.push(file.name); // Agregar archivo a la lista de no procesados
        continue; // Saltar a la siguiente iteración
      }

      // Convertir la fecha de Excel a un objeto Date de JavaScript
      const mileageDateString = jsonData[3][10] || 'NAC';
      const mileageDate = mileageDateString !== 'NAC' ? excelDateToJSDate(mileageDateString) : 'NAC';

      // Asegurarse de que la fecha es válida
      const isValidDate = mileageDate instanceof Date && !isNaN(mileageDate);
      const mileage_date = isValidDate ? mileageDate : 'NAC';

      // Crear objeto de vehículo
      const vehicle = {
        region: jsonData[3][0] || 'NAC', // Región
        dependency: jsonData[3][1] || 'NAC', // Dependencia
        plate,
        code: jsonData[3][3] || 'NAC', // Código
        assetCode: jsonData[3][4] || 'NAC', // Código Patrimonio
        brand,
        style,
        modelYear,
        maintenances: [
          {
            vehicle_id: null,
            issue_description: jsonData[3][8] || 'NAC', // Problema
            unit_mileage: jsonData[3][9] || 'NAC', // Kilometraje
            mileage_date: mileage_date, // Fecha medición
            requires_platform_transfer: jsonData[3][11]?.toLowerCase() === 'sí',
            under_warranty: jsonData[3][12]?.toLowerCase() === 'sí',
            mechanic_contact: jsonData[5][1]?.toString().trim() || 'NAC', // Contacto
            mechanic_phone: jsonData[7][1]?.toString().trim() || 'NAC', // Teléfonos
            observations: jsonData[9][1] || 'NAC', // Observaciones
          },
        ],
      };

      vehicleList.push(vehicle);
    } catch (error) {
      console.error(`Error procesando el archivo ${file.name}:`, error);
      invalidFiles.push(file.name); // Agregar archivo a la lista de no procesados en caso de error
    }
  }

  // Mostrar alerta con archivos no procesados si existen
  if (invalidFiles.length > 0) {
    alert(`Archivos no procesados por mal formato: ${invalidFiles.join(', ')}`);
  }

  console.log('Lista de vehículos procesados:', vehicleList);
  return vehicleList;
};