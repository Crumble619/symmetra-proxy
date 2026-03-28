import os
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health_check(request):
    """Simple health check for DigitalOcean and debugging"""
    return Response({
        "status": "ok",
        "proxy": "running",
        "real_backend_url": os.getenv('REAL_BACKEND_URL', 'NOT_SET')
    })


@api_view(['POST'])
def proxy_predict(request):
    """Forward requests from React → your hidden backend via VS Code tunnel"""
    real_backend = os.getenv('REAL_BACKEND_URL')
    
    if not real_backend:
        return Response({"error": "REAL_BACKEND_URL environment variable is not configured"}, status=500)

    try:
        # Forward the request exactly as React sends it
        response = requests.post(
            real_backend,
            json=request.data,
            timeout=20,                    # Give it enough time for model inference
            headers={"User-Agent": "Symmetra-Proxy"}
        )
        
        # Pass through the response from your real backend
        return Response(response.json(), status=response.status_code)
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Proxy forwarding error: {e}")
        return Response({
            "error": "Cannot reach prediction backend",
            "detail": "Check if VS Code tunnel and backend server are running"
        }, status=503)
    except Exception as e:
        print(f"❌ Unexpected proxy error: {e}")
        return Response({"error": "Internal proxy error"}, status=500)