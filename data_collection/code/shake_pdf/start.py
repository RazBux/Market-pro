import data
import exstract_combain
import os
import code


def go(file_path):
    # Path to your file
    with open(file_path, 'r') as file:
        data = file.read()

    # Remove commas, square brackets, and single quotes
    data = data.replace(',', '').replace('[', '').replace(']', '').replace("'", '')

    # Split the data into separate lines (URLs)
    urls = data.split()

    # Print each URL
    for url in urls:
        print(url)
    
    # Write each URL to the output file
    with open(file_path, 'w') as file:
        for url in urls:
            file.write(url + '\n')


# ---------------------start--------------------
if __name__ == "__main__":
    # Exsample of solar-edge, other companies need thier fine tuning...
    url = "https://investors.solaredge.com/financial-information/quarterly-results"

    url = 'https://ir.monday.com/financials-and-filings/quarterly-results/default.aspx'
    # html_content = data.write_html_content(website_url=url)

    # filtered_file = data.read_html(url, html_content, ["static-files", "Supplemental Information"])
    # print(filtered_file)

    # old_phrase = "https://investors.solaredge.com/financial-information/quarterly-results/static-files/"
    # new_phrase = "https://investors.solaredge.com/static-files/"

    # filtered_file = data.manipulate_links(filtered_file, old_phrase, new_phrase)

    output_file_path = '/Users/razbuxboim/Desktop/Raz-market-app/docs/monday/new_link.txt'
    report_folder_path = data.download_pdf(output_file_path)

    # # combain all the relevant pdf to one big file using text keyword to select only the desire ones
    # output_folder = exstract_combain.exstrac_page_by_txt(report_folder_path, "P&L GAAP")

    # exstract_combain.combain_all_pdf_in_folder(output_folder)

    # ---- Now when we have 1 PDF that contain all the data needed >> move to build_db modoule

    
    # file = "/Users/razbuxboim/Desktop/Raz-market-app/docs/monday/links.txt"
    # go(file)