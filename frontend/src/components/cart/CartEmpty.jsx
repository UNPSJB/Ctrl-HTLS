// src/components/cart/CartEmpty.jsx
function CartEmpty() {
  return (
    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
      <p className="font-medium">No hay reservas en el carrito</p>
      <p className="text-sm mt-2">
        Explora hoteles y agrega habitaciones o paquetes para reservar.
      </p>
    </div>
  );
}

export default CartEmpty;
