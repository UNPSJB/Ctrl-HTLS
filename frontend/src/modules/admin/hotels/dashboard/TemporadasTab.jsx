import { useState } from 'react';
import { Calendar, Tag } from 'lucide-react';
import TemporadasSection from '../components/TemporadasSection';
import DescuentosSection from '../components/DescuentosSection';

const TAB_STYLES = {
  temporadas: { active: 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400', icon: 'text-blue-500' },
  descuentos: { active: 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400', icon: 'text-indigo-500' },
};
const TAB_INACTIVE = 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300';

export default function TemporadasTab({ hotelId }) {
  const [activeSubTab, setActiveSubTab] = useState('temporadas');

  return (
    <div className="animate-in fade-in duration-300">
      {/* Barra de pestañas */}
      <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveSubTab('temporadas')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeSubTab === 'temporadas' ? TAB_STYLES.temporadas.active : TAB_INACTIVE}`}
        >
          <Calendar className={`h-4 w-4 ${activeSubTab === 'temporadas' ? TAB_STYLES.temporadas.icon : ''}`} />
          Temporadas del Hotel
        </button>
        <button
          onClick={() => setActiveSubTab('descuentos')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeSubTab === 'descuentos' ? TAB_STYLES.descuentos.active : TAB_INACTIVE}`}
        >
          <Tag className={`h-4 w-4 ${activeSubTab === 'descuentos' ? TAB_STYLES.descuentos.icon : ''}`} />
          Descuentos por Cantidad
        </button>
      </div>

      {activeSubTab === 'temporadas' && <TemporadasSection hotelId={hotelId} />}
      {activeSubTab === 'descuentos' && <DescuentosSection hotelId={hotelId} />}
    </div>
  );
}
