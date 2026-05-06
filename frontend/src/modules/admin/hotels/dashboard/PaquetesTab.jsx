import { useState, useEffect } from 'react';
import { Tag, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import PaquetesTable from '../components/PaquetesTable';
import PaqueteFormModal from '../components/PaqueteFormModal';
import AppButton from '@/components/ui/AppButton';

export default function PaquetesTab({ hotelId, isActive = false }) {
  const [paquetes, setPaquetes] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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
    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/hotel/${hotelId}/paquete-promocional/${idPaquete}`);
      toast.success('Paquete eliminado');
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar el paquete');
    } finally {
      setIsDeleting(false);
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
            Cree paquetes promocionales para determinadas fechas.
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
        <PaquetesTable
          data={paquetes}
          loading={loadingInitial}
          isDeleting={isDeleting}
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
