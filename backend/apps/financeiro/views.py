from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q
from .models import SessaoCaixa, MovimentacaoFinanceira
from .serializers import SessaoCaixaSerializer, MovimentacaoFinanceiraSerializer
from .services import CaixaService
from apps.usuarios.permissions import IsAdministrador


class SessaoCaixaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SessaoCaixa.objects.all()
    serializer_class = SessaoCaixaSerializer
    permission_classes = [IsAdministrador]

    @action(detail=False, methods=['get'])
    def ativa(self, request):
        sessao = CaixaService.sessao_ativa()
        if not sessao:
            return Response({'aberto': False})
        return Response({
            'aberto': True,
            'sessao': SessaoCaixaSerializer(sessao).data,
            'resumo': CaixaService.resumo(sessao),
        })

    @action(detail=False, methods=['post'])
    def abrir(self, request):
        valor = request.data.get('valor_abertura', 0)
        try:
            sessao = CaixaService.abrir(valor, request.user)
            return Response(
                SessaoCaixaSerializer(sessao).data,
                status=status.HTTP_201_CREATED
            )
        except ValueError as e:
            return Response({'erro': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def fechar(self, request):
        valor_contado = request.data.get('valor_contado')
        observacao = request.data.get('observacao', '')
        if valor_contado is None:
            return Response(
                {'erro': 'Informe o valor contado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            sessao = CaixaService.fechar(valor_contado, observacao, request.user)
            return Response({
                'sessao': SessaoCaixaSerializer(sessao).data,
                'resumo': CaixaService.resumo(sessao),
            })
        except ValueError as e:
            return Response({'erro': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MovimentacaoFinanceiraViewSet(viewsets.ModelViewSet):
    queryset = MovimentacaoFinanceira.objects.select_related(
        'sessao_caixa', 'pedido', 'usuario'
    )
    serializer_class = MovimentacaoFinanceiraSerializer
    permission_classes = [IsAdministrador]
    filterset_fields = ['tipo', 'forma_pagamento', 'sessao_caixa']
    http_method_names = ['get', 'post']

    def perform_create(self, serializer):
        sessao = CaixaService.sessao_ativa()
        serializer.save(
            usuario=self.request.user,
            sessao_caixa=sessao,
            tipo='despesa',
        )

    @action(detail=False, methods=['get'])
    def fluxo(self, request):
        inicio = request.query_params.get('inicio')
        fim = request.query_params.get('fim')

        qs = self.queryset
        if inicio:
            qs = qs.filter(created_at__date__gte=inicio)
        if fim:
            qs = qs.filter(created_at__date__lte=fim)

        agg = qs.aggregate(
            total_receitas=Sum('valor', filter=Q(tipo='receita')),
            total_despesas=Sum('valor', filter=Q(tipo='despesa')),
            dinheiro=Sum('valor', filter=Q(tipo='receita', forma_pagamento='dinheiro')),
            cartao=Sum('valor', filter=Q(tipo='receita', forma_pagamento='cartao')),
            pix=Sum('valor', filter=Q(tipo='receita', forma_pagamento='pix')),
        )

        receitas = agg['total_receitas'] or 0
        despesas = agg['total_despesas'] or 0

        return Response({
            'periodo': {'inicio': inicio, 'fim': fim},
            'receitas': receitas,
            'despesas': despesas,
            'resultado': float(receitas) - float(despesas),
            'por_forma_pagamento': {
                'dinheiro': agg['dinheiro'] or 0,
                'cartao': agg['cartao'] or 0,
                'pix': agg['pix'] or 0,
            },
        })
