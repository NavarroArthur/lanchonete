import uuid
from django.db import models
from django.conf import settings


class SessaoCaixa(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    abertura_usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name='caixas_abertos',
    )
    fechamento_usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name='caixas_fechados', null=True, blank=True,
    )
    valor_abertura = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    valor_contado = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    diferenca = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    aberto_em = models.DateTimeField(auto_now_add=True)
    fechado_em = models.DateTimeField(null=True, blank=True)
    observacao = models.TextField(blank=True)

    class Meta:
        ordering = ['-aberto_em']

    def __str__(self):
        return f'Caixa aberto em {self.aberto_em:%d/%m/%Y %H:%M}'

    @property
    def esta_aberto(self):
        return self.fechado_em is None

    def total_esperado_dinheiro(self):
        from django.db.models import Sum, Q
        receitas = self.movimentacoes.filter(
            tipo='receita', forma_pagamento='dinheiro'
        ).aggregate(total=Sum('valor'))['total'] or 0
        despesas = self.movimentacoes.filter(
            tipo='despesa'
        ).aggregate(total=Sum('valor'))['total'] or 0
        return self.valor_abertura + receitas - despesas


class MovimentacaoFinanceira(models.Model):
    TIPOS = [('receita', 'Receita'), ('despesa', 'Despesa')]
    CATEGORIAS_DESPESA = [
        ('fornecedor', 'Fornecedor'),
        ('aluguel', 'Aluguel'),
        ('energia', 'Energia'),
        ('agua', 'Água'),
        ('folha', 'Folha de pagamento'),
        ('manutencao', 'Manutenção'),
        ('outro', 'Outro'),
    ]
    PAGAMENTOS = [
        ('dinheiro', 'Dinheiro'),
        ('cartao', 'Cartão'),
        ('pix', 'PIX'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sessao_caixa = models.ForeignKey(
        SessaoCaixa, on_delete=models.PROTECT,
        related_name='movimentacoes', null=True, blank=True,
    )
    pedido = models.ForeignKey(
        'pedidos.Pedido', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='movimentacao_financeira',
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='movimentacoes_financeiras',
    )
    tipo = models.CharField(max_length=10, choices=TIPOS)
    categoria = models.CharField(max_length=20, choices=CATEGORIAS_DESPESA, blank=True)
    descricao = models.CharField(max_length=200, blank=True)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    forma_pagamento = models.CharField(max_length=10, choices=PAGAMENTOS, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_tipo_display()} — R$ {self.valor}'
