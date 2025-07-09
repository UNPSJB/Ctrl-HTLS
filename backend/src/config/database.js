const Sequelize = require('sequelize');
require('dotenv').config();
const colors = require('colors/safe');

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  //loggin: false,
  logging: (msg) => {
    if (msg.includes('SELECT')) {
      console.log(colors.cyan(msg)); // SELECT -> Cyan
    } else if (msg.includes('INSERT')) {
      console.log(colors.green(msg)); // INSERT -> Verde
    } else if (msg.includes('UPDATE')) {
      console.log(colors.yellow(msg)); // UPDATE -> Amarillo
    } else if (msg.includes('DELETE')) {
      console.log(colors.red(msg)); // DELETE -> Rojo
    } else {
      console.log(colors.gray(msg)); // Otros -> Gris
    }
  },
});

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: process.env.DB_DIALECT,
//     logging: false,
//   },
// );

module.exports = sequelize;
