import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Validación simple (la dejé igual pero ahora acepta card.type si existe)
 */
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

/* ---------- Helpers: formateo y detección de tipo de tarjeta ---------- */

/** Quita todo lo que no sea dígito */
function onlyDigits(value = '') {
  return String(value).replace(/\D+/g, '');
}

/** Formatea el número en bloques de 4 (soporta Amex visualmente también) */
function formatCardNumber(value = '') {
  const digits = onlyDigits(value);
  // Para Amex (15 dígitos) el formato suele ser 4-6-5, pero aquí mantengo 4-4-4-4 para simplicidad visual.
  // Si necesitás el formato Amex específico podemos implementarlo.
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

/** Formatea expiry a MM/YY automáticamente */
function formatExpiry(value = '') {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

/**
 * Detección simple por prefijo/BIN — suficiente para UI local.
 * Devuelve uno de: 'visa','mastercard','amex','discover','unknown'
 */
function detectCardType(number = '') {
  const d = onlyDigits(number);
  if (d.startsWith('4')) return 'visa';
  // Mastercard: 51-55 or 2221-2720
  const two = Number(d.slice(0, 2));
  const four = Number(d.slice(0, 4));
  if ((two >= 51 && two <= 55) || (four >= 2221 && four <= 2720))
    return 'mastercard';
  if (d.startsWith('34') || d.startsWith('37')) return 'amex';
  if (
    d.startsWith('6011') ||
    d.startsWith('65') ||
    d.startsWith('644') ||
    d.startsWith('645') ||
    d.startsWith('646') ||
    d.startsWith('647') ||
    d.startsWith('648') ||
    d.startsWith('649')
  )
    return 'discover';
  return 'unknown';
}

/** Iconos / badges visuales por tipo (sin texto) */
function CardBrandIcon({ type }) {
  // No devuelvo texto visible; solo SVGs/colores distintos.
  // aria-hidden para no exponer la marca como texto (cumple tu pedido).
  // Si necesitás accesibilidad, podés añadir un sr-only con descripción aparte.
  switch (type) {
    case 'visa':
      return (
        <div
          aria-hidden
          className="flex h-7 w-10 items-center justify-center rounded bg-blue-100"
        >
          <svg
            width="22"
            height="14"
            viewBox="0 0 22 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="22" height="14" rx="2" fill="#1A6ED8" />
            <path d="M3 10L5 4H7L9 10H7L6.3 7H5.1L4.4 10H3Z" fill="white" />
          </svg>
        </div>
      );
    case 'mastercard':
      return (
        <div
          aria-hidden
          className="flex h-7 w-10 items-center justify-center rounded bg-red-50"
        >
          <svg
            width="22"
            height="14"
            viewBox="0 0 22 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="8" cy="7" r="5" fill="#FF5F00" />
            <circle cx="14" cy="7" r="5" fill="#EB001B" />
          </svg>
        </div>
      );
    case 'amex':
      return (
        <div
          aria-hidden
          className="flex h-7 w-10 items-center justify-center rounded bg-green-50"
        >
          <svg
            width="22"
            height="14"
            viewBox="0 0 22 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="22" height="14" rx="2" fill="#2A9D8F" />
          </svg>
        </div>
      );
    case 'discover':
      return (
        <div
          aria-hidden
          className="flex h-7 w-10 items-center justify-center rounded bg-yellow-50"
        >
          <svg
            width="22"
            height="14"
            viewBox="0 0 22 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="22" height="14" rx="2" fill="#FFA500" />
          </svg>
        </div>
      );
    default:
      return (
        <div
          aria-hidden
          className="flex h-7 w-10 items-center justify-center rounded bg-gray-100"
        >
          <svg
            width="18"
            height="12"
            viewBox="0 0 18 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="18" height="12" rx="2" fill="#D1D5DB" />
          </svg>
        </div>
      );
  }
}

/* ---------- Componente principal ---------- */

function TarjetaForm({ onChange, className = '' }) {
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
    cardType: 'unknown',
  });

  // Detectar tipo de tarjeta a partir del número actual
  const cardType = useMemo(
    () => detectCardType(cardData.number),
    [cardData.number]
  );

  // Valid (memoized para no recrear función todo el tiempo)
  const valid = useMemo(() => simpleValidate(cardData), [cardData]);

  // Notificar cambios al padre: mantiene la forma { cardData, valid }.
  useEffect(() => {
    if (typeof onChange === 'function') {
      // Añado cardType dentro de cardData para que el padre pueda usarlo si quiere
      onChange({ cardData: { ...cardData, cardType }, valid });
    }
  }, [cardData, cardType, valid]);

  // Handlers para campos con formateo/sanitización
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
    // limitar a 4 dígitos máximo
    const digits = onlyDigits(e.target.value).slice(0, 4);
    setCardData((p) => ({ ...p, cvc: digits }));
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Número de tarjeta
        </span>

        <div className="mt-1 flex items-center gap-3">
          <div className="flex-1">
            <input
              id="card-number"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardData.number}
              onChange={handleNumber}
              className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              inputMode="numeric"
              aria-label="Número de tarjeta"
              autoComplete="cc-number"
            />
          </div>

          {/* Icono visual de la marca detectada — NO muestra el nombre */}
          <div className="shrink-0">
            <CardBrandIcon type={cardType} />
          </div>
        </div>
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
          onChange={handleName}
          className="mt-1 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
          aria-label="Nombre en la tarjeta"
          autoComplete="cc-name"
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
            onChange={handleExpiry}
            className="mt-1 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            aria-label="Fecha de expiración"
            inputMode="numeric"
            autoComplete="cc-exp"
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-700 dark:text-gray-300">CVC</span>
          <input
            id="card-cvc"
            type="text"
            placeholder="123"
            value={cardData.cvc}
            onChange={handleCvc}
            className="mt-1 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            inputMode="numeric"
            aria-label="CVC"
            autoComplete="cc-csc"
          />
        </label>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Validación simple local: {valid ? 'OK' : 'Incompleto/Inválido'}
      </div>
    </div>
  );
}

export default TarjetaForm;
