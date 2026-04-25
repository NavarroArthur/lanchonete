#!/bin/bash
set -e

echo "==> Rodando migrations..."
python manage.py migrate --noinput

echo "==> Coletando arquivos estaticos..."
python manage.py collectstatic --noinput

echo "==> Iniciando servidor..."
exec gunicorn config.wsgi \
    --bind 0.0.0.0:8000 \
    --workers ${GUNICORN_WORKERS:-2} \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
