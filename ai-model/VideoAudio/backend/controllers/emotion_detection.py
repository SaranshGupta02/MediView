import base64
import numpy as np
import os

_cv2_available = False
_classifier_available = False
face_classifier = None
classifier = None
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

def _init_cv2():
    global _cv2_available, face_classifier
    if _cv2_available:
        return True
    try:
        import cv2
        # Verify CascadeClassifier actually exists (guards against stub packages)
        if not hasattr(cv2, 'CascadeClassifier'):
            print("[WARN] cv2 is a stub — install opencv-python-headless")
            return False
        face_classifier = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        _cv2_available = True
        return True
    except Exception as e:
        print(f"[WARN] cv2 init failed: {e}")
        return False

def _init_classifier():
    global _classifier_available, classifier
    if _classifier_available:
        return True
    try:
        from keras.models import load_model
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'emotion_detection_Tensor_2_18.keras')
        if not os.path.exists(model_path):
            print(f"[WARN] emotion model not found at: {model_path}")
            return False
        classifier = load_model(model_path)
        _classifier_available = True
        return True
    except Exception as e:
        print(f"[WARN] Could not load emotion classifier: {e}")
        return False



def detect_emotion(image_data):
    if not _init_cv2() or not _init_classifier():
        return None
    import cv2  # safe now — _init_cv2 already verified it works
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