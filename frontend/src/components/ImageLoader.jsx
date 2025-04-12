import { ImageOff } from 'lucide-react';
import { useState } from 'react';

const ImageLoader = ({ name, folder }) => {
  const [imageError, setImageError] = useState(false);

  const imagePath = `/src/assets/${folder}/${encodeURIComponent(name)}.webp`;

  return imageError ? (
    <div className="w-52 h-52 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
      <ImageOff className="w-12 h-12 text-gray-500" />
    </div>
  ) : (
    <img
      className="w-52 h-52 object-cover"
      src={imagePath}
      alt={name}
      onError={() => setImageError(true)}
    />
  );
};

export default ImageLoader;
