"""
AI Student PRO — Django WSGI конфигурациясы
"""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "aistudentpro.settings")

application = get_wsgi_application()
