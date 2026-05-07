const express = require('express');
const {
  liquidarComisiones,
  liquidarVendedor,
  listarLiquidaciones,
  liquidarVendedorPorDetalles,
  getReciboPDF,
} = require('../../controllers/ventas/liquidacionesController');

const router = express.Router();

router.post('/liquidaciones/liquidar', liquidarComisiones);
router.post('/liquidaciones/liquidar/:vendedorId', liquidarVendedor);
router.post(
  '/liquidaciones/liquidar-detalles/:vendedorId',
  liquidarVendedorPorDetalles,
);
router.get('/liquidaciones', listarLiquidaciones);
router.get('/liquidaciones/:id/recibo', getReciboPDF);

module.exports = router;
