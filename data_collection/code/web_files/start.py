import os
import pull_table
import pandas as pd
# website = "https://ir.netflix.net/financials/quarterly-earnings/"
# website = "https://investor.enphase.com/"
# website = "https://ir.tesla.com/#quarterly-disclosure"
# # html_path = data.write_page_html(website)
# html_path = "/Users/razbuxboim/Desktop/pyPro/docs/tesla/tesla_HtmlToText.txt"
# # print("path to html >>> ",html_path)

# # filter_keywords = ["gcs-web", "static-files", "Financial results"] # enpahse
# # filter_keywords = ["IR", "Q1", "Q2", "Q3", "Q4", "TSLA_Update_Letter"] # tesla

# # pdf_urls = data.readHtml(website,html_path,filter_keywords)

# # data.downloadPDF("/Users/razbuxboim/Desktop/pyPro/docs/tesla/filtered_links.txt")


if __name__ == '__main__':
    # ---------------------start--------------------
    # Define the PDF file path
    # pdf_dir = "/Users/razbuxboim/Desktop/pyPro/docs/tesla/repo_4/"
    pdf_dir = '/Users/razbuxboim/Desktop/pyPro/docs/enphase/report/'
    file_list = pull_table.get_list_of_files(pdf_dir)
    
    DB_NAME = "enpahse_energy.db"
    problem_file = []

    # Print the list of file paths
    for pdf_file in file_list:
        print(pdf_file)
        df= pull_table.take_tables_from_pdf(pdf_file,['1'], True)
        
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
