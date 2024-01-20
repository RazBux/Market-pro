import fitz  # PyMuPDF
import re
import pandas as pd

# Open the PDF file
file_path = '/Users/razbuxboim/Desktop/Raz-market-app/data_collection/docs/enphase/combined.pdf' 
doc = fitz.open(file_path)




# Extract text from each page
text = ""
for page in doc:
    text += page.get_text()

# Close the document
doc.close()

# Define the regular expression pattern for quarterly data
pattern = re.compile(
    r"Three Months Ended\s+(\w+ \d{2}, \d{4}).*?Net revenues\s+\$\s+([\d,]+)\s+\$\s+([\d,]+).*?Cost of revenues\s+([\d,]+)\s+([\d,]+).*?Gross profit\s+([\d,]+)\s+([\d,]+)",
    re.DOTALL
)

# Find all matches
matches = pattern.findall(text)

# Create a DataFrame from matches
data = []
for match in matches:
    quarter_end, net_revenues_current, net_revenues_previous, cost_of_revenues_current, cost_of_revenues_previous, gross_profit_current, gross_profit_previous = match

    # Convert numerical strings to integers, removing commas
    net_revenues_current = int(net_revenues_current.replace(",", ""))
    net_revenues_previous = int(net_revenues_previous.replace(",", ""))
    cost_of_revenues_current = int(cost_of_revenues_current.replace(",", ""))
    cost_of_revenues_previous = int(cost_of_revenues_previous.replace(",", ""))
    gross_profit_current = int(gross_profit_current.replace(",", ""))
    gross_profit_previous = int(gross_profit_previous.replace(",", ""))

    # Append to the data list
    data.append([
        quarter_end, 
        net_revenues_current, 
        net_revenues_previous, 
        cost_of_revenues_current, 
        cost_of_revenues_previous, 
        gross_profit_current, 
        gross_profit_previous
    ])

# Define column names
columns = [
    'Quarter End', 
    'Net Revenues Current Year', 
    'Net Revenues Previous Year', 
    'Cost of Revenues Current Year', 
    'Cost of Revenues Previous Year', 
    'Gross Profit Current Year', 
    'Gross Profit Previous Year'
]

# Creating the DataFrame
df = pd.DataFrame(data, columns=columns)

# Print the DataFrame
print(df)

# Optionally, save to a CSV file
csv_file_path = 'path_to_save_csv.csv'  # Replace with your desired file path
df.to_csv(csv_file_path, index=False)