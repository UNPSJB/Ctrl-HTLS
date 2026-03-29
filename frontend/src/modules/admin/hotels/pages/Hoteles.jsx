import { useNavigate } from 'react-router-dom';
import { ListHeader } from '@admin-ui';
import { Hotel } from 'lucide-react';
import HotelesTable from '../components/HotelesTable';

const Hoteles = () => {
    const navigate = useNavigate();

    const handleCreate = () => {
        navigate('/admin/hoteles/nuevo');
    };

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            <ListHeader
                title="Gestión de Hoteles"
                description="Administra los hoteles, ubicaciones y categorías del sistema"
                actionLabel="Registrar Hotel"
                onAction={handleCreate}
                icon={Hotel}
            />

            {/* Listado de Hoteles */}
            <HotelesTable />
        </div>
    );
};

export default Hoteles;
