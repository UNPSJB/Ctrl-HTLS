import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Lock, LogIn } from 'lucide-react';
import TextInput from '@ui/form/TextInput';
import PasswordInput from '@ui/form/PasswordInput';
import AppButton from '@/components/ui/AppButton';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado de carga
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Por favor ingresa usuario y contraseña');
      return;
    }

    setIsLoading(true); // Activar carga, deshabilita inputs
    try {
      const success = await login(username, password);
      // Si success es false, desactivamos carga. Si es true, el componente se desmontará.
      if (!success) {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      {/* Background decoration (optional) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 -z-10" />

      <div className="w-full max-w-md p-6">
        <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
          <div className="mb-8 text-center">
            {/* Logo placeholder or Icon */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <LogIn className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bienvenido de nuevo</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Ingresa tus credenciales para acceder al panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="login-username" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Usuario / Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <TextInput
                  id="login-username"
                  placeholder="admin@ejemplo.com"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <PasswordInput
                  id="login-password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <AppButton
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              size="lg"
            >
              Iniciar Sesión
            </AppButton>
          </form>

          {/* Optional Footer Text */}
          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            Si olvidaste tu contraseña, contacta al administrador.
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
