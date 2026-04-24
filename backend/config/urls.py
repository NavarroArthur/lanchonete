from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('apps.usuarios.urls')),
    path('api/', include('apps.catalogo.urls')),
    path('api/', include('apps.pedidos.urls')),
    path('api/', include('apps.estoque.urls')),
    path('api/', include('apps.financeiro.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
