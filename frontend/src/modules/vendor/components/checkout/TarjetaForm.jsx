import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormField, TextInput } from '@ui/form';

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

function validateCard(card) {
  const errors = {};
  const num = String(card.number || '').replace(/\s+/g, '');
  const name = String(card.name || '').trim();
  const expiry = String(card.expiry || '').trim();
  const cvc = String(card.cvc || '').trim();

  // Validate Number
  if (num && num.length < 12) {
    errors.number = { message: 'El número de tarjeta es muy corto' };
  } else if (!num) {
    errors.number = { message: 'Requerido' };
  }

  // Validate Name
  if (name && name.length < 2) {
    errors.name = { message: 'Nombre muy corto' };
  } else if (!name) {
    errors.name = { message: 'Requerido' };
  }

  // Validate Expiry
  if (expiry) {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      errors.expiry = { message: 'Formato inválido (MM/YY)' };
    } else {
      const [monthStr, yearStr] = expiry.split('/');
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10) + 2000;

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      if (month < 1 || month > 12) {
        errors.expiry = { message: 'Mes inválido' };
      } else if (year < currentYear) {
        errors.expiry = { message: 'Tarjeta vencida' };
      } else if (year === currentYear && month < currentMonth) {
        errors.expiry = { message: 'Tarjeta vencida' };
      }
    }
  } else {
    errors.expiry = { message: 'Requerido' };
  }

  // Validate CVC
  if (cvc) {
    if (!/^\d{3,4}$/.test(cvc) || cvc.length < 3) {
      errors.cvc = { message: 'Mínimo 3 dígitos' };
    }
  } else {
    errors.cvc = { message: 'Requerido' };
  }

  return errors;
}

// Formulario para ingresar datos de tarjeta de credito
function TarjetaForm({ onChange, className = '' }) {
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });

  const [touched, setTouched] = useState({
    number: false,
    name: false,
    expiry: false,
    cvc: false,
  });

  const errors = useMemo(() => validateCard(cardData), [cardData]);
  const valid = Object.keys(errors).length === 0;

  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange({ cardData, valid });
    }
  }, [cardData, valid, onChange]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

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
    <div className={`space-y-4 ${className}`}>
      <FormField
        label="Numero de tarjeta"
        required
        error={touched.number ? errors.number : null}
      >
        <TextInput
          id="card-number"
          placeholder="1234 5678 9012 3456"
          value={cardData.number}
          onChange={handleNumber}
          onBlur={() => handleBlur('number')}
          inputMode="numeric"
          aria-label="Numero de tarjeta"
          autoComplete="cc-number"
        />
      </FormField>

      <FormField
        label="Nombre en la tarjeta"
        required
        error={touched.name ? errors.name : null}
      >
        <TextInput
          id="card-name"
          placeholder="Nombre completo"
          value={cardData.name}
          onChange={handleName}
          onBlur={() => handleBlur('name')}
          aria-label="Nombre en la tarjeta"
          autoComplete="cc-name"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="MM/YY"
          required
          error={touched.expiry ? errors.expiry : null}
        >
          <TextInput
            id="card-expiry"
            placeholder="MM/YY"
            value={cardData.expiry}
            onChange={handleExpiry}
            onBlur={() => handleBlur('expiry')}
            aria-label="Fecha de expiración"
            inputMode="numeric"
            autoComplete="cc-exp"
          />
        </FormField>

        <FormField
          label="CVC"
          required
          error={touched.cvc ? errors.cvc : null}
        >
          <TextInput
            id="card-cvc"
            placeholder="123"
            value={cardData.cvc}
            onChange={handleCvc}
            onBlur={() => handleBlur('cvc')}
            inputMode="numeric"
            aria-label="CVC"
            autoComplete="cc-csc"
          />
        </FormField>
      </div>
    </div>
  );
}

export default TarjetaForm;