import { useState, useMemo } from 'react';
import { DataTable, DataTableToolbar } from '@admin-ui';
import { SearchInput } from '@form';
import { Globe, Map, Building, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import TableButton from '@admin-ui/TableButton';
import { capitalizeFirst } from '@/utils/stringUtils';

export default function UbicacionesTable({
  paises,
  provincias,
  ciudades,
  loadingPaises,
  loadingProvincias,
  loadingCiudades,
  expandedPais,
  expandedProvincia,
  onExpandPais,
  onExpandProvincia,
  onEdit,
  onDelete,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPaises = useMemo(() => {
    if (!searchTerm) return paises;
    return paises.filter((p) => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [paises, searchTerm]);

  // Actions renderers
  const renderActions = (item, tipo) => (
    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
      <TableButton variant="edit" icon={Edit} onClick={() => onEdit(item, tipo)} title={`Editar ${tipo}`} />
      <TableButton variant="delete" icon={Trash2} onClick={() => onDelete(item, tipo)} title={`Eliminar ${tipo}`} />
    </div>
  );

  // Render para fila expandida de Provincia -> Ciudades
  const renderCiudades = (provincia) => {
    const columnsCiudades = [
      {
        key: 'nombre',
        label: 'Ciudad',
        render: (ciu) => (
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 ml-2">
            <Building className="h-4 w-4 text-violet-500" />
            {capitalizeFirst(ciu.nombre)}
          </div>
        ),
      },
      {
        key: 'codigoPostal',
        label: 'Código Postal',
        render: (ciu) => (
          <span className="text-sm font-mono bg-white dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded shadow-sm border border-gray-100 dark:border-gray-700">
            {ciu.codigoPostal}
          </span>
        ),
      },
      {
        key: 'acciones',
        label: '',
        align: 'right',
        render: (ciu) => renderActions(ciu, 'ciudad'),
      },
    ];

    return (
      <div className="pl-12 pr-2 py-2 border-l-2 border-violet-400/50 bg-violet-50/30 dark:bg-violet-900/10 ml-4 my-1 rounded-r-lg">
        <DataTable
          columns={columnsCiudades}
          data={ciudades}
          loading={loadingCiudades}
          emptyIcon={Building}
          emptyMessage="No hay ciudades registradas en esta provincia."
        />
      </div>
    );
  };

  // Render para fila expandida de Pais -> Provincias
  const renderProvincias = (pais) => {
    const columnsProvincias = [
      {
        key: 'expand',
        label: '',
        width: 'w-10',
        render: (prov) => (
          <div className="text-gray-400 flex justify-center">
            {expandedProvincia?.id === prov.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        ),
      },
      {
        key: 'nombre',
        label: 'Provincia',
        render: (prov) => (
          <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200">
            <Map className="h-4 w-4 text-indigo-500" />
            {capitalizeFirst(prov.nombre)}
          </div>
        ),
      },
      {
        key: 'acciones',
        label: '',
        align: 'right',
        render: (prov) => renderActions(prov, 'provincia'),
      },
    ];

    return (
      <div className="pl-8 pr-2 py-2 border-l-2 border-indigo-400/50 bg-indigo-50/20 dark:bg-indigo-900/10 ml-2 my-1 rounded-r-lg">
        <DataTable
          columns={columnsProvincias}
          data={provincias}
          loading={loadingProvincias}
          emptyIcon={Map}
          emptyMessage="No hay provincias registradas en este país."
          onRowClick={(prov) => onExpandProvincia(prov)}
          expandedRowIds={expandedProvincia ? [expandedProvincia.id] : []}
          expandedRowRender={renderCiudades}
        />
      </div>
    );
  };

  // Columns for Paises
  const columnsPaises = [
    {
      key: 'expand',
      label: '',
      width: 'w-12',
      render: (pais) => (
        <div className="text-gray-400 flex justify-center">
          {expandedPais?.id === pais.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      ),
    },
    {
      key: 'nombre',
      label: 'País',
      render: (pais) => (
        <div className="flex items-center gap-3 font-medium text-gray-900 dark:text-white">
          <Globe className="h-5 w-5 text-blue-500" />
          {capitalizeFirst(pais.nombre)}
        </div>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      render: (pais) => renderActions(pais, 'pais'),
    },
  ];

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <DataTableToolbar>
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Buscar país..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            disabled={loadingPaises}
          />
        </div>
      </DataTableToolbar>

      <DataTable
        columns={columnsPaises}
        data={filteredPaises}
        loading={loadingPaises}
        emptyIcon={Globe}
        emptyMessage="No se encontraron países."
        onRowClick={(pais) => onExpandPais(pais)}
        expandedRowIds={expandedPais ? [expandedPais.id] : []}
        expandedRowRender={renderProvincias}
      />
    </div>
  );
}
