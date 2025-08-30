import os
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Any
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import uvicorn

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
        "http://localhost:3000",  # Default React Dev server
        "http://localhost:5173",  # Vite Dev server
        "https://liverguardian-frontend.onrender.com",  # Deployed frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- File Paths ---
MODEL_FILE = "liver_cirrhosis_model.joblib"
DATA_FILE = "liver_cirrhosis_clean.csv"

# --- Features (order is critical) ---
FEATURE_NAMES = [
    "Age", "Sex", "Ascites", "Hepatomegaly", "Spiders", "Edema",
    "Bilirubin", "Cholesterol", "Albumin", "Copper",
    "Alk_Phos", "SGOT", "Tryglicerides", "Platelets", "Prothrombin"
]

# --- Model Training ---
def train_model():
    df = pd.read_csv(DATA_FILE)
    df.drop(columns=["Status", "Drug"], inplace=True, errors="ignore")
    df.dropna(inplace=True)

    X = df[FEATURE_NAMES]
    y = df["Stage"]

    # Define which columns are categorical
    categorical_features = X.select_dtypes(include=['object']).columns
    
    # Create a preprocessor to handle categorical features
    # OrdinalEncoder will convert string categories to numbers
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1), categorical_features)
        ],
        remainder="passthrough" # Keep numerical columns as they are
    )

    # Create the full pipeline
    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("model", RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced'))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    print(f"✅ Model Accuracy: {accuracy_score(y_test, y_pred):.2f}")

    joblib.dump(pipeline, MODEL_FILE)
    print(f"✅ Model saved to {MODEL_FILE}")
    return pipeline

# --- Load or Train Model on Startup ---
model = None

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_FILE):
        model = joblib.load(MODEL_FILE)
        print("✅ Model loaded from file.")
    elif os.path.exists(DATA_FILE):
        print("⚠️ Model not found, training new one...")
        model = train_model()
    else:
        # This will stop the server from starting if data is missing, which is good for debugging
        raise RuntimeError("❌ No model file or training data found! Please add liver_cirrhosis_clean.csv to the backend directory.")

# --- Health Check ---
@app.get("/health")
def health():
    return {"status": "ok"}

# --- Prediction Request Schema ---
class PredictionRequest(BaseModel):
    data: List[List[Any]]

# --- Prediction Endpoint ---
@app.post("/predict")
async def predict(request: PredictionRequest):
    try:
        # Create a DataFrame with the correct column names, as the pipeline expects it
        input_data = pd.DataFrame(request.data, columns=FEATURE_NAMES)
        
        # The pipeline will automatically handle the preprocessing (like converting 'M'/'F' to numbers)
        prediction = model.predict(input_data)
        
        return {"prediction": prediction.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during prediction: {str(e)}")

# --- Run locally ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)