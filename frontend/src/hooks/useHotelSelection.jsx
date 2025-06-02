import { useState } from 'react';
import {
  calculateRoomsTotal,
  calculatePackagesTotal,
} from '../utils/hotelUtils';

/**
 * Hook personalizado para gestionar la selección de habitaciones y paquetes turísticos en un hotel.
 *
 * Proporciona funciones para seleccionar/deseleccionar habitaciones y paquetes, y calcula el total
 * a pagar considerando posibles descuentos por temporada alta.
 *
 * @param {Object} hotel - Objeto con la información del hotel.
 * @returns {Object} - Estados y funciones para manejar la selección de habitaciones y paquetes.
 */
const useHotelSelection = (hotel) => {
  // Estado para almacenar habitaciones seleccionadas
  const [selectedRooms, setSelectedRooms] = useState([]);

  // Estado para almacenar paquetes seleccionados
  const [selectedPackages, setSelectedPackages] = useState([]);

  // Determina el coeficiente de descuento si la temporada es alta
  const discountCoefficient =
    hotel.temporada === 'alta' ? hotel.coeficiente : 1;

  /**
   * Alterna la selección de una habitación.
   * Si la habitación ya está seleccionada, se elimina. Si no, se agrega.
   *
   * @param {string} roomName - Nombre de la habitación a seleccionar/deseleccionar.
   */
  const toggleRoomSelection = (roomName) => {
    setSelectedRooms((prevSelected) =>
      prevSelected.includes(roomName)
        ? prevSelected.filter((name) => name !== roomName)
        : [...prevSelected, roomName]
    );
  };

  /**
   * Alterna la selección de un paquete turístico.
   * Si el paquete ya está seleccionado, se elimina. Si no, se agrega.
   *
   * @param {string} packageName - Nombre del paquete a seleccionar/deseleccionar.
   */
  const togglePackageSelection = (packageName) => {
    setSelectedPackages((prevSelected) =>
      prevSelected.includes(packageName)
        ? prevSelected.filter((name) => name !== packageName)
        : [...prevSelected, packageName]
    );
  };

  // Calcula el total a pagar sumando habitaciones y paquetes seleccionados
  const totalPrice =
    calculateRoomsTotal(
      selectedRooms,
      hotel.habitaciones,
      discountCoefficient
    ) +
    calculatePackagesTotal(
      selectedPackages,
      hotel.paquetes,
      discountCoefficient
    );

  return {
    selectedRooms,
    selectedPackages,
    toggleRoomSelection,
    togglePackageSelection,
    totalPrice,
    discountCoefficient,
  };
};

export default useHotelSelection;
