function Counter({ value = 0, onIncrement, onDecrement, max = 1 }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
      <button
        onClick={onDecrement}
        disabled={value <= 0}
        className="h-8 w-8 rounded-md bg-transparent px-2 text-lg font-bold text-gray-700 disabled:opacity-50 dark:text-gray-200"
        aria-label="Decrementar"
      >
        −
      </button>

      <div className="min-w-[36px] text-center text-sm font-medium text-gray-800 dark:text-gray-100">
        {value}
      </div>

      <button
        onClick={onIncrement}
        disabled={value >= max}
        className="h-8 w-8 rounded-md bg-transparent px-2 text-lg font-bold text-gray-700 disabled:opacity-50 dark:text-gray-200"
        aria-label="Incrementar"
      >
        +
      </button>
    </div>
  );
}

export default Counter;
