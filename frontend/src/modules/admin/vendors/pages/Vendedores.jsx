import { useNavigate } from 'react-router-dom';
import { ListHeader } from '@admin-ui';
import { UserCheck, DollarSign } from 'lucide-react';
import VendedoresTable from '../components/VendedoresTable';

/**
 * Vendedores - Página raíz para la gestión de vendedores.
 */
const Vendedores = () => {
    const navigate = useNavigate();

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            <ListHeader
                title="Gestión de Vendedores"
                description="Administra la red de vendedores, sus comisiones y liquidaciones"
                actionLabel="Nuevo Vendedor"
                onAction={() => navigate('/admin/vendedores/nuevo')}
                actionIcon={UserCheck}
            />

            {/* Componente de Tabla */}
            <VendedoresTable />
        </div>
    );
};

export default Vendedores;
