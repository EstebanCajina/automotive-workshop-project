import * as XLSX from 'xlsx';
import api from '../components/Auth/AxiosConfig'

const expectedHeaders = ['ID:', 'Nombre:'];

export const processConsistentExcelFiles = async (files) => {
  const scheduleList = [];
  const invalidFiles = [];

  for (const file of files) {
    const reader = new FileReader();
    try {
      const fileData = await new Promise((resolve, reject) => {
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
      });
      const workbook = XLSX.read(fileData, { type: 'binary' });
      const sheetName = workbook.SheetNames[2];

      if (!sheetName) {
        console.warn(`El archivo ${file.name} no tiene suficientes hojas.`);
        invalidFiles.push(file.name);
        continue;
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!jsonData[2] || jsonData[2].length < 3) {
        console.warn(`El archivo ${file.name} no tiene suficientes filas.`);
        invalidFiles.push(file.name);
        continue;
      }

      let fileHeaders = jsonData[2]
        .filter(header => header && header.toString().trim() !== '')
        .map(header => header.toString().trim());
      fileHeaders = fileHeaders.filter(header => header !== 'Primer Horario' && header !== 'Segundo Horario' && header !== 'Notas');
      let isValidFormat= true;

if((worksheet['A5'].v !== expectedHeaders[0]) && (worksheet['I5'].v !== expectedHeaders[1])){
isValidFormat=false;

}

      if (!isValidFormat) {
        const id = worksheet['A6'] ? worksheet['A6'].v : "No encontrado";
        const name = worksheet['C6'] ? worksheet['C6'].v : "No encontrado";
        const department = worksheet['E6'] ? worksheet['E6'].v : "No encontrado";
        invalidFiles.push(file.name);
        continue;
      }
      let rowIndex = 5; // Comenzamos en la fila 5

      while (worksheet[`C${rowIndex}`] && worksheet[`K${rowIndex}`]) {
        const identification = worksheet[`C${rowIndex}`]?.v.toString().trim() || "N/A";
        const name = worksheet[`K${rowIndex}`]?.v.toString().trim() || "N/A";
        const checkInRow = jsonData[rowIndex]; // Entrada
        const dateInRow = jsonData[3];
        const dateInits = (worksheet[`C${3}`]?.v.toString().trim().substring(0, 7)) || "N/A";
        let [year, month] = dateInits.split("-"); // Extraemos el año y el mes

        let previousDay = null; // Variable para guardar el día anterior

        if (checkInRow) {
          for (let col = 0; col < 14; col++) { // De A a N (14 columnas, un día por columna)
            const checkIn = checkInRow[col]?.toString().trim() || null;
            let day = dateInRow[col]?.toString().trim() || null;
            let date = null;

            if (day) {
              if (!previousDay) {
                previousDay = parseInt(day);
              }
              
              if (parseInt(day) < previousDay) {

                let newMonth = parseInt(month) + 1;
                let newYear = parseInt(year);
                year = newYear;
                month = newMonth;
      
                if (newMonth > 12) {
                  newMonth = 1;
                  newYear += 1; 
                  year = newYear;
                  month = newMonth;
                }
                      
                day = '01';
                date = `${newYear}-${String(newMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

              } else {
                date = `${year}-${month}-${String(day).padStart(2, '0')}`;

              }
      
              previousDay = parseInt(day);
            }
      


            if (checkIn && checkIn.length < 11 && checkIn.length > 5) {
              let firstPart = null;
              let secondPart = null;

              firstPart = checkIn.slice(0, 5)+':00';  
              secondPart = checkIn.slice(5)+':00';

              if(firstPart.slice(0,2) > 12){
                secondPart = firstPart;
                firstPart = null;
              }
          
              if (secondPart.slice(0,2) < 12){
                firstPart = secondPart;
                secondPart = null;
              }

              if(firstPart !== null && secondPart !== null){

              date = new Date(date);
              date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Ajuste a UTC
              

              scheduleList.push({
                identification,
                name,
                check_in: firstPart,
                check_out: secondPart,
                date: date ? date.getFullYear() + '-' + 
                (date.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                date.getDate().toString().padStart(2, '0') : 'N/A',

                delays: 1,
                  early_release: 1,
                  misses: 1,
                  extras: 1,
              });
            }
          }
        }
        }
        
        rowIndex += 2; 
      }

    } catch (error) {
      console.error(`Error procesando el archivo ${file.name}:`, error);
      invalidFiles.push(file.name);
    }
  }

  if (invalidFiles.length > 0) {
    alert(`Archivos no procesados por mal formato: ${invalidFiles.join(', ')}`);
  }

  console.log("los datos consistentes son", scheduleList);
  return scheduleList;
};

export const processInconsistentExcelFiles = async (files) => {
  const scheduleList = [];
  const invalidFiles = [];

  for (const file of files) {
    const reader = new FileReader();

    try {
      const fileData = await new Promise((resolve, reject) => {
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
      });

      const workbook = XLSX.read(fileData, { type: 'binary' });
      const sheetName = workbook.SheetNames[2];

      if (!sheetName) {
        console.warn(`El archivo ${file.name} no tiene suficientes hojas.`);
        invalidFiles.push(file.name);
        continue;
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!jsonData[2] || jsonData[2].length < 3) {
        invalidFiles.push(file.name);
        continue;
      }

      let fileHeaders = jsonData[2]
        .filter(header => header && header.toString().trim() !== '')
        .map(header => header.toString().trim());

      fileHeaders = fileHeaders.filter(header => header !== 'Primer Horario' && header !== 'Segundo Horario' && header !== 'Notas');
      let isValidFormat= true;

      if((worksheet['A5'].v !== expectedHeaders[0]) && (worksheet['I5'].v !== expectedHeaders[1])){
      isValidFormat=false;
      }

      let rowIndex = 5;
     
      while (worksheet[`C${rowIndex}`] && worksheet[`K${rowIndex}`]) {
        const identification = worksheet[`C${rowIndex}`]?.v.toString().trim() || "N/A";
        const name = worksheet[`K${rowIndex}`]?.v.toString().trim() || "N/A";
        const checkInRow = jsonData[rowIndex];
        const dateInRow = jsonData[3];
        const dateInits = (worksheet[`C${3}`]?.v.toString().trim().substring(0, 7)) || "N/A";
        let [year, month] = dateInits.split("-"); 

        
        let previousDay = null;
        
        if (checkInRow) {

          //cambiar el 14
          for (let col = 0; col < 14; col++) { 
            const checkIn = checkInRow[col]?.toString().trim() || null;
            let day = dateInRow[col]?.toString().trim() || null;
      
            let date = null;
      
            if (day) {
              if (!previousDay) {
                previousDay = parseInt(day);
              }
      
              if (parseInt(day) < previousDay) {
                let newMonth = parseInt(month) + 1;
                let newYear = parseInt(year);
                year = newYear;
                month = newMonth;
      
                if (newMonth > 12) {
                  newMonth = 1;  
                  newYear += 1; 
                  year = newYear;
                  month = newMonth;
                }
      
                day = '01';

                date = `${newYear}-${String(newMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;


              } else {
                date = `${year}-${month}-${String(day).padStart(2, '0')}`;
            
              }
              previousDay = parseInt(day);
            }
      
            if (checkIn) {
              if (checkIn.length >= 11 || checkIn.length === 5) {
                let firstPart = null;
                let secondPart = null;
              
                if (checkIn.length >= 11) {
                  firstPart = checkIn.slice(0, 5) + ':00';  // Ejemplo: 07:39
                  secondPart = '¿' + checkIn.slice(5, 10) + ':00' + " o " + checkIn.slice(10)+':00' +'?';   // Ejemplo: 21:04
                } else if (checkIn.length === 5) {
                  const checkInHour = parseInt(checkIn.slice(0, 2), 10);
                  if (checkInHour >= 12) {
                    secondPart = checkIn + ':00';
                  } else {
                    firstPart = checkIn + ':00';
                  }
                }

                date = new Date(date);
                date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Ajuste a UTC
                
      
                scheduleList.push({
                  identification,
                  name,
                  check_in: firstPart ? firstPart : 'N/A',
                  check_out: secondPart ? secondPart : 'N/A',
                  date: date ? date.getFullYear() + '-' + 
                  (date.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                  date.getDate().toString().padStart(2, '0') : 'N/A',

                  delays: 1,
                  early_release: 1,
                  misses: 1,
                  extras: 1,
                });


               
              }else{
                if(checkIn.length < 11 && checkIn.length > 5){
                  let firstPart = null;
                  let secondPart = null;
      
                  firstPart = checkIn.slice(0, 5)+':00';  
                  secondPart = checkIn.slice(5)+':00';
      
                  if(firstPart.slice(0,2) > 12){
                    secondPart = '¿' + firstPart + ' o ' + secondPart + '?';
                    firstPart = null;
                  }
              
                  if (secondPart.slice(0,2) < 12){
                    firstPart = '¿'+firstPart+ ' o ' + secondPart+'?';
                    secondPart = null;
                  }
      
                  if(firstPart === null || secondPart === null){
      
                  date = new Date(date);
                  date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Ajuste a UTC
                  
      
                  scheduleList.push({
                    identification,
                    name,
                    check_in: firstPart? firstPart : 'N/A',
                    check_out: secondPart? secondPart : 'N/A',
                    date: date ? date.getFullYear() + '-' + 
                    (date.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                    date.getDate().toString().padStart(2, '0') : 'N/A',
      
                    delays: 1,
                      early_release: 1,
                      misses: 1,
                      extras: 1,
                  });
                }
              }
              }
            }
          }
          
        }
        
        rowIndex += 2; // Aumentamos en 2 filas para la siguiente persona
      }
      
      


    } catch (error) {
      console.error(`Error procesando el archivo ${file.name}:`, error);
      invalidFiles.push(file.name);
    }
  }

console.log("los datos inconsistentes son", scheduleList);

  return scheduleList;
};

export const GroupBYIdentification = async (scheduleList, invalidScheduleList) => {

const combinedList = scheduleList.concat(invalidScheduleList);

  const groupedSchedules = combinedList.reduce((acc, schedule) => {
    if (!acc[schedule.identification]) {
      acc[schedule.identification] = [];
    }
    acc[schedule.identification].push(schedule);
    return acc;
  }, {});

  console.log("los datos agrupados son: ", groupedSchedules);

  return groupedSchedules;

}

export const UnifyByIdentification = async (groupedSchedules, lunchHours) => {
  let UnifyByIdentification = [];

  for (const identification in groupedSchedules) {
    const schedules = groupedSchedules[identification];
    let hoursWorked = 0;
    let extraHours = 0;

    for (const schedule of schedules) {
      if (schedule.check_out !== 'N/A' && schedule.check_in !== 'N/A') {
        const checkInTime = new Date(`1970-01-01T${schedule.check_in}Z`);
        const checkOutTime = new Date(`1970-01-01T${schedule.check_out}Z`);
        
        // Verifica que las fechas se hayan creado correctamente
        if (!isNaN(checkInTime) && !isNaN(checkOutTime)) {
          const workedHours = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Convert milliseconds to hours
          const lunchHour = lunchHours[identification] || 0;
          const netWorkedHours = workedHours - lunchHour;

          if (netWorkedHours > 9.6) {
            extraHours += netWorkedHours - 9.6;
            hoursWorked += 9.6;
          } else {
            hoursWorked += netWorkedHours;
          }
        } else {
          console.error(`Error al convertir las horas: check_in=${schedule.check_in}, check_out=${schedule.check_out}`);
        }
      }
    }

    UnifyByIdentification.push({
      identification: schedules[0].identification,
      name: schedules[0].name,
      hoursWorked: hoursWorked > 0 ? hoursWorked : 0,
      extraHours: extraHours > 0 ? extraHours : 0
    });
  }

  return UnifyByIdentification;
}

export const calculateSalary = async (unifiedSchedules, salaryPerHour) => {
  const salaryList = unifiedSchedules.map((schedule) => {
    const salary = (schedule.hoursWorked * salaryPerHour[schedule.identification]) + (schedule.extraHours * salaryPerHour[schedule.identification] * 1.5);
    return {
      identification: schedule.identification,
      name: schedule.name,
      hoursWorked: schedule.hoursWorked,
      extraHours: schedule.extraHours,
      salary: salary
    };
  });

  return salaryList;
}

export const addSchedules=async ( unifiedSchedules,salaryPerHour ) => {

  try {
    for (const schedule of unifiedSchedules) {
      // Enviar datos a /schedules
      const scheduleData = {
        identification: schedule.identification,
        name: schedule.name,
        hourly_rate: salaryPerHour[schedule.identification] || 0,
        workday_hours: 9.6,
      }

      const schedulesResponse = await api.post('/schedules', scheduleData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('session_token')}` },
      })

      const scheduleEntryData = {
        schedule_id: schedulesResponse.data.id,
        date: new Date().toISOString().split('T')[0],
        hours_worked: schedule.hoursWorked,
        hours_extra: schedule.extraHours,
        salary: schedule.salary,
      }

      // Guardar horarios unificados
      await api.post('/schedule-entries', scheduleEntryData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('session_token')}` },
      })
    }
  } catch (error) {
    console.error('Error al agregar horarios:', error);
    throw error;
  }


}

export const getSchedules = async () => {
  try {
    const response = await api.get('/schedules', {
      headers: { Authorization: `Bearer ${localStorage.getItem('session_token')}`,Connection: 'keep-alive' },
    });

    return response.data;
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    throw error;
  }
}

export const getScheduleEntries = async (scheduleId) => {
  try {
    const response = await api.get(`/schedule-entries/${scheduleId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('session_token')}` ,Connection: 'keep-alive'  },
    });

    return response.data;
  } catch (error) {
    console.error('Error al obtener entradas de horario:', error);
    throw error;
  }
}

export const getSalaryData = async (identification) => {
  try {
    const response = await api.get(`/schedules/identification/${identification}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('session_token')}` },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de salario:', error);
    throw error;
  }
}

