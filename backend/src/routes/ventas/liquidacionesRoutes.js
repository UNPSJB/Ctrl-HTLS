const express = require('express');
const {
  liquidarComisiones,
  listarLiquidaciones,
} = require('../../controllers/ventas/liquidacionesController');

const router = express.Router();

router.post('/liquidaciones/liquidar', liquidarComisiones);
router.get('/liquidaciones', listarLiquidaciones);

module.exports = router;
