from rest_framework.permissions import BasePermission


class IsAdministrador(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.groups.filter(name='administrador').exists()
        )


class IsOperadorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.groups.filter(name__in=['administrador', 'operador']).exists()
        )
