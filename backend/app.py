import joblib
import pandas as pd
import numpy as np
import requests
from datetime import datetime, timedelta
import os

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AquaEarth Weekly Water Shortage Forecast API")

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load artifacts
MODEL_PATH = "models/water_week_xgb_model.pkl"
LE_PATH = "models/week_label_encoder.pkl"

if os.path.exists(MODEL_PATH) and os.path.exists(LE_PATH):
    model = joblib.load(MODEL_PATH)
    le = joblib.load(LE_PATH)
    print("✅ Model & Label Encoder loaded")
else:
    model = None
    le = None
    print("⚠️ Model or Label Encoder not found. Please run train_model.py first.")

LOCALITY_INFO = {
    "Whitefield": {"lat":12.9698, "lon":77.7500, "population_density_score":9, "construction_index":9, "tanker_cost_index":9},
    "Mahadevapura": {"lat":12.9916, "lon":77.6959, "population_density_score":9, "construction_index":8, "tanker_cost_index":9},
    "Marathahalli": {"lat":12.9563, "lon":77.7010, "population_density_score":9, "construction_index":8, "tanker_cost_index":9},
    "Bellandur": {"lat":12.9304, "lon":77.6784, "population_density_score":9, "construction_index":8, "tanker_cost_index":9},
    "Electronic City": {"lat":12.8399, "lon":77.6770, "population_density_score":8, "construction_index":8, "tanker_cost_index":8},
    "Koramangala": {"lat":12.9352, "lon":77.6245, "population_density_score":8, "construction_index":6, "tanker_cost_index":8},
    "BTM layout": {"lat":12.9166, "lon":77.6101, "population_density_score":8, "construction_index":6, "tanker_cost_index":7},
    "Jayanagar": {"lat":12.9250, "lon":77.5938, "population_density_score":7, "construction_index":3, "tanker_cost_index":6},
    "Rajajinagar": {"lat":12.9912, "lon":77.5554, "population_density_score":7, "construction_index":4, "tanker_cost_index":6},
    "Hebbal": {"lat":13.0358, "lon":77.5970, "population_density_score":7, "construction_index":5, "tanker_cost_index":7},
    "Banashankari": {"lat":12.9300, "lon":77.5600, "population_density_score":7, "construction_index":4, "tanker_cost_index":6},
    "Banashankari 3rd stage": {"lat":12.9160, "lon":77.5450, "population_density_score":7, "construction_index":5, "tanker_cost_index":6},
    "Basaveshwaranagar": {"lat":12.9910, "lon":77.5400, "population_density_score":7, "construction_index":4, "tanker_cost_index":6},
    "Kalyan Nagar": {"lat":13.0180, "lon":77.6400, "population_density_score":7, "construction_index":6, "tanker_cost_index":7},
    "Kengeri": {"lat":12.9143, "lon":77.4827, "population_density_score":6, "construction_index":6, "tanker_cost_index":6},
    "RR Nagar": {"lat":12.9270, "lon":77.5150, "population_density_score":6, "construction_index":5, "tanker_cost_index":6},
    "Nagarbhavi": {"lat":12.9650, "lon":77.5000, "population_density_score":6, "construction_index":5, "tanker_cost_index":6},
    "Yelahanka": {"lat":13.1007, "lon":77.5963, "population_density_score":6, "construction_index":6, "tanker_cost_index":6},
    "Kumaraswamy layout": {"lat":12.9000, "lon":77.5600, "population_density_score":6, "construction_index":5, "tanker_cost_index":6},
    "Sadashivanagar": {"lat":13.0000, "lon":77.5700, "population_density_score":5, "construction_index":2, "tanker_cost_index":5},
    "Prashanth Nagar": {"lat":12.9800, "lon":77.5200, "population_density_score":6, "construction_index":6, "tanker_cost_index":6},
}

class PredictRequest(BaseModel):
    prediction_date: str
    locality: str
    household_size: int
    usage_per_person_lpd: float
    avg_demand_liters: int
    avg_supply_liters: int
    avg_supply_hours: float
    tanker_trips_30d: int
    tanker_days_30d: int

def fetch_last30_days_weather(lat, lon, end_date):
    start_date = end_date - timedelta(days=29)
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "daily": "temperature_2m_mean,temperature_2m_max,precipitation_sum",
        "timezone": "Asia/Kolkata"
    }
    r = requests.get(url, params=params, timeout=25)
    r.raise_for_status()
    data = r.json()
    daily = data["daily"]
    temp_mean = np.array(daily["temperature_2m_mean"], dtype=float)
    temp_max = np.array(daily["temperature_2m_max"], dtype=float)
    rain = np.array(daily["precipitation_sum"], dtype=float)
    return {
        "rainfall_30d_mm": round(float(rain.sum()), 1),
        "rainfall_last7d_mm": round(float(rain[-7:].sum()), 1),
        "temperature_avg_c": round(float(temp_mean.mean()), 1),
        "temperature_std_c": round(float(temp_mean.std()), 1),
        "heatwave_days_30d": int((temp_max > 35).sum()),
        "dry_spell_days_30d": int((rain < 1.0).sum())
    }

@app.get("/")
def home():
    return {"status": "ok", "message": "AquaEarth XGBoost Forecast API"}

@app.get("/weather")
def get_weather(locality: str = Query(...), prediction_date: str = Query(...)):
    if locality not in LOCALITY_INFO:
        return {"error": "Locality not supported"}
    dt = pd.to_datetime(prediction_date)
    info = LOCALITY_INFO[locality]
    weather = fetch_last30_days_weather(info["lat"], info["lon"], dt.to_pydatetime())
    return {"locality": locality, "weather": weather}

@app.post("/predict_week")
def predict_week(req: PredictRequest):
    if model is None:
        return {"error": "Model not loaded. Please train the model first."}
    
    if req.locality not in LOCALITY_INFO:
        return {"error": "Locality not supported"}

    loc_info = LOCALITY_INFO[req.locality]
    dt = pd.to_datetime(req.prediction_date)
    weather = fetch_last30_days_weather(loc_info["lat"], loc_info["lon"], dt.to_pydatetime())
    
    ratio = req.avg_supply_liters / max(req.avg_demand_liters, 1)

    X = {
        "locality": req.locality,
        "household_size": req.household_size,
        "usage_per_person_lpd": req.usage_per_person_lpd,
        "rainfall_30d_mm": weather["rainfall_30d_mm"],
        "rainfall_last7d_mm": weather["rainfall_last7d_mm"],
        "temperature_avg_c": weather["temperature_avg_c"],
        "temperature_std_c": weather["temperature_std_c"],
        "heatwave_days_30d": weather["heatwave_days_30d"],
        "dry_spell_days_30d": weather["dry_spell_days_30d"],
        "population_density_score": loc_info["population_density_score"],
        "construction_index": loc_info["construction_index"],
        "tanker_cost_index": loc_info["tanker_cost_index"],
        "avg_demand_liters": req.avg_demand_liters,
        "avg_supply_liters": req.avg_supply_liters,
        "avg_supply_demand_ratio": round(float(ratio), 3),
        "avg_supply_hours": req.avg_supply_hours,
        "tanker_trips_30d": req.tanker_trips_30d,
        "tanker_days_30d": req.tanker_days_30d,
        "month": int(dt.month),
        "day": int(dt.day),
        "weekday": int(dt.weekday())
    }

    X_input = pd.DataFrame([X])
    pred_enc = model.predict(X_input)[0]
    pred_label = le.inverse_transform([pred_enc])[0]
    
    proba = model.predict_proba(X_input)[0]
    probs = {cls: float(p) for cls, p in zip(le.classes_, proba)}

    return {
        "week_prediction": pred_label,
        "probabilities": probs,
        "forecast_range": {
            "start": str(dt.date()),
            "end": str((dt + timedelta(days=6)).date())
        },
        "weather_data": weather
    }

def fetch_forecast_weather(lat, lon):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum",
        "timezone": "Asia/Kolkata",
        "past_days": 31
    }
    r = requests.get(url, params=params, timeout=25)
    r.raise_for_status()
    data = r.json()["daily"]
    return data

@app.post("/forecast_7day")
def forecast_7day(req: PredictRequest):
    if model is None:
        return {"error": "Model not loaded"}
    
    if req.locality not in LOCALITY_INFO:
        return {"error": "Locality not supported"}

    loc_info = LOCALITY_INFO[req.locality]
    # Fetch 30 days past + 7 days future
    weather_data = fetch_forecast_weather(loc_info["lat"], loc_info["lon"])
    
    dates = weather_data["time"] # List of dates from -31 to +7
    temp_mean = np.array(weather_data["temperature_2m_mean"])
    temp_max = np.array(weather_data["temperature_2m_max"])
    rain = np.array(weather_data["precipitation_sum"])

    # We want to predict for today and the next 6 days
    # Today is at index 31 in the lists
    results = []
    
    for i in range(31, 38): # Current day (31) to Day 7 (37)
        dt = pd.to_datetime(dates[i])
        
        # Calculate 30-day window metrics ending at day i
        window_rain = rain[i-29 : i+1]
        window_temp = temp_mean[i-29 : i+1]
        window_temp_max = temp_max[i-29 : i+1]

        w_features = {
            "rainfall_30d_mm": round(float(window_rain.sum()), 1),
            "rainfall_last7d_mm": round(float(window_rain[-7:].sum()), 1),
            "temperature_avg_c": round(float(window_temp.mean()), 1),
            "temperature_std_c": round(float(window_temp.std()), 1),
            "heatwave_days_30d": int((window_temp_max > 35).sum()),
            "dry_spell_days_30d": int((window_rain < 1.0).sum())
        }

        ratio = req.avg_supply_liters / max(req.avg_demand_liters, 1)

        X = {
            "locality": req.locality,
            "household_size": req.household_size,
            "usage_per_person_lpd": req.usage_per_person_lpd,
            "rainfall_30d_mm": w_features["rainfall_30d_mm"],
            "rainfall_last7d_mm": w_features["rainfall_last7d_mm"],
            "temperature_avg_c": w_features["temperature_avg_c"],
            "temperature_std_c": w_features["temperature_std_c"],
            "heatwave_days_30d": w_features["heatwave_days_30d"],
            "dry_spell_days_30d": w_features["dry_spell_days_30d"],
            "population_density_score": loc_info["population_density_score"],
            "construction_index": loc_info["construction_index"],
            "tanker_cost_index": loc_info["tanker_cost_index"],
            "avg_demand_liters": req.avg_demand_liters,
            "avg_supply_liters": req.avg_supply_liters,
            "avg_supply_demand_ratio": round(float(ratio), 3),
            "avg_supply_hours": req.avg_supply_hours,
            "tanker_trips_30d": req.tanker_trips_30d,
            "tanker_days_30d": req.tanker_days_30d,
            "month": int(dt.month),
            "day": int(dt.day),
            "weekday": int(dt.weekday())
        }

        X_input = pd.DataFrame([X])
        pred_enc = model.predict(X_input)[0]
        pred_label = le.inverse_transform([pred_enc])[0]
        
        proba = model.predict_proba(X_input)[0]
        risk_score = round(float(proba[pred_enc]) * 100) # Simple proxy for risk score

        results.append({
            "date": dates[i],
            "day": dt.strftime("%a"),
            "risk": pred_label,
            "score": int(risk_score),
            "temp": round(float(temp_mean[i]), 1),
            "rain": round(float(rain[i]), 1)
        })

    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
