/* eslint-disable prettier/prettier */

const MaintenanceEntryModel = {
  id: 0,
  maintenance_id: 0,
  entry_time: '', // Formato ISO: "YYYY-MM-DDTHH:mm:ssZ"
  estimated_completion: '', // Formato ISO: "YYYY-MM-DDTHH:mm:ssZ"
  maintenance_status: 'En espera',
  assigned_mechanic: '',
  is_active: true,
  vehicle_plate: '',
}

export default MaintenanceEntryModel
