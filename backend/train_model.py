import pandas as pd
import joblib
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import os

def train():
    # Load dataset
    data_path = r"C:\Users\AdithyaP\Downloads\water_shortage_week_forecast_dataset_5000_advanced.csv"
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return

    df = pd.read_csv(data_path)
    
    # Preprocessing
    df["prediction_date"] = pd.to_datetime(df["prediction_date"], dayfirst=True)
    df["day"] = df["prediction_date"].dt.day
    df["month"] = df["prediction_date"].dt.month
    df["weekday"] = df["prediction_date"].dt.weekday
    df = df.drop(columns=["prediction_date"])

    target = "shortage_risk_week"
    X = df.drop(columns=[target])
    y = df[target]

    # Encode target
    le = LabelEncoder()
    y_enc = le.fit_transform(y)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )

    # Features
    cat_cols = ["locality"]
    num_cols = [c for c in X.columns if c not in cat_cols]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
            ("num", "passthrough", num_cols)
        ]
    )

    # Model
    clf = XGBClassifier(
        n_estimators=500,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.9,
        colsample_bytree=0.9,
        reg_lambda=1.0,
        random_state=42,
        eval_metric="mlogloss"
    )

    model = Pipeline(steps=[
        ("prep", preprocessor),
        ("xgb", clf)
    ])

    # Fit
    print("Training model...")
    model.fit(X_train, y_train)
    
    # Save artifacts
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/water_week_xgb_model.pkl")
    joblib.dump(le, "models/week_label_encoder.pkl")
    
    print("✅ Model trained and saved to models/ folder")

if __name__ == "__main__":
    train()
