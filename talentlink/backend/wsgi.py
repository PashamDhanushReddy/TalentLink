import os
import sys

# Debug: Print environment before Django loads
print(f"=== WSGI DEBUG ===", file=sys.stderr)
print(f"DJANGO_SETTINGS_MODULE: {os.environ.get('DJANGO_SETTINGS_MODULE')}", file=sys.stderr)
print(f"ALLOWED_HOSTS env: {os.environ.get('ALLOWED_HOSTS', 'Not set')}", file=sys.stderr)
print(f"DATABASE_URL env: {os.environ.get('DATABASE_URL', 'Not set')}", file=sys.stderr)
print(f"PORT: {os.environ.get('PORT', 'Not set')}", file=sys.stderr)
print(f"Current working directory: {os.getcwd()}", file=sys.stderr)
print(f"Python path: {sys.path}", file=sys.stderr)
print(f"===================", file=sys.stderr)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()

print("=== WSGI Application Loaded Successfully ===", file=sys.stderr)