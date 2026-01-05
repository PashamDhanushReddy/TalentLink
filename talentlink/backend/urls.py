from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView, RedirectView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/contracts/', include('contracts.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Redirect root files to static
    path('favicon.ico', RedirectView.as_view(url='/static/favicon.ico', permanent=True)),
    path('manifest.json', RedirectView.as_view(url='/static/manifest.json', permanent=True)),
    path('robots.txt', RedirectView.as_view(url='/static/robots.txt', permanent=True)),
    path('logo192.png', RedirectView.as_view(url='/static/logo192.png', permanent=True)),
    path('logo512.png', RedirectView.as_view(url='/static/logo512.png', permanent=True)),

    # Catch-all pattern for React frontend
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]