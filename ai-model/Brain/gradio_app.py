import os
import gradio as gr
from brain_doctor import generate_output
from voice_of_patient import record_audio, transcribe_with_openai
from voice_of_doctor import doctor_speech
from dotenv import load_dotenv
load_dotenv()

system_prompt="""You have to act as a professional doctor, i know you are not but this is for learning purpose. 
            What's in this image?. Do you find anything wrong with it medically? 
            If you make a differential, suggest some remedies for them. Donot add any numbers or special characters in 
            your response. Your response should be in one long paragraph. Also always answer as if you are answering to a real person.
            Donot say 'In the image I see' but say 'With what I see, I think you have ....'
            Dont respond as an AI model in markdown, your answer should mimic that of an actual doctor not an AI bot, 
            Keep your answer concise (max 2 sentences). No preamble, start your answer right away please"""


def process_inputs(audio_filepath, image_filepath):
    if not audio_filepath:
        print("NONEEE")
        
    speech_to_text_output = transcribe_with_openai(audio_filepath=audio_filepath)
    print(speech_to_text_output)

    # Handle the image input
    if image_filepath:
        doctor_response = generate_output(prompt=system_prompt+speech_to_text_output,image_path=image_filepath)
    else:
        doctor_response = "No image provided for me to analyze"

    voice_of_doctor = doctor_speech(input_text=doctor_response, speech_path="Temp.mp3")


    return speech_to_text_output, doctor_response, voice_of_doctor


# Create the interface
iface = gr.Interface(
    fn=process_inputs,
    inputs=[
        gr.Audio(sources=["microphone"], type="filepath"),
        gr.Image(type="filepath")
    ],
    outputs=[
        gr.Textbox(label="Speech to Text"),
        gr.Textbox(label="Doctor's Response"),
        gr.Audio("Temp.mp3")
    ],
    title="AI Doctor with Vision and Voice"
)

iface.launch(debug=True)

#http://127.0.0.1:7860