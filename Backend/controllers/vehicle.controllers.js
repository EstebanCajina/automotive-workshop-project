const vehicleService = require('../services/vehicle.services');

async function getVehicles(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;  // Página por defecto: 1
    const pageSize = parseInt(req.query.pageSize) || 5;  // Tamaño por defecto: 10

    const vehicles = await vehicleService.getAllVehicles(page, pageSize);
    const totalVehicles = await vehicleService.getTotalVehicles();  // Obtener total de registros
    
    res.json({
      totalVehicles,
      totalPages: Math.ceil(totalVehicles / pageSize),
      currentPage: page,
      pageSize,
      data: vehicles
    });
    
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function addVehicles(req, res) {
  try {
    const vehicles = req.body;  // Suponiendo que la lista de vehículos está en el cuerpo de la solicitud

    if (!Array.isArray(vehicles) || vehicles.length === 0) {
      return res.status(400).send('Debe proporcionar una lista de vehículos.');
    }

    const responses = [];
    for (let vehicle of vehicles) {
      try {
        const result = await vehicleService.addVehicle(vehicle);  // Llamada al servicio para agregar el vehículo
        if (result.exists) {
          responses.push({ id: result.id, plate: vehicle.plate, message: 'El vehículo ya existe.' });
        } else {
          responses.push({ id: result.id, plate: vehicle.plate });
        }
      } catch (err) {
        responses.push({ error: `${err.message}` });
      }
    }

    res.status(201).json(responses);  // Retorna el vector de respuestas
  } catch (err) {
    res.status(500).send(err.message);  // En caso de error, mandamos el mensaje
  }
}


async function getVehicleById(req, res) {
  try {
    const id = req.params.id;
    const vehicle = await vehicleService.getVehicleById(id);
    if (!vehicle) {
      return res.status(404).send('Vehículo no encontrado');
    }
    res.json(vehicle);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function updateVehicle(req, res) {
  try {
    const id = req.params.id;
    const vehicleData = req.body;
    const updatedVehicle = await vehicleService.updateVehicle(id, vehicleData);
    if (!updatedVehicle) {
      return res.status(404).send('Vehículo no encontrado');
    }
    res.send('Vehículo actualizado correctamente');
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function deleteVehicle(req, res) {
  try {
    const id = req.params.id;
    const result = await vehicleService.deleteVehicle(id);
    if (!result) {
      return res.status(404).send('Vehículo no encontrado o ya está inactivo');
    }
    res.send('Vehículo eliminado correctamente');
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function checkPlate(req, res) {
  try {
    const plate = req.params.plate;
    const exists = await vehicleService.checkPlate(plate);
    res.json(exists);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

module.exports = { getVehicles, getVehicleById, updateVehicle, deleteVehicle,addVehicles, checkPlate };

