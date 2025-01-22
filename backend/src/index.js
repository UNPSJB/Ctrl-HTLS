const express = require('express');
const app = express();
const port = 3000;
const sequelize = require('./config/database');
const { swaggerUi, swaggerSpec } = require('./config/swaggerConfig');
const coreRoutes = require('./routes/core/coreRoutes');
const hotelRoutes = require('./routes/hotel/hotelRoutes');

// Importar todos los modelos y asociaciones
require('./models/associations');
require('./docs/swaggerDocs');

app.use(express.json());

// Middleware para Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Usar las rutas de core
app.use('/api', coreRoutes);
app.use('/api', hotelRoutes);

// Sincronizar la base de datos
sequelize
  // .sync({ alter: true }) // Si se crean nuevas tablas descomentar esta linea y comentar la de "autenticar"
  // .then(() => {
  //   console.log('Base de datos y tablas creadas');
  .authenticate()
  .then(() => {
    console.log('Conexión establecida con la base de datos');

    // Iniciar el servidor
    app.listen(port, () => {
      console.log(`Servidor inicializado en el puerto ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error al crear la base de datos y tablas:', error);
  });
