from django.contrib import admin
from .models import MovimentacaoEstoque


@admin.register(MovimentacaoEstoque)
class MovimentacaoEstoqueAdmin(admin.ModelAdmin):
    list_display = ['insumo', 'tipo', 'quantidade', 'motivo', 'usuario', 'created_at']
    list_filter = ['tipo', 'insumo']
    readonly_fields = ['created_at']
