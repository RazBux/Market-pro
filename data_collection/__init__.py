import sys
import datetime
import os

# USE "import code" for logging the print statment for debaging and othere uses.
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

    def flush(self):
        # If flushing is not needed, you can simply pass
        pass
# change the dir for the same as the __init__ file
# Create a directory for logs if it doesn't exist
# log_folder = "logs"

# Get the directory of the current file (__init__.py)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Create a path for the logs directory within the current directory
log_folder = os.path.join(current_dir, "logs")

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
