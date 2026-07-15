from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
import os
import base64
from datetime import datetime
import subprocess

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

UPLOAD_FOLDER = 'uploads'
IMAGE_FOLDER = os.path.join(UPLOAD_FOLDER, 'images')
AUDIO_FOLDER = os.path.join(UPLOAD_FOLDER, 'audio')

os.makedirs(IMAGE_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)

@app.route('/start_frames', methods=['POST'])
def start_frames():
    print("[INFO] Interview started")
    return jsonify({'status': 'started'})

@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    audio = request.files.get('audio')
    if audio:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        webm_path = os.path.join(AUDIO_FOLDER, f'temp_{timestamp}.webm')
        mp3_filename = f'audio_{timestamp}.mp3'
        mp3_path = os.path.join(AUDIO_FOLDER, mp3_filename)
        latest_audio_filename = mp3_filename
        audio.save(webm_path)
        subprocess.run(['ffmpeg', '-i', webm_path, mp3_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        os.remove(webm_path)
        print(f"Saved audio: {latest_audio_filename}")
        
        # ✅ SUCCESS response
        return jsonify({'status': 'success', 'filename': mp3_filename}), 200

    # ❌ FALLBACK if no audio in request
    return jsonify({'status': 'error', 'message': 'No audio uploaded'}), 400










@app.route('/upload_image', methods=['POST'])
def upload_image():
    image = request.files.get('image')
    if image:
        filename = f'image_{datetime.now().strftime("%Y%m%d_%H%M%S")}.jpg'
        path = os.path.join(IMAGE_FOLDER, filename)
        image.save(path)
        print(f"[INFO] Image saved at: {path}")
        return jsonify({'status': 'success', 'image_url': f'http://localhost:5000/image/{filename}'})
    return jsonify({'status': 'error', 'message': 'No image uploaded'}), 400

@app.route('/interview_stopped', methods=['POST'])
def interview_stopped():
    print("[INFO] Interview stopped")
    return jsonify({'status': 'stopped'})

@app.route('/image/<filename>')
def get_image(filename):
    return send_from_directory(IMAGE_FOLDER, filename)

@socketio.on('video_frame')
def handle_video_frame(data):
    image_data = data['image']
    print("[SOCKET] Received frame of size:", len(image_data))
    # Optional: Decode and save image for debugging
    # header, encoded = image_data.split(",", 1)
    # img_bytes = base64.b64decode(encoded)
    # with open(os.path.join(IMAGE_FOLDER, f'frame_{datetime.now().strftime("%H%M%S%f")}.jpg'), 'wb') as f:
    #     f.write(img_bytes)

    # Optionally emit back to clients:
    # socketio.emit('frame_received', {'status': 'ok'})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
