import xgboost as xgb
import numpy as np
import joblib
import requests
from datetime import datetime, timedelta
import os

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AquaEarth Weekly Water Shortage Forecast API (Optimized)")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load artifacts
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "xgb_model.json")
CAT_PATH = os.path.join(BASE_DIR, "models", "categories.pkl")
LABEL_PATH = os.path.join(BASE_DIR, "models", "labels.pkl")

# Load model and meta
if os.path.exists(MODEL_PATH):
    model = xgb.XGBClassifier()
    model.load_model(MODEL_PATH)
    categories = joblib.load(CAT_PATH)
    labels = joblib.load(LABEL_PATH)
    logger.info("✅ Optimized Model & Meta loaded")
else:
    model = None
    logger.warning(f"⚠️ Model not found at {MODEL_PATH}")

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
        "temperature_std_c": round(float(np.std(temp_mean)), 1),
        "heatwave_days_30d": int((temp_max > 35).sum()),
        "dry_spell_days_30d": int((rain < 1.0).sum())
    }

def get_prediction(req, weather, dt, loc_info):
    ratio = req.avg_supply_liters / max(req.avg_demand_liters, 1)
    
    # Numerical features in order:
    # household_size,usage_per_person_lpd,rainfall_30d_mm,rainfall_last7d_mm,temperature_avg_c,
    # temperature_std_c,heatwave_days_30d,dry_spell_days_30d,population_density_score,construction_index,
    # tanker_cost_index,avg_demand_liters,avg_supply_liters,avg_supply_demand_ratio,avg_supply_hours,
    # tanker_trips_30d,tanker_days_30d,day,month,weekday
    
    num_features = [
        req.household_size,
        req.usage_per_person_lpd,
        weather["rainfall_30d_mm"],
        weather["rainfall_last7d_mm"],
        weather["temperature_avg_c"],
        weather["temperature_std_c"],
        weather["heatwave_days_30d"],
        weather["dry_spell_days_30d"],
        loc_info["population_density_score"],
        loc_info["construction_index"],
        loc_info["tanker_cost_index"],
        req.avg_demand_liters,
        req.avg_supply_liters,
        round(float(ratio), 3),
        req.avg_supply_hours,
        req.tanker_trips_30d,
        req.tanker_days_30d,
        int(dt.day),
        int(dt.month),
        int(dt.weekday())
    ]
    
    # One-hot locality
    oh = [1.0 if c == req.locality else 0.0 for c in categories]
    
    X_input = np.array(oh + num_features).reshape(1, -1)
    
    # Predict
    pred_enc = model.predict(X_input)[0]
    pred_label = labels[int(pred_enc)]
    
    proba = model.predict_proba(X_input)[0]
    probs = {cls: float(p) for cls, p in zip(labels, proba)}
    
    return pred_label, probs

@app.get("/")
@app.get("/api")
def home():
    return {"status": "ok", "message": "AquaEarth Optimized API"}

@app.post("/api/predict_week")
@app.post("/predict_week")
def predict_week(req: PredictRequest):
    if model is None: return {"error": "Model not loaded."}
    if req.locality not in LOCALITY_INFO: return {"error": "Locality not supported"}

    loc_info = LOCALITY_INFO[req.locality]
    dt = datetime.strptime(req.prediction_date, "%Y-%m-%d")
    weather = fetch_last30_days_weather(loc_info["lat"], loc_info["lon"], dt)
    
    pred_label, probs = get_prediction(req, weather, dt, loc_info)

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
        "latitude": lat, "longitude": lon,
        "daily": "temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum",
        "timezone": "Asia/Kolkata", "past_days": 31
    }
    r = requests.get(url, params=params, timeout=25)
    r.raise_for_status()
    return r.json()["daily"]

@app.post("/api/forecast_7day")
@app.post("/forecast_7day")
def forecast_7day(req: PredictRequest):
    if model is None: return {"error": "Model not loaded"}
    if req.locality not in LOCALITY_INFO: return {"error": "Locality not supported"}

    loc_info = LOCALITY_INFO[req.locality]
    weather_data = fetch_forecast_weather(loc_info["lat"], loc_info["lon"])
    
    dates = weather_data["time"]
    temp_mean = np.array(weather_data["temperature_2m_mean"])
    temp_max = np.array(weather_data["temperature_2m_max"])
    rain = np.array(weather_data["precipitation_sum"])

    results = []
    for i in range(31, 38):
        dt = datetime.strptime(dates[i], "%Y-%m-%d")
        window_rain = rain[i-29 : i+1]
        window_temp = temp_mean[i-29 : i+1]
        window_temp_max = temp_max[i-29 : i+1]

        w_features = {
            "rainfall_30d_mm": round(float(window_rain.sum()), 1),
            "rainfall_last7d_mm": round(float(window_rain[-7:].sum()), 1),
            "temperature_avg_c": round(float(window_temp.mean()), 1),
            "temperature_std_c": round(float(np.std(window_temp)), 1),
            "heatwave_days_30d": int((window_temp_max > 35).sum()),
            "dry_spell_days_30d": int((window_rain < 1.0).sum())
        }

        pred_label, probs = get_prediction(req, w_features, dt, loc_info)
        risk_score = round(float(probs[pred_label]) * 100)

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
