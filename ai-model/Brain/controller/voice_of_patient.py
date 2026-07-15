import logging
import speech_recognition as sr
import pydub
from pydub import AudioSegment
import os
from openai import OpenAI
from io import BytesIO
from dotenv import load_dotenv
load_dotenv()  
api_key = os.getenv("OPENAI_API_KEY")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
import cv2
import threading
import logging
from io import BytesIO
import speech_recognition as sr
from pydub import AudioSegment




def transcribe_with_openai(audio_filepath):
    
    client = OpenAI()
    audio_file = open(audio_filepath, "rb")

    translation = client.audio.translations.create(
        model="whisper-1", 
        file=audio_file,
    )

    return translation.text


def record_audio_mp3(file_path, timeout=5, phrase_time_limit=None):
    recognizer = sr.Recognizer()
    try:
        with sr.Microphone() as source:
            logging.info("Adjusting for ambient noise...")
            recognizer.adjust_for_ambient_noise(source, duration=1)
            logging.info("Start speaking now...")
            audio_data = recognizer.listen(source, timeout=timeout, phrase_time_limit=phrase_time_limit)
            logging.info("Recording complete.")

            wav_data = audio_data.get_wav_data()
            audio_segment = AudioSegment.from_wav(BytesIO(wav_data))
            audio_segment.export(file_path, format="mp3", bitrate="128k")

            logging.info(f"Audio saved to {file_path}")
            return True, file_path
    except Exception as e:
        logging.error(f"Audio recording error: {e}")
        return False, str(e)


def record_video(video_path, record_seconds=10, fps=20, frame_size=(640, 480)):
    cap = cv2.VideoCapture(0)  # Open default camera

    if not cap.isOpened():
        logging.error("Could not open video device")
        return False, "Video device error"

    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out = cv2.VideoWriter(video_path, fourcc, fps, frame_size)

    logging.info("Starting video recording...")
    frame_count = 0
    max_frames = record_seconds * fps

    while frame_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break

        out.write(frame)
        frame_count += 1

        # Optional: show frame while recording
        cv2.imshow('Recording Video - Press q to stop', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    out.release()
    cv2.destroyAllWindows()
    logging.info(f"Video saved to {video_path}")
    return True, video_path


def record_video_and_audio(video_path, audio_path, record_seconds=10):
    audio_result = {}
    video_result = {}

    # Thread for audio recording
    def audio_thread_func():
        success, result = record_audio_mp3(audio_path, timeout=record_seconds + 2, phrase_time_limit=record_seconds)
        audio_result['success'] = success
        audio_result['result'] = result

    # Thread for video recording
    def video_thread_func():
        success, result = record_video(video_path, record_seconds=record_seconds)
        video_result['success'] = success
        video_result['result'] = result

    # Start threads
    audio_thread = threading.Thread(target=audio_thread_func)
    video_thread = threading.Thread(target=video_thread_func)

    audio_thread.start()
    video_thread.start()

    audio_thread.join()
    video_thread.join()

    return audio_result['result']
















def record_audio(file_path, timeout=5, phrase_time_limit=None):
    """
    Simplified function to record audio from the microphone and save it as an MP3 file.

    Args:
    file_path (str): Path to save the recorded audio file.
    timeout (int): Maximum time to wait for a phrase to start (in seconds).
    phrase_time_lfimit (int): Maximum time for the phrase to be recorded (in seconds).
    """
    recognizer = sr.Recognizer()
    
    try:
        with sr.Microphone() as source:
            logging.info("Adjusting for ambient noise...")
            recognizer.adjust_for_ambient_noise(source, duration=1)
            logging.info("Start speaking now...")
            
            # Record the audio
            audio_data = recognizer.listen(source, timeout=timeout, phrase_time_limit=phrase_time_limit)
            logging.info("Recording complete.")
            
            # Convert the recorded audio to an MP3 file
            wav_data = audio_data.get_wav_data()
            audio_segment = AudioSegment.from_wav(BytesIO(wav_data))
            audio_segment.export(file_path, format="mp3", bitrate="128k")
            
            
            logging.info(f"Audio saved to {file_path}")
            return file_path
           

    except Exception as e:
        logging.error(f"An error occurred: {e}")


audio_filepath="patient_voice_test_for_patient.mp3"
#record_audio(file_path=audio_filepath)





#transcribe_with_openai(audio_filepath=audio_filepath)