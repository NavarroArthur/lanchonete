from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Pedido
from .serializers import PedidoSerializer
from .services import PedidoService
from apps.usuarios.permissions import IsOperadorOrAdmin


class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.prefetch_related(
        'itens__produto'
    ).select_related('criado_por')
    serializer_class = PedidoSerializer
    permission_classes = [IsOperadorOrAdmin]
    filterset_fields = ['status', 'tipo', 'origem']

    def perform_create(self, serializer):
        serializer.save(criado_por=self.request.user)

    def update(self, request, *args, **kwargs):
        pedido = self.get_object()
        if not pedido.status_permite_edicao:
            return Response(
                {'erro': 'Pedido em andamento não pode ser editado.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def avancar(self, request, pk=None):
        pedido = self.get_object()
        try:
            PedidoService.avancar_status(pedido, request.user)
            return Response(PedidoSerializer(pedido).data)
        except ValueError as e:
            return Response({'erro': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def concluir(self, request, pk=None):
        pedido = self.get_object()
        forma = request.data.get('forma_pagamento')
        if not forma:
            return Response(
                {'erro': 'Informe a forma de pagamento.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            PedidoService.concluir(pedido, forma, request.user)
            return Response(PedidoSerializer(pedido).data)
        except ValueError as e:
            return Response({'erro': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        pedido = self.get_object()
        motivo = request.data.get('motivo', '')
        try:
            PedidoService.cancelar(pedido, motivo, request.user)
            return Response(PedidoSerializer(pedido).data)
        except ValueError as e:
            return Response({'erro': str(e)}, status=status.HTTP_400_BAD_REQUEST)
