import { createContext, useContext, useState, useCallback } from 'react';

const BreadcrumbContext = createContext();

export const BreadcrumbProvider = ({ children }) => {
    const [labels, setLabels] = useState({});

    /**
     * Registra o actualiza una etiqueta para un segmento de ruta específico (usualmente un ID).
     * @param {string|number} key - El ID o segmento de ruta.
     * @param {string} label - El nombre legible a mostrar.
     */
    const setCrumbLabel = useCallback((key, label) => {
        if (!key || !label) return;
        setLabels((prev) => ({
            ...prev,
            [key.toString()]: label,
        }));
    }, []);

    return (
        <BreadcrumbContext.Provider value={{ labels, setCrumbLabel }}>
            {children}
        </BreadcrumbContext.Provider>
    );
};

export const useBreadcrumbs = () => {
    const context = useContext(BreadcrumbContext);
    if (!context) {
        throw new Error('useBreadcrumbs debe usarse dentro de un BreadcrumbProvider');
    }
    return context;
};
