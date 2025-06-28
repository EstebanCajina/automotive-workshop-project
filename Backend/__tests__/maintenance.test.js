const {
    getAllMaintenances,
    addMaintenance,
    getMaintenanceById,
    updateMaintenance,
    deleteMaintenance,
    getMaintenanceByPlate,
  } = require("../models/maintenance.model"); // Ajusta la ruta al archivo que contiene las funciones
  
  const sql = require("mssql");
  
  // Mock de la conexión a la base de datos
  jest.mock("mssql");
  
  describe("Maintenance Functions", () => {
    beforeEach(() => {
      // Limpiar todos los mocks antes de cada prueba
      jest.clearAllMocks();
    });
  
    test("getAllMaintenances should return all active maintenances", async () => {
      const mockRecordset = [
        { id: 1, vehicle_id: 1, issue_description: "Problema 1", is_active: 1 },
        { id: 2, vehicle_id: 2, issue_description: "Problema 2", is_active: 1 },
      ];
  
      sql.Request.prototype.query.mockResolvedValueOnce({ recordset: mockRecordset });
  
      const result = await getAllMaintenances();
      expect(result).toEqual(mockRecordset);
      expect(sql.Request.prototype.query).toHaveBeenCalledWith(
        "SELECT * FROM Maintenances WHERE is_active = 1"
      );
    });

    test("addMaintenance should throw an error if some parameters is null", async () => {
const invalidMaintenance = {
    vehicle_id: 1,
    issue_description: "Problema 1",
    unit_mileage: 123, 
    mileage_date: "2023-10-01",
    requires_platform_transfer: true,
    under_warranty: false,
    mechanic_contact: "", // Parámetro nulo
    mechanic_phone: "123456789",
    observations: "Observación 1",
    is_active: 1,
}

await expect(addMaintenance(invalidMaintenance)).rejects.toThrow(
    "El contacto del mecánico no puede estar vacío."
);    
    });

    test("addMaintenance should throw an error if date is invalid", async () => {
        const invalidMaintenance = {
          vehicle_id: 1,
          issue_description: "Problema 1",
          unit_mileage: 123,
          mileage_date: "xsd", // Fecha inválida
          requires_platform_transfer: true,
          under_warranty: false,
          mechanic_contact: "Mecánico 1",
          mechanic_phone: "123456789",
          observations: "Observación 1",
          is_active: 1,
        };

        await expect(addMaintenance(invalidMaintenance)).rejects.toThrow(
            "La fecha de kilometraje no es válida."
        );
    });

  
    test("addMaintenance should add a new maintenance and return the ID", async () => {
      const mockMaintenance = {
        vehicle_id: 1,
        issue_description: "Problema 1",
        unit_mileage: 1000,
        mileage_date: "2023-10-01",
        requires_platform_transfer: true,
        under_warranty: false,
        mechanic_contact: "Mecánico 1",
        mechanic_phone: "123456789",
        observations: "Observación 1",
        is_active: 1,
      };
  
      const mockResult = { recordset: [{ id: 1 }] };
  
      sql.Request.prototype.query.mockResolvedValueOnce(mockResult);
  
      const result = await addMaintenance(mockMaintenance);
      expect(result).toBe(1);
      expect(sql.Request.prototype.query).toHaveBeenCalled();
    });
  
    test("addMaintenance should throw an error if vehicle_id is invalid", async () => {
      const invalidMaintenance = {
        vehicle_id: -1, // ID inválido
        issue_description: "Problema 1",
        unit_mileage: 1000,
        mileage_date: "2023-10-01",
        requires_platform_transfer: true,
        under_warranty: false,
        mechanic_contact: "Mecánico 1",
        mechanic_phone: "123456789",
        observations: "Observación 1",
        is_active: 1,
      };
  
      await expect(addMaintenance(invalidMaintenance)).rejects.toThrow(
        "El ID del vehículo debe ser un número positivo."
      );
    });

    test("getMaintenanceById should return a maintenance by ID", async () => {
      const mockMaintenance = {
        id: 1,
        vehicle_id: 1,
        issue_description: "Problema 1",
        is_active: 1,
      };
  
      sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [mockMaintenance] });
  
      const result = await getMaintenanceById(1);
      expect(result).toEqual(mockMaintenance);
      expect(
        sql.Request.prototype.query.mock.calls[0][0].replace(/\s+/g, ' ').trim()
      ).toBe("SELECT * FROM Maintenances WHERE id = @id AND is_active = 1");
      
    });
  
    test("updateMaintenance should update a maintenance", async () => {
      const mockMaintenance = {
        vehicle_id: 1,
        issue_description: "Problema actualizado",
        unit_mileage: 2000,
        mileage_date: "2023-10-02",
        requires_platform_transfer: false,
        under_warranty: true,
        mechanic_contact: "Mecánico 2",
        mechanic_phone: "987654321",
        observations: "Observación actualizada",
        is_active: 1,
      };
  
      sql.Request.prototype.query.mockResolvedValueOnce({});
  
      await updateMaintenance(1, mockMaintenance);
      expect(sql.Request.prototype.query).toHaveBeenCalled();
    });
  
    test("deleteMaintenance should deactivate a maintenance", async () => {
      sql.Request.prototype.query.mockResolvedValueOnce({});
  
      await deleteMaintenance(1);
      expect(
        sql.Request.prototype.query.mock.calls[0][0].replace(/\s+/g, ' ').trim()
      ).toBe(
        "UPDATE Maintenances SET is_active = 0 WHERE id = @id"
      );
    });


    test("getMaintenanceByPlate should return maintenance when the vehicle exists", async () => {
        // Mock de la respuesta de la consulta de vehículos
        const mockVehicle = { id: 1 };
        sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [mockVehicle] });
      
        // Mock de la respuesta de la consulta de mantenimientos
        const mockMaintenance = {
          id: 1,
          vehicle_id: 1,
          issue_description: "Problema 1",
          is_active: 1,
        };
        sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [mockMaintenance] });
      
        // Llamamos a la función
        const result = await getMaintenanceByPlate("ABC123");
      
        // Verificamos que el resultado sea el esperado
        expect(result).toEqual([mockMaintenance]);
      
        // Verificamos que las consultas se ejecutaron correctamente
        expect(sql.Request.prototype.query).toHaveBeenCalledTimes(2);
        expect(sql.Request.prototype.query.mock.calls[0][0]).toContain("SELECT id FROM Vehicles");
        expect(sql.Request.prototype.query.mock.calls[1][0]).toContain("SELECT * FROM Maintenances");
      });
      
      test("getMaintenanceByPlate should throw an error if vehicle does not exist", async () => {
        // Mock de la respuesta de la consulta de vehículos, sin resultados (vehículo no encontrado)
        sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [] });
      
        // Llamamos a la función y verificamos que lance el error adecuado
        await expect(getMaintenanceByPlate("XYZ999")).rejects.toThrow("No existe un vehículo con la placa XYZ999.");
      });
      

  });