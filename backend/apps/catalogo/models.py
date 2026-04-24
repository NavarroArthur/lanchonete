import uuid
from django.db import models


class Categoria(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=100)
    ordem = models.PositiveIntegerField(default=0)
    ativo = models.BooleanField(default=True)

    class Meta:
        ordering = ['ordem', 'nome']
        verbose_name_plural = 'Categorias'

    def __str__(self):
        return self.nome


class Produto(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    categoria = models.ForeignKey(
        Categoria, on_delete=models.PROTECT, related_name='produtos'
    )
    nome = models.CharField(max_length=150)
    descricao = models.TextField(blank=True)
    preco_venda = models.DecimalField(max_digits=8, decimal_places=2)
    foto = models.ImageField(upload_to='produtos/', blank=True, null=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        ordering = ['categoria__ordem', 'nome']

    def __str__(self):
        return self.nome


class Insumo(models.Model):
    UNIDADES = [
        ('kg', 'Quilograma'),
        ('g', 'Grama'),
        ('l', 'Litro'),
        ('ml', 'Mililitro'),
        ('un', 'Unidade'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=150)
    unidade_medida = models.CharField(max_length=2, choices=UNIDADES)
    estoque_atual = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    estoque_minimo = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    custo_medio = models.DecimalField(max_digits=10, decimal_places=4, default=0)

    class Meta:
        ordering = ['nome']

    def __str__(self):
        return f'{self.nome} ({self.unidade_medida})'

    @property
    def abaixo_do_minimo(self):
        return self.estoque_atual <= self.estoque_minimo


class FichaTecnica(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produto = models.ForeignKey(
        Produto, on_delete=models.CASCADE, related_name='ficha_tecnica'
    )
    insumo = models.ForeignKey(
        Insumo, on_delete=models.PROTECT, related_name='ficha_tecnica'
    )
    quantidade = models.DecimalField(max_digits=10, decimal_places=4)

    class Meta:
        unique_together = ('produto', 'insumo')

    def __str__(self):
        return f'{self.produto} → {self.insumo} ({self.quantidade})'
