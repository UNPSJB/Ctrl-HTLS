import React from 'react';

/**
 * SidebarLayout - Wrapper principal para páginas con barra lateral.
 */
export const SidebarLayout = ({ sidebar, children, className = '' }) => (
  <div className={`flex flex-col gap-6 lg:flex-row ${className}`}>
    <aside className="w-full lg:w-80 shrink-0">
      {sidebar}
    </aside>
    <main className="flex-1 w-full min-w-0">
      {children}
    </main>
  </div>
);

/**
 * PageSidebar - Barra de navegación lateral estandarizada.
 * 
 * @param {Array} tabs - Lista de objetos { id, label, icon: LucideIcon }
 * @param {string} activeTab - ID de la pestaña activa.
 * @param {function} onTabChange - Callback para cambiar de pestaña.
 */
export const PageSidebar = ({ tabs, activeTab, onTabChange }) => (
  <nav className="flex flex-col space-y-1 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onTabChange(tab.id)}
        className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
          activeTab === tab.id
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        {tab.icon && <tab.icon className="h-5 w-5" />}
        <span>{tab.label}</span>
      </button>
    ))}
  </nav>
);

/**
 * PageContentCard - Tarjeta blanca para el contenido principal.
 */
export const PageContentCard = ({ children, className = '', as: Tag = 'div' }) => (
  <Tag className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 flex flex-col min-h-[400px] ${className}`}>
    {children}
  </Tag>
);
