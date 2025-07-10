import sys
import os
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(BASE_DIR)
from flask import Flask, request, send_from_directory, jsonify,send_file,make_response
from flask_socketio import SocketIO
from keras.models import load_model
from collections import Counter
from flask_cors import CORS
from datetime import datetime
import numpy as np
from controllers.audio_video import upload_audio_controller,upload_image_controller
from controllers.emotion_detection import detect_emotion
from models.Predictions import predict_brain_tumor_from_image,predict_kidney_from_data,predict_eye_disease_from_image,predict_heart_from_data,predict_diabetes_from_data
from Brain.app import brain,get_image_date,get_response_from_doctor
latest_audio_filename = None
latest_image_filename = None
import requests
AUDIO_FOLDER = 'media/audio_uploads'
IMAGE_FOLDER = 'media/image_uploads'
os.makedirs(AUDIO_FOLDER, exist_ok=True)
os.makedirs(IMAGE_FOLDER, exist_ok=True)
app = Flask(__name__)  
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
socketio = SocketIO(app, cors_allowed_origins="*")

interview_running = False  
labels =[]
frame_counter = 0
from fpdf import FPDF
from datetime import datetime
import threading

@app.route('/auth', methods=['POST'])
def auth():
    token = request.json.get("token")
    if not token or token in ["null", "undefined", ""]:
        return "Invalid token", 401
    resp = make_response({"message": "Token accepted"})
    resp.set_cookie("token", token, httponly=True, samesite='Lax')  
    return resp

@app.route('/')
def serve_index():
    token = request.cookies.get('token')
    if not token or token in ["null", "undefined", ""]:
        return "Unauthorized", 401
   
    frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
    return send_from_directory(frontend_path, 'index.html')

@app.route('/logout', methods=['POST'])
def logout():
    resp = make_response({"message": "Logged out successfully"})
    resp.set_cookie("token", "", expires=0)
    return resp

@app.route('/x')
def serve_x():
   
    return send_from_directory('../frontend', 'index.html')



# Handle audio upload and convert to mp3
@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    global latest_audio_filename
    latest_audio_filename=upload_audio_controller(request.files['audio'],AUDIO_FOLDER=AUDIO_FOLDER)
    return 'MP3 Saved', 200



# Handle image uploads
@app.route('/upload_image', methods=['POST'])
def upload_image():
    global latest_image_filename
    print("Uploading image...")
    img = request.files['image']
    if(not img):
        return 'No image uploaded', 400
    latest_image_filename=upload_image_controller(img,IMAGE_FOLDER=IMAGE_FOLDER)
    threading.Thread(target=get_image_date, args=(latest_image_filename,)).start()
    return jsonify({ "url": f"/image/{latest_image_filename}" })




@app.route('/image/<filename>')
def get_image(filename):
    return send_from_directory(IMAGE_FOLDER, filename)


@app.route('/start_frames', methods=['POST'])
def start_interview():
    global interview_running
    interview_running = True
    return {"status": "started"}

@app.route('/stop_frames', methods=['POST'])
def stop_interview():
    global interview_running
    interview_running = False
    return {"status": "stopped"}


@socketio.on('video_frame')
def handle_video_frame(data):
    try:
        global interview_running
        if not interview_running:
            return 
        image_data = data.get('image')
        if not image_data:
            print("No image data received.")
            return
        global labels
        label=detect_emotion(image_data)
        if label is not None:
            labels.append(label)

    except Exception as e:
        print("Error processing frame:", e)
    
@app.route('/download_pdf/<filename>')
def download_pdf(filename):
    return send_from_directory('media/reports', filename, as_attachment=True)


@app.route('/get_pdf', methods=['GET'])
def get_pdf():
    doctor_response = get_response_from_doctor()
    
    # File details
    now = datetime.now()
    timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
    pdf_filename = "doctor_report_" + now.strftime("%Y%m%d%H%M%S") + ".pdf"
    pdf_path = os.path.join("media/reports", pdf_filename)

    # Ensure directory exists
    os.makedirs("media/reports", exist_ok=True)

    # Create PDF
    pdf = FPDF()
    pdf.add_page()

    # Header
    pdf.set_font("Arial", "B", 16)
    pdf.set_text_color(40, 40, 120)
    pdf.cell(0, 10, "MediView Healthcare", ln=True, align="C")
    pdf.set_text_color(0, 0, 0)

    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Patient Consultation Report", ln=True, align="C")
    pdf.ln(10)

    # Timestamp
    pdf.set_font("Arial", size=11)
    pdf.cell(0, 10, f"Date: {timestamp}", ln=True)
    pdf.ln(5)

    # Doctor info
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Reviewed by: Dr. Neuron", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 10, "Designation: Senior AI Consultant", ln=True)
    pdf.ln(10)

    # Response
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Doctor's Observations:", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, doctor_response)
    pdf.ln(5)

    # Footer
    pdf.set_font("Arial", "I", 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, "This report is auto-generated by MediView Virtual Interview System.", ln=True, align="C")

    pdf.output(pdf_path)
    
    token = request.cookies.get('token')
    try:
     with open(pdf_path, 'rb') as f:
        files = {'file': (pdf_filename, f, 'application/pdf')}
       
        
        data = {
        'patient_id': '12345',  # Use actual user ID if needed
        'doctor': 'Dr. Cura',
        'timestamp': timestamp,
    }
        headers = {
        'Authorization': f'Bearer {token}'
    }
    
        backend_url = 'http://localhost:4000/api/user/addreport'
        response = requests.post(backend_url, files=files, data=data,headers=headers)
        backend_status = response.status_code
        print(backend_status)
    except Exception as e:
        backend_status = f"Error sending to backend: {str(e)}"
    

    return jsonify({
        "pdf_url": f"/download_pdf/{pdf_filename}"
    })

@app.route('/interview_stopped', methods=['POST'])
def interview_stopped():
    global latest_audio_filename
    global interview_running
    global labels
    interview_running = False
    counter = Counter(labels)
    max_freq = max(counter.values())
    max_freq_elements = [k for k, v in counter.items() if v == max_freq]
    emotion= max_freq_elements[0]
    print("overall mood is :- ", emotion)
   
    if not latest_audio_filename:
        return jsonify({"error": "Audio or image file not uploaded yet."}), 400

    audio_path = latest_audio_filename


    brain(audio_path,emotion)

    return jsonify({"status": "Processing started"}), 200

@app.route('/get_output_audio', methods=['GET'])
def get_output_audio():
    file_path = "Temp.mp3"
    if os.path.exists(file_path):
        return send_file(file_path, mimetype="audio/mpeg")
    else:
        return jsonify({"error": "Audio file not found"}), 404
    
    
@app.route('/predict_brain_tumor', methods=['POST'])
def predict_brain_tumor():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        result = predict_brain_tumor_from_image(file)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    
@app.route('/predict_kidney', methods=['POST'])
def predict_kidney():
   
    
    print("funtion called 1")
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data received"}), 400

 
    
    try:
        result = predict_kidney_from_data(data)

       
        print(result)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/predict_eye_disease', methods=['POST'])
def predict_eye_disease():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        result = predict_eye_disease_from_image(file)
       
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/predict_heart', methods=['POST'])
def predict_heart():
   
    
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data received"}), 400

 
    
    try:
        result = predict_heart_from_data(data)

       
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/predict_diabetes', methods=['POST'])
def predict_diabetes():
   
    
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data received"}), 400

 
    
    try:
        result = predict_diabetes_from_data(data)

       
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
    
