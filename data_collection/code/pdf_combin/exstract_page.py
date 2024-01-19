import os
import PyPDF2

def combain_all_pdf_in_folder(input_folder, output_pdf):
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
                pdf_reader = PyPDF2.PdfFileReader(pdf_file)
                
                # Add all pages from the input PDF to the output PDF
                for page_number in range(pdf_reader.getNumPages()):
                    page = pdf_reader.getPage(page_number)
                    pdf_writer.addPage(page)

    # Write the combined PDF to the output file
    with open(output_pdf, "wb") as output_file:
        pdf_writer.write(output_file)

    print(f"All PDFs in {input_folder} combined into {output_pdf}.")

def exstrac_page_by_txt(input_folder, output_folder, txt: str):
    # Input folder containing PDF files
    input_folder = "/Users/razbuxboim/Desktop/Raz-market-app/data_collection/docs/enphase/report"

    # Output folder for the extracted pages
    output_folder = "/Users/razbuxboim/Desktop/Raz-market-app/data_collection/docs/enphase/new"

    # Array of page numbers to extract (1-based index)
    # page_numbers = [4, 4, 4, 5, 4,5,4, 4,5,5,4,6,4,5,6,5,6,6,2,5]  # Customize this array as needed

    # Ensure the output folder exists, create it if necessary
    os.makedirs(output_folder, exist_ok=True)

    # Iterate through each PDF file in the input folder
    for filename in os.listdir(input_folder):
        if filename.endswith(".pdf"):
            input_pdf = os.path.join(input_folder, filename)
            
            # Open the input PDF file
            with open(input_pdf, "rb") as pdf_file:
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                
                # Flag to track if the target text is found in the document
                target_text_found = False
                
                # Iterate through each page in the PDF
                for page_number in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_number]
                    page_text = page.extract_text()
                    
                    # Check if the target text is found on the page
                    if "CONDENSED CONSOLIDATED STATEMENTS OF OPERATION" in page_text:
                        target_text_found = True
                        
                        # Create a new PDF writer object for this file
                        pdf_writer = PyPDF2.PdfWriter()
                        pdf_writer.add_page(page)
                        
                        # Create the output PDF file name
                        output_pdf = os.path.join(output_folder, filename)
                        
                        # Write the new PDF to the output file
                        with open(output_pdf, "wb") as output_file:
                            pdf_writer.write(output_file)
                        
                        print(f"Target text found in {input_pdf}. Page extracted and saved to {output_pdf}")
                        break  # Stop searching after finding the target text
                
                if not target_text_found:
                    print(f"Target text not found in {input_pdf}. Skipping.")
                    
                    
if __name__ == '__main__':
    input_folder = '/Users/razbuxboim/Desktop/Raz-market-app/data_collection/docs/enphase/new'
    pdf_path = '/Users/razbuxboim/Desktop/Raz-market-app/data_collection/docs/enphase/new_pdf.pdf'
    combain_all_pdf_in_folder(input_folder, pdf_path)