from rest_framework import serializers
from .models import Pedido, ItemPedido


class ItemPedidoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)

    class Meta:
        model = ItemPedido
        fields = ['id', 'produto', 'produto_nome', 'quantidade', 'preco_unitario', 'observacao']
        read_only_fields = ['preco_unitario']


class PedidoSerializer(serializers.ModelSerializer):
    itens = ItemPedidoSerializer(many=True)
    criado_por_nome = serializers.CharField(
        source='criado_por.nome_completo', read_only=True, default=''
    )
    pode_concluir = serializers.BooleanField(read_only=True)
    status_permite_edicao = serializers.BooleanField(read_only=True)

    class Meta:
        model = Pedido
        fields = [
            'id', 'numero', 'tipo', 'origem', 'status',
            'cliente_nome', 'cliente_telefone', 'cliente_endereco',
            'forma_pagamento', 'valor_total', 'observacao', 'numero_fiscal',
            'criado_por', 'criado_por_nome', 'created_at', 'concluido_at',
            'pode_concluir', 'status_permite_edicao',
            'itens',
        ]
        read_only_fields = ['numero', 'status', 'valor_total', 'concluido_at']

    def create(self, validated_data):
        itens_data = validated_data.pop('itens')
        pedido = Pedido.objects.create(**validated_data)
        self._salvar_itens(pedido, itens_data)
        return pedido

    def update(self, instance, validated_data):
        itens_data = validated_data.pop('itens', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if itens_data is not None:
            instance.itens.all().delete()
            self._salvar_itens(instance, itens_data)
        return instance

    def _salvar_itens(self, pedido, itens_data):
        total = 0
        itens = []
        for item_data in itens_data:
            produto = item_data['produto']
            preco = produto.preco_venda
            quantidade = item_data['quantidade']
            total += preco * quantidade
            itens.append(ItemPedido(
                pedido=pedido,
                produto=produto,
                quantidade=quantidade,
                preco_unitario=preco,
                observacao=item_data.get('observacao', ''),
            ))
        ItemPedido.objects.bulk_create(itens)
        pedido.valor_total = total
        pedido.save(update_fields=['valor_total'])
