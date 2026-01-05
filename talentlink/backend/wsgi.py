import os
import sys

# Debug: Print environment before Django loads
print(f"=== WSGI DEBUG ===", file=sys.stderr)
print(f"DJANGO_SETTINGS_MODULE: {os.environ.get('DJANGO_SETTINGS_MODULE')}", file=sys.stderr)
print(f"ALLOWED_HOSTS env: {os.environ.get('ALLOWED_HOSTS', 'Not set')}", file=sys.stderr)
print(f"===================", file=sys.stderr)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()