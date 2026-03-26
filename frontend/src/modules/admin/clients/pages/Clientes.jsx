import { useNavigate } from 'react-router-dom';
import { ListHeader } from '@admin-ui';
import { Users } from 'lucide-react';
import ClientesTable from '../components/ClientesTable';

const Clientes = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <ListHeader
                title="Gestión de Clientes"
                description="Administra la base de datos de clientes y sus perfiles"
                actionLabel="Nuevo Cliente"
                onAction={() => navigate('/admin/clientes/nuevo')}
                icon={Users}
            />

            {/* Componente de Lista (Datos) */}
            <ClientesTable />
        </div>
    );
};

export default Clientes;
