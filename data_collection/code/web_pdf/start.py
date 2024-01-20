import os

# import build_db.pull_table as pull_table
import pandas as pd
import data

if __name__ == "__main__":
    # exsample of solar-edge
    url = "https://investors.solaredge.com/financial-information/quarterly-results"

    # html_web_content = data.write_html_content(website_url=url);

    html_content = "/Users/razbuxboim/Desktop/Raz-market-app/docs/solaredge/solaredge_HtmlToText.txt"

    filtered_file = data.read_html(
        url, html_content, ["static-files", "Supplemental Information"]
    )
    print(filtered_file)

    old_phrase = "https://investors.solaredge.com/financial-information/quarterly-results/static-files/"
    new_phrase = "https://investors.solaredge.com/static-files/"
    
    filtered_file = data.manipulate_links(filtered_file, old_phrase, new_phrase)

    data.download_pdf(filtered_file)

    # ---------------------start--------------------
    # Define the PDF file path
    # pdf_dir = "/Users/razbuxboim/Desktop/pyPro/docs/tesla/repo_4/"
    # pdf_dir = '/Users/razbuxboim/Desktop/pyPro/docs/enphase/report/'
    # file_list = pull_table.get_list_of_files(pdf_dir)

    # DB_NAME = "enpahse_energy.db"
    # problem_file = []

    # # Print the list of file paths
    # for pdf_file in file_list:
    #     print(pdf_file)
    #     df= pull_table.take_tables_from_pdf(pdf_file,['1'], True)

    #     # FIND a way to locate problem file
    #     data = pull_table.data_to_sqlite(DB_NAME, pull_table.get_valid_table_name(os.path.basename(pdf_file)), df)
    #     if data == None:
    #         pass
    #     elif isinstance(pd.DataFrame(), data):
    #         pass
    #     elif isinstance(str, data):
    #         problem_file.append(data)
    #     else:
    #         print(type(data))
    #         print(data)
