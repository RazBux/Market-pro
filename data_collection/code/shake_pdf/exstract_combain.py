import os
import PyPDF2

def combain_all_pdf_in_folder(input_folder, site_name = ''):
    # Split the path into directory and filename
    dir_path, filename = os.path.split(input_folder)
    if site_name == '':
        site_name = ('new_combain.pdf')
    else:
        site_name = 'new_'+ site_name + '.pdf' 
    # Combine the directory path with the new filename
    output_pdf = os.path.join(dir_path, site_name)
    
    # Ensure the output folder exists, create it if necessary
    os.makedirs(os.path.dirname(output_pdf), exist_ok=True)

    # Create a PDF writer object for the output file
    pdf_writer = PyPDF2.PdfWriter()

    # Iterate through each PDF file in the input folder
    for filename in os.listdir(input_folder):
        if filename.endswith(".pdf"):
            input_pdf = os.path.join(input_folder, filename)
                        
            # Skip if the file is empty
            if os.path.getsize(input_pdf) == 0:
                print(f"Skipping empty file: {filename}")
                continue
            
            # Open the input PDF file
            with open(input_pdf, "rb") as pdf_file:
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                
                # Add all pages from the input PDF to the output PDF
                for page_number in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_number]
                    pdf_writer.add_page(page)  # Updated method

    # Write the combined PDF to the output file
    with open(output_pdf, "wb") as output_file:
        pdf_writer.write(output_file)

    print(f"All PDFs in {input_folder} combined into {output_pdf}.")
    return output_pdf

def exstrac_page_by_txt(input_folder, txt: str):
    # Split the path into directory and filename
    dir_path, filename = os.path.split(input_folder)

    # Modify the filename
    new_filename = filename + '_new'

    # Combine the directory path with the new filename
    output_folder = os.path.join(dir_path, new_filename)
    
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
                    if txt in page_text:
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
    
    return output_folder
        
if __name__ == '__main__':
    # Input folder containing PDF files
    input_folder = "/Users/razbuxboim/Desktop/Raz-market-app/docs/solaredge/report"

    # Output folder for the extracted pages
    output_folder = "/Users/razbuxboim/Desktop/Raz-market-app/docs/solaredge/new_repo/"
    
    # exstrac_page_by_txt(input_folder, output_folder, 'P&L GAAP')
    
    pdf_path = os.path.join(output_folder,"SE_new.pdf")
    combain_all_pdf_in_folder(output_folder, pdf_path)