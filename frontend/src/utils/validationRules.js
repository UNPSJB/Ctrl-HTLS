/**
 * @file validationRules.js
 * @description Reglas de validación centralizadas para todos los formularios del sistema.
 *
 * CÓMO USAR:
 *   import { RULES } from '@/utils/validationRules';
 *
 *   // Uso básico — aplica el objeto completo de reglas
 *   {...register('nombre', { required: 'El nombre es obligatorio', ...RULES.nombre })}
 *
 *   // Uso con spread — para combinar con required u otras reglas contextuales
 *   {...register('telefono', { ...RULES.telefono })}
 *
 *   // Acceso a constantes de límites (para props HTML como maxLength del input)
 *   <TextInput maxLength={LIMITS.nombre} ... />
 *
 * NOTA:
 *   Estas reglas son las restricciones de formato/longitud compartidas.
 *   La regla `required` siempre se define en el formulario porque
 *   depende del contexto (ej: teléfono es opcional en hotels pero puede
 *   ser requerido en otro formulario).
 */

// ─── Constantes de Límites ───────────────────────────────────────────────────
// Cambiar aquí impacta en todas las validaciones y props HTML del sistema.

export const LIMITS = {
  // Personas
  nombre:        50,
  apellido:      50,
  // Hoteles / Entidades comerciales
  nombreHotel:    100,
  nombrePaquete:  80,
  descripcion:    500,
  direccion:      150,
  // Ubicaciones geográficas
  nombreUbicacion: 100,  // Países, provincias, ciudades
  codigoPostal:    10,
  // Documentos
  documento:     { min: 7, max: 15 },
  // Contacto
  telefono:      { min: 7, max: 20 },
  email:         320, // RFC 5321
  // Seguridad
  password:      { min: 8, max: 64 },
  // Financiero
  porcentaje:    { min: 0.01, max: 1 },
};

// ─── Patrones Reutilizables ──────────────────────────────────────────────────

const PATTERNS = {
  // Email estándar RFC-compatible
  email: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'El formato del email es inválido',
  },
  // Contraseña segura: al menos 1 mayúscula, 1 minúscula y 1 número
  passwordSeguro: {
    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Debe contener al menos una mayúscula, una minúscula y un número',
  },
};

// ─── Reglas por Campo ────────────────────────────────────────────────────────

/**
 * Reglas de validación para usar en react-hook-form.
 * Cada entrada es un objeto parcial de RegisterOptions (sin `required`).
 *
 * Uso: { required: 'El nombre es obligatorio', ...RULES.nombre }
 */
export const RULES = {

  // ── Persona ────────────────────────────────────────────────────────────────
  nombre: {
    maxLength: {
      value: LIMITS.nombre,
      message: `El nombre no puede superar los ${LIMITS.nombre} caracteres`,
    },
  },

  apellido: {
    maxLength: {
      value: LIMITS.apellido,
      message: `El apellido no puede superar los ${LIMITS.apellido} caracteres`,
    },
  },

  // ── Hotel / Entidad ────────────────────────────────────────────────────────
  nombreHotel: {
    maxLength: {
      value: LIMITS.nombreHotel,
      message: `El nombre no puede superar los ${LIMITS.nombreHotel} caracteres`,
    },
  },

  nombrePaquete: {
    minLength: {
      value: 3,
      message: 'El nombre debe tener al menos 3 caracteres',
    },
    maxLength: {
      value: LIMITS.nombrePaquete,
      message: `El nombre no puede superar los ${LIMITS.nombrePaquete} caracteres`,
    },
  },

  descripcion: {
    maxLength: {
      value: LIMITS.descripcion,
      message: `La descripción no puede superar los ${LIMITS.descripcion} caracteres`,
    },
  },

  direccion: {
    maxLength: {
      value: LIMITS.direccion,
      message: `La dirección no puede superar los ${LIMITS.direccion} caracteres`,
    },
  },

  // ── Documentos de Identidad ────────────────────────────────────────────────
  documento: {
    minLength: {
      value: LIMITS.documento.min,
      message: `El documento debe tener al menos ${LIMITS.documento.min} caracteres`,
    },
    maxLength: {
      value: LIMITS.documento.max,
      message: `El documento no puede superar los ${LIMITS.documento.max} caracteres`,
    },
  },

  // ── Contacto ───────────────────────────────────────────────────────────────
  telefono: {
    minLength: {
      value: LIMITS.telefono.min,
      message: `El teléfono debe tener al menos ${LIMITS.telefono.min} dígitos`,
    },
    maxLength: {
      value: LIMITS.telefono.max,
      message: `El teléfono no puede superar los ${LIMITS.telefono.max} dígitos`,
    },
  },

  email: {
    maxLength: {
      value: LIMITS.email,
      message: 'El email es demasiado largo',
    },
    pattern: PATTERNS.email,
  },

  // ── Seguridad ──────────────────────────────────────────────────────────────
  /**
   * Reglas para la NUEVA contraseña (requiere formato seguro).
   * Uso: { required: 'La contraseña es obligatoria', ...RULES.passwordNueva }
   */
  passwordNueva: {
    minLength: {
      value: LIMITS.password.min,
      message: `La contraseña debe tener al menos ${LIMITS.password.min} caracteres`,
    },
    maxLength: {
      value: LIMITS.password.max,
      message: `La contraseña no puede superar los ${LIMITS.password.max} caracteres`,
    },
    pattern: PATTERNS.passwordSeguro,
  },

  /**
   * Reglas para la contraseña INICIAL al crear un usuario.
   * Más permisiva que passwordNueva ya que el admin la asigna.
   */
  passwordCreacion: {
    minLength: {
      value: LIMITS.password.min,
      message: `La contraseña debe tener al menos ${LIMITS.password.min} caracteres`,
    },
    maxLength: {
      value: LIMITS.password.max,
      message: `La contraseña no puede superar los ${LIMITS.password.max} caracteres`,
    },
  },

  // ── Financiero ─────────────────────────────────────────────────────────────
  porcentaje: {
    min: {
      value: LIMITS.porcentaje.min,
      message: `El valor debe ser mayor a 0`,
    },
    max: {
      value: LIMITS.porcentaje.max,
      message: `El valor debe ser como máximo 1 (100%)`,
    },
  },
};

/**
 * Helper para construir la validación de "confirmar contraseña".
 * Necesita acceso al valor actual del campo de la nueva contraseña.
 *
 * Uso:
 *   const nueva = watch('contrasenaNueva');
 *   {...register('confirmarContrasena', {
 *     required: 'Debe confirmar la contraseña',
 *     ...RULES.passwordNueva,
 *     validate: confirmarPasswordValidation(nueva),
 *   })}
 */
export const confirmarPasswordValidation = (nuevaContrasena) => (val) =>
  val === nuevaContrasena || 'Las contraseñas no coinciden';

export default RULES;
