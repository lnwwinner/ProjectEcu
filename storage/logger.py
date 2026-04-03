import csv
import os
from datetime import datetime

FILE_PATH = "data_log.csv"


def init_logger():
    if not os.path.exists(FILE_PATH):
        with open(FILE_PATH, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                "timestamp",
                "rpm",
                "speed",
                "throttle",
                "engine_load",
                "coolant_temp",
                "intake_temp"
            ])


def log_data(data: dict):
    with open(FILE_PATH, "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            datetime.now().isoformat(),
            data.get("rpm"),
            data.get("speed"),
            data.get("throttle"),
            data.get("engine_load"),
            data.get("coolant_temp"),
            data.get("intake_temp")
        ])
