from django.contrib import admin
from django.urls import path
from api.views import proxy_predict   # we will create this next

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/predict/', proxy_predict),           # ← your current React uses this
    # Future endpoints (we'll use these when adding LLM and LOB)
    # path('api/predict/ecg/', proxy_predict),
    # path('api/predict/llm/', proxy_predict),
    # path('api/predict/lob/', proxy_predict),
]