import tabula
import sqlite3
import pandas as pd
from tabulate import tabulate
import pdfplumber
import os
import re 
import PyPDF2
# import data_collection.code

def get_valid_table_name(filename):
    # Replace hyphens with underscores
    formatted_name = filename.replace('-', '_')
    
    # Remove file extension
    base_name = os.path.splitext(formatted_name)[0]
    
    # Remove any characters that are not letters, numbers, underscores, or dollar signs
    valid_chars = re.sub(r'[^a-zA-Z0-9_$]', '_', base_name)
    
    # Ensure the name starts with a letter or underscore
    if not valid_chars[0].isalpha() and valid_chars[0] != '_':
        valid_chars = '_' + valid_chars

    # Convert the name to lowercase (optional)
    valid_name = valid_chars.lower()
    
    return valid_name


def clean_valid_column_names(column_list):
    """will remove unnecessary character of non-alphanumeric from the column name.
    So we can have valid & clean column name"""
    cleaned_columns = []
    for column_name in column_list:
        column_name_str = str(column_name)
        # Remove non-alphanumeric characters and spaces
        cleaned_name = re.sub(r'[^a-zA-Z0-9_]', '_', column_name_str)
        # Remove leading underscores
        cleaned_name = cleaned_name.strip('_')
        cleaned_name = cleaned_name.lower()
        # remove the unnecessary _ form the cleaned_name
        cleaned_name = re.sub(r'_{2,}', '_', cleaned_name)        
        cleaned_columns.append(cleaned_name)
    return cleaned_columns


def convert_quarter_to_float(quarter):
    '''Define a custom function to convert the values of the quarter to flaot. will be like 2022.2.'''
    # Remove any non-alphanumeric characters and convert to lowercase
    quarter = ''.join(filter(str.isalnum, quarter)).lower()

    # Extract the year and quarter
    year = None
    if quarter[0] == 'q' and quarter[1:].isdigit():
        year = int(quarter[2:])
        quarter = quarter[1]
    elif quarter[-1] == 'q' and quarter[:-1].isdigit():
        year = int(quarter[:-2])
        quarter = quarter[len(quarter) -1]
    else:
        parts = quarter.split('_')
        if len(parts) == 2:
            year_part, quarter_part = parts
            if year_part.isdigit() and (quarter_part.startswith('q') or quarter_part.isdigit()):
                year = int(year_part)
                quarter = quarter_part.replace('q', '') if quarter_part.startswith('q') else quarter_part

    if year is not None:
        return year + float(quarter) / 10
    else:
        return None  # Handle invalid input
    

def take_tables_from_pdf(pdf_file, pages_to_look, one_table : bool):
    """This function take all the tables from a file and range of pages and return a dataframe"""
    # tables = tabula.read_pdf(pdf_file, pages=pages_to_look)
    
    # pdf data collecting with pdfplumber.
    df_tables = []
    # Open the PDF file using pdfplumber
    with pdfplumber.open(pdf_file) as pdf:
        # Iterate through the specified pages
        for page_number in pages_to_look:
            # Extract the table on the current page
            page = pdf.pages[page_number - 1]  # Page numbering is 1-based
            table = page.extract_table()
            # if table is None:
            #     print(f"None table in pdf file >>> {pdf_file}")
            #     return pdf_file
                
            check_table_df = pd.DataFrame(table)
            if check_table_df.empty:
                print(f"in file: {pdf_file} table is 'empty' in page {page}, or somthing went wrong.")
                continue
            # ----check here how to return problem file in case there is anything that when wrong. 
            # right now there is the continue statment that move to the next page. 
                # return pdf_file
            
            
            # Filter out both empty rows and empty columns
            filtered_table = []
    
            for row in table:
                if any(cell.strip() for cell in row):  # Check if any cell in the row is not empty
                    filtered_row = [cell if cell.strip() else None for cell in row]  # Replace empty cells with None
                    filtered_table.append(filtered_row)

            # Transpose the filtered table to filter out empty columns
            transposed_table = list(map(list, zip(*filtered_table)))
            filtered_columns = []
            
            print(transposed_table)
            
            for column in transposed_table:
                if column is not None and any(cell.strip() for cell in column if cell is not None):
                    filtered_columns.append(column)

            # Transpose the columns back to rows to get the final filtered table
            final_filtered_table = list(map(list, zip(*filtered_columns)))

            # Now, final_filtered_table contains the table with empty rows and columns removed
            # for row in final_filtered_table:
            #     print(row)
            df_tables.append(final_filtered_table)
            
            
            
    print("Number of table collected:", len(df_tables))
    if not len(df_tables) > 0: 
        print("PROBLEM IN >>>> ", pdf_file)
        return pdf_file
    
    # list of pd.DataFrames
    df_list = []

    # maybe this is wrong... it was created to tablua-py, may now not be needed...
    if one_table:
        # take only the fisrt table from each page
        for df in df_tables:
            df = pd.DataFrame(df)
            df = df.dropna(how='all')  # Remove rows with all NaN values
            df = df.reset_index(drop=True)
            df_list.append(df)
    else:
        pass 
        # check this else statment... 
        # Take all the tables
        for df in df_tables:
            if isinstance(df, pd.DataFrame):
                df = df.dropna(how='all')  # Remove rows with all NaN values
                df = df.reset_index(drop=True)
                df_list.append(df)
            else:
                print("Table is not a DataFrame:", type(df))
    
    for df in df_list:
        if df.empty:
            print(f"Empty table in pdf file >>> {pdf_file}")
            return pdf_file
    print('------------------------')
    print("--DataFrame DIAGNOSTIC--")
    print('list size: ', len(df_list))
    print('df_list type:', type(df_list))
    print('df_list[0] type:', type(df_list[0]))
    print('------------------------')
    
    return df_list


def data_to_sqlite(db_name, table_name, df_list: pd.DataFrame, values_to_drop=['QoQ', 'YoY']):
    # Create a SQLite database connection
    conn = sqlite3.connect(db_name)

    for df in df_list:
        df = df.T
        print("df type", type(df))
        # Create a new DataFrame with rows that don't contain the values to drop
        first_column = df.iloc[:, 0]
        # values_to_drop = //optional value - if pass in the method - that what the method will use.
        new_df = df[~first_column.isin(values_to_drop)]
        
        # create new DF to have good columns for table
        columns = clean_valid_column_names(new_df.iloc[0].tolist())

        # convert the first column to be name "quarter" 
        new_col_name = "quarter"
        columns[0] = new_col_name
        
        data = new_df.iloc[1:]
        data_dict = {col: values for col, values in zip(columns, zip(*data.values))}
        data_dict = pd.DataFrame(data_dict)
        
        data_dict[new_col_name] = data_dict[new_col_name].apply(convert_quarter_to_float)
        
        data_dict.to_sql(table_name, conn, if_exists="replace", index=False)

        conn.commit()
    
    conn.commit()
    conn.close()


def active_pull_table(filtered_file_path, db_name, take_all_pages: bool, pages=[1]):
    """
    This function take 1 or more files of PDF, collect all their table
    and write them in sqlite
    ->pages if optional,
        will take all if "take-all-pages" is True
        when False - we the range can be chosen.
        by default the table from page number 1.
    """
   
    problem_file = []

    file_list = get_list_of_files(filtered_file_path)
    if file_list is None:
        return
    
    # print the file that going to be scanned 
    print(tabulate([[file] for file in file_list], headers=["File List To Scann"], tablefmt="pretty"))

    # Print the list of file paths
    for pdf_file in file_list:
        print("Start file >>> ", pdf_file)
        
        if take_all_pages:
            # when we want to scann the hole pdf pages
            pages = list(range(1,get_number_pages(pdf_file)))
            print("will take pages:\n",pages)
            df_list = take_tables_from_pdf(pdf_file, pages, one_table=False)
        else:
            # take range or single
            df_list = take_tables_from_pdf(pdf_file, pages, one_table=True)
                
        # if df_list isnt dataframe it wont be sent to "data_to_sqlite"
        if isinstance(df_list, str):
            # if the return type is srt -> this mean there is somthing wrong 
            # in activation of method: "take_table_from_pdf"
            # and the file name returned. so we add it to the problem_file.
            bad_file = df_list
            problem_file.append(bad_file) 
        else:
            # if the put_data return False there is prablom with the file. 
            data_to_sqlite(db_name, get_valid_table_name(os.path.basename(pdf_file)), df_list)
         
    # --see how to take the problem file...  
    # Print all the problem files
    print(tabulate([[file] for file in problem_file], headers=["Problem File"], tablefmt="pretty"))
    print("END")
  
  
def get_list_of_files(pdf_path):
    '''
        this function take path and collect the pdf files from it. 
    '''
    
    file_list = []

    # Iterate over all files in the folder
    if os.path.isdir(pdf_path):
        for file in os.listdir(pdf_path):
            dir_name = os.path.dirname(pdf_path)
            # Check if the item is a file (not a subdirectory)
            pdf_file = os.path.join(dir_name, file)
            if os.path.isfile(pdf_file):
                file_list.append(pdf_file)
    elif os.path.isfile(pdf_path):
        file_list.append(pdf_path)
    else:
        file_list = None 
    
    return file_list


def get_number_pages(pdf_file):
    # Open the PDF file in read-binary mode
    with open(pdf_file, "rb") as pdf_file_obj:
        pdf_reader = PyPDF2.PdfReader(pdf_file_obj)
        
        # Get the number of pages in the PDF file
        num_pages = len(pdf_reader.pages)
        return num_pages
    
      

if __name__ == '__main__':
    # pdf_path = "/Users/razbuxboim/Desktop/pyPro/docs/enphase/repo/"
    
    pdf_path = "/Users/razbuxboim/Desktop/Raz-market-app/data_collection/docs/enphase/new/"
    db_name = "/Users/razbuxboim/Desktop/Raz-market-app/data_collection/docs/db/enphase.db"

    # corect the take_all_pages - it isn't work right now...
    active_pull_table(pdf_path, db_name, take_all_pages=True, pages=[1])
