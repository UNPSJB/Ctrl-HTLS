const Resumen = ({ totalOriginal, totalDiscount, totalFinal }) => (
  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
    <div className="flex justify-between items-center mb-4">
      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
      <span className="font-medium text-gray-800 dark:text-gray-100">
        ${totalOriginal.toFixed(2)}
      </span>
    </div>
    <div className="flex justify-between items-center mb-4">
      <span className="text-gray-600 dark:text-gray-400">Descuento:</span>
      <span className="font-medium text-gray-800 dark:text-gray-100">
        -${totalDiscount.toFixed(2)}
      </span>
    </div>
    <div className="flex justify-between items-center text-lg font-bold text-gray-800 dark:text-gray-100">
      <span>Total a Pagar:</span>
      <span>${totalFinal.toFixed(2)}</span>
    </div>
  </div>
);

export default Resumen;
