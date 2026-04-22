import { useCallback, useEffect, useMemo, useState } from 'react';
import { TextInput } from '@ui/form';

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

function onlyDigits(value = '') {
  return String(value).replace(/\D+/g, '');
}

function formatCardNumber(value = '') {
  const digits = onlyDigits(value);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiry(value = '') {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

// Formulario para ingresar datos de tarjeta de crédito/débito
function TarjetaForm({ onChange, className = '' }) {
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });

  const valid = useMemo(() => simpleValidate(cardData), [cardData]);

  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange({ cardData, valid });
    }
  }, [cardData, valid, onChange]);

  const handleNumber = useCallback((e) => {
    const raw = e.target.value;
    const formatted = formatCardNumber(raw);
    setCardData((p) => ({ ...p, number: formatted }));
  }, []);

  const handleName = useCallback((e) => {
    setCardData((p) => ({ ...p, name: e.target.value }));
  }, []);

  const handleExpiry = useCallback((e) => {
    const formatted = formatExpiry(e.target.value);
    setCardData((p) => ({ ...p, expiry: formatted }));
  }, []);

  const handleCvc = useCallback((e) => {
    const digits = onlyDigits(e.target.value).slice(0, 4);
    setCardData((p) => ({ ...p, cvc: digits }));
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block">
        <span className="text-sm text-gray-700 dark:text-gray-300">Número de tarjeta</span>
        <div className="mt-1">
          <TextInput
            id="card-number"
            placeholder="1234 5678 9012 3456"
            value={cardData.number}
            onChange={handleNumber}
            inputMode="numeric"
            aria-label="Número de tarjeta"
            autoComplete="cc-number"
          />
        </div>
      </label>

      <label className="block">
        <span className="text-sm text-gray-700 dark:text-gray-300">Nombre en la tarjeta</span>
        <div className="mt-1">
          <TextInput
            id="card-name"
            placeholder="Nombre completo"
            value={cardData.name}
            onChange={handleName}
            aria-label="Nombre en la tarjeta"
            autoComplete="cc-name"
          />
        </div>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-sm text-gray-700 dark:text-gray-300">MM/YY</span>
          <div className="mt-1">
            <TextInput
              id="card-expiry"
              placeholder="MM/YY"
              value={cardData.expiry}
              onChange={handleExpiry}
              aria-label="Fecha de expiración"
              inputMode="numeric"
              autoComplete="cc-exp"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-sm text-gray-700 dark:text-gray-300">CVC</span>
          <div className="mt-1">
            <TextInput
              id="card-cvc"
              placeholder="123"
              value={cardData.cvc}
              onChange={handleCvc}
              inputMode="numeric"
              aria-label="CVC"
              autoComplete="cc-csc"
            />
          </div>
        </label>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Validación simple local: {valid ? 'OK' : 'Incompleto/Inválido'}
      </div>
    </div>
  );
}

export default TarjetaForm;
