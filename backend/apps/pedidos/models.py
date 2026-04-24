import uuid
from django.db import models
from django.conf import settings


class Pedido(models.Model):
    TIPOS = [('delivery', 'Delivery'), ('retirada', 'Retirada no local')]
    ORIGENS = [('interno', 'Interno'), ('qrcode', 'Cardápio QR Code')]
    STATUS = [
        ('aguardando', 'Aguardando confirmação'),
        ('confirmado', 'Confirmado'),
        ('em_preparo', 'Em preparo'),
        ('pronto', 'Pronto'),
        ('saiu_entrega', 'Saiu para entrega'),
        ('concluido', 'Concluído'),
        ('cancelado', 'Cancelado'),
    ]
    PAGAMENTOS = [
        ('dinheiro', 'Dinheiro'),
        ('cartao', 'Cartão'),
        ('pix', 'PIX'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    numero = models.PositiveIntegerField(unique=True, editable=False)
    tipo = models.CharField(max_length=10, choices=TIPOS)
    origem = models.CharField(max_length=10, choices=ORIGENS, default='interno')
    status = models.CharField(max_length=15, choices=STATUS, default='aguardando')
    cliente_nome = models.CharField(max_length=150, blank=True)
    cliente_telefone = models.CharField(max_length=20, blank=True)
    cliente_endereco = models.TextField(blank=True)
    forma_pagamento = models.CharField(max_length=10, choices=PAGAMENTOS, blank=True)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    observacao = models.TextField(blank=True)
    numero_fiscal = models.CharField(max_length=50, blank=True)
    criado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='pedidos_criados',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    concluido_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Pedido #{self.numero}'

    def save(self, *args, **kwargs):
        if not self.numero:
            from django.db.models import Max
            ultimo = Pedido.objects.aggregate(Max('numero'))['numero__max']
            self.numero = (ultimo or 0) + 1
        super().save(*args, **kwargs)

    @property
    def status_permite_edicao(self):
        return self.status in ('aguardando', 'confirmado')

    @property
    def pode_concluir(self):
        if self.tipo == 'delivery':
            return self.status == 'saiu_entrega'
        return self.status == 'pronto'


class ItemPedido(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='itens')
    produto = models.ForeignKey(
        'catalogo.Produto', on_delete=models.PROTECT, related_name='itens_pedido'
    )
    quantidade = models.PositiveIntegerField(default=1)
    preco_unitario = models.DecimalField(max_digits=8, decimal_places=2)
    observacao = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f'{self.quantidade}x {self.produto.nome}'
