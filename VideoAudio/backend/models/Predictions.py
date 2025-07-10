import numpy as np
from tensorflow.keras.preprocessing.image import img_to_array
import pandas as pd
from PIL import Image
import io
import joblib
from keras.models import load_model
model_tumor = load_model('brain_tumor.keras')
model_eye=load_model('eye.keras')
pipeline = joblib.load('xgb_pipeline_kidney.pkl')
model_heart = joblib.load('heart_disease_model.sav')
model_diabetes=joblib.load('diabetes_model.sav')
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OrdinalEncoder, StandardScaler
from xgboost import XGBClassifier

class_labels = ['pituitary', 'glioma', 'notumor', 'meningioma']

def predict_brain_tumor_from_image(file_stream):
    
    image_size=128
    image = Image.open(io.BytesIO(file_stream.read()))
    image = image.convert('RGB')
    image = image.resize((image_size, image_size))
    
    img_array = img_to_array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model_tumor.predict(img_array)
    predicted_class_index = np.argmax(predictions, axis=1)[0]
    confidence_score = float(np.max(predictions, axis=1)[0])
    predicted_label = class_labels[predicted_class_index]

    if predicted_label.lower() in ['no_tumor', 'notumor']:
        result_ = "Negative"
    else:
        result_ = f"Tumor: {predicted_label}"


    result ={
     "testType": "brain_tumor",
     "result": {
         "prediction": result_,
         "confidence": confidence_score
     }
}
    return result

def predict_kidney_from_data(data):
    try:
        # Extracting and storing values
        age = float(data.get('Age', 0))
        blood_pressure = float(data.get('Blood_pressure', 0))
        specific_gravity = float(data.get('Specific_gravity', 0))
        albumin = float(data.get('Albumin', 0))
        sugar = float(data.get('Sugar', 0))
        red_blood_cells = data.get('Red_blood_cells', 'normal')
        pus_cell = data.get('Pus_cell', 'notpresent')
        pus_cell_clumps = data.get('Pus_cell_clumps', 'notpresent')
        bacteria = data.get('Bacteria', 'notpresent')
        blood_glucose_random = float(data.get('Blood_glucose_random', 0))
        blood_urea = float(data.get('Blood_urea', 0))
        serum_creatinine = float(data.get('Serum_creatinine', 0))
        sodium = float(data.get('Sodium', 0))
        potassium = float(data.get('Potassium', 0))
        haemoglobin = float(data.get('Haemoglobin', 0))
        packed_cell_volume = float(data.get('Packed_cell_volume', 0))
        white_blood_cell_count = float(data.get('White_blood_cell_count', 0))
        red_blood_cell_count = float(data.get('Red_blood_cell_count', 0))
        hypertension = data.get('Hypertension', 'no')
        diabetes_mellitus = data.get('Diabetes_mellitus', 'no')
        coronary_artery_disease = data.get('Coronary_artery_disease', 'no')
        appetite = data.get('Appetite', 'good')
        peda_edema = data.get('Peda_edema', 'no')
        aanemia = data.get('Aanemia', 'no')
        
        red_blood_cells=red_blood_cells.lower()
        pus_cell=pus_cell.lower()
        pus_cell_clumps=pus_cell_clumps.lower().replace(" ", "")
        bacteria=bacteria.lower().replace(" ","")
        hypertension=hypertension.lower()
        diabetes_mellitus=diabetes_mellitus.lower()
        coronary_artery_disease=coronary_artery_disease.lower()
        appetite=appetite.lower()
        peda_edema=peda_edema.lower()
        aanemia=aanemia.lower()
        
        
        columns = [
    "age", "blood_pressure", "specific_gravity", "albumin", "sugar",
    "red_blood_cells", "pus_cell", "pus_cell_clumps", "bacteria",
    "blood_glucose_random", "blood_urea", "serum_creatinine", "sodium",
    "potassium", "haemoglobin", "packed_cell_volume",
    "white_blood_cell_count", "red_blood_cell_count", "hypertension",
    "diabetes_mellitus", "coronary_artery_disease", "appetite",
    "peda_edema", "aanemia"
]
        input_df = pd.DataFrame([[
    age, blood_pressure, specific_gravity, albumin, sugar,
    red_blood_cells, pus_cell, pus_cell_clumps, bacteria,
    blood_glucose_random, blood_urea, serum_creatinine, sodium,
    potassium, haemoglobin, packed_cell_volume,
    white_blood_cell_count, red_blood_cell_count, hypertension,
    diabetes_mellitus, coronary_artery_disease, appetite,
    peda_edema, aanemia
]], columns=columns)

        p#rint(input_df)
        # Predict
        prediction = pipeline.predict(input_df)[0]
        
        confidence = (
            pipeline.predict_proba(input_df)[0][int(prediction)]
            if hasattr(pipeline, "predict_proba")
            else 1.0
        )
         #result = predict_kidney()
        prediction=int(prediction)
        
        if(prediction==0):
            prediction="Negative"
        else:
            prediction="Positive"
        result ={
     "testType": "Kidney",
     "result": {
         "prediction": prediction,
         "confidence": float(confidence)
     }
}

        return result

    except Exception as e:
        print("Prediction error:", str(e))
        return {"error": "Prediction failed", "details": str(e)} 

def predict_eye_disease_from_image(file_stream,target_size=(264, 264), class_names=None):
    image = Image.open(io.BytesIO(file_stream.read()))

    image = image.convert("RGB")  
    image = image.resize(target_size)
  
    img_array = img_to_array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model_eye.predict(img_array)
    predicted_index = np.argmax(predictions[0])

    class_names = ['Age related Macular Degeneration', 'Cataract', 'Diabetes', 'Glaucoma', 'Hypertension', 'Pathological Myopia', 'Normal', 'Other diseases/abnormalities']

    predicted_index = predictions[0].argmax()
    confidence = predictions[0][predicted_index]

    predicted_class = class_names[predicted_index]
    


    result ={
     "testType": "Eye",
     "result": {
         "prediction": predicted_class,
         "confidence": float(confidence)
     }
}
    return result

def predict_heart_from_data(data):
    
    sex_map = {"Male": 1, "Female": 0}
    cp_map = {
        "Typical Angina": 0,
        "Atypical Angina": 1,
        "Non-Anginal Pain": 2,
        "Asymptomatic": 3
    }
    fbs_map = {"True": 1, "False": 0}
    restecg_map = {
        "Normal": 0,
        "ST-T Abnormality": 1,
        "Left Ventricular Hypertrophy": 2
    }
    exang_map = {"Yes": 1, "No": 0}
    slope_map = {
        "Upsloping": 0,
        "Flat": 1,
        "Downsloping": 2
    }
    thal_map = {
        "Normal": 1,
        "Fixed Defect": 2,
        "Reversible Defect": 3
    }

        # Extract and map features
    input_data = {
            "age": float(data.get("age")),
            "sex": sex_map[data.get("sex")],
            "cp": cp_map[data.get("cp")],
            "trestbps": float(data.get("trestbps")),
            "chol": float(data.get("chol")),
            "fbs": fbs_map[data.get("fbs")],
            "restecg": restecg_map[data.get("restecg")],
            "thalach": float(data.get("thalach")),
            "exang": exang_map[data.get("exang")],
            "oldpeak": float(data.get("oldpeak")),
            "slope": slope_map[data.get("slope")],
            "ca": float(data.get("ca")),
            "thal": thal_map[data.get("thal")]
        }

    df = pd.DataFrame([input_data])

    try:
        prediction = model_heart.predict(df)[0]
        confidence = (
        model_heart.predict_proba(df)[0][int(prediction)]
                if hasattr(model_heart, "predict_proba")
                else 1.0
            )
        if(int(prediction)==1):
            prediction="positive"
        else:
            prediction="negative"
        result ={
     "testType": "Heart ",
     "result": {
         "prediction": prediction,
         "confidence": float(confidence)
     }
}
    
        return result

    except Exception as e:
            return ({"error": "Prediction failed", "details": str(e)}), 500



def predict_diabetes_from_data(data):
    try:
        input_data = {
            "Pregnancies": float(data.get("Pregnancies")),
            "Glucose": float(data.get("Glucose")),
            "BloodPressure": float(data.get("BloodPressure")),
            "SkinThickness": float(data.get("SkinThickness")),
            "Insulin": float(data.get("Insulin")),
            "BMI": float(data.get("BMI")),
            "DiabetesPedigreeFunction": float(data.get("DiabetesPedigreeFunction")),
            "Age": float(data.get("Age"))
        }

        # Create a DataFrame in expected shape
        df = pd.DataFrame([input_data])

        # Make prediction
        prediction = model_diabetes.predict(df)[0]
        confidence = (
            model_diabetes.predict_proba(df)[0][int(prediction)]
            if hasattr(model_diabetes, "predict_proba")
            else 1.0
        )
        if(int(prediction)==1):
            prediction="positive"
        else:
            prediction="negative"

        result = {
            "testType": "Diabetes",
            "result": {
                "prediction": prediction,  #s
                "confidence": round(float(confidence), 4)
            }
        }

        return result

    except Exception as e:
        return {"error": "Prediction failed", "details": str(e)}, 500

