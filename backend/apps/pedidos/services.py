from django.db import transaction
from django.utils import timezone
from django.db.models import F
from apps.catalogo.models import FichaTecnica
from apps.estoque.models import MovimentacaoEstoque


class PedidoService:

    @staticmethod
    @transaction.atomic
    def avancar_status(pedido, usuario):
        fluxo = {
            'aguardando': 'confirmado',
            'confirmado': 'em_preparo',
            'em_preparo': 'pronto',
            'pronto': 'saiu_entrega' if pedido.tipo == 'delivery' else None,
            'saiu_entrega': None,
        }

        proximo = fluxo.get(pedido.status)
        if not proximo:
            raise ValueError(f'Status "{pedido.status}" não pode ser avançado.')

        pedido.status = proximo
        pedido.save(update_fields=['status'])
        return pedido

    @staticmethod
    @transaction.atomic
    def concluir(pedido, forma_pagamento, usuario):
        if not pedido.pode_concluir:
            raise ValueError(
                f'Pedido no status "{pedido.status}" não pode ser concluído.'
            )

        PedidoService._baixar_estoque(pedido, usuario)
        PedidoService._registrar_receita(pedido, forma_pagamento, usuario)

        pedido.status = 'concluido'
        pedido.forma_pagamento = forma_pagamento
        pedido.concluido_at = timezone.now()
        pedido.save(update_fields=['status', 'forma_pagamento', 'concluido_at'])
        return pedido

    @staticmethod
    @transaction.atomic
    def cancelar(pedido, motivo, usuario):
        if pedido.status == 'concluido':
            raise ValueError('Pedido já concluído não pode ser cancelado.')

        pedido.status = 'cancelado'
        pedido.observacao = f'Cancelado: {motivo}'
        pedido.save(update_fields=['status', 'observacao'])
        return pedido

    @staticmethod
    def _baixar_estoque(pedido, usuario):
        movimentacoes = []

        for item in pedido.itens.select_related('produto').all():
            fichas = FichaTecnica.objects.filter(
                produto=item.produto
            ).select_related('insumo')

            for ficha in fichas:
                quantidade_a_baixar = ficha.quantidade * item.quantidade

                ficha.insumo.__class__.objects.filter(pk=ficha.insumo.pk).update(
                    estoque_atual=F('estoque_atual') - quantidade_a_baixar
                )

                movimentacoes.append(MovimentacaoEstoque(
                    insumo=ficha.insumo,
                    pedido=pedido,
                    usuario=usuario,
                    tipo='saida_automatica',
                    quantidade=quantidade_a_baixar,
                    motivo=f'Pedido #{pedido.numero}',
                ))

        MovimentacaoEstoque.objects.bulk_create(movimentacoes)

    @staticmethod
    def _registrar_receita(pedido, forma_pagamento, usuario):
        from apps.financeiro.models import MovimentacaoFinanceira, SessaoCaixa

        sessao = SessaoCaixa.objects.filter(fechado_em__isnull=True).first()

        MovimentacaoFinanceira.objects.create(
            sessao_caixa=sessao,
            pedido=pedido,
            usuario=usuario,
            tipo='receita',
            descricao=f'Pedido #{pedido.numero}',
            valor=pedido.valor_total,
            forma_pagamento=forma_pagamento,
        )
