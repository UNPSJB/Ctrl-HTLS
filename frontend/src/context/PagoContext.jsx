import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { usePersistedState } from '../hooks/usePersistedState';

const STORAGE_KEY = 'pagoState';

const initialState = {
  metodoPago: 'Efectivo',
  tipoFactura: 'B',
  montoTotal: 0,
  montoEfectivo: 0,
  montoTarjeta: 0,
  cardData: null,
  isCardValid: false,
  clienteId: null,
  vendedorId: 2,
};

const TIPOS = {
  SET_METODO_PAGO: 'SET_METODO_PAGO',
  SET_TIPO_FACTURA: 'SET_TIPO_FACTURA',
  SET_CARD_DATA: 'SET_CARD_DATA',
  SET_MONTO_TOTAL: 'SET_MONTO_TOTAL',
  SET_CLIENTE_ID: 'SET_CLIENTE_ID',
  RESET_PAGO: 'RESET_PAGO',
};

function pagoReducer(state, action) {
  switch (action.type) {
    case TIPOS.SET_METODO_PAGO:
      return { ...state, metodoPago: action.payload };
    case TIPOS.SET_TIPO_FACTURA:
      return { ...state, tipoFactura: action.payload };
    case TIPOS.SET_CARD_DATA:
      return {
        ...state,
        cardData: action.payload.cardData,
        isCardValid: action.payload.valid,
      };
    case TIPOS.SET_MONTO_TOTAL:
      return { ...state, montoTotal: action.payload };
    case TIPOS.SET_CLIENTE_ID:
      return { ...state, clienteId: action.payload };
    case TIPOS.RESET_PAGO:
      return {
        ...initialState,
        clienteId: state.clienteId,
        vendedorId: state.vendedorId,
      };
    default:
      return state;
  }
}

const PagoContext = createContext(undefined);

export function PagoProvider({ children }) {
  const [persistedState, setPersistedState] = usePersistedState(
    STORAGE_KEY,
    initialState
  );

  const [state, dispatch] = useReducer(pagoReducer, {
    ...initialState,
    ...persistedState,
    cardData: null,
    isCardValid: false,
  });

  useEffect(() => {
    const { cardData, isCardValid, ...stateToPersist } = state;
    setPersistedState(stateToPersist);
  }, [state, setPersistedState]);

  const setMetodoPago = useCallback((metodo) => {
    dispatch({ type: TIPOS.SET_METODO_PAGO, payload: metodo });
  }, []);

  const setTipoFactura = useCallback((tipo) => {
    dispatch({ type: TIPOS.SET_TIPO_FACTURA, payload: tipo });
  }, []);

  const setCardData = useCallback(({ cardData, valid }) => {
    dispatch({ type: TIPOS.SET_CARD_DATA, payload: { cardData, valid } });
  }, []);

  const setMontoTotal = useCallback((monto) => {
    dispatch({ type: TIPOS.SET_MONTO_TOTAL, payload: monto });
  }, []);

  const setClienteId = useCallback((id) => {
    dispatch({ type: TIPOS.SET_CLIENTE_ID, payload: id });
  }, []);

  const resetPago = useCallback(() => {
    dispatch({ type: TIPOS.RESET_PAGO });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      setMetodoPago,
      setTipoFactura,
      setCardData,
      setMontoTotal,
      setClienteId,
      resetPago,
    }),
    [
      state,
      setMetodoPago,
      setTipoFactura,
      setCardData,
      setMontoTotal,
      setClienteId,
      resetPago,
    ]
  );

  return <PagoContext.Provider value={value}>{children}</PagoContext.Provider>;
}

export function usePago() {
  const context = useContext(PagoContext);
  if (context === undefined) {
    throw new Error('usePago debe usarse dentro de un PagoProvider');
  }
  return context;
}
