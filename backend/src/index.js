const express = require('express');
const app = express();
const port = 3000;
const sequelize = require('./config/database');
const Pais = require('./models/core/Pais');
const Provincia = require('./models/core/Provincia');
const Ciudad = require('./models/core/Ciudad');
const Cliente = require('./models/core/Cliente');
const Direccion = require('./models/core/Direccion');
const associations = require('./models/associations');

async function initializeServer() {
  try {
    // Probar conexión con la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos exitosa.');

    // Sincronizar modelos con la base de datos (crear tablas)
    //await sequelize.sync({ alter: true });
    await sequelize.sync({ force: true });
    console.log('Tablas sincronizadas con éxito.');

    // Iniciar el servidor
    app.listen(port, () => {
      console.log(`Servidor inicializado en el puerto ${port}`);
    });
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
  }
}

initializeServer();
