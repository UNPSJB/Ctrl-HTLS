import { useNavigate } from 'react-router-dom';
import { ListHeader } from '@admin-ui';
import { UserCheck } from 'lucide-react';
import VendedoresTable from '../components/VendedoresTable';

/**
 * Vendedores - Página raíz aislada para la gestión de vendedores (Experimento).
 */
const Vendedores = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <ListHeader
                title="Gestión de Vendedores"
                description="Administra la red de vendedores, sus comisiones y liquidaciones"
                actionLabel="Nuevo Vendedor"
                onAction={() => navigate('/admin/personal/vendedores/nuevo')}
                icon={UserCheck}
            />

            {/* Componente de Tabla (Datos) */}
            <VendedoresTable />
        </div>
    );
};

export default Vendedores;
