import json

with open("../model/schema.json") as f:
    SCHEMA = json.load(f)["features"]

def validate_payload(data):
    missing = [f for f in SCHEMA if f not in data]
    if missing:
        raise ValueError(f"Missing fields: {missing}")

    return [data[f] for f in SCHEMA]