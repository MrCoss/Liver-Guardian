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
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

# --- Configuration Management ---
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

# --- Global Model Variable ---
model: Pipeline = None

# --- Application Startup Event ---
@app.on_event("startup")
def load_model():
    """Loads the pre-trained model on application startup."""
    global model
    if os.path.exists(settings.MODEL_FILE):
        model = joblib.load(settings.MODEL_FILE)
        logging.info(f"Model loaded successfully from '{settings.MODEL_FILE}'.")
    else:
        log_message = "No model file found! The API cannot make predictions."
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