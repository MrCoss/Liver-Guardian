import os
import logging
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from typing import List, Any
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OrdinalEncoder
from sklearn.metrics import accuracy_score
import joblib
import uvicorn

# --- Basic Logging Configuration ---
# Sets up a logger to output messages with a timestamp, level, and message.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

# --- Configuration Management ---
# Uses Pydantic to manage settings from environment variables with defaults.
class Settings(BaseSettings):
    MODEL_FILE: str = "liver_cirrhosis_model.joblib"
    DATA_FILE: str = "liver_cirrhosis_clean.csv"

settings = Settings()

# --- App Initialization ---
app = FastAPI(
    title="LiverGuardian API",
    description="API for predicting liver cirrhosis stage.",
    version="1.0.0"
)

# --- CORS Configuration ---
# Allows the frontend application to communicate with this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://liverguardian-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Features (Order is critical and must match the frontend) ---
FEATURE_NAMES = [
    "Age", "Sex", "Ascites", "Hepatomegaly", "Spiders", "Edema",
    "Bilirubin", "Cholesterol", "Albumin", "Copper",
    "Alk_Phos", "SGOT", "Tryglicerides", "Platelets", "Prothrombin"
]

# --- Model Training ---
def train_model() -> Pipeline:
    """Trains a new model using the data file and saves it."""
    logging.info(f"Starting model training with data from '{settings.DATA_FILE}'...")
    df = pd.read_csv(settings.DATA_FILE)
    df.drop(columns=["Status", "Drug"], inplace=True, errors="ignore")
    df.dropna(inplace=True)

    X = df[FEATURE_NAMES]
    y = df["Stage"]

    categorical_features = X.select_dtypes(include=['object']).columns
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1), categorical_features)
        ],
        remainder="passthrough"
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("model", RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced'))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    pipeline.fit(X_train, y_train)
    
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    logging.info(f"Model training complete. Accuracy: {accuracy:.2f}")

    joblib.dump(pipeline, settings.MODEL_FILE)
    logging.info(f"Model saved to '{settings.MODEL_FILE}'")
    return pipeline

# --- Global Model Variable ---
# This will hold the loaded machine learning model pipeline.
model: Pipeline = None

# --- Application Startup Event ---
@app.on_event("startup")
def load_model():
    """Loads the model on application startup, or trains one if not found."""
    global model
    if os.path.exists(settings.MODEL_FILE):
        model = joblib.load(settings.MODEL_FILE)
        logging.info(f"Model loaded successfully from '{settings.MODEL_FILE}'.")
    elif os.path.exists(settings.DATA_FILE):
        logging.warning(f"Model file not found. Training a new model...")
        model = train_model()
    else:
        log_message = "No model file or training data found! The API cannot make predictions."
        logging.critical(log_message)
        raise RuntimeError(log_message)

# --- API Endpoints ---
@app.get("/health", summary="Check API Health")
def health():
    """A simple health check endpoint to confirm the API is running."""
    return {"status": "ok"}

class PredictionRequest(BaseModel):
    data: List[List[Any]] = Field(..., example=[[50, "M", "N", "N", "N", "N", 1.1, 248, 3.9, 55, 1100, 120, 150, 250, 10.5]])

@app.post("/predict", summary="Predict Cirrhosis Stage")
async def predict(request: PredictionRequest):
    """Receives patient data and returns a predicted cirrhosis stage."""
    if not model:
        raise HTTPException(status_code=503, detail="Model is not loaded. The service is unavailable.")
    try:
        input_data = pd.DataFrame(request.data, columns=FEATURE_NAMES)
        prediction = model.predict(input_data)
        return {"prediction": prediction.tolist()}
    except Exception as e:
        # Log the full error with traceback for easier debugging.
        logging.error(f"Error during prediction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred during prediction.")

# --- Run for Local Development ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)