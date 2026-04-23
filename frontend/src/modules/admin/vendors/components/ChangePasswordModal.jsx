import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import axiosInstance from '@/api/axiosInstance';
import { FormField, PasswordInput } from '@form';
import { RULES, LIMITS, confirmarPasswordValidation } from '@/utils/validationRules';



export default function ChangePasswordModal({ isOpen, onClose, empleadoId }) {
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm({
    mode: 'onChange', // Validar en tiempo real para habilitar/deshabilitar el botón
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
      confirmDisabled={!isValid}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Contraseña actual — solo requerida, sin reglas de formato */}
        <FormField label="Contraseña Actual" required error={errors.contrasenaActual}>
          <PasswordInput
            id="contrasenaActual"
            {...register('contrasenaActual', {
              required: 'La contraseña actual es obligatoria',
              minLength: { value: 1, message: 'Campo obligatorio' },
            })}
            placeholder="••••••••"
          />
        </FormField>
        
        {/* Nueva contraseña — con todas las reglas de seguridad */}
        <FormField label="Nueva Contraseña" required error={errors.contrasenaNueva}>
          <PasswordInput
            id="contrasenaNueva"
            {...register('contrasenaNueva', {
              required: 'La contraseña nueva es obligatoria',
              ...RULES.passwordNueva,
            })}
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Mínimo {LIMITS.password.min} caracteres, con mayúsculas, minúsculas y números.
          </p>
        </FormField>
        
        {/* Confirmar contraseña — valida que coincida con la nueva */}
        <FormField label="Confirmar Nueva Contraseña" required error={errors.confirmarContrasena}>
          <PasswordInput
            id="confirmarContrasena"
            {...register('confirmarContrasena', { 
              required: 'Debe confirmar la contraseña',
              maxLength: { value: LIMITS.password.max, message: `Máximo ${LIMITS.password.max} caracteres` },
              validate: confirmarPasswordValidation(nueva),
            })}
            placeholder="••••••••"
          />
        </FormField>
      </form>
    </Modal>
  );
}
