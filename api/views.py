import os
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health_check(request):
    """Simple health check"""
    return Response({
        "status": "ok",
        "proxy": "running",
        "real_backend_url": os.getenv('REAL_BACKEND_URL', 'NOT_SET')
    })


@api_view(['POST'])
def proxy_predict(request):
    real_backend = os.getenv('REAL_BACKEND_URL')
    
    if not real_backend:
        return Response({"error": "REAL_BACKEND_URL is not set"}, status=500)

    try:
        print(f"🔄 Proxy forwarding to: {real_backend}")
        print(f"📦 Request data: {request.data}")

        response = requests.post(
            real_backend,
            json=request.data,
            timeout=40,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Symmetra-Proxy"
            }
        )
        
        print(f"✅ Backend responded with status: {response.status_code}")
        
        return Response(response.json(), status=response.status_code)

    except requests.exceptions.RequestException as e:
        print(f"❌ Forwarding error: {e}")
        return Response({
            "error": "Cannot reach inference backend",
            "detail": str(e),
            "backend_url_used": real_backend
        }, status=502)
