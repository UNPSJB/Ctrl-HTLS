import { User } from 'lucide-react';

const Avatar = () => {
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 transition-colors group hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer">
      <User className="w-6 h-6 text-gray-800 dark:text-gray-200 group-hover:text-gray-400" />
    </div>
  );
};

export default Avatar;
