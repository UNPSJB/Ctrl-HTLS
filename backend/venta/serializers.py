from rest_framework.serializers import ModelSerializer
from .models import Factura, Alquiler, Pago, Detalle_factura, Liquidacion


class AlquilerSerializer(ModelSerializer):
    class Meta:
        model = Alquiler
        fields = "__all__"


class FacturaSerializer(ModelSerializer):
    class Meta:
        model = Factura
        fields = "__all__"


class DetalleFacturaSerializer(ModelSerializer):
    class Meta:
        model = Detalle_factura
        fields = "__all__"


class LiquidacionSerializer(ModelSerializer):
    class Meta:
        model = Liquidacion
        fields = "__all__"


class PagoSerializer(ModelSerializer):
    class Meta:
        model = Pago
        fields = "__all__"
