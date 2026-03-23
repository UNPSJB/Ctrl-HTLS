import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Componente de redirección minimalista para navegación en formularios.
 * "Menos cuerpo y color": Diseñado para ser discreto y funcional.
 * 
 * @param {string} to - Ruta de destino.
 * @param {string} label - Texto opcional del enlace.
 * @param {React.ElementType} icon - Icono opcional de Lucide.
 * @param {string} className - Clases adicionales de Tailwind.
 */
const RedirectLink = ({ to, label, icon: Icon, className = '' }) => {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-all duration-200 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white ${className}`}
    >
      {Icon && (
        <Icon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
      )}
      {label && <span>{label}</span>}
    </Link>
  );
};

export default RedirectLink;
