import requests
import json
import os

def save_company_tickers():
    # Create request header
    headers = {'User-Agent': "email@address.com"}

    # Get all companies data
    companyTickers = requests.get(
        "https://www.sec.gov/files/company_tickers.json",
        headers=headers
    )

    # Save the JSON data to a file
    with open('company_tickers.json', 'w') as f:
        json.dump(companyTickers.json(), f, indent=4)
        

def get_companyfacts_CIK(CIK, company_name):
    # add zeros to the CIK
    CIK = str(CIK.zfill(10)) 
    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{CIK}.json"
    
    # Send the GET request
    headers = {'User-Agent': 'Your-Name your-emailll@example.com'}
    response = requests.get(url, headers=headers)

    # Parse the JSON response
    data = response.json()

    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Concatenate the company_data folder name to the path
    ED_path = os.path.join(script_dir, 'ED_company_data')

    # Ensure the directory exists
    os.makedirs(ED_path, exist_ok=True)

    # create the file.json path
    filename = os.path.join(ED_path, f'{company_name}.json')
    # Write the data to a file
    with open(filename, 'w') as file:
        json.dump(data, file, indent=4)

    print(f"Data has been saved to {filename}")


def read_data(file_path="/Users/razbuxboim/Desktop/Raz-market-app/data_collection/code/EDGAR/ED_data/company_tickers.json"):    
    # Read the JSON file
    with open(file_path, "r") as file:
        # Load the JSON data
        data = json.load(file)
        return data
        

if __name__=='__main__':
    # get the company CIK and name
    company_tiker_file = '/Users/razbuxboim/Desktop/Raz-market-app/data_collection/code/EDGAR/ED_company_tickers/company_tickers.json'
    
    with open(company_tiker_file, 'r') as file:
        data = json.load(file)
        print(type(data))
        print(len(data))
        for i in range(7, 10, 1):
            num = str(i)
            print(num)
            
            comp = str(data[num]['ticker'])
            print(comp)

            # fill zeros for the CIK 
            cik = str(data[num]['cik_str']).zfill(10)
        
            # get all the compamy data 
            get_companyfacts_CIK(cik, comp) 
        

    