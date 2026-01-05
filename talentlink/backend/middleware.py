"""
Custom middleware to handle host validation for Render deployment
"""

class RenderHostMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Allow all onrender.com hosts
        host = request.get_host()
        if host and ('.onrender.com' in host or host == 'talentlink-7pqy.onrender.com'):
            # Temporarily bypass Django's host validation for Render domains
            request.get_host = lambda: host
        
        response = self.get_response(request)
        return response