import tabula
import PyPDF2
import camelot
import pull_table
import data_collection.code
import pandas as pd

# work!!
def extract_table_tabula(pdf_file, pages):
    # Read the PDF and extract tables
    tables = tabula.read_pdf(pdf_file, pages=pages, multiple_tables=True)
    for i, table in enumerate(tables):
        if table.empty:
            print(f"Empty table found in {pdf_file} on page {pages[i]}")
        else:
            df = pd.DataFrame(table)
            print(df)
            
            # Process your table
            pass


def extract_text_pypdf2(pdf_file, pages):
    with open(pdf_file, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        for page_number in pages:
            page = reader.pages[page_number - 1]
            text = page.extract_text()
            # You might need additional processing here to isolate tables
            # This method is more manual and requires parsing the text
            print(text)


def extract_table_camelot(pdf_file, pages):
    # Extract tables using Lattice mode (good for tables with lines)
    tables = camelot.read_pdf(pdf_file, pages=','.join(map(str, pages)), flavor='lattice')
    
    # For tables without clear lines, you can try stream mode
    # tables = camelot.read_pdf(pdf_file, pages=','.join(map(str, pages)), flavor='stream')
    
    for table in tables:
        if table.df.empty:
            print(f"Empty table found in {pdf_file}")
        else:
            print(table)
            # Process your table
            pass

if __name__ == '__main__':
    
    pdf_path = "/Users/razbuxboim/Desktop/Raz-market-app/data_collection/docs/pdf_work/Enphse_new.pdf"
    
    num_p = pull_table.get_number_pages(pdf_path)
    # num_p = 1
    array = [i for i in range(1, num_p + 1)]
    extract_table_tabula(pdf_path, array)