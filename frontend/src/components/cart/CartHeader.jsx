function CartHeader() {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <h2
        id="cart-title"
        className="text-lg font-semibold text-gray-900 dark:text-gray-100"
      >
        Carrito de Reservas
      </h2>
    </div>
  );
}

export default CartHeader;
