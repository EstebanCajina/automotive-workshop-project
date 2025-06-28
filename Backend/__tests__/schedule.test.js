const {
    getSchedules,
    getScheduleById,
    getScheduleByIdentification,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  } = require("../models/schedule.model");
  
  const sql = require("mssql");
  
  // Mock de la conexión a la base de datos
  jest.mock("mssql");
  
  describe("Schedule Functions", () => {
    beforeEach(() => {
      // Limpiar todos los mocks antes de cada prueba
      jest.clearAllMocks();
    });
  
    test("getSchedules should return all schedules", async () => {
      const mockRecordset = [
        { id: 1, identification: "123", name: "John Doe", hourly_rate: 20, extra_hourly_rate: 25, workday_hours: 8 },
        { id: 2, identification: "456", name: "Jane Doe", hourly_rate: 22, extra_hourly_rate: 27, workday_hours: 8 },
      ];
  
      sql.Request.prototype.query.mockResolvedValueOnce({ recordset: mockRecordset });
  
      const result = await getSchedules();
      expect(result).toEqual(mockRecordset);
      expect(sql.Request.prototype.query).toHaveBeenCalledWith("SELECT * FROM Schedules ORDER BY Id ASC");
    });
  
    test("getScheduleById should return a schedule by ID", async () => {
      const mockSchedule = { id: 1, identification: "123", name: "John Doe", hourly_rate: 20, extra_hourly_rate: 25, workday_hours: 8 };
  
      sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [mockSchedule] });
  
      const result = await getScheduleById(1);
      expect(result).toEqual(mockSchedule);
      expect(
        sql.Request.prototype.query.mock.calls[0][0].replace(/\s+/g, ' ').trim()
      ).toBe("SELECT * FROM Schedules WHERE Id = @id");
    });
  
    test("getScheduleByIdentification should return a schedule by identification", async () => {
      const mockSchedule = { id: 1, identification: "123", name: "John Doe", hourly_rate: 20, extra_hourly_rate: 25, workday_hours: 8 };
  
      sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [mockSchedule] });
  
      const result = await getScheduleByIdentification("123");
      expect(result).toEqual(mockSchedule);
      expect(
        sql.Request.prototype.query.mock.calls[0][0].replace(/\s+/g, ' ').trim()
      ).toBe("SELECT * FROM Schedules WHERE identification = @identification");
    });
  
    test("addSchedule should add a new schedule and return the ID", async () => {
      const mockSchedule = {
        identification: "123",
        name: "John Doe",
        hourly_rate: 20,
        extra_hourly_rate: 25,
        workday_hours: 8,
      };
  
      const mockResult = { recordset: [{ id: 1 }] };
  
      sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [] }); // No existing schedule
      sql.Request.prototype.query.mockResolvedValueOnce(mockResult); // Insert new schedule
  
      const result = await addSchedule(mockSchedule);
      expect(result).toBe(1);
      expect(sql.Request.prototype.query).toHaveBeenCalledTimes(2);
    });
  
    test("updateSchedule should update a schedule", async () => {
      const mockSchedule = {
        identification: "123",
        name: "John Doe",
        hourly_rate: 20,
        extra_hourly_rate: 25,
        workday_hours: 8,
      };
  
      sql.Request.prototype.query.mockResolvedValueOnce({});
  
      await updateSchedule(1, mockSchedule);
      expect(sql.Request.prototype.query).toHaveBeenCalled();
    });
  
    test("deleteSchedule should delete a schedule", async () => {
      sql.Request.prototype.query.mockResolvedValueOnce({});
  
      await deleteSchedule(1);
      expect(
        sql.Request.prototype.query.mock.calls[0][0].replace(/\s+/g, ' ').trim()
      ).toBe("DELETE FROM Schedules WHERE Id = @id");
    });
  
    // Pruebas adicionales para validar atributos requeridos y formatos correctos
    test("addSchedule should throw an error if identification is missing", async () => {
      const invalidSchedule = {
        name: "John Doe",
        hourly_rate: 20,
        extra_hourly_rate: 25,
        workday_hours: 8,
      };
  
      await expect(addSchedule(invalidSchedule)).rejects.toThrow(
        "La identificación es requerida y debe ser una cadena de texto."
      );
    });
  
    test("addSchedule should throw an error if hourly_rate is not a positive number", async () => {
      const invalidSchedule = {
        identification: "123",
        name: "John Doe",
        hourly_rate: -20,
        extra_hourly_rate: 25,
        workday_hours: 8,
      };
  
      await expect(addSchedule(invalidSchedule)).rejects.toThrow(
        "La tarifa por hora es requerida y debe ser un número positivo."
      );
    });
  });
