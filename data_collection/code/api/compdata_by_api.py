# 0AQXEXJF4KHCIC6C
import requests
import json

API_KEY = "0AQXEXJF4KHCIC6C"
SYMBOL = "FSLR"             
BASE_URL = "https://www.alphavantage.co/query"

params = {
    "function": "INCOME_STATEMENT",
    "symbol": SYMBOL,
    "apikey": API_KEY,
}

response = requests.get(BASE_URL, params=params, timeout=30)
data = response.json()

# Save to JSON file
name = params["function"].lower() + "_" + SYMBOL + ".json"
with open(name, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print(f"✅ Income statement data saved to {name}")
