import pandas as pd
import json
import sqlite3 


# Function to find all instances where "form" is "10-K"
def find_10k_forms(data):
    results = []
    # Navigate to the relevant section in the data
    # Step 1: Extract entries with form "10-K"
    ten_k_entries = [entry for entry in data["units"]["USD"] if entry["form"] == "10-Q"]

    # Step 2: Display the results
    for entry in ten_k_entries:
        print(entry)
        results.append(entry)
        
    return results

# Step 1: Load the JSON file
file_path = 'data.json'  # Replace with the path to your file

with open(file_path, 'r') as file:
    data = json.load(file)
    
    
# Find all "10-K" forms
ten_k_forms = find_10k_forms(data)

# Create a DataFrame from the list of "10-K" forms
df = pd.DataFrame(ten_k_forms)

# Connect to SQLite database (or create it)
conn = sqlite3.connect('apple.db')

# Write DataFrame to SQLite table
df.to_sql('my_table', conn, if_exists='replace', index=False)

# Close the connection
conn.close()


# Display the DataFrame
# print(df)