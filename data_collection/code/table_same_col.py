import sqlite3
import pandas as pd
from tabulate import tabulate
import data_collection.code

def find_column_differences(df1: pd.DataFrame, df2: pd.DataFrame, table_name, other_table_name):
    """A sub method for "get_same_col" that find if 2 DataFrames column are equal or not."""
    print('\n----------------------------')
    print(f"For tables, {table_name}, {other_table_name}")
    # Check if columns are equal
    if set(df1.columns) == set(df2.columns):
        print("Columns are equal :)")
        return None

    else:
        print("Columns are not equal.")
        # Find differing columns
        differing_columns = list(set(df1.columns) ^ set(df2.columns))
        table_data = []
        print("Differing columns:")
        for col in differing_columns:
            t = table_name if col in df1.columns else other_table_name
            table_data.append([col, t])
        
        # Sort the table_data list by the second column (t)
        table_data.sort(key=lambda x: x[1])
        print(tabulate(table_data, headers=["Column Name", "Table Name"], tablefmt="pretty"))
        
        # # # check for similar columns -----------> build this method.
        # # # Set a threshold for similarity (adjust as needed)
        # threshold = 90  # For example, consider names with a similarity score >= 90

        # # Find pairs of similar column names
        # similar_pairs = []
        # for name1, name2 in product(df1.values.tolist(), df2.values.tolist()):
        #     similarity_score = fuzz.token_sort_ratio(name1, name2)
        #     if similarity_score >= threshold:
        #         similar_pairs.append((name1, name2, similarity_score))

        # # Print the similar pairs and their similarity scores
        # for name1, name2, score in similar_pairs:
        #     print(f"Similar Pair: '{name1}' - '{name2}', Similarity Score: {score}")
        # # -----------------

        return differing_columns 


def get_same_col(db_path):
    # Connect to the SQLite database
    conn = sqlite3.connect(db_path)

    # Get a list of all table names in the database
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    table_names = [table[0] for table in tables]
    
    copy_of_table_names = table_names.copy()

    # Create a dictionary to store tables with the same columns
    tables_with_same_columns = {}

    # Iterate over the tables
    for table_name in table_names:
        # Read the table into a DataFrame
        df = pd.read_sql_query(f"SELECT * FROM {table_name};", conn)
        
        # Check if there are other tables with the same columns
        for other_table_name in table_names:
            if other_table_name != table_name:
                other_df = pd.read_sql_query(f"SELECT * FROM {other_table_name};", conn)
                
                # if columns are equal - it's return - None. 
                # if they are diffrent - return list of all the columns that are diffrent in both list.
                diff_column = find_column_differences(df, other_df, table_name, other_table_name)
                if set(df.columns) == set(other_df.columns):
                    if table_name not in tables_with_same_columns:
                        tables_with_same_columns[table_name] = []
                    tables_with_same_columns[table_name].append(other_table_name)
            
    same_col_group = []

    conn.close()    

    for table_name, same_columns_tables in tables_with_same_columns.items():
        lst = [table_name] + same_columns_tables
        # remove the value of table with same column - so we will leave with all the rest
        # that doesn't in the same_col_group...
        copy_of_table_names = [item for item in copy_of_table_names if item not in lst]
        same_col_group.append(set(lst))
    
    same_col_group = eliminate_duplicate_sets(same_col_group)
    
    # add all the single value as a set to the same_col_group
    for single_gro in copy_of_table_names:
        same_col_group.append({single_gro})

    print('Print all the group of all table that have same column')
    # print same_col_group
    list(map(lambda v: print(v), same_col_group))

    return same_col_group


def eliminate_duplicate_sets(same_col_group):
    unique_sets = set()

    # Iterate over the sets in same_col_group
    for s in same_col_group:
        # Convert each set to a frozenset to make it hashable
        fs = frozenset(s)

        # Add the frozenset to the unique_sets set
        unique_sets.add(fs)

    # Convert the unique sets back to regular sets
    unique_sets = [set(fs) for fs in unique_sets]

    return unique_sets


def merge_table_same_col(source_db, destination_db, groups):
    # Create a connection to your source SQLite database
    source_db_conn = sqlite3.connect(source_db)

    # Create a connection to your destination SQLite database
    dest_db_conn = sqlite3.connect(destination_db)

    # Iterate over each group of tables
    for i, group in enumerate(groups):
        group_tables = list(group)
        combined_df = pd.DataFrame()

        for table_name in group_tables:
            # Read the table data into a dataframe
            df = pd.read_sql_query(f'SELECT * FROM {table_name}', source_db_conn)
            if not len(group_tables) <= 1:
                # if there is not pairs to combin with - the "Merege table" will be him self
                combined_df = pd.concat([combined_df, df], ignore_index=True)
            else: 
                # if the group is more then 1 - combin it all togeter. 
                combined_df = df

        table_n = f'Merged_Table_{i}'  # Define a new table name
        combined_df = combined_df.drop_duplicates()
        combined_df.to_sql(table_n, dest_db_conn, if_exists="replace", index=False)

    # Close the database connections
    source_db_conn.close()
    dest_db_conn.close()


if __name__ == "__main__":    
    db = "/Users/razbuxboim/Desktop/pyPro/Tesla_finc.db"
    
    dest_db = "/Users/razbuxboim/Desktop/pyPro/T_raz.db"
    
    g = get_same_col(db)

    merge_table_same_col(db, dest_db, g)
