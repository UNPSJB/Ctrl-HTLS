import { ImageOff } from 'lucide-react';
import { useState } from 'react';

const ImageLoader = ({ name, folder, cuadrado = true }) => {
  const [imageError, setImageError] = useState(false);

  const imagePath = `/src/assets/${folder}/${encodeURIComponent(name)}.webp`;

  const widthClass = cuadrado ? 'w-52' : 'w-full';
  const heightClass = cuadrado ? 'h-52' : 'h-48';

  return imageError ? (
    <div
      className={`${widthClass} ${heightClass} flex items-center justify-center bg-gray-200 dark:bg-gray-700`}
    >
      <ImageOff className="h-12 w-12 text-gray-500" />
    </div>
  ) : (
    <img
      className={`${widthClass} ${heightClass} object-cover`}
      src={imagePath}
      alt={name}
      onError={() => setImageError(true)}
    />
  );
};

export default ImageLoader;
