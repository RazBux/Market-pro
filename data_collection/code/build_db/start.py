import pull_table
import pandas as pd
import os
# solarEdge exsample:::

if __name__ == "__main__":
    print("hello")
    # ---------------------start--------------------
    pdf_dir = '/Users/razbuxboim/Desktop/Raz-market-app/docs/solaredge/report/'
    file_list = pull_table.get_list_of_files(pdf_dir)

    DB_NAME = "solar_edge.db"
    problem_file = []

    # Print the list of file paths
    for pdf_file in file_list:
        print(pdf_file)
        df= pull_table.take_tables_from_pdf(pdf_file,[7], True)

        # FIND a way to locate problem file
        data = pull_table.data_to_sqlite(DB_NAME, pull_table.get_valid_table_name(os.path.basename(pdf_file)), df)
        if data == None:
            pass
        elif isinstance(pd.DataFrame(), data):
            pass
        elif isinstance(str, data):
            problem_file.append(data)
        else:
            print(type(data))
            print(data)
