import Estrellas from "../helpers/Estrellas";
import SwitchButton from "../helpers/SwitchButton";
import hotelimg from "../../public/hotel2.jpeg";
import { Link } from "react-router-dom";

function HotelCard({ hotel }) {
  return (
    <div className="p-4 m-2 border rounded shadow-lg flex justify-between">
      <img src={hotelimg} width={250} alt="Imagen del hotel" className="mr-2" />
      <div className="w-3/4">
        <div className="flex items-center">
          <h2 className="text-4xl text-LetraAgregarHotel font-hoteles font-bold mr-2 uppercase">
            <Link to={`/hotel/${hotel.id}`}>{hotel.nombre}</Link>
          </h2>
          <Estrellas stars={hotel.categoria.estrellas} />
        </div>
        <p className="font-navSitiosFrecuentes text-FrecuentesItems">
          {hotel.ubicacion.ciudad} - {hotel.ubicacion.provincia} -{" "}
          {hotel.ubicacion.pais}
        </p>
        <p className="mt-2 text-DescripcionHotel">
          {hotel.descripcion.length > 500
            ? hotel.descripcion.slice(0, 500) + "..."
            : hotel.descripcion}
        </p>
      </div>
      <div className="w-1/4 flex flex-col items-end">
        <SwitchButton />
        <div className="mt-auto flex">
          <button className="w-full border rounded-md px-9 py-1 mr-2 text-white bg-ModificarToggle">
            Modificar
          </button>
          <button className="w-full border rounded-md px-9 py-1 mr-2 bg-AgregarHotel text-LetraAgregarHotel">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default HotelCard;
