from rest_framework import serializers
from .models import MovimentacaoEstoque


class MovimentacaoEstoqueSerializer(serializers.ModelSerializer):
    insumo_nome = serializers.CharField(source='insumo.nome', read_only=True)
    usuario_nome = serializers.CharField(source='usuario.nome_completo', read_only=True, default='')

    class Meta:
        model = MovimentacaoEstoque
        fields = [
            'id', 'insumo', 'insumo_nome', 'pedido', 'usuario', 'usuario_nome',
            'tipo', 'quantidade', 'motivo', 'custo_unitario', 'created_at',
        ]
        read_only_fields = ['usuario', 'created_at']

    def validate(self, data):
        tipo = data.get('tipo')
        motivo = data.get('motivo', '')
        if tipo in ('saida_manual', 'ajuste') and not motivo:
            raise serializers.ValidationError(
                {'motivo': 'Motivo é obrigatório para saídas manuais e ajustes.'}
            )
        return data
