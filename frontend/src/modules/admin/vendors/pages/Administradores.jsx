import { useNavigate } from 'react-router-dom';
import { ListHeader } from '@admin-ui';
import { Users } from 'lucide-react';
import AdministradoresTable from '../components/AdministradoresTable';

/**
 * Administradores - Página raíz aislada para la gestión de administradores (Experimento).
 */
const Administradores = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <ListHeader
                title="Gestión de Administradores"
                description="Administra los perfiles con acceso total al sistema de gestión"
                actionLabel="Nuevo Administrador"
                onAction={() => navigate('/admin/personal/administradores/nuevo')}
                icon={Users}
            />

            {/* Componente de Tabla (Datos) */}
            <AdministradoresTable />
        </div>
    );
};

export default Administradores;
