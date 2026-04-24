from django.contrib import admin
from .models import SessaoCaixa, MovimentacaoFinanceira


@admin.register(SessaoCaixa)
class SessaoCaixaAdmin(admin.ModelAdmin):
    list_display = ['aberto_em', 'abertura_usuario', 'valor_abertura', 'valor_contado', 'diferenca', 'fechado_em']
    readonly_fields = ['aberto_em', 'diferenca']


@admin.register(MovimentacaoFinanceira)
class MovimentacaoFinanceiraAdmin(admin.ModelAdmin):
    list_display = ['tipo', 'categoria', 'descricao', 'valor', 'forma_pagamento', 'created_at']
    list_filter = ['tipo', 'forma_pagamento']
    readonly_fields = ['created_at']
