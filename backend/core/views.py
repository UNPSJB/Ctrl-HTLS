from rest_framework.viewsets import ModelViewSet
from .models import (
    Pais,
    Provincia,
    Ciudad,
    Direccion,
    TipoHabitacion,
    Servicio,
    Categoria,
    Vendedor,
    Encargado,
    Cliente,
)
from .serializers import (
    PaisSerializer,
    ProvinciaSerializer,
    CiudadSerializer,
    DireccionSerializer,
    TipoHabitacionSerializer,
    ServicioSerializer,
    CategoriaFullSerializer,
    VendedorSerializer,
    EncargadoSerializer,
    ClienteSerializer,
)
from django_filters import rest_framework as filters
from .filters import ProvinciaFilter, CiudadFilter, EncargadoFilter


# -------------------- Ubicacion --------------------


class PaisViewSet(ModelViewSet):
    queryset = Pais.objects.all()
    serializer_class = PaisSerializer


class ProvinciaViewSet(ModelViewSet):
    queryset = Provincia.objects.all()
    serializer_class = ProvinciaSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = ProvinciaFilter


class CiudadViewSet(ModelViewSet):
    queryset = Ciudad.objects.all()
    serializer_class = CiudadSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = CiudadFilter


class DireccionViewSet(ModelViewSet):
    queryset = Direccion.objects.all()
    serializer_class = DireccionSerializer


# -------------------- Otros --------------------


class TipoHabitacionViewSet(ModelViewSet):
    queryset = TipoHabitacion.objects.all()
    serializer_class = TipoHabitacionSerializer


class ServicioViewSet(ModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer


class CategoriaViewSet(ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaFullSerializer


# -------------------- Persona --------------------


class VendedorViewSet(ModelViewSet):
    queryset = Vendedor.objects.all()
    serializer_class = VendedorSerializer


class EncargadoViewSet(ModelViewSet):
    queryset = Encargado.objects.all()
    serializer_class = EncargadoSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = EncargadoFilter


class ClienteViewSet(ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
