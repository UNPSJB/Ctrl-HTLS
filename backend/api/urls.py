from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("hotel/", include("hotel.urls")),
    path("core/", include("core.urls")),
    path("venta/", include("venta.urls")),
]
