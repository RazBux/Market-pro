import sqlite3
from tabulate import tabulate
import pandas as pd
from fuzzywuzzy import fuzz
from itertools import zip_longest
import shutil
import market_pro.code 


def get_similar(conn_source: sqlite3.Connection,
                cursor_source: sqlite3.Cursor,
                list1_table_name, list2_table_name,
                list1: list, list2: list,
                threshold=85):   

    # remove names that appear in both list
    # Use set intersection to find values that appear in both lists
    common_values = set(list1) & set(list2)
   
    # Remove common values from both lists
    list1 = [value for value in list1 if value not in common_values]
    list2 = [value for value in list2 if value not in common_values]
    
    # -------- printing area -> the common and the diffrent values.    
    # print the common values
    common_values_list = [[value] for value in common_values]
    print(tabulate(common_values_list, headers=["common values".upper()], showindex="always" ,tablefmt="pretty"))

    # print all the value from each list that doesn't appear in the other list
    # Create a list of tuples pairing elements from list1 and list2
    paired_lists = list(zip_longest(list1, list2))
    print('\nDifferent column in each table >>> '.upper())
    print(tabulate(paired_lists, headers=[list1_table_name, list2_table_name], tablefmt="pretty"))
    
    # check if there is common quarter in 2 chosen tables.
    qurter_query =f'''select a.quarter
                        FROM {list1_table_name} as a, {list2_table_name} as b 
                        WHERE a.quarter = b.quarter
                        LIMIT 1;'''
    quarter_name = cursor_source.execute(qurter_query).fetchall()
    
    # start checking
    print("========")
   
    if not len(quarter_name) > 0:
        # There isn't qurter that appear in both table so the query return nothing.
        print(f"None of the quarter appear in both table: {list1_table_name}, {list2_table_name}")
        # return False, (list1_table_name)
    
    
    if len(quarter_name) > 0:
        # the quarter name returned as a [(2021.1, )] we exstract only the folut from this 
        quarter_name = float(quarter_name[0][0])
        print("Quarter >> ", quarter_name)
        
        # the follwing if else statment is for combaining table in most accurate way.
        # can add both table to be 1, and add the exstra column as null value where the other table dosent have them. 
        if len(list1) > 0 and len(list2) > 0:
            print("1: Both list have values")
            # query the lists with the column from the diff column we found. 
            query1 = f'''select {', '.join(list1)} 
                FROM {list1_table_name}
                WHERE quarter = {quarter_name}
                ;'''
            df1 = pd.read_sql_query(query1, conn_source)
            print(tabulate(df1.T, headers=[list1_table_name, quarter_name], tablefmt="pretty"))
        
            query2 = f'''select {', '.join(list2)} 
                FROM {list2_table_name}
                WHERE quarter = {quarter_name}
                ;'''
            print(query2)
            df2 = pd.read_sql_query(query2, conn_source)
            print(tabulate(df2.T, headers=[list2_table_name, quarter_name], tablefmt="pretty"))

            # add here the algo that calculat the same values and diff name
            # see if the name have good score >85 and change the colname. 
            # after - add column that haven't in both and then combain the table into 1.
            df1_dict = {}
            df1_col = df1.columns.tolist()
            df1_val = df1.values.tolist()
            df1_val = df1_val[0]

            df2_dict = {}
            df2_col = df2.columns.tolist()
            df2_val = df2.values.tolist()
            df2_val = df2_val[0]
            
            for i, v in enumerate(df1_val):
                df1_dict[v] = df1_col[i]

            for i, v in enumerate(df2_val):
                df2_dict[v] = df2_col[i]

            # print(df1_dict)
            # print(df2_dict)
            
            # check for similiar pair base on same value for diff column name. 
            similar_pairs = []
            for key, d1_col_name in df1_dict.items():
                if key in df2_dict and df2_dict.get(key) is not None:
                    similarity_score = fuzz.token_sort_ratio(d1_col_name, df2_dict[key])
                    pair = (d1_col_name, df2_dict[key], similarity_score)
                    similar_pairs.append(pair)
            
            # print the pair list only if there is something to show
            # and run the code for changing the column name. 
            if len(similar_pairs) > 0:
                pair_df = pd.DataFrame(data=similar_pairs, columns=[list1_table_name, list2_table_name, f'Similarity Score for treshold >= {threshold}'])
                pair_tab = tabulate(pair_df, headers=pair_df.columns, tablefmt="pretty")
                print(pair_tab)
            
                # change the tables name to the shorter one
                for name1, name2, score in similar_pairs:
                    # change the column name only if the treshold > 85(defult, can be changed)
                    if score >= threshold:
                        # add here code the print the names and table that have been change. 
                        if len(name1) < len(name2):
                            # Change table 2 to column name as in table 1
                            query = f"ALTER TABLE {list2_table_name} RENAME COLUMN {name2} TO {name1};"
                        else:
                            query = f"ALTER TABLE {list1_table_name} RENAME COLUMN {name1} TO {name2};"
                        result = cursor_source.execute(query)
                        conn_source.commit()
                        
                        print("query:", query)
                        print("query result:", result)
    # end if
    
    # +++ ADD +++
    # ------> need to think how going to have all the before add.
    # mean - try all the cases and only after finish add non same quarter to list.
    # if there is no order = add to mean list. 
        
        
    # now we have all the colum we can to be the same - the same
    # and this following code manage the remain columns that have diff name and values. 
    # conbained the table to new large one and write them to the dest_db
    df_1 = pd.read_sql_query(f'SELECT * FROM {list1_table_name}', conn_source)
    df_2 = pd.read_sql_query(f'SELECT * FROM {list2_table_name}', conn_source)
    
    # Merge the DataFrames on the common column "quarter"
    merged_df = pd.merge(df_1, df_2, on='quarter', how='inner')

    # Rename columns to remove '_x' or '_y' suffix
    merged_df = merged_df.rename(columns=lambda x: x.replace('_x', '').replace('_y', '') if x.endswith(('_x', '_y')) else x)

    # Drop duplicate columns (keeping the first occurrence)
    merged_df = merged_df.loc[:, ~merged_df.columns.duplicated(keep='first')]
    combined_df = pd.concat([df_1, df_2], ignore_index=True).drop_duplicates()
    
    # ==try!!
    # Drop rows in combined_df that have "quarter" values in merged_quarters
    combined_df = combined_df[~combined_df['quarter'].isin(merged_df['quarter'])]
    
    # drop before the column we will add here. to avoid diff and strange thing. 
    combined_df = pd.concat([combined_df, merged_df])
    # Identify columns with null values
    columns_with_null = combined_df.columns[combined_df.isnull().any()].tolist()

    # Create a list of column names with non-null values
    columns_without_null = [col for col in combined_df.columns if col not in columns_with_null]

    # Concatenate the two lists to create a new column order
    new_column_order = columns_without_null + columns_with_null

    # Reorder the DataFrame columns based on the new order
    combined_df = combined_df[new_column_order]
    
    combined_df = combined_df.sort_values(by='quarter', ignore_index=True)
    table_n = f'{list1_table_name}_{list2_table_name}'  # Define a new table name
    combined_write_to_sql = combined_df.to_sql(table_n, conn_source, if_exists="replace", index=False)
    print('result of write to sql =', combined_write_to_sql)
    
    
    drop_table1_query = f'DROP TABLE IF EXISTS {list1_table_name};'
    drop_table2_query = f'DROP TABLE IF EXISTS {list2_table_name};'
    result1 = cursor_source.execute(drop_table1_query)
    result2 = cursor_source.execute(drop_table2_query)
    print('Drop table result1:',result1)
    print('Drop table result2:',result2)
    
    conn_source.commit()
    
    print(f"Finish check tables: {list1_table_name}, {list2_table_name}")
    print("========")
    return table_n
    

def algo_for_col(db_source ,threshold, name="all_conbain"):
    # Connect to the SQLite database
    conn_source = sqlite3.connect(db_source)
    
    # Create a cursor object
    cursor = conn_source.cursor()
    
    # Query to get a list of table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    
    # Fetch all table names
    table_names = cursor.fetchall()
    print("All table names >>>\n", table_names)
    table_tapule_list = []    
    
    big_table_name  = table_names[0][0]
    table_to_return_to = []
    # Iterate through the tables and retrieve column names
    for i in range(len(table_names) - 1):
        j = i+1
        table2_name = table_names[j][0]
        
        print("big_table_name", big_table_name)
        print("table2_name", table2_name)

        # Execute the PRAGMA statement to get column information for the current tables
        cursor.execute(f"PRAGMA table_info({big_table_name});")
        columns1 = cursor.fetchall()
        
        cursor.execute(f"PRAGMA table_info({table2_name});")
        columns2 = cursor.fetchall()
        
        # Extract column names for both tables
        column_names1 = [column[1] for column in columns1]
        column_names2 = [column[1] for column in columns2]
        
        
        # Perform the column matching and renaming operations here based on the given threshold
        table_n1 = get_similar(conn_source, cursor, big_table_name, table2_name, column_names1, column_names2, threshold)
        big_table_name = table_n1
        
    query = f"ALTER TABLE {big_table_name} RENAME TO {name};"
    result = cursor.execute(query)

    # Close the cursor and the connection
    cursor.close()
    conn_source.close()


if __name__ == '__main__':
    db_source = '/Users/razbuxboim/Desktop/pyPro/T_raz.db'
    
    db_work = shutil.copy2(db_source, db_source.replace('.db', '_copy.db'))
    algo_for_col(db_source=db_work, threshold=85, name="tesla")
    
