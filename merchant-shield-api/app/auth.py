from flask import request, abort
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")

def require_api_key():
    key = request.headers.get("X-API-KEY")
    if key != API_KEY:
        abort(401, description="Invalid API Key")