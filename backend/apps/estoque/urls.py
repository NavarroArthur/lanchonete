from rest_framework.routers import DefaultRouter
from .views import MovimentacaoEstoqueViewSet

router = DefaultRouter()
router.register('estoque', MovimentacaoEstoqueViewSet)

urlpatterns = router.urls
