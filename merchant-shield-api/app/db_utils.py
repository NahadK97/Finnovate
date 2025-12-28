import os
import jwt
import datetime
from flask import jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# MongoDB Connection
client = MongoClient(MONGO_URI, tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=2000)
db = client["fraud-detect"]

# Collections
logs_col = db["card_logs"]
users_col = db["users"]

# SECRET_KEY for JWT (Should be in .env)
SECRET_KEY = os.getenv("SECRET_KEY")

# User Registration & Authentication ---

def register_user(username, password):
    if users_col.find_one({"username": username}):
        return {"error": "User already exists"}, 400
    
    hashed_pw = generate_password_hash(password)
    users_col.insert_one({
        "username": username,
        "password": hashed_pw,
        "created_at": datetime.datetime.utcnow()
    })
    return {"message": "User created successfully"}, 201

def authenticate_user(username, password):
    # 1. FIX: Changed "User" to "username" to match your DB schema
    user = users_col.find_one({"username": username})
    
    # Verify the password hash
    if user and check_password_hash(user['password'], password):
        # Generate the JWT token
        token = jwt.encode({
            'user': username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm="HS256")
        
        # 2. FIX: Return a nested object so the frontend 'if (resp.user)' check passes
        return {
            "token": token,
            "user": {
                "username": username
            }
        }, 200
        
    return {"error": "Invalid credentials"}, 401

# Transaction Retrieval ---

def get_transactions_by_user(username):
    query = {"transaction.username": username}
    results = list(logs_col.find(query, {"_id": 0}))
    return results

def log_request(transaction: dict, response: dict) -> bool:
    try:
        log_entry = {
            "transaction": transaction,
            "response": response,
        }
        logs_col.insert_one(log_entry)
        return True
    except Exception as e:
        print(f"Error logging transaction: {e}")
        return False

def get_all_logs(limit=100):
    logs = []
    cursor = logs_col.find().sort("_id", -1).limit(limit)
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        logs.append(doc)
    return logs