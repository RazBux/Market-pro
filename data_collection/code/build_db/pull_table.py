import tabula
import sqlite3
import pandas as pd
from tabulate import tabulate
import pdfplumber
import os
import re
import PyPDF2
# import data_collection.code
from utils import util

# see if u want to use it...
def table_filteraztion(table):
    """
    Function that get table and filter it
    where there is Nan value - change to None
    and where there is empty row - remove them.
    """
    # Filter out both empty rows and empty columns
    filtered_table = []

    for row in table:
        # Process and filter each row
        filtered_row = []
        for cell in row:
            if isinstance(cell, str) and not cell.strip():
                # Replace empty strings with None
                filtered_row.append(None)
            else:
                # Keep the cell as is
                filtered_row.append(cell)

        # Check if the row is not entirely None
        if any(cell is not None for cell in filtered_row):
            filtered_table.append(filtered_row)

    # Transpose the filtered table to filter out empty columns
    transposed_table = list(map(list, zip(*filtered_table)))
    filtered_columns = []

    for column in transposed_table:
        if column is not None and any(
            cell.strip() for cell in column if cell is not None
        ):
            filtered_columns.append(column)
            # check

    # Transpose the columns back to rows to get the final filtered table
    final_filtered_table = list(map(list, zip(*filtered_columns)))
    return final_filtered_table


def extract_table_tabula(pdf_file, pages):
    # Read the PDF and extract tables
    tables = tabula.read_pdf(pdf_file, pages=pages, multiple_tables=True)
    df_list = []
    for i, table in enumerate(tables):
        if table.empty:
            print(f"Empty table found in {pdf_file} on page {pages[i]}")
        else:
            df_list.append(table)
    print("Number of talbes: ", len(df_list))
    return df_list

def take_tables_from_pdf(pdf_file, pages_to_look):
    """
    This function called from a loop function that iterate over all the pdf files
    and take all the tables from a file and range of pages and return a dataframe
    """
    # tables = tabula.read_pdf(pdf_file, pages=pages_to_look)

    # pdf data collecting with pdfplumber.
    df_tables = []
    # Open the PDF file using pdfplumber
    with pdfplumber.open(pdf_file) as pdf:
        # Iterate through the specified pages
        for page_number in pages_to_look:
            # ///PdfPlumber///
            # Extract the table on the current page

            page = pdf.pages[page_number - 1]  # Page numbering is 1-based
            table = page.extract_table()

            check_table_df = pd.DataFrame(table)
            if check_table_df.empty:
                print(f'''in file: {pdf_file} pdfplumber have issue to collect
                      that data and the table is 'empty' in page {page}, or somthing went wrong.''')

            df_tables.append(table)
            print(table)

    print("Number of table collected:", len(df_tables))
    if not len(df_tables) > 0:
        print("PROBLEM IN >>>> ", pdf_file)
        return pdf_file

    # list of pd.DataFrames
    df_list = []

    # covert the table to data frame
    for i, table in enumerate(df_tables):
        print(i)
        print("len", len(table))
        print("type", type(table))
       
        # df = pd.DataFrame(table)
        # df = df.dropna(how="all")  # Remove rows with all NaN values
        # df = df.reset_index(drop=True)
        # df_list.append(df)
    
    
    for df in df_list:
        if df.empty:
            print(f"Empty table in pdf file >>> {pdf_file}")
            return pdf_file
    print("------------------------")
    print("--DataFrame DIAGNOSTIC--")
    print("list size: ", len(df_list))
    print("df_list type:", type(df_list))
    print("df_list[0] type:", type(df_list[0]))
    print("------------------------")

    return df_list


def data_to_sqlite(
    db_name, table_name, df_list: pd.DataFrame, values_to_drop=["QoQ", "YoY", " ", "", "$"]
):
    # Create a SQLite database connection
    conn = sqlite3.connect(db_name)

    for i, df in enumerate(df_list):
        df = df.T
        # Create a new DataFrame with rows that don't contain the values to drop
        first_column = df.iloc[:, 0]
        # values_to_drop = //optional value - if pass in the method - that what the method will use.
        new_df = df[~first_column.isin(values_to_drop)]

        # create new DF to have good columns for table
        columns = util.clean_valid_column_names(new_df.iloc[0].tolist())

        # convert the first column to be name "quarter"

        new_col_name = "quarter"
        columns[0] = new_col_name

        data = new_df.iloc[1:]
        data_dict = {col: values for col, values in zip(columns, zip(*data.values))}
        data_dict = pd.DataFrame(data_dict)
        #### need to add here check that the resolt are really a good ones before sending to "convert_quarter_to_float"
        # data_dict[new_col_name] = data_dict[new_col_name].apply(util.convert_quarter_to_float)
        
        # data_dict.to_sql(table_name+(str)(i), conn, if_exists="replace", index=False)
        try:
            # Attempt to write the DataFrame to the SQLite database
            data_dict.to_sql(table_name + str(i), conn, if_exists="replace", index=False)
            print(f"Table {table_name}{i} successfully written to the database.")
        except Exception as e:
            print(f"Error writing table {table_name}{i} to the database: {str(e)}")
            continue  # Continue to the next table if an error occurs

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

    # Take the files we going to work on and print them in table
    file_list = util.get_list_of_files(filtered_file_path)
    if file_list is None:
        print("There is no files in this path...")
        return

    # Print the list of file paths
    print(
        tabulate(
            [[file] for file in file_list],
            headers=["File List To Scann"],
            tablefmt="pretty",
        )
    )

    # Analyze the pdf's and collect their tables
    for pdf_file in file_list:
        print("Start file >>> ", pdf_file)

        if take_all_pages:
            # scan all the pdf pages in the file 
            pages = list(range(1, util.get_number_pages(pdf_file)))
        print("will take pages:\n", pages)
        
        # --------------------------------------------
        # --- Using Tabula
        df_list = extract_table_tabula(pdf_file, pages)
        
        # --- Using PdfPlumber
        # df_list = take_tables_from_pdf(pdf_file, pages)
        # --------------------------------------------

        # if df_list isnt dataframe it wont be sent to "data_to_sqlite"
        if isinstance(df_list, str):
            # if the return type is srt -> this mean there is somthing wrong
            # in activation of method: "take_table_from_pdf"
            # and the file name returned. so we add it to the problem_file.
            bad_file = df_list
            problem_file.append(bad_file)
        else:
            # if the put_data return False there is prablom with the file.
            
            data_to_sqlite(
                db_name, util.get_valid_table_name(os.path.basename(pdf_file)), df_list
            )
            

    # --see how to take the problem file...
    # Print all the problem files
    print(
        tabulate(
            [[file] for file in problem_file],
            headers=["Problem File"],
            tablefmt="pretty",
        )
    )
    print("END")


if __name__ == "__main__":
    print(os.getcwd())
    
    pdf_path = "/Users/razbuxboim/Desktop/Raz-market-app/data_collection/docs/pdf_work/SE_new.pdf"

    db_name = "/Users/razbuxboim/Desktop/Raz-market-app/data_collection/docs/pdf_work/SE_1.db"

    # # corect the take_all_pages - it isn't work right now...
    active_pull_table(pdf_path, db_name, take_all_pages=True, pages=[1])
    