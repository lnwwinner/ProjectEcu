from core.pid_map import PIDS
from core.obd_parser import parse_rpm, parse_speed, parse_throttle


def collect_all(conn):
    data = {}

    try:
        rpm_raw = conn.send(PIDS["rpm"])
        data["rpm"] = parse_rpm(rpm_raw)
    except:
        data["rpm"] = None

    try:
        speed_raw = conn.send(PIDS["speed"])
        data["speed"] = int(speed_raw.split()[-1], 16)
    except:
        data["speed"] = None

    try:
        throttle_raw = conn.send(PIDS["throttle"])
        data["throttle"] = parse_throttle(throttle_raw)
    except:
        data["throttle"] = None

    return data
