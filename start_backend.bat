@echo off
echo Starting AquaEarth XGBoost Backend...
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8001
pause
