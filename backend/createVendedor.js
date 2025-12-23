const bcrypt = require('bcrypt');
const Empleado = require('./src/models/core/Empleado');
const sequelize = require('./src/config/database');

async function crearVendedor() {
  try {
    // Sincroniza con la base de datos
    await sequelize.authenticate();

    const passwordPlana = '123456';
    const saltRounds = 10;
    const passwordHasheada = await bcrypt.hash(passwordPlana, saltRounds);

    const nuevoVendedor = await Empleado.create({
      nombre: 'Juan',
      apellido: 'Vendedor',
      email: 'vendedor@test.com',
      password: passwordHasheada,
      rol: 'vendedor', // El ENUM permite 'vendedor'
      tipoDocumento: 'dni',
      numeroDocumento: '1234567800',
      direccion: 'Calle Falsa 123',
    });

    console.log('Vendedor creado con éxito:', nuevoVendedor.email);
  } catch (error) {
    console.error('Error al crear el vendedor:', error);
  } finally {
    await sequelize.close();
  }
}

crearVendedor();
