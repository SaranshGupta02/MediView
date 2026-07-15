# MediView

MediView has two runnable stacks in this workspace:

1. A patient/admin web app in [mediview/](mediview/) built with React, Vite, and Express.
2. An AI services stack in [ai-model/](ai-model/) built with Python, Flask, Gradio, and Streamlit.

## Web App Layout

- [mediview/frontend](mediview/frontend) - patient portal
- [mediview/admin](mediview/admin) - admin and doctor dashboard
- [mediview/backend](mediview/backend) - Node.js API for auth, appointments, reports, and uploads

## AI Layout

- [ai-model/Brain](ai-model/Brain) - AI doctor workflows and demos
- [ai-model/VideoAudio](ai-model/VideoAudio) - Flask backend for uploads, emotion detection, and predictions
- [ai-model/Models](ai-model/Models) - notebook experiments and training assets

## Requirements

- Node.js 18+
- npm
- Python 3.10+
- MongoDB
- Cloudinary credentials
- Razorpay credentials
- OpenAI API key for the AI flows

## Run The Web App

Create these environment files first:

Backend [mediview/backend/.env](mediview/backend/.env):

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CURRENCY=INR
```

Patient frontend [mediview/frontend/.env](mediview/frontend/.env):

```env
VITE_BACKEND_URL=http://localhost:4000
```

Admin frontend [mediview/admin/.env](mediview/admin/.env):

```env
VITE_BACKEND_URL=http://localhost:4000
```

Install and run each app in a separate terminal:

```bash
cd mediview/backend
npm install
npm run server
```

```bash
cd mediview/frontend
npm install
npm run dev
```

```bash
cd mediview/admin
npm install
npm run dev
```

## Run The AI Services

The Python entrypoints now use local imports that match the folder layout in this workspace.

Install Brain dependencies:

```bash
cd ai-model/Brain
pip install -r requirements.txt
```

Run one of these:

```bash
python gradio_app.py
```

```bash
streamlit run doctor_app_streamlit.py
```

Install Flask backend dependencies:

```bash
cd ai-model/VideoAudio
pip install -r requirements.txt
```

Run the Flask backend:

```bash
cd ai-model/VideoAudio/backend
python server.py
```

## Notes

- Start the Node backend before the React apps.
- The Flask backend listens on port 5000.
- The AI scripts depend on local model files such as `.keras`, `.sav`, and `.pkl` artifacts in [ai-model/VideoAudio/backend/models](ai-model/VideoAudio/backend/models) and [ai-model/Brain](ai-model/Brain).
- This workspace does not define a single root command to launch everything together.

## Main API Routes

MediView is an AI-assisted healthcare project focused on medical image analysis, voice-based consultation, and video/emotion-driven patient interaction.

This branch contains the Python-based part of the project, organized into three main areas:

- `Brain/` - AI doctor workflows, speech-to-text, text-to-speech, Gradio, and Streamlit interfaces
- `VideoAudio/` - Flask backend for audio/video upload, emotion detection, PDF generation, and disease prediction APIs
- `Models/` - notebook experiments used to train or prototype the prediction models

## What This Project Does

- accepts patient audio and medical images
- transcribes speech and generates doctor-style responses
- analyzes emotions from video frames during an interview flow
- generates PDF consultation reports
- exposes prediction endpoints for conditions such as brain tumor, kidney disease, eye disease, heart disease, and diabetes

## Project Structure

```text
MediView/
  Brain/
    app.py
    gradio_app.py
    doctor_app_streamlit.py
    controller/
    requirements.txt
  Models/
    BrainTumor.ipynb
    emotion_detection_new.ipynb
  VideoAudio/
    backend/
      server.py
      controllers/
      models/
    requirements.txt
```

- `/api/user/*` for patient flows
- `/api/admin/*` for admin flows
- `/api/doctor/*` for doctor listing

## Tech Stack

- Python
- Flask
- Flask-SocketIO
- Streamlit
- Gradio
- LangChain
- OpenAI APIs
- gTTS / speech recognition tooling
- scikit-learn, joblib, keras, and notebook-based model work

## Requirements

- Python 3.10+ recommended
- a virtual environment
- OpenAI API access for the doctor workflow
- any model files or trained artifacts required by the notebooks and controllers

## Installation

Create and activate a virtual environment, then install the dependencies for the subproject you want to run.

### Brain app

```bash
cd Brain
pip install -r requirements.txt
```

### Video and audio backend

```bash
cd VideoAudio
pip install -r requirements.txt
```

If you plan to work with the notebooks under `Models/`, install notebook tooling in your environment as needed.

## Running the Apps

### Gradio demo

```bash
cd Brain
python gradio_app.py
```

### Streamlit demo

```bash
cd Brain
streamlit run doctor_app_streamlit.py
```

### Flask backend

```bash
cd VideoAudio/backend
python server.py
```

## Environment Variables

The AI doctor workflow expects environment variables loaded from a `.env` file. Based on the code, you will likely need OpenAI-related credentials and any model-specific keys required by your local setup.

## Notes

- This repository is split across branches. The current worktree is on `master`, while `main` contains additional documentation work and may include newer project notes.
- Some files in this branch refer to local media folders such as `media/audio_uploads`, `media/image_uploads`, and `media/reports`.
- The backend serves generated PDFs and uploads directly from the local filesystem.

## Troubleshooting

- If audio or image uploads fail, verify the media directories exist and are writable.
- If OpenAI or speech services fail, confirm the relevant API keys are loaded in your environment.
- If you change branches, reinstall dependencies if the requirements files differ.
