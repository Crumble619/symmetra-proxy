from django.urls import path
from .views import health_check, predict   # ← Import from proxy's views.py

urlpatterns = [
    path('health/', health_check, name='health'),
    path('api/predict/', predict, name='predict'),   # This is what React will call
]