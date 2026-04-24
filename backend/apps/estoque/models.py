import uuid
from django.db import models
from django.conf import settings


class MovimentacaoEstoque(models.Model):
    TIPOS = [
        ('entrada', 'Entrada de mercadoria'),
        ('saida_automatica', 'Saída automática (pedido)'),
        ('saida_manual', 'Saída manual'),
        ('ajuste', 'Ajuste de inventário'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    insumo = models.ForeignKey(
        'catalogo.Insumo', on_delete=models.PROTECT, related_name='movimentacoes'
    )
    pedido = models.ForeignKey(
        'pedidos.Pedido', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='movimentacoes_estoque'
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='movimentacoes_estoque'
    )
    tipo = models.CharField(max_length=20, choices=TIPOS)
    quantidade = models.DecimalField(max_digits=10, decimal_places=3)
    motivo = models.CharField(max_length=200, blank=True)
    custo_unitario = models.DecimalField(
        max_digits=10, decimal_places=4, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        sinal = '+' if self.tipo == 'entrada' else '-'
        return f'{sinal}{self.quantidade} {self.insumo}'
