const {
    getScheduleEntries,
    getScheduleEntryById,
    addScheduleEntry,
    updateScheduleEntry,
    deleteScheduleEntry,
  } = require("../models/scheduleEntry.model");
  
  const sql = require("mssql");
  
  // Mock de la conexión a la base de datos
  jest.mock("mssql");
  
  describe("ScheduleEntry Functions", () => {
    beforeEach(() => {
      // Limpiar todos los mocks antes de cada prueba
      jest.clearAllMocks();
    });
  
    test("getScheduleEntries should return all entries for a schedule", async () => {
      const mockRecordset = [
        { id: 1, schedule_id: 1, date: new Date("2023-01-01"), hours_worked: 8, hours_extra: 2, salary: 100 },
        { id: 2, schedule_id: 1, date: new Date("2023-01-02"), hours_worked: 7, hours_extra: 1, salary: 90 },
      ];
  
      sql.Request.prototype.query.mockResolvedValueOnce({ recordset: mockRecordset });
  
      const result = await getScheduleEntries(1);
      expect(result).toEqual(mockRecordset);
      expect(
        sql.Request.prototype.query.mock.calls[0][0].replace(/\s+/g, ' ').trim()
      ).toBe("SELECT * FROM ScheduleEntries WHERE schedule_id = @id ORDER BY date DESC");
    });
  
    test("getScheduleEntryById should return an entry by ID", async () => {
      const mockEntry = { id: 1, schedule_id: 1, date: new Date("2023-01-01"), hours_worked: 8, hours_extra: 2, salary: 100 };
  
      sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [mockEntry] });
  
      const result = await getScheduleEntryById(1);
      expect(result).toEqual(mockEntry);
      expect(
        sql.Request.prototype.query.mock.calls[0][0].replace(/\s+/g, ' ').trim()
      ).toBe("SELECT * FROM ScheduleEntries WHERE Id = @id");
    });
  
    test("addScheduleEntry should add a new entry and return the ID", async () => {
      const mockEntry = {
        schedule_id: 1,
        date: new Date("2023-01-01"),
        hours_worked: 8,
        hours_extra: 2,
        salary: 100,
      };
  
      const mockResult = { recordset: [{ id: 1 }] };
  
      sql.Request.prototype.query.mockResolvedValueOnce(mockResult);
  
      const result = await addScheduleEntry(mockEntry);
      expect(result).toBe(1);
      expect(sql.Request.prototype.query).toHaveBeenCalled();
    });
  
    test("updateScheduleEntry should update an entry", async () => {
      const mockEntry = {
        schedule_id: 1,
        date: new Date("2023-01-01"),
        hours_worked: 8,
        hours_extra: 2,
        salary: 100,
      };
  
      sql.Request.prototype.query.mockResolvedValueOnce({});
  
      await updateScheduleEntry(1, mockEntry);
      expect(sql.Request.prototype.query).toHaveBeenCalled();
    });
  
    test("deleteScheduleEntry should delete an entry", async () => {
      sql.Request.prototype.query.mockResolvedValueOnce({});
  
      await deleteScheduleEntry(1);
      expect(
        sql.Request.prototype.query.mock.calls[0][0].replace(/\s+/g, ' ').trim()
      ).toBe("DELETE FROM ScheduleEntries WHERE Id = @id");
    });
  
    // Pruebas adicionales para validar atributos requeridos y formatos correctos
    test("addScheduleEntry should throw an error if schedule_id is missing", async () => {
      const invalidEntry = {
        date: new Date("2023-01-01"),
        hours_worked: 8,
        hours_extra: 2,
        salary: 100,
      };
  
      await expect(addScheduleEntry(invalidEntry)).rejects.toThrow(
        "El ID del horario es requerido y debe ser un número positivo."
      );
    });
  
    test("addScheduleEntry should throw an error if date is not a Date instance", async () => {
      const invalidEntry = {
        schedule_id: 1,
        date: "2023-01-01",
        hours_worked: 8,
        hours_extra: 2,
        salary: 100,
      };
  
      await expect(addScheduleEntry(invalidEntry)).rejects.toThrow(
        "La fecha es requerida y debe ser una instancia de Date."
      );
    });
  
    test("addScheduleEntry should throw an error if hours_worked is not a non-negative number", async () => {
      const invalidEntry = {
        schedule_id: 1,
        date: new Date("2023-01-01"),
        hours_worked: -8,
        hours_extra: 2,
        salary: 100,
      };
  
      await expect(addScheduleEntry(invalidEntry)).rejects.toThrow(
        "Las horas trabajadas son requeridas y deben ser un número no negativo."
      );
    });
  });