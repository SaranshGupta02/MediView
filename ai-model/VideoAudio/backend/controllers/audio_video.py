import os
import subprocess
from flask import request
from datetime import datetime

def upload_audio_controller(audio_file,AUDIO_FOLDER):
    global latest_audio_filename
    print("Uploading audio...")
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    webm_path = os.path.join(AUDIO_FOLDER, f'temp_{timestamp}.webm')
    mp3_filename = f'audio_{timestamp}.mp3'
    mp3_path = os.path.join(AUDIO_FOLDER, mp3_filename)
    latest_audio_filename = mp3_filename
    audio_file.save(webm_path)
    subprocess.run(['ffmpeg', '-i', webm_path, mp3_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(webm_path)
    print(f"Saved audio: {latest_audio_filename}")
    return latest_audio_filename

def upload_image_controller(img,IMAGE_FOLDER):
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"img_{timestamp}.jpg"
    path = os.path.join(IMAGE_FOLDER, filename)
    img.save(path)
    latest_image_filename = filename
    print(f"Saved image: {latest_image_filename}")
    return latest_image_filename