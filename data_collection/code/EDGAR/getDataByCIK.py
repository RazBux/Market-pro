import requests
import json

# Define the company CIK and concept
CIK = '0000320193'  # Example: Apple Inc.
concept = 'NetIncomeLoss'

# Construct the API URL
# url = f"https://data.sec.gov/api/xbrl/companyconcept/CIK{CIK}/us-gaap/{concept}.json"

# url = "https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json"

url = "https://data.sec.gov/submissions/CIK0000320193.json"

# Send the GET request
headers = {'User-Agent': 'Your-Name your-email@example.com'}
response = requests.get(url, headers=headers)

# Parse the JSON response
data = response.json()

# Define the filename
filename = 'AppleSubmissions.json'

# Write the data to a file
with open(filename, 'w') as file:
    json.dump(data, file, indent=4)

print(f"Data has been saved to {filename}")
