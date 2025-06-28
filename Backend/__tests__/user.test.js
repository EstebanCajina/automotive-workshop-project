const {
  getAllUsers,
  addUser,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
} = require("../models/user.model");

const sql = require("mssql");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Mock de la conexión a la base de datos
jest.mock("mssql");

describe("User Functions", () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  test("getAllUsers should return all users", async () => {
    const mockRecordset = [
      { id: 1, username: "user1", role: "admin", is_active: 1 },
      { id: 2, username: "user2", role: "user", is_active: 1 },
    ];

    sql.Request.prototype.query.mockResolvedValueOnce({ recordset: mockRecordset });

    const result = await getAllUsers();
    expect(result).toEqual(mockRecordset);
    expect(sql.Request.prototype.query).toHaveBeenCalledWith("SELECT * FROM Users ORDER BY is_active DESC");
  });

  test("addUser should throw an error if some parameters are missing", async () => {
    const invalidUser = {
      username: "",
      password: "password1",
      role: "user",
      is_active: 1,
    };

    await expect(addUser(invalidUser)).rejects.toThrow("Faltan campos requeridos: username, password, role o is_active.");
  });

  test("addUser should throw an error if username contains spaces", async () => {
    const invalidUser = {
      username: "user 1", // Contiene espacio
      password: "password1",
      role: "user",
      profile_picture: "profile.jpg",
      is_active: 1,
    };

    await expect(addUser(invalidUser)).rejects.toThrow("El nombre de usuario no puede contener espacios.");
  });

  test("addUser should throw an error if username already exists", async () => {
    const invalidUser = {
      username: "user1", // Ya existe
      password: "password1",
      role: "user",
      profile_picture: "profile.jpg",
      is_active: 1,
    };

    sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [{ username: "user1" }] });

    await expect(addUser(invalidUser)).rejects.toThrow("El nombre de usuario ya existe.");
  });

  // test("addUser should add a new user and return the ID", async () => {
  //   const mockUser = {
  //     username: "useroo",
  //     password: "password1",
  //     role: "user",
  //     profile_picture: "profile.jpg",
  //     is_active: 1,
  //   };

  //   const mockResult = { recordset: [{ id: 99 }] };

  //   sql.Request.prototype.query.mockResolvedValueOnce(mockResult);

  //   const result = await addUser(mockUser);
  //   expect(result).toBe(99);
  //   expect(sql.Request.prototype.query).toHaveBeenCalled();
  // });

  test("getUserById should return a user by ID", async () => {
    const mockUser = {
      id: 1,
      username: "user1",
      role: "admin",
      is_active: 1,
    };
  
    sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [mockUser] });
  
    const result = await getUserById(1);
  
    expect(result).toEqual(mockUser);
  
    // Remove extra spaces, newlines, and trim the result for comparison
    const actualQuery = sql.Request.prototype.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
    const expectedQuery = "SELECT * FROM Users WHERE id = @id";
  
    expect(actualQuery).toBe(expectedQuery);
  });
  

  test("updateUser should update a user", async () => {
    const mockUser = {
      username: "user1",
      role: "admin",
      is_active: 1,
    };

    sql.Request.prototype.query.mockResolvedValueOnce({});

    await updateUser(1, mockUser);
    expect(sql.Request.prototype.query).toHaveBeenCalled();
  });

  test("updateUser should throw an error if username contains spaces", async () => {
    const invalidUser = {
      username: "user 1", // Contiene espacio
      role: "admin",
      is_active: 1,
    };

    await expect(updateUser(1, invalidUser)).rejects.toThrow("El nombre de usuario no puede contener espacios.");
  });

  test("deleteUser should deactivate a user", async () => {
    sql.Request.prototype.query.mockResolvedValueOnce({});
  
    await deleteUser(1);
  
    const actualQuery = sql.Request.prototype.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
    const expectedQuery = "UPDATE Users SET is_active = 0 WHERE id = @id;"
    
    expect(actualQuery).toBe(expectedQuery);
  });
  

  // test("loginUser should return a token if credentials are valid", async () => {
  //   const mockUser = {
  //     id: 1,
  //     username: "user1",
  //     password: "password1",
  //     role: "admin",
  //     profile_picture: "profile.jpg",
  //     is_active: 1,
  //   };

  //   sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [mockUser] });

  //   const result = await loginUser("user1", "password1");

  //   expect(result).toHaveProperty("token");
  //   expect(result.user).toEqual(mockUser);
  //   expect(sql.Request.prototype.query).toHaveBeenCalled();
  // });

  test("loginUser should throw an error if credentials are invalid", async () => {
    sql.Request.prototype.query.mockResolvedValueOnce({ recordset: [] });

    await expect(loginUser("user1", "wrongpassword")).rejects.toThrow("Nombre de usuario o contraseña incorrectos");
  });

  test("logoutUser should remove session token from user", async () => {
    sql.Request.prototype.query.mockResolvedValueOnce({});
  
    await logoutUser(1);
    
    const actualQuery = sql.Request.prototype.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
    const expectedQuery = "UPDATE Users SET session_token = NULL WHERE id = @id";
    
    expect(actualQuery).toBe(expectedQuery);
  });
  
});
