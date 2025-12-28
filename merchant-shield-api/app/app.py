import os
import datetime
import pandas as pd
import joblib
import json
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS

from auth import require_api_key
from db_utils import (
    register_user, authenticate_user, 
    get_transactions_by_user, log_request, get_all_logs
)
from validation import validate_payload


app = Flask(__name__)
CORS(app)

# Load model
MODEL_PATH = "../model/model_v1.pkl"
model = joblib.load(MODEL_PATH)

# 🔧 sklearn 1.8.x compatibility patch for LogisticRegression
if hasattr(model, "named_steps"):
    lr = model.named_steps.get("model")
    if lr is not None and not hasattr(lr, "multi_class"):
        print("⚠️ Patching LogisticRegression.multi_class = 'auto'")
        lr.multi_class = "auto"

# Load feature names from schema in correct order
with open("../model/schema.json") as f:
    FEATURE_NAMES = json.load(f)["features"]

# --- 1) User Registration ---
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Missing username or password"}), 400
    
    response, status_code = register_user(data['username'], data['password'])
    return jsonify(response), status_code

# --- 2) User Authentication ---
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    response, status_code = authenticate_user(data.get('username'), data.get('password'))
    return jsonify(response), status_code

# --- 4) GET transactions by a single user ---
@app.route("/api/get-transactions/<username>", methods=["GET"])
def user_transactions(username):
    transactions = get_transactions_by_user(username)
    return jsonify(transactions)

@app.route("/api/get-all-transactions", methods=["GET"])
def get_logs():
    try:
        # Get limit from query parameters, default to 100
        limit = request.args.get('limit', default=100, type=int)
        
        logs = get_all_logs(limit)
        
        return logs
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/analyze-risk", methods=["POST"])
def analyze_risk():
    require_api_key()
    
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
        
        data = request.get_json()
        if data is None:
            return jsonify({"error": "Invalid JSON"}), 400
        
        # Validate payload
        features = validate_payload(data)
        
        # Create DataFrame with EXACT feature names from schema
        X = pd.DataFrame([features], columns=FEATURE_NAMES)
        
        prob = model.predict_proba(X)[0][1]
        flagged = bool(prob > 0.5)
        
        response_data = {
            "fraud_probability": round(float(prob), 4),
            "flagged": flagged
        }

        # Instead of calling log_request(data, prob) directly:
        threading.Thread(
            target=log_request, 
            args=(data, response_data)
        ).start()

        return jsonify(response_data)
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500

# Custom error handlers to return JSON instead of HTML
@app.errorhandler(401)
def unauthorized(e):
    return jsonify({"error": "Unauthorized", "message": str(e)}), 401

@app.errorhandler(403)
def forbidden(e):
    return jsonify({"error": "Forbidden", "message": str(e)}), 403

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found", "message": str(e)}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False, use_reloader=False)