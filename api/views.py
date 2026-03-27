import os
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def proxy_predict(request):
    real_backend = os.getenv('REAL_BACKEND_URL')
    
    if not real_backend:
        return Response({"error": "REAL_BACKEND_URL not configured"}, status=500)

    try:
        # Forward the exact same data your React sends
        response = requests.post(
            real_backend,
            json=request.data,
            timeout=15,
            headers={"User-Agent": "Symmetra-Proxy"}
        )
        
        # Return whatever the real backend returns
        return Response(response.json(), status=response.status_code)
        
    except requests.exceptions.RequestException as e:
        print(f"Proxy error: {e}")
        return Response(
            {"error": "Prediction service temporarily unavailable"},
            status=503
        )