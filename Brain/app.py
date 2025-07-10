import os
from pathlib import Path
from .controller.brain_doctor import generate_output
from .controller.voice_of_patient import  transcribe_with_openai
from .controller.voice_of_doctor import doctor_speech
from dotenv import load_dotenv
load_dotenv()
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate,MessagesPlaceholder
from langchain_openai import ChatOpenAI 
from fpdf import FPDF
from datetime import datetime
from pathlib import Path
response_image=None
store = {}
def get_session_history(session_id: str) -> BaseChatMessageHistory:
    """Function will return an object of type BaseChatMessageHistory"""
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

overall_speech = " "
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", 
        """ You are a professional doctor. You will be given the following data:-
            - Image uploaded by the patient
            - Patient emotion throughout the call
            - Patient's audio
            You have to carefully diagnosis the patient audio , emotions and the uploaded image and guide him like the doctor
            if there is no image data than respond to patient as per his query and past chat history
            The flow of response should be:-
            - start by addressing the patient saying hello
            - to start a conversation give a short answer to the patient query
            - to continue the conversation tell the patient about the image he/she has uploaded 
            - now continue the conversation and give precautions , treatment , diet etc
            The following requirements should also meant when giving response:-
            - The response should be in a professional tone ,If you make a differential, suggest some remedies for them. Do not add any numbers or special characters in  your response. 
            - Your response should be in one long paragraph. Also always answer as if you are answering to a real person.
            - Donot say 'In the image I see' but say 'With what I see, I think you have ....'
            - Guide the patient what should he do next 
            - Give required Precautions to the patient
            - Dont threaten the patient untill any critical disease is found
            - Make sure your answer should align with patient query
            - Suggest Patient a good diet for faster recovery"""
            ),
        MessagesPlaceholder(variable_name="messages")
    ]
)
model = ChatOpenAI(model="o3-mini")
chain = prompt | model
config = {"configurable": {"session_id": "chat3"}}  # Configuring the session
with_message_history = RunnableWithMessageHistory(chain, get_session_history)

def get_response(question):
    response = with_message_history.invoke(
            [HumanMessage(content=question)],
            config=config
        )
    return response.content
      
        

def get_image_date(image_filename):
    brain_dir = Path(__file__).resolve().parent
    videoaudio_dir = brain_dir.parent / 'VideoAudio' / 'backend' / 'media'
    image_path = videoaudio_dir / 'image_uploads' / image_filename
    system_prompt= " you are a professional doctor , patient has uploaded the image and told you about the disease and problems the person is facing , you have to return detailed analysis of this image "
    global response_image
    response_image= generate_output(prompt=system_prompt ,image_path=image_path)
    
    

def save_response_as_pdf(text, filename="doctor_response.pdf"):
    pdf_dir = Path(__file__).resolve().parent.parent / 'media' / 'pdf'
    pdf_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = pdf_dir / filename

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, txt=text)
    pdf.output(str(pdf_path))
    
    return filename  # return just filename for use in URL


def brain(audio_filename,emotion):

    brain_dir = Path(__file__).resolve().parent
    
    videoaudio_dir = brain_dir.parent / 'VideoAudio' / 'backend' / 'media'
    
    audio_path = videoaudio_dir / 'audio_uploads' / audio_filename
    
    print("Audio path:", audio_path)
    global response_image
    
    
    transcript = transcribe_with_openai(audio_filepath=audio_path)
    print(transcript)
    
    #system_prompt = system_prompt + "The tone of the patient is " + emotio
   
    if(response_image):
        question = "About the image" + response_image + transcript + "Emotion of the patient is " +  emotion
        response_image=None
    else:
        question = transcript + "Emotion of the patient is " +  emotion
    global overall_speech
    doctor_response = get_response(question)
    output_audio = "Temp.mp3"
    overall_speech= overall_speech + "\n" + doctor_response
    
    doctor_speech(input_text=doctor_response, speech_path=output_audio)
    
    return save_response_as_pdf(doctor_response)


def get_response_from_doctor():   #to be called to write content to pdf 
    global overall_speech
    
    return overall_speech