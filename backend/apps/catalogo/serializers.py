from rest_framework import serializers
from .models import Categoria, Produto, Insumo, FichaTecnica


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'


class FichaTecnicaSerializer(serializers.ModelSerializer):
    insumo_nome = serializers.CharField(source='insumo.nome', read_only=True)
    unidade = serializers.CharField(source='insumo.unidade_medida', read_only=True)

    class Meta:
        model = FichaTecnica
        fields = ['id', 'insumo', 'insumo_nome', 'unidade', 'quantidade']


class ProdutoSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    ficha_tecnica = FichaTecnicaSerializer(many=True, read_only=True)

    class Meta:
        model = Produto
        fields = [
            'id', 'categoria', 'categoria_nome', 'nome', 'descricao',
            'preco_venda', 'foto', 'ativo', 'ficha_tecnica',
        ]


class InsumoSerializer(serializers.ModelSerializer):
    abaixo_do_minimo = serializers.BooleanField(read_only=True)

    class Meta:
        model = Insumo
        fields = '__all__'
