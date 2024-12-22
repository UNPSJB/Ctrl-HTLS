const express = require('express');
const app = express();
const port = 3000;
const sequelize = require('./config/database');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos exitosa.');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  }
}

// Probar la conexión antes de iniciar el servidor
testConnection();

app.listen(port, () => {
  console.log(`Server inicializado en el puerto ${port}`);
});
