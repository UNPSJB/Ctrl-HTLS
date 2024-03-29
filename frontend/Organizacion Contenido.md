# Administrado

## Hoteles

### Filtros

- ubicacion (pais, provincia, ciudad).
- categoria (numero de estresllas).
- nombre (nombre del hotel)
- encargado (documento)

### Ordenar por

- categoria (estrellas).
- alfabetico.
- estado logico (baja o alta).

### Crear Hotel (Pagina)

- Nombre.
- Ubicacion (Pais, Provincia, Ciudad, Calle, Numero).
- Categoria.

> Una vez creado el hotel se navegara a la pagina del hotel la cual es un modificar y nos permitira crear todos los datos faltantes (habitaciones, paquetes, temporadas, encargado, descuentos, precios por tipo)

### Contenido (listado hotel)

- nombre
- categoria (estrellas)
- ubicacion (pais, provincia, ciudad).

### Hotel (Pagina)

| Dato      | Contenido                               | ABM |
| --------- | --------------------------------------- | --- |
| Base      | nombre                                  | M   |
| Categoria | nombre, numero de estrellas             | M   |
| Ubicacion | pais, provincia, ciudad, calle y numero | M   |
| Encargado | nombre, epellido                        | AB  |
| Fechas    | fecha de afiliacion                     |     |

## _Listados_

| Dato         | Contenido                  | ABM |
| ------------ | -------------------------- | --- |
| Habitaciones | numero, piso y tipo        | ABM |
| Tipos        | nombre, capacidad y precio | ABM |
| Vendedores   | nombre y apellido          | AB  |
| Paquetes     |                            | ABM |
| Tempordas    |                            | ABM |
| Alquileres   | en proceso, futuros        |     |
| Ventas       | concretadas                |     |

## Vendedores

### Filtros

- hotel (nombre).
- vendedor (nombre, documento).

### Ordenar por

- alfabetico
- estado logico (baja o alta)

### Contenido (listado vendedor)

- nombre y apellido
- hoteles asignados (numero)

### Vendedor (Pagina)

| Dato      | Contenido                                       | ABM |
| --------- | ----------------------------------------------- | --- |
| Base      | nombre, apellido, documento y tipo de documento | M   |
| Ubicacion | pais, provincia y ciudad                        | M   |

## _Listados_

| Dato          | Contenido                  | ABM |
| ------------- | -------------------------- | --- |
| Hoteles       | nombre                     | AB  |
| Ventas        | fecha emision, importe     |     |
| Liquidaciones | fecha liquidacion, importe |     |

## Clientes

### Filtros

- cliente (nombre, documento).

### Ordenar por

- alfabetico

### Contenido (listado cliente)

- nombre y apellido
- puntos

### Cliente (Pagina)

| Dato      | Contenido                                               | ABM |
| --------- | ------------------------------------------------------- | --- |
| Base      | nombre, apellido, documento, tipo de documento y puntos | M   |
| Ubicacion | pais, provincia y ciudad                                | M   |

**_Listados_**

| Dato       | Contenido                                             | ABM |
| ---------- | ----------------------------------------------------- | --- |
| Alquileres | fecha inicio, fecha fin, importe, hotel, habitaciones |     |

## Otros

> Tener en cuanta que todo esto son CRUD de los datos del CORE

- Categorias.
- Servicios.
- Tipos de habitaciones.
- Metodos de Pago.
- Ubicacion (Pais, Provincia, Ciudad).
