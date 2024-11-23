from django.contrib import admin
from django.urls import path, include, re_path
from api.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings  # Change this import
from django.conf.urls.static import static
from .views import index 

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    #authentication
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Change this pattern
urlpatterns += [
    re_path(r'^(?!admin|api).*$', index, name='index')  
]