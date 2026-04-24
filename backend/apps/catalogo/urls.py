from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, ProdutoViewSet, InsumoViewSet, FichaTecnicaViewSet

router = DefaultRouter()
router.register('categorias', CategoriaViewSet)
router.register('produtos', ProdutoViewSet)
router.register('insumos', InsumoViewSet)
router.register('ficha-tecnica', FichaTecnicaViewSet)

urlpatterns = router.urls
