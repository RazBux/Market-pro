import json
from datetime import datetime

# Path to the JSON file
file_path = "/Users/razbuxboim/Desktop/Raz-market-app/data_collection/code/EDGAR/AppleCompanyFacts.json"


# Function to calculate the duration between two dates
def calculate_duration(start_date_str, end_date_str):
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
    duration = (end_date - start_date).days
        
    return duration/30


# Read the JSON file
with open(file_path, "r") as file:
    # Load the JSON data
    data = json.load(file)
    list = data["facts"]["us-gaap"].keys()
    
    
    # print all the category that the doc have like Revenue, NetIncomeLoss.
    category = data["facts"]["us-gaap"].keys() 
    for cat in category:
        if "Rev" in cat: 
            print(cat)
    print()
    
    
    
    list1 = []
    netIL = data["facts"]["us-gaap"]["Revenues"]["units"]["USD"]
    for v in netIL:
        if "Q" in v["form"]:
            # print(v)
            
            duration = calculate_duration(v["start"], v["end"])

            # Check if the duration is less than or equal to 3 days
            if duration <= 3:
                # print(v)  # Print the record if the condition is met
                list1.append(v)

    # for l in list1: 
    #     for lk in l:
    #         print(lk, l[lk])
    #     print()
    print(len(list1))
