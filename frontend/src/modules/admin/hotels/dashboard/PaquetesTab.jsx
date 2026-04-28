import { useState, useEffect } from 'react';
import { Tag, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import PaquetesList from '../components/PaquetesList';
import PaqueteFormModal from '../components/PaqueteFormModal';
import AppButton from '@/components/ui/AppButton';

export default function PaquetesTab({ hotelId, isActive = false }) {
  const [paquetes, setPaquetes] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  // Estados para el modal
  const [showForm, setShowForm] = useState(false);
  const [editingPaquete, setEditingPaquete] = useState(null); // null = modo crear

  useEffect(() => {
    if (isActive) {
      fetchData();
    }
  }, [hotelId, isActive]);

  const fetchData = async () => {
    try {
      setLoadingInitial(true);
      const resPaquetes = await axiosInstance.get(`/hotel/${hotelId}/paquetes`);
      setPaquetes(resPaquetes.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos de paquetes');
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPaquete(null);
    setShowForm(true);
  };

  const handleOpenEdit = (paquete) => {
    setEditingPaquete(paquete);
    setShowForm(true);
  };

  const handleDeletePaquete = async (idPaquete) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este paquete promocional?')) return;

    try {
      await axiosInstance.delete(`/hotel/${hotelId}/paquete-promocional/${idPaquete}`);
      toast.success('Paquete eliminado');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al eliminar el paquete');
    }
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingPaquete(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPaquete(null);
    fetchData(); // Refrescar la lista
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex-shrink-0 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Tag className="h-5 w-5 text-blue-500" />
            Paquetes Turísticos
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cree ofertas combinando múltiples habitaciones por un precio especial.
          </p>
        </div>
        <AppButton
          onClick={handleOpenCreate}
          disabled={loadingInitial}
          icon={Plus}
        >
          Nuevo Paquete
        </AppButton>
      </div>

      <div className="flex-grow flex flex-col mt-6 overflow-hidden relative">
        <PaquetesList
          data={paquetes}
          loading={loadingInitial}
          onEdit={handleOpenEdit}
          onDelete={handleDeletePaquete}
        />
      </div>

      {/* Componente del Modal Formulario */}
      <PaqueteFormModal
        isOpen={showForm}
        onClose={handleCloseModal}
        hotelId={hotelId}
        paquete={editingPaquete}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
