// A service for making API calls to the backend

// Use Render's environment variable for production, fallback to local for development
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

/**
 * Sends patient data to the backend for prediction.
 * @param {Object} payload - The payload containing the feature vector.
 * @returns {Promise<any>} The JSON response from the server.
 */
export const predictStage = async (payload) => {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    try {
        const errData = await response.json();
        let errorMessage = 'Prediction service error.';
        if (errData && errData.detail) {
            if (typeof errData.detail === 'string' && errData.detail.includes("Input data has")) {
                errorMessage = "Data format error: The features sent do not match the model's expectation.";
            } else {
                errorMessage = errData.detail;
            }
        }
        throw new Error(errorMessage);
    } catch (e) {
        throw new Error("Failed to fetch. The backend service may be down or crashing.");
    }
  }

  return response.json();
};