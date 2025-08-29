import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Any
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ML Model and Data Files ---
MODEL_FILE = 'liver_cirrhosis_model.joblib'
DATA_FILE = 'liver_cirrhosis_clean.csv'

# --- Model Training Function ---
def train_model():
    """Trains and saves the Random Forest model."""
    df = pd.read_csv(DATA_FILE)

    # Preprocessing to match the 15 features from the frontend
    df.drop(columns=['Status', 'Drug'], inplace=True, errors='ignore')
    
    categorical_cols = ['Sex', 'Ascites', 'Hepatomegaly', 'Spiders', 'Edema']
    for col in categorical_cols:
        if df[col].dtype == 'object':
            df[col] = df[col].astype('category').cat.codes

    df.dropna(inplace=True)

    X = df.drop(['Stage'], axis=1)
    y = df['Stage']
    
    # Ensure column order is consistent
    feature_names = ['Age', 'Sex', 'Ascites', 'Hepatomegaly', 'Spiders', 'Edema', 'Bilirubin', 'Cholesterol', 'Albumin', 'Copper', 'Alk_Phos', 'SGOT', 'Tryglicerides', 'Platelets', 'Prothrombin']
    X = X[feature_names]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    print(f"Model Accuracy: {accuracy_score(y_test, y_pred)}")

    joblib.dump(model, MODEL_FILE)
    print(f"Model trained and saved to {MODEL_FILE}")
    return model

# --- Loading the Model ---
model = None
@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_FILE):
        model = joblib.load(MODEL_FILE)
        print("Model loaded from file.")
    else:
        print("Model file not found. Training a new model...")
        model = train_model()

# --- Prediction Endpoint ---
class PredictionRequest(BaseModel):
    data: List[List[Any]]

@app.post('/predict')
async def predict(request: PredictionRequest):
    try:
        # The frontend sends raw data, we need to preprocess it here
        input_data = request.data[0]
        
        # Manually create the 15-feature vector in the correct order
        feature_vector = [
            float(input_data[0]), # Age
            1 if input_data[1] == 'M' else 0, # Sex
            1 if input_data[2] == 'Y' else 0, # Ascites
            1 if input_data[3] == 'Y' else 0, # Hepatomegaly
            1 if input_data[4] == 'Y' else 0, # Spiders
            1 if input_data[5] == 'Y' else (0.5 if input_data[5] == 'S' else 0), # Edema
            float(input_data[6]), # Bilirubin
            float(input_data[7]), # Cholesterol
            float(input_data[8]), # Albumin
            float(input_data[9]), # Copper
            float(input_data[10]), # Alk_Phos
            float(input_data[11]), # SGOT
            float(input_data[12]), # Tryglicerides
            float(input_data[13]), # Platelets
            float(input_data[14]), # Prothrombin
        ]

        prediction = model.predict([feature_vector])
        return {'prediction': prediction.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during prediction: {str(e)}")

# --- Server Runner (for local development) ---
if __name__ == '__main__':
    # Use '0.0.0.0' to be accessible on your network
    # Render will use the startCommand from render.yaml instead of this block
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)

