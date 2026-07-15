import base64
import cv2
import numpy as np
import os
from keras.models import load_model

face_classifier = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
classifier = load_model('emotion_detection_Tensor_2_18.keras')
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

def detect_emotion(image_data):
    labels=[]
    try:
        # Decode base64
        header, encoded = image_data.split(",", 1)
        image_bytes = base64.b64decode(encoded)

        # Convert to OpenCV image
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_classifier.detectMultiScale(gray)

        for (x, y, w, h) in faces:
            roi_color = frame[y:y+h, x:x+w]
            try:
                roi_color = cv2.resize(roi_color, (224, 224))
            except:
                continue

            roi = roi_color.astype("float32") / 255.0
            roi = np.expand_dims(roi, axis=0)

            prediction = classifier.predict(roi, verbose=0)[0]
            label = emotion_labels[prediction.argmax()]
            print("Predicted Emotion:", label)
            return label
            
    except Exception as e:
        print(e)