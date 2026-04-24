from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ['username', 'nome_completo', 'email', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Dados extras', {'fields': ('nome_completo',)}),
    )
