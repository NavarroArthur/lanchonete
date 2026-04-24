from django.contrib import admin
from .models import Categoria, Produto, Insumo, FichaTecnica


class FichaTecnicaInline(admin.TabularInline):
    model = FichaTecnica
    extra = 1


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    inlines = [FichaTecnicaInline]
    list_display = ['nome', 'categoria', 'preco_venda', 'ativo']
    list_filter = ['categoria', 'ativo']
    search_fields = ['nome']


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nome', 'ordem', 'ativo']


@admin.register(Insumo)
class InsumoAdmin(admin.ModelAdmin):
    list_display = ['nome', 'unidade_medida', 'estoque_atual', 'estoque_minimo', 'custo_medio']
    search_fields = ['nome']
