import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) {
      toast.error(
        'Credenciales incorrectas (Prueba admin/admin o vendedor/vendedor)'
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-96 rounded bg-white p-8 shadow-md dark:bg-gray-800"
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Login
        </h2>
        <input
          type="text"
          placeholder="Usuario"
          className="mb-4 w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="mb-6 w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
