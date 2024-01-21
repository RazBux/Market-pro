import pandas as pd
from tabulate import tabulate
import os
import re
import PyPDF2


def get_valid_table_name(filename):
    """Change the table name to be an SQL valid table name"""
    # Replace hyphens with underscores
    formatted_name = filename.replace("-", "_")

    # Remove file extension
    base_name = os.path.splitext(formatted_name)[0]

    # Remove any characters that are not letters, numbers, underscores, or dollar signs
    valid_chars = re.sub(r"[^a-zA-Z0-9_$]", "_", base_name)

    # Ensure the name starts with a letter or underscore
    if not valid_chars[0].isalpha() and valid_chars[0] != "_":
        valid_chars = "_" + valid_chars

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
        cleaned_name = re.sub(r"[^a-zA-Z0-9_]", "_", column_name_str)
        # Remove leading underscores
        cleaned_name = cleaned_name.strip("_")
        cleaned_name = cleaned_name.lower()
        # remove the unnecessary _ form the cleaned_name
        cleaned_name = re.sub(r"_{2,}", "_", cleaned_name)
        cleaned_columns.append(cleaned_name)
    return cleaned_columns


def convert_quarter_to_float(quarter):
    """Define a custom function to convert the values of the quarter to flaot. will be like 2022.2."""
    # Remove any non-alphanumeric characters and convert to lowercase
    quarter = "".join(filter(str.isalnum, quarter)).lower()

    # Extract the year and quarter
    year = None
    if quarter[0] == "q" and quarter[1:].isdigit():
        year = int(quarter[2:])
        quarter = quarter[1]
    elif quarter[-1] == "q" and quarter[:-1].isdigit():
        year = int(quarter[:-2])
        quarter = quarter[len(quarter) - 1]
    else:
        parts = quarter.split("_")
        if len(parts) == 2:
            year_part, quarter_part = parts
            if year_part.isdigit() and (
                quarter_part.startswith("q") or quarter_part.isdigit()
            ):
                year = int(year_part)
                quarter = (
                    quarter_part.replace("q", "")
                    if quarter_part.startswith("q")
                    else quarter_part
                )

    if year is not None:
        return year + float(quarter) / 10
    else:
        return None  # Handle invalid input


def get_list_of_files(pdf_path):
    """
    this function take path and collect the pdf files from it.
    it can either take a file or folder.
    """

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

