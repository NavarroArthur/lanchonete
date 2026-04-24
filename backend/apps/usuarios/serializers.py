from rest_framework import serializers
from django.contrib.auth.models import Group
from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    grupos = serializers.SlugRelatedField(
        many=True, slug_field='name',
        queryset=Group.objects.all(), source='groups'
    )
    is_admin = serializers.BooleanField(read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'nome_completo', 'email',
            'grupos', 'is_admin', 'ativo', 'is_active',
        ]

    def create(self, validated_data):
        grupos = validated_data.pop('groups', [])
        password = self.context['request'].data.get('password')
        user = Usuario(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        user.groups.set(grupos)
        return user
