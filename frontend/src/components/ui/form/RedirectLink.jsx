import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Componente de redirección minimalista para mensajes de ayuda en formularios.
 * Diseño "Texto Puro": Discreto, sin íconos, sin bordes de contenedor.
 * 
 * @param {string} to - Ruta de destino.
 * @param {string} text - Texto descriptivo opcional (ej: "¿No encuentras lo que buscas?").
 * @param {string} label - Texto del enlace interactivo.
 * @param {string} className - Clases adicionales para el contenedor.
 * @param {boolean} newTab - Si el enlace debe abrirse en una nueva pestaña.
 */
const RedirectLink = ({ to, text, label, className = '', newTab = false }) => {
  return (
    <div className={`inline-block text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {text && <span>{text} </span>}
      <Link
        to={to}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        className="font-semibold text-gray-600 hover:text-gray-900 hover:underline transition-colors dark:text-gray-300 dark:hover:text-white"
      >
        {label}
      </Link>
    </div>
  );
};

export default RedirectLink;
