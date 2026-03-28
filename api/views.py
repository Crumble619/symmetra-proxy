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
    """Forward requests to the real hidden backend"""
    real_backend = os.getenv('REAL_BACKEND_URL')
    
    if not real_backend:
        return Response({"error": "REAL_BACKEND_URL environment variable is not configured"}, status=500)

    try:
        response = requests.post(
            real_backend,
            json=request.data,
            timeout=25,
            headers={"User-Agent": "Symmetra-Proxy"}
        )
        
        return Response(response.json(), status=response.status_code)
        
    except requests.exceptions.RequestException as e:
        print(f"Proxy forwarding error: {e}")
        return Response({
            "error": "Cannot reach prediction backend",
            "detail": "Make sure VS Code tunnel and backend are running"
        }, status=503)
    except Exception as e:
        print(f"Unexpected proxy error: {e}")
        return Response({"error": "Internal proxy error"}, status=500)
