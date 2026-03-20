from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os

app = Flask(__name__)
CORS(app) # Allow cross-origin requests

# Load the model
MODEL_PATH = 'kyc_model/kyc_verification_rf.joblib'
model = None

@app.before_request
def load_model():
    global model
    if model is None:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
        else:
            print(f"Warning: Model not found at {MODEL_PATH}")

@app.route('/api/predict_kyc', methods=['POST'])
def predict_kyc_endpoint():
    if model is None:
        return jsonify({"error": "Model not available. Please run kyc_model_pipeline.py first."}), 503

    try:
        data = request.json
        face_match = float(data.get('face_match', 0.95))
        blur = float(data.get('blur', 150))
        brightness = float(data.get('brightness', 130))
        name_sim = float(data.get('name_sim', 90))

        input_data = pd.DataFrame([{
            'face_match_score': face_match,
            'id_blur_score': blur,
            'id_brightness': brightness,
            'name_similarity': name_sim
        }])

        prediction = model.predict(input_data)[0]
        probabilities = model.predict_proba(input_data)[0]
        confidence = probabilities[prediction] * 100

        result = "VERIFIED" if prediction == 1 else "REJECTED"

        return jsonify({
            "status": "success",
            "result": result,
            "confidence": round(confidence, 1)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
