import HotelCard from './ui/HotelCard';

const HotelList = () => {
  // Datos de ejemplo de los hoteles
  const hoteles = [
    {
      nombre: 'Hotel Paraíso',
      estrellas: 5,
      ubicacion: {
        pais: 'Argentina',
        provincia: 'Buenos Aires',
        ciudad: 'Mar del Plata',
      },
      descripcion:
        'Ubicado en el corazón de Mar del Plata, el Hotel Paraíso ofrece una experiencia de lujo inigualable. Con vistas panorámicas al mar, este hotel combina elegancia y confort. Sus instalaciones incluyen un spa de clase mundial, piscinas climatizadas y una variedad de restaurantes gourmet que deleitarán su paladar. Además, su cercanía a las principales atracciones turísticas lo convierte en el lugar ideal para quienes buscan explorar la ciudad sin renunciar al confort.',
      imagen: 'Hotel Paraíso.webp',
      habitaciones: [
        { nombre: 'Habitación Deluxe', capacidad: 2, precio: 200 },
        { nombre: 'Suite Ejecutiva', capacidad: 3, precio: 300 },
      ],
      paquetes: [
        {
          nombre: 'Escapada Romántica',
          habitaciones: [
            { nombre: 'Habitación Deluxe', capacidad: 2, precio: 200 },
          ],
          descuento: 10, // %
          noches: 3,
          descripcion:
            'Disfrute de una escapada romántica de tres noches con su ser querido, que incluye alojamiento en una Habitación Deluxe, cenas a la luz de las velas y acceso al spa.',
        },
        {
          nombre: 'Aventura Familiar',
          habitaciones: [
            { nombre: 'Suite Ejecutiva', capacidad: 3, precio: 300 },
            { nombre: 'Habitación Deluxe', capacidad: 2, precio: 200 },
          ],
          descuento: 15,
          noches: 5,
          descripcion:
            'Paquete de cinco noches ideal para familias, que incluye alojamiento en nuestras espaciosas suites, actividades recreativas para niños y adultos, y excursiones guiadas por la ciudad.',
        },
      ],
    },
    {
      nombre: 'Gran Hotel Mar del Plata',
      estrellas: 4,
      ubicacion: {
        pais: 'Argentina',
        provincia: 'Buenos Aires',
        ciudad: 'Mar del Plata',
      },
      descripcion:
        'El Gran Hotel Mar del Plata se destaca por su arquitectura clásica y su ambiente acogedor. Situado a pocos pasos de la playa, ofrece habitaciones con vistas al océano y un servicio al cliente excepcional. Los huéspedes pueden disfrutar de un desayuno buffet variado cada mañana y relajarse en el bar del hotel por la noche. Su ubicación céntrica facilita el acceso a tiendas, teatros y otros puntos de interés de la ciudad.',
      imagen: 'Gran Hotel Mar del Plata.webp',
      habitaciones: [
        { nombre: 'Habitación Estándar', capacidad: 2, precio: 150 },
        { nombre: 'Suite Familiar', capacidad: 4, precio: 250 },
      ],
      paquetes: [
        {
          nombre: 'Fin de Semana Relax',
          habitaciones: [
            { nombre: 'Habitación Estándar', capacidad: 2, precio: 150 },
          ],
          descuento: 5,
          noches: 2,
          descripcion:
            'Escápese durante un fin de semana y disfrute de nuestras cómodas habitaciones estándar, desayuno incluido y acceso al gimnasio.',
        },
        {
          nombre: 'Vacaciones en Familia',
          habitaciones: [
            { nombre: 'Suite Familiar', capacidad: 4, precio: 250 },
          ],
          descuento: 10,
          noches: 7,
          descripcion:
            'Paquete de una semana para familias, que incluye alojamiento en nuestras amplias suites familiares, actividades para niños y cenas temáticas.',
        },
      ],
    },
    {
      nombre: 'Hotel Boutique Playa Grande',
      estrellas: 3,
      ubicacion: {
        pais: 'Argentina',
        provincia: 'Buenos Aires',
        ciudad: 'Mar del Plata',
      },
      descripcion:
        'El Hotel Boutique Playa Grande es una joya escondida en Mar del Plata. Con un diseño moderno y elegante, este hotel ofrece una experiencia íntima y personalizada. A solo una cuadra de la famosa Playa Grande, es perfecto para quienes buscan disfrutar del sol y el mar. Además, su café en la azotea ofrece vistas impresionantes de la ciudad y el océano, ideales para relajarse al atardecer.',
      imagen: 'Hotel Boutique Playa Grande.webp',
      habitaciones: [
        { nombre: 'Habitación Simple', capacidad: 1, precio: 100 },
        { nombre: 'Habitación Doble', capacidad: 2, precio: 180 },
      ],
      paquetes: [
        {
          nombre: 'Aventura Surfista',
          habitaciones: [
            { nombre: 'Habitación Simple', capacidad: 1, precio: 100 },
          ],
          descuento: 8,
          noches: 4,
          descripcion:
            'Paquete de cuatro noches diseñado para amantes del surf, que incluye alojamiento, clases de surf diarias y alquiler de equipo.',
        },
        {
          nombre: 'Escapada Gastronómica',
          habitaciones: [
            { nombre: 'Habitación Doble', capacidad: 2, precio: 180 },
          ],
          descuento: 12,
          noches: 3,
          descripcion:
            'Disfrute de una escapada culinaria de tres noches, que incluye alojamiento, cenas en restaurantes locales seleccionados y una clase de cocina regional.',
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {hoteles.map((hotel, index) => (
        <HotelCard key={index} hotel={hotel} />
      ))}
    </div>
  );
};

export default HotelList;
