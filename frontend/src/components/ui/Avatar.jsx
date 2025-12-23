import { useAuth } from '@/context/AuthContext';

const Avatar = () => {
  const { user } = useAuth();
  const inicial = user?.nombre?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-tr from-blue-600 to-blue-400 text-sm font-bold text-white shadow-md dark:border-gray-700">
      {inicial}
    </div>
  );
};

export default Avatar;
