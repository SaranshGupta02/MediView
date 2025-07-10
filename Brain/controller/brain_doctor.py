import os
from openai import OpenAI
from dotenv import load_dotenv  
import base64
load_dotenv()  
api_key = os.getenv("OPENAI_API_KEY")
#print(api_key)



client = OpenAI()

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


def generate_output(prompt, image_path=None):
    messages = [
        { "role": "user", "content": [{ "type": "text", "text": prompt }] }
    ]

    if image_path:
        base64_image = encode_image(image_path)
        messages[0]["content"].append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{base64_image}",
            },
        })

    completion = client.chat.completions.create(
        model="gpt-4.1",
        messages=messages,
    )

    return completion.choices[0].message.content

#print(generate_output("what is in the image","acne.jpg"))