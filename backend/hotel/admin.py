from django.contrib import admin
from .models import (
    Hotel,
    Habitacion,
    HotelVendedor,
    PrecioPorTipo,
    PaquetePromocional,
    Descuento,
    Temporada,
)


class HotelAdmin(admin.ModelAdmin):
    list_display = ("nombre", "direccion", "ciudad", "provincia", "pais")

    def direccion(self, obj):
        return f"{obj.direccion.calle}, {obj.direccion.numero}"

    direccion.short_description = "Dirección"

    def ciudad(self, obj):
        return obj.direccion.ciudad.nombre

    ciudad.short_description = "Ciudad"

    def provincia(self, obj):
        return obj.direccion.ciudad.provincia.nombre

    provincia.short_description = "Provincia"

    def pais(self, obj):
        return obj.direccion.ciudad.provincia.pais.nombre

    pais.short_description = "País"


admin.site.register(Hotel, HotelAdmin)
admin.site.register(Habitacion)
admin.site.register(HotelVendedor)
admin.site.register(PrecioPorTipo)
admin.site.register(PaquetePromocional)
admin.site.register(Descuento)
admin.site.register(Temporada)
admin.site.register(PaqueteHabitacion)
