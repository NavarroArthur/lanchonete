from django.db import migrations


def criar_grupos(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Group.objects.get_or_create(name='administrador')
    Group.objects.get_or_create(name='operador')


def remover_grupos(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Group.objects.filter(name__in=['administrador', 'operador']).delete()


class Migration(migrations.Migration):
    dependencies = [('usuarios', '0001_initial')]
    operations = [migrations.RunPython(criar_grupos, remover_grupos)]
