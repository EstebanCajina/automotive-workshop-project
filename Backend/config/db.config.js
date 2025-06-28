const express = require('express');
const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // Usar SSL si es necesario
    trustServerCertificate: true, // Solo para desarrollo
  },
};

async function connectDB() {
  try {
    await sql.connect(dbConfig);
    console.log('Connected to SQL Server');
  } catch (err) {
    console.error('Database connection failed', err);
  }
}

module.exports = { connectDB, sql };
