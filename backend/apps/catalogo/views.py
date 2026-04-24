from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import F
from .models import Categoria, Produto, Insumo, FichaTecnica
from .serializers import (
    CategoriaSerializer, ProdutoSerializer,
    InsumoSerializer, FichaTecnicaSerializer,
)
from apps.usuarios.permissions import IsOperadorOrAdmin, IsAdministrador


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsOperadorOrAdmin]


class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.select_related('categoria').prefetch_related(
        'ficha_tecnica__insumo'
    )
    serializer_class = ProdutoSerializer
    permission_classes = [IsOperadorOrAdmin]
    filterset_fields = ['categoria', 'ativo']
    search_fields = ['nome']

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def cardapio(self, request):
        """Endpoint público para o QR Code — sem autenticação."""
        produtos = self.queryset.filter(ativo=True)
        serializer = ProdutoSerializer(
            produtos, many=True, context={'request': request}
        )
        return Response(serializer.data)


class InsumoViewSet(viewsets.ModelViewSet):
    queryset = Insumo.objects.all()
    serializer_class = InsumoSerializer
    permission_classes = [IsOperadorOrAdmin]
    search_fields = ['nome']

    @action(detail=False, methods=['get'])
    def alertas(self, request):
        """Retorna insumos abaixo do estoque mínimo."""
        qs = self.queryset.filter(estoque_atual__lte=F('estoque_minimo'))
        return Response(InsumoSerializer(qs, many=True).data)


class FichaTecnicaViewSet(viewsets.ModelViewSet):
    queryset = FichaTecnica.objects.select_related('produto', 'insumo')
    serializer_class = FichaTecnicaSerializer
    permission_classes = [IsOperadorOrAdmin]
    filterset_fields = ['produto']
