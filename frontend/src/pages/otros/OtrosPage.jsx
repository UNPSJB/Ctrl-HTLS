import { useState } from "react";
import Header from "../../components/header/Header";
import CiudadForm from "../../components/otros/CiudadForm";
import ProvinciaForm from "../../components/otros/ProvinciaForm";
import PaisForm from "../../components/otros/PaisForm";
import EncargadoForm from "../../components/otros/EncargadoForm";
import TipoHabitacionForm from "../../components/otros/TipoHabitacionForm";
import ServicioForm from "../../components/otros/ServicioForm";
import CategoriaForm from "../../components/otros/CategoriaForm";
import HabitacionForm from "../../components/otros/HabitacionForm";


export default function OtrosPage() {
  const [ciudadFormOpen, setCiudadFormOpen] = useState(null);
  const [provinciaFormOpen, setProvinciaFormOpen] = useState(null);
  const [paisFormOpen, setPaisFormOpen] = useState(null);
  const [encargadoFormOpen, setEncargadoFormOpen] = useState(null);
  const [tipoHabitacionFormOpen, setTipoHabitacionFormOpen] = useState(null);
  const [servicioFormOpen, setServicioFormOpen] = useState(null);
  const [categoriaFormOpen, setCategoriaFormOpen] = useState(null);
  const [habitacionFormOpen, setHabitacionFormOpen] = useState(null);

  const secondNavBarChildren = (
    <>
      <h2 className="text-3xl">Otros</h2>
    </>
  );

  return (
    <div>
      <Header secondNavBarChildren={secondNavBarChildren} />
      <div className="grid grid-cols-3 items-center justify-center">
        <button className="border text-Letras bg-FondoHotel w-full p-2 rounded-md" onClick={() => setCiudadFormOpen(true)}>
          Crear Ciudad
        </button>
        <button className="border text-Letras bg-FondoHotel w-full p-2 rounded-md" onClick={() => setProvinciaFormOpen(true)}>
          Crear Provincia
        </button>
        <button className="border text-Letras bg-FondoHotel w-full p-2 rounded-md" onClick={() => setPaisFormOpen(true)}>Crear Pais</button>
        <button className="border text-Letras bg-FondoHotel w-full p-2 rounded-md" onClick={() => setEncargadoFormOpen(true)}>
          Crear Encargado
        </button>
        <button className="border text-Letras bg-FondoHotel w-full p-2 rounded-md" onClick={() => setTipoHabitacionFormOpen(true)}>
          Crear Tipo Habitacion
        </button>
        <button className="border text-Letras bg-FondoHotel w-full p-2 rounded-md" onClick={() => setCategoriaFormOpen(true)}>
          Crear Categoria
        </button>
        <button className="border text-Letras bg-FondoHotel w-full p-2 rounded-md" onClick={() => setServicioFormOpen(true)}>
          Crear Servicio
        </button>
        <button className="border text-Letras bg-FondoHotel w-full p-2 rounded-md" onClick={() => setHabitacionFormOpen(true)}>
          Crear Habitacion
        </button>
      </div>
      {ciudadFormOpen && (
        <CiudadForm
          title={"Crear Ciudad"}
          isOpen={ciudadFormOpen}
          onClose={() => setCiudadFormOpen(false)}
        />
      )}
      {provinciaFormOpen && (
        <ProvinciaForm
          title={"Crear Provincia"}
          isOpen={provinciaFormOpen}
          onClose={() => setProvinciaFormOpen(false)}
        />
      )}
      {paisFormOpen && (
        <PaisForm
          title={"Crear Pais"}
          isOpen={paisFormOpen}
          onClose={() => setPaisFormOpen(false)}
        />
      )}
      {encargadoFormOpen && (
        <EncargadoForm
          title={"Crear Encargado"}
          isOpen={encargadoFormOpen}
          onClose={() => setEncargadoFormOpen(false)}
        />
      )}
      {tipoHabitacionFormOpen && (
        <TipoHabitacionForm
          title={"Crear Tipo Habitacion"}
          isOpen={tipoHabitacionFormOpen}
          onClose={() => setTipoHabitacionFormOpen(false)}
        />
      )}
      {servicioFormOpen && (
        <ServicioForm
          title={"Crear Servicio"}
          isOpen={servicioFormOpen}
          onClose={() => setServicioFormOpen(false)}
        />
      )}
      {categoriaFormOpen && (
        <CategoriaForm
          title={"Crear Categoria"}
          isOpen={categoriaFormOpen}
          onClose={() => setCategoriaFormOpen(false)}
        />
      )}
      {habitacionFormOpen && (
        <HabitacionForm
          title={"Crear Habitacion"}
          isOpen={habitacionFormOpen}
          onClose={() => setHabitacionFormOpen(false)}
        />
      )}
    </div>
  );
}
