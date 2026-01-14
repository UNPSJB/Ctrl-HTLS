import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNameMap = {
    admin: 'Dashboard',
    vendedores: 'Vendedores',
    clientes: 'Clientes',
    hoteles: 'Hoteles',
    nuevo: 'Nuevo',
    editar: 'Editar',
    reportes: 'Reportes',
    reservas: 'Reservas',
    ingresos: 'Ingresos',
    configuracion: 'Configuración',
    categorias: 'Categorías',
};

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <nav className="mb-4 flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link
                        to="/admin"
                        className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Inicio
                    </Link>
                </li>
                {pathnames.map((value, index) => {
                    // Skip 'admin' as it is the first "Inicio" link usually, or handle it if it duplicates.
                    // My map has admin: 'Dashboard'.
                    // If the path is /admin/vendedores, split gives ['admin', 'vendedores'].
                    // If I hardcode /admin as "Inicio", I should skip 'admin' in the map loop if index is 0.
                    if (value === 'admin' && index === 0) return null;

                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;
                    const name = routeNameMap[value] || value;

                    // If it's an ID (numeric or long string), show "Detalle" or skip?
                    // If previous was 'editar', this is likely an ID.
                    const isId = !isNaN(value) || (pathnames[index - 1] === 'editar');
                    const displayName = isId ? value : name;

                    return (
                        <li key={to}>
                            <div className="flex items-center">
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                {isLast ? (
                                    <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                                        {displayName}
                                    </span>
                                ) : (
                                    <Link
                                        to={to}
                                        className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white md:ml-2"
                                    >
                                        {displayName}
                                    </Link>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
