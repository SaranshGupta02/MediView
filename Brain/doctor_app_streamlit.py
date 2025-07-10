import os
import streamlit as st
from controller.brain_doctor import generate_output
from controller.voice_of_patient import  transcribe_with_openai,record_audio,record_video_and_audio
from controller.voice_of_doctor import doctor_speech
from dotenv import load_dotenv

load_dotenv()

system_prompt = """You have to act as a professional doctor, i know you are not but this is for learning purpose. 
            What's in this image?. Do you find anything wrong with it medically? 
            If you make a differential, suggest some remedies for them. Donot add any numbers or special characters in 
            your response. Your response should be in one long paragraph. Also always answer as if you are answering to a real person.
            Donot say 'In the image I see' but say 'With what I see, I think you have ....'
            Dont respond as an AI model in markdown, your answer should mimic that of an actual doctor not an AI bot, 
            Keep your answer concise (max 2 sentences). No preamble, start your answer right away please"""

#st.title("🩺 AI Doctor with Vision and Voice")


# Step 1: Upload image
image_file = st.file_uploader("Upload medical image", type=["jpg", "jpeg", "png"])

# Step 2: Record audio
st.write("Record patient's voice:")

if st.button("🎙️ Start Recording"):
    
    #audio_path = record_audio(file_path="patient_voice_test_for_patient.mp3")  # this should save and return a file path (e.g. "audio.wav")
    audio_path=record_video_and_audio(video_path = "output_video.avi", audio_path="patient_voice_test_for_patient.mp3", record_seconds=10)
    st.success("Recording complete.")
    st.session_state["audio_path"] = audio_path

# Process if both are present
if "audio_path" in st.session_state and st.session_state["audio_path"]:
    if st.button("🩻 Analyze and Respond"):
        audio_fp = st.session_state["audio_path"]
        image_fp = None

        # Save uploaded image to temp file if it exists
        if image_file:
            image_fp = os.path.join("temp_image.png")
            with open(image_fp, "wb") as f:
                f.write(image_file.read())

        # Transcribe + Generate + Voice
        st.info("Transcribing...")
        transcript = transcribe_with_openai(audio_filepath=audio_fp)

        st.info("Generating doctor's response...")
        if image_fp:
            doctor_response = generate_output(prompt=system_prompt + transcript, image_path=image_fp)
        else:
            doctor_response = "No image provided for me to analyze"

        output_audio = "Temp.mp3"
        doctor_speech(input_text=doctor_response, speech_path=output_audio)

        # Show results
        st.subheader("🗣️ Patient Transcript")
        st.text(transcript)

        st.subheader("👨‍⚕️ Doctor's Response")
        st.text(doctor_response)

        st.subheader("🔊 Doctor's Voice")
        st.audio(output_audio, format="audio/mp3")
else:
    st.warning("Please record audio before proceeding.")
