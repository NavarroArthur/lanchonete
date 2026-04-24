from rest_framework.routers import DefaultRouter
from .views import SessaoCaixaViewSet, MovimentacaoFinanceiraViewSet

router = DefaultRouter()
router.register('caixa', SessaoCaixaViewSet)
router.register('financeiro', MovimentacaoFinanceiraViewSet)

urlpatterns = router.urls
