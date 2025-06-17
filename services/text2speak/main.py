from fastapi import FastAPI, Form
from fastapi.responses import FileResponse
import uuid
import os
from tts import extract_speechable_text, gTTS

app = FastAPI()

# check is /ouput exists, if not create it
output_dir = "output"
if not os.path.exists(output_dir):
	os.makedirs(output_dir)

@app.post("/tts/")
async def tts_from_markdown(markdown_text: str = Form(...)):
    speech_text, detected_lang = extract_speechable_text(markdown_text)

    if not speech_text.strip():
        return {"error": "No speechable content found."}

    filename = f"output/speech_{uuid.uuid4().hex}.mp3"
    # Use the detected language for TTS
    print("Lang:",detected_lang)
    tts = gTTS(text=speech_text, lang=detected_lang)
    tts.save(filename)

    return FileResponse(path=filename, filename=filename, media_type='audio/mpeg')
