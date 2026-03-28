from django.urls import path
from api.views import health_check, proxy_predict

urlpatterns = [
    path('health/', health_check, name='health'),
    path('api/predict/', proxy_predict, name='proxy_predict'),
]
