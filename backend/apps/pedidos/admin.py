from django.contrib import admin
from .models import Pedido, ItemPedido


class ItemPedidoInline(admin.TabularInline):
    model = ItemPedido
    extra = 0
    readonly_fields = ['preco_unitario']


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    inlines = [ItemPedidoInline]
    list_display = ['numero', 'tipo', 'status', 'cliente_nome', 'valor_total', 'created_at']
    list_filter = ['status', 'tipo', 'origem']
    readonly_fields = ['numero', 'valor_total', 'concluido_at', 'created_at']
    search_fields = ['numero', 'cliente_nome']
