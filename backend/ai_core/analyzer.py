import random
import time
import json

def simulate_live_ecu_data():
    """
    Placeholder function to simulate receiving live ECU data.
    In a real scenario, this would read from a CAN bus interface (e.g., OBD-II).
    Returns a JSON string containing RPM, temperature, boost pressure, AFR, and engine load.
    """
    data = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "rpm": random.randint(800, 6800),
        "temperature": random.randint(80, 110),
        "boostPressure": round(random.uniform(0.5, 2.0), 2),
        "afr": round(random.uniform(12.0, 15.0), 1),
        "load": random.randint(10, 100)
    }
    return json.dumps(data)

if __name__ == "__main__":
    # Example usage
    for _ in range(5):
        print(simulate_live_ecu_data())
        time.sleep(1)
