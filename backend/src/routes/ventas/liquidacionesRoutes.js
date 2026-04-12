const express = require('express');
const {
  liquidarComisiones,
  liquidarVendedor,
  listarLiquidaciones,
  liquidarVendedorPorDetalles,
} = require('../../controllers/ventas/liquidacionesController');

const router = express.Router();

router.post('/liquidaciones/liquidar', liquidarComisiones);
router.post('/liquidaciones/liquidar/:vendedorId', liquidarVendedor);
router.post(
  '/liquidaciones/liquidar-detalles/:vendedorId',
  liquidarVendedorPorDetalles,
);
router.get('/liquidaciones', listarLiquidaciones);

module.exports = router;
