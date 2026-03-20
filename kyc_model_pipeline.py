import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

def generate_synthetic_kyc_data(num_samples=1000):
    """
    Generates a synthetic dataset simulating KYC document and face match metrics.
    Features:
    - face_match_score: Simulates cosine similarity between ID photo and live selfie (0.0 to 1.0)
    - id_blur_score: Variance of Laplacian of the ID image, indicating sharpness (> 100 is good)
    - id_brightness: Average brightness of the ID document (0 to 255)
    - name_similarity: Fuzzy string match percentage between extracted OCR name and user input name (0 to 100)
    """
    np.random.seed(42)
    
    # Generate random features
    face_match_score = np.random.normal(loc=0.85, scale=0.15, size=num_samples)
    face_match_score = np.clip(face_match_score, 0.0, 1.0)
    
    id_blur_score = np.random.normal(loc=150, scale=80, size=num_samples)
    id_blur_score = np.clip(id_blur_score, 0, 500)
    
    id_brightness = np.random.normal(loc=130, scale=40, size=num_samples)
    id_brightness = np.clip(id_brightness, 0, 255)
    
    name_similarity = np.random.normal(loc=85, scale=20, size=num_samples)
    name_similarity = np.clip(name_similarity, 0, 100)
    
    df = pd.DataFrame({
        'face_match_score': face_match_score,
        'id_blur_score': id_blur_score,
        'id_brightness': id_brightness,
        'name_similarity': name_similarity
    })
    
    # Define ground truth rules for "Verified" (1) vs "Rejected" (0)
    # A realistic model learns these hidden rules and edge cases
    conditions = (
        (df['face_match_score'] > 0.70) & 
        (df['id_blur_score'] > 90) & 
        (df['name_similarity'] > 80) &
        (df['id_brightness'] > 50) & (df['id_brightness'] < 240)
    )
    
    df['is_verified'] = np.where(conditions, 1, 0)
    
    # Add some noise to make the model learn rather than memorize exact thresholds
    noise_indices = np.random.choice(df.index, size=int(num_samples * 0.05), replace=False)
    df.loc[noise_indices, 'is_verified'] = 1 - df.loc[noise_indices, 'is_verified']
    
    return df

def train_kyc_model():
    print("1. Generating synthetic KYC dataset...")
    df = generate_synthetic_kyc_data(2000)
    
    print(f"Dataset generated with {len(df)} records.")
    print(f"Class distribution:\n{df['is_verified'].value_counts(normalize=True)}")
    
    # Prepare features and target
    X = df[['face_match_score', 'id_blur_score', 'id_brightness', 'name_similarity']]
    y = df['is_verified']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("\n2. Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    
    print("\n3. Evaluating Model...")
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print(f"Model Accuracy: {accuracy * 100:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, predictions, target_names=['Rejected', 'Verified']))
    
    # Feature Importances
    importances = model.feature_importances_
    for feature, imp in zip(X.columns, importances):
        print(f"Feature '{feature}' importance: {imp:.3f}")
        
    # Save the model
    os.makedirs('kyc_model', exist_ok=True)
    model_path = 'kyc_model/kyc_verification_rf.joblib'
    joblib.dump(model, model_path)
    print(f"\n4. Model saved successfully to {model_path}")
    return model

def predict_kyc(model, face_match, blur, brightness, name_sim):
    """Utility function to run prediction on a single KYC application."""
    input_data = pd.DataFrame([{
        'face_match_score': face_match,
        'id_blur_score': blur,
        'id_brightness': brightness,
        'name_similarity': name_sim
    }])
    
    prediction = model.predict(input_data)[0]
    probabilities = model.predict_proba(input_data)[0]
    
    result = "VERIFIED ✅" if prediction == 1 else "REJECTED ❌"
    confidence = probabilities[prediction] * 100
    
    print(f"\n--- KYC Prediction Result ---")
    print(f"Inputs: Face={face_match:.2f}, Blur={blur}, Brightness={brightness}, NameMatch={name_sim}%")
    print(f"Result: {result} (Confidence: {confidence:.1f}%)")

if __name__ == "__main__":
    trained_model = train_kyc_model()
    
    print("\n--- Testing Model on Mock KYC Streams ---")
    # Test a perfect submission
    predict_kyc(trained_model, face_match=0.95, blur=210, brightness=130, name_sim=98)
    
    # Test a blurry ID card submission
    predict_kyc(trained_model, face_match=0.88, blur=45, brightness=130, name_sim=85)
    
    # Test a low face match score (potential fraud)
    predict_kyc(trained_model, face_match=0.45, blur=180, brightness=140, name_sim=95)
