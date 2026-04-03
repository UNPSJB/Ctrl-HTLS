import { useNavigate } from 'react-router-dom';
import { ListHeader } from '@admin-ui';
import { UserCog } from 'lucide-react';
import EncargadosTable from '../components/EncargadosTable';

const Encargados = () => {
    const navigate = useNavigate();

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            <ListHeader
                title="Gestión de Encargados"
                description="Administra la base de datos de encargados disponibles o asignados"
                actionLabel="Nuevo Encargado"
                onAction={() => navigate('/admin/encargados/nuevo')}
                icon={UserCog}
            />

            {/* Componente de Tabla (Datos) */}
            <EncargadosTable />
        </div>
    );
};

export default Encargados;
