from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Usuario
from .serializers import UsuarioSerializer
from .permissions import IsAdministrador


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.prefetch_related('groups').order_by('nome_completo')
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdministrador]

    @action(detail=False, methods=['get'])
    def me(self, request):
        return Response(UsuarioSerializer(request.user).data)
