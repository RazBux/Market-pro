import os
import PyPDF2

# Input folder containing PDF files
input_folder = "/Users/razbuxboim/Desktop/Raz-market-app/data_collection/docs/enphase/new"

# Output PDF file name
output_pdf = "/Users/razbuxboim/Desktop/Raz-market-app/data_collection/docs/enphase/combined.pdf"

# Ensure the output folder exists, create it if necessary
os.makedirs(os.path.dirname(output_pdf), exist_ok=True)

# Create a PDF writer object for the output file
pdf_writer = PyPDF2.PdfWriter()

# Iterate through each PDF file in the input folder
for filename in os.listdir(input_folder):
    if filename.endswith(".pdf"):
        input_pdf = os.path.join(input_folder, filename)
        
        # Open the input PDF file
        with open(input_pdf, "rb") as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            # Add all pages from the input PDF to the output PDF
            for page in pdf_reader.pages:
                pdf_writer.add_page(page)

# Write the combined PDF to the output file
with open(output_pdf, "wb") as output_file:
    pdf_writer.write(output_file)

print(f"All PDFs in {input_folder} combined into {output_pdf}.")
