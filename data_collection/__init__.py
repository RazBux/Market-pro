import sys
import datetime
import os


class LoggerAndPrint:
    def __init__(self, logfile):
        self.terminal = sys.stdout
        self.logfile = open(logfile, "a")

    def write(self, message):
        # # This will add the current time stemp into the print.
        # timestamp = datetime.datetime.now().strftime('%Y-%m-%d_%H:%M:%S')
        # log_message = f"{timestamp}: {message}"
        self.terminal.write(message)
        self.logfile.write(message)


# Create a directory for logs if it doesn't exist
log_folder = "logs"
if not os.path.exists(log_folder):
    os.makedirs(log_folder)

# Get the current date in the format "y-m-d"
current_date = datetime.datetime.now().strftime("%Y-%m-%d")

# Create a subfolder with the current date
log_subfolder = os.path.join(log_folder, current_date)
if not os.path.exists(log_subfolder):
    os.makedirs(log_subfolder)

current_datetime = datetime.datetime.now()
log_filename = f"{current_datetime.strftime('%Y-%m-%d_%H:%M:%S')}_market_pro.log"
log_path = os.path.join(log_subfolder, log_filename)

# Redirect stdout to the custom LoggerAndPrint class with the log file
sys.stdout = LoggerAndPrint(log_path)