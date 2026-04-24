from django.db import transaction
from django.utils import timezone
from django.db.models import Sum, Q
from .models import SessaoCaixa, MovimentacaoFinanceira


class CaixaService:

    @staticmethod
    def sessao_ativa():
        return SessaoCaixa.objects.filter(fechado_em__isnull=True).first()

    @staticmethod
    @transaction.atomic
    def abrir(valor_abertura, usuario):
        if CaixaService.sessao_ativa():
            raise ValueError('Já existe um caixa aberto. Feche-o antes de abrir outro.')
        return SessaoCaixa.objects.create(
            abertura_usuario=usuario,
            valor_abertura=valor_abertura,
        )

    @staticmethod
    @transaction.atomic
    def fechar(valor_contado, observacao, usuario):
        sessao = CaixaService.sessao_ativa()
        if not sessao:
            raise ValueError('Nenhum caixa aberto no momento.')

        esperado = sessao.total_esperado_dinheiro()
        sessao.valor_contado = valor_contado
        sessao.diferenca = float(valor_contado) - float(esperado)
        sessao.fechamento_usuario = usuario
        sessao.fechado_em = timezone.now()
        sessao.observacao = observacao
        sessao.save()
        return sessao

    @staticmethod
    def resumo(sessao):
        movs = sessao.movimentacoes.all()
        receitas = movs.filter(tipo='receita').aggregate(
            total=Sum('valor'),
            dinheiro=Sum('valor', filter=Q(forma_pagamento='dinheiro')),
            cartao=Sum('valor', filter=Q(forma_pagamento='cartao')),
            pix=Sum('valor', filter=Q(forma_pagamento='pix')),
        )
        despesas = movs.filter(tipo='despesa').aggregate(total=Sum('valor'))

        return {
            'valor_abertura': sessao.valor_abertura,
            'receitas': {
                'total': receitas['total'] or 0,
                'dinheiro': receitas['dinheiro'] or 0,
                'cartao': receitas['cartao'] or 0,
                'pix': receitas['pix'] or 0,
            },
            'despesas': despesas['total'] or 0,
            'esperado_dinheiro': sessao.total_esperado_dinheiro(),
            'valor_contado': sessao.valor_contado,
            'diferenca': sessao.diferenca,
        }
