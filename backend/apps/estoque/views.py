from rest_framework import viewsets
from django.db import transaction
from django.db.models import F
from .models import MovimentacaoEstoque
from .serializers import MovimentacaoEstoqueSerializer
from apps.catalogo.models import Insumo
from apps.usuarios.permissions import IsOperadorOrAdmin


class MovimentacaoEstoqueViewSet(viewsets.ModelViewSet):
    queryset = MovimentacaoEstoque.objects.select_related('insumo', 'usuario', 'pedido')
    serializer_class = MovimentacaoEstoqueSerializer
    permission_classes = [IsOperadorOrAdmin]
    filterset_fields = ['insumo', 'tipo']
    http_method_names = ['get', 'post']

    @transaction.atomic
    def perform_create(self, serializer):
        mov = serializer.save(usuario=self.request.user)
        insumo = mov.insumo

        if mov.tipo == 'entrada':
            estoque_atual = insumo.estoque_atual
            custo_atual = insumo.custo_medio
            nova_qtd = mov.quantidade
            novo_custo = mov.custo_unitario or 0

            if estoque_atual + nova_qtd > 0:
                custo_medio = (
                    (estoque_atual * custo_atual) + (nova_qtd * novo_custo)
                ) / (estoque_atual + nova_qtd)
            else:
                custo_medio = novo_custo

            Insumo.objects.filter(pk=insumo.pk).update(
                estoque_atual=F('estoque_atual') + nova_qtd,
                custo_medio=custo_medio,
            )

        elif mov.tipo in ('saida_manual', 'ajuste'):
            Insumo.objects.filter(pk=insumo.pk).update(
                estoque_atual=F('estoque_atual') - mov.quantidade
            )
