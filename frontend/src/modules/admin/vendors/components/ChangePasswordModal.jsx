import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import axiosInstance from '@/api/axiosInstance';
import { FormField, PasswordInput } from '@form';

export default function ChangePasswordModal({ isOpen, onClose, empleadoId }) {
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      contrasenaActual: '',
      contrasenaNueva: '',
      confirmarContrasena: '',
    }
  });

  const nueva = watch('contrasenaNueva');

  const onSubmit = async (data) => {
    if (!empleadoId) return;
    
    setLoading(true);
    try {
      await axiosInstance.post('/cambiar-contrasena', {
        empleadoId,
        contrasenaActual: data.contrasenaActual,
        contrasenaNueva: data.contrasenaNueva,
        confirmarContrasena: data.confirmarContrasena,
      });
      toast.success('Contraseña actualizada correctamente');
      reset();
      onClose(true); // éxito
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title="Cambiar Contraseña"
      description="Ingrese la contraseña actual y la nueva contraseña para el usuario."
      variant="blue"
      confirmLabel="Cambiar Contraseña"
      cancelLabel="Cancelar"
      confirmIcon={Key}
      onConfirm={handleSubmit(onSubmit)}
      loading={loading}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Contraseña Actual" required error={errors.contrasenaActual}>
          <PasswordInput
            id="contrasenaActual"
            {...register('contrasenaActual', { required: 'La contraseña actual es obligatoria' })}
            placeholder="••••••••"
          />
        </FormField>
        
        <FormField label="Nueva Contraseña" required error={errors.contrasenaNueva}>
          <PasswordInput
            id="contrasenaNueva"
            {...register('contrasenaNueva', { 
              required: 'La contraseña nueva es obligatoria',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' }
            })}
            placeholder="••••••••"
          />
        </FormField>
        
        <FormField label="Confirmar Nueva Contraseña" required error={errors.confirmarContrasena}>
          <PasswordInput
            id="confirmarContrasena"
            {...register('confirmarContrasena', { 
              required: 'Debe confirmar la contraseña',
              validate: (val) => val === nueva || 'Las contraseñas no coinciden'
            })}
            placeholder="••••••••"
          />
        </FormField>
      </form>
    </Modal>
  );
}
