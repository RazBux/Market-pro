import data
import exstract_combain
import os
import code

# ---------------------start--------------------
if __name__ == "__main__":
    # Exsample of solar-edge, other companies need thier fine tuning...
    url = "https://investors.solaredge.com/financial-information/quarterly-results"

    html_content = data.write_html_content(website_url=url)

    filtered_file = data.read_html(url, html_content, ["static-files", "Supplemental Information"])
    print(filtered_file)

    old_phrase = "https://investors.solaredge.com/financial-information/quarterly-results/static-files/"
    new_phrase = "https://investors.solaredge.com/static-files/"

    filtered_file = data.manipulate_links(filtered_file, old_phrase, new_phrase)

    report_folder_path = data.download_pdf(filtered_file)

    # combain all the relevant pdf to one big file using text keyword to select only the desire ones
    output_folder = exstract_combain.exstrac_page_by_txt(report_folder_path, "P&L GAAP")

    exstract_combain.combain_all_pdf_in_folder(output_folder)

    # ---- Now when we have 1 PDF that contain all the data needed >> move to build_db modoule
