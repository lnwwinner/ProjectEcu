def calculate_health_score(data):
    score = 100

    rpm = data.get("rpm") or 0
    temp = data.get("coolant_temp") or 0
    throttle = data.get("throttle") or 0

    # simple rules
    if rpm > 4000:
        score -= 10
    if temp > 100:
        score -= 20
    if throttle > 80:
        score -= 5

    return max(score, 0)


def risk_level(score):
    if score > 80:
        return "LOW"
    elif score > 50:
        return "MEDIUM"
    else:
        return "HIGH"
