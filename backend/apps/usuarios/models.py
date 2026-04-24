from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    nome_completo = models.CharField(max_length=150, blank=True)

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return self.nome_completo or self.username

    @property
    def is_admin(self):
        return self.groups.filter(name='administrador').exists()
