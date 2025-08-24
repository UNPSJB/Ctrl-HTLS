import { useCallback, useEffect, useState } from 'react';

function simpleValidate(card) {
  const num = String(card.number || '').replace(/\s+/g, '');
  const name = String(card.name || '').trim();
  const expiry = String(card.expiry || '').trim();
  const cvc = String(card.cvc || '').trim();

  if (num.length < 12) return false;
  if (name.length < 2) return false;
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
  if (!/^\d{3,4}$/.test(cvc)) return false;
  return true;
}

function TarjetaForm({ onChange, className = '' }) {
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });

  // calcular validez
  const valid = useCallback(() => simpleValidate(cardData), [cardData]);

  // notificar cambios al padre (si existe)
  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange({ cardData, valid: valid() });
    }
  }, [cardData]);

  const handle = useCallback(
    (field) => (e) => {
      const v = e.target.value;
      setCardData((p) => ({ ...p, [field]: v }));
    },
    []
  );

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Número de tarjeta
        </span>
        <input
          id="card-number"
          type="text"
          placeholder="1234 5678 9012 3456"
          value={cardData.number}
          onChange={handle('number')}
          className="mt-1 w-full px-3 py-2 rounded border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-sm"
          inputMode="numeric"
          aria-label="Número de tarjeta"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Nombre en la tarjeta
        </span>
        <input
          id="card-name"
          type="text"
          placeholder="Nombre completo"
          value={cardData.name}
          onChange={handle('name')}
          className="mt-1 w-full px-3 py-2 rounded border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-sm"
          aria-label="Nombre en la tarjeta"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            MM/YY
          </span>
          <input
            id="card-expiry"
            type="text"
            placeholder="MM/YY"
            value={cardData.expiry}
            onChange={handle('expiry')}
            className="mt-1 px-3 py-2 rounded border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-sm w-full"
            aria-label="Fecha de expiración"
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-700 dark:text-gray-300">CVC</span>
          <input
            id="card-cvc"
            type="text"
            placeholder="123"
            value={cardData.cvc}
            onChange={handle('cvc')}
            className="mt-1 px-3 py-2 rounded border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-sm w-full"
            inputMode="numeric"
            aria-label="CVC"
          />
        </label>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Validación simple local: {valid() ? 'OK' : 'Incompleto/Inválido'}
      </div>
    </div>
  );
}

export default TarjetaForm;
