const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db.config");
const userRoutes = require("./routes/user.route");
const vehicleRoutes = require("./routes/vehicle.route");
const maintenanceRoutes = require("./routes/maintenance.route");
const supplierRoutes = require("./routes/supplier.route");
const maintenanceEntryRoutes = require("./routes/maintenanceEntry.route");
const maintenanceEntryExtensionRoutes = require("./routes/maintenanceEntryExtension.route");
const scheduleRoutes = require("./routes/schedule.route");
const toolBoxRoutes = require("./routes/toolBox.route");
const scheduleEntryRoutes = require("./routes/scheduleEntry.route");
const certificatesRoutes = require("./routes/certificates.route");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();
const port = process.env.PORT || 3000;

connectDB();
// Configura los archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const corsOptions = {
  origin: "http://localhost:4000", // Especifica el origen permitido
  credentials: true, // Permite enviar credenciales
};
// Configurar el limitador de peticiones
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 200, // Límite de 100 peticiones por IP
  message: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
  headers: true, // Devuelve información en los headers sobre el rate limit
});

// Aplicar el rate limiter a todas las rutas
app.use(limiter);

app.use(cors(corsOptions)); // Permitir solicitudes desde cualquier origen
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/maintenances", maintenanceRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/maintenance-entries", maintenanceEntryRoutes);
app.use("/api/maintenance-entry-extensions", maintenanceEntryExtensionRoutes);
app.use("/api/certificates", certificatesRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/schedule-entries", scheduleEntryRoutes);
app.use("/api/toolboxes", toolBoxRoutes);

app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto http://localhost:${port}`);
});
