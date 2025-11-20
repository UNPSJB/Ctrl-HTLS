const express = require('express');
const { confirmarPago } = require('../../controllers/ventas/facturasController');
const router = express.Router();

router.post('/generarFactura');

router.post('/confirmar-pago', confirmarPago);

module.exports = router;
