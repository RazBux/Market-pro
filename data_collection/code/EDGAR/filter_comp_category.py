import json
from datetime import datetime
import os 
import pandas as pd

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Concatenate the company_data folder name to the path
ED_path = os.path.join(script_dir, 'ED_company_data')



# create list of the the .json files in ED_company_data dir
files = []
for dirpath, _, filenames in os.walk(ED_path):
    for filename in filenames:
        # removing the DS_Store file
        if ".json" in filename:
            files.append(os.path.join(dirpath, filename))
            
# for f in files:
#     print(f)
    
setList = []
newList = []

# setList category from the first file in the list
with open(files[0], "r") as file:
        # Load the JSON data
        data = json.load(file)
        setList = data["facts"]["us-gaap"].keys()

# compare all the category for each file starting from 1.
for i in range(1,len(files),1):
    # Read the JSON file
    with open(files[i], "r") as file:
        # Load the JSON data
        data = json.load(file)
        if "us-gaap" in data.get("facts", {}):
            newList = data["facts"]["us-gaap"].keys()
            setList = set(newList) & set(setList)
        
            print(f"iteration no:{i} --> {len(setList)}")
        else:
            print(f"No \"us-gaap\" in {files[i]}")
# Convert lists to sets and find the intersection
common_elements = setList
print("common_elements len:",len(common_elements))

common_elements = sorted(common_elements, key=len)
for com in common_elements:
    if len(com): 
        print(com)


