const express = require('express');
const {
  liquidarComisiones,
  liquidarVendedor,
  listarLiquidaciones,
} = require('../../controllers/ventas/liquidacionesController');

const router = express.Router();

router.post('/liquidaciones/liquidar', liquidarComisiones);
router.post('/liquidaciones/liquidar/:vendedorId', liquidarVendedor);
router.get('/liquidaciones', listarLiquidaciones);

module.exports = router;
