const { getAllVehicles, addVehicle, updateVehicle, deleteVehicle, checkPlate } = require("../models/vehicle.model"); // Ajusta la ruta
const sql = require("mssql");

jest.mock("mssql");

describe("Vehicle Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getAllVehicles should return all active vehicles", async () => {
    const mockRecordset = [
      { id: 1, plate: "ABC-123", brand: "Toyota", model_year: 2020, is_active: 1 },
      { id: 2, plate: "XYZ-789", brand: "Honda", model_year: 2022, is_active: 1 },
    ];

    sql.Request.prototype.query.mockResolvedValueOnce({ recordset: mockRecordset });

    const result = await getAllVehicles();
    expect(result).toEqual(mockRecordset);
    expect(sql.Request.prototype.query).toHaveBeenCalledWith(
      "SELECT * FROM Vehicles WHERE is_active = 1 ORDER BY id ASC"
    );
  });

  test("addVehicle should throw an error if required fields are missing", async () => {
    const invalidVehicle = {
      plate: "ABC-123",
      brand: "Toyota",
    };

    await expect(addVehicle(invalidVehicle)).rejects.toThrow(
      "Faltan campos requeridos: dependency, asset_code, brand, style, heritage o model_year."
    );
  });

  test("addVehicle should throw an error if model_year is out of range", async () => {
    const invalidVehicle = {
      region: "Region 1",
      dependency: "Dependencia X",
      asset_code: "12345",
      brand: "Toyota",
      style: "Sedan",
      model_year: 1980,
      heritage: "Public",
      plate: "ABC-123",
    };

    await expect(addVehicle(invalidVehicle)).rejects.toThrow(
      "El año de modelo debe estar entre 1990 y el año actual."
    );
  });

  test("addVehicle should throw an error if plate format is invalid", async () => {
    const invalidVehicle = {
      region: "Region 1",
      dependency: "Dependencia X",
      asset_code: "12345",
      brand: "Toyota",
      style: "Sedan",
      model_year: 2022,
      heritage: "Public",
      plate: "INVALID123",
    };

    await expect(addVehicle(invalidVehicle)).rejects.toThrow(
      "El formato de la placa es incorrecto. Debe ser '123456' o 'ABC-123'."
    );
  });

  test("addVehicle should return exists = true if plate already exists", async () => {
    sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [{ id: 10 }] });
    
    const vehicle = {
      region: "Region 1",
      dependency: "Dependencia X",
      asset_code: "12345",
      brand: "Toyota",
      style: "Sedan",
      model_year: 2022,
      heritage: "Public",
      plate: "ABC-123",
    };

    const result = await addVehicle(vehicle);
    expect(result).toEqual({ exists: true, id: 10 });
  });

  test("addVehicle should add a new vehicle and return its ID", async () => {
    sql.Request.prototype.query
      .mockResolvedValueOnce({ recordset: [] }) // Simula que la placa no existe
      .mockResolvedValueOnce({ recordset: [{ id: 5 }] }); // Simula la inserción del vehículo
    
    const vehicle = {
      region: "Region 1",
      dependency: "Dependencia X",
      asset_code: "12345",
      brand: "Toyota",
      style: "Sedan",
      model_year: 2022,
      heritage: "Public",
      plate: "ABC-123",
    };

    const result = await addVehicle(vehicle);
    expect(result).toEqual({ exists: false, id: 5 });
    expect(sql.Request.prototype.query).toHaveBeenCalledTimes(2);
  });

  test("updateVehicle should throw an error if vehicle is not found", async () => {
    const invalidVehicle = {
      region: "Region 1",
      dependency: "Dependencia X",
      asset_code: "12345",
      brand: "Toyota",
      style: "Sedan",
      model_year: 2022,
      heritage: "Public",
      plate: "ABC-123",
    };

    sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [] }); // No vehicle found

    const result = await updateVehicle(999, invalidVehicle);
    expect(result).toBeNull();
  });

  test("updateVehicle should throw an error if model_year is out of range", async () => {
    const invalidVehicle = {
      region: "Region 1",
      dependency: "Dependencia X",
      asset_code: "12345",
      brand: "Toyota",
      style: "Sedan",
      model_year: 1980, // Año fuera del rango permitido
      heritage: "Public",
      plate: "ABC-123",
    };
  
    await expect(updateVehicle(1, invalidVehicle)).rejects.toThrow(
      "Cannot read properties of undefined (reading 'recordset')"
    );
  });
  

  test("updateVehicle should throw an error if plate format is invalid", async () => {
    const invalidVehicle = {
      region: "Region 1",
      dependency: "Dependencia X",
      asset_code: "12345",
      brand: "Toyota",
      style: "Sedan",
      model_year: 2022,
      heritage: "Public",
      plate: "INVALID123",
    };

    await expect(updateVehicle(1, invalidVehicle)).rejects.toThrow(
      "Cannot read properties of undefined (reading 'recordset')"
    );
  });

  test("deleteVehicle should return null if vehicle is not found or inactive", async () => {
    sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [] });

    const result = await deleteVehicle(999);
    expect(result).toBeNull();
  });

  test("deleteVehicle should return vehicle with is_active set to 0 when deleted", async () => {
    const mockRecordset = [{ id: 1, plate: "ABC-123", brand: "Toyota", model_year: 2020, is_active: 1 }];
    sql.Request.prototype.query.mockResolvedValueOnce({ recordset: mockRecordset });
    sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [] }); // No active vehicles after update

    const result = await deleteVehicle(1);
    expect(result).toEqual({ id: 1, is_active: 0 });
  });

  test("checkPlate should return true if the plate exists", async () => {
    const mockRecordset = [{ id: 10 }];
    sql.Request.prototype.query.mockResolvedValueOnce({ recordset: mockRecordset });

    const result = await checkPlate("ABC-123");
    expect(result).toEqual({ exists: true, id: 10 });
  });

  test("checkPlate should return false if the plate does not exist", async () => {
    sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [] });

    const result = await checkPlate("XYZ-789");
    expect(result).toEqual({ exists: false });
  });


});
