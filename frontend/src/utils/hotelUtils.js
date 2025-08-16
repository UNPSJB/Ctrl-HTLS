// Wrapper ligero que adapta selected ids a las funciones de pricing (en español)

import pricing from './pricingUtils'; // import por defecto (objeto) para facilidad

export const calculateRoomsTotal = (
  selectedRoomIds = [],
  habitaciones = [],
  descuentoHotel = 0
) => {
  const selectedSet = new Set((selectedRoomIds || []).map((id) => String(id)));
  const totals = (habitaciones || [])
    .filter((hab) => selectedSet.has(String(hab.id)))
    .map((hab) =>
      pricing.calcularPrecioFinalHabitacion({ habitacion: hab, descuentoHotel })
    );
  const total = totals.reduce((acc, t) => acc + (t.final ?? 0), 0);
  return Math.round(total * 100) / 100;
};

export const calculatePackagesTotal = (
  selectedPackageIds = [],
  paquetes = [],
  descuentoHotel = 0
) => {
  const selectedSet = new Set(
    (selectedPackageIds || []).map((id) => String(id))
  );
  const totals = (paquetes || [])
    .filter((p) => selectedSet.has(String(p.id)))
    .map((p) =>
      pricing.calcularPrecioFinalPaquete({ paquete: p, descuentoHotel })
    );
  const total = totals.reduce((acc, t) => acc + (t.final ?? 0), 0);
  return Math.round(total * 100) / 100;
};
