from rest_framework import serializers
from .models import SessaoCaixa, MovimentacaoFinanceira


class SessaoCaixaSerializer(serializers.ModelSerializer):
    abertura_usuario_nome = serializers.CharField(
        source='abertura_usuario.nome_completo', read_only=True
    )
    esta_aberto = serializers.BooleanField(read_only=True)

    class Meta:
        model = SessaoCaixa
        fields = [
            'id', 'abertura_usuario', 'abertura_usuario_nome',
            'valor_abertura', 'valor_contado', 'diferenca',
            'aberto_em', 'fechado_em', 'observacao', 'esta_aberto',
        ]
        read_only_fields = ['diferenca', 'fechado_em']


class MovimentacaoFinanceiraSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovimentacaoFinanceira
        fields = [
            'id', 'sessao_caixa', 'pedido', 'tipo', 'categoria',
            'descricao', 'valor', 'forma_pagamento', 'created_at',
        ]
        read_only_fields = ['sessao_caixa', 'tipo', 'created_at']
