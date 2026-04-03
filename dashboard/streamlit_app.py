import streamlit as st
import requests
import time

st.set_page_config(page_title="AI Vehicle Dashboard", layout="wide")

st.title("🚗 AI Vehicle Real-Time Monitor")

rpm_chart = st.line_chart([])
speed_chart = st.line_chart([])

col1, col2 = st.columns(2)

rpm_metric = col1.empty()
speed_metric = col2.empty()

API_URL = "http://127.0.0.1:8000/data"

while True:
    try:
        res = requests.get(API_URL).json()

        rpm = res.get("rpm", 0)
        speed = res.get("speed", 0)

        rpm_chart.add_rows([rpm])
        speed_chart.add_rows([speed])

        rpm_metric.metric("RPM", rpm)
        speed_metric.metric("Speed", speed)

    except Exception as e:
        st.warning("Waiting for data...")

    time.sleep(1)
