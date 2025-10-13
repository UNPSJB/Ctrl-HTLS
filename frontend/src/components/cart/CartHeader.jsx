function CartHeader() {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
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
