from gtts import gTTS
from bs4 import BeautifulSoup
from markdown import markdown
import nltk
from nltk.tokenize import sent_tokenize
from langdetect import detect
from utils import *

def markdown_to_plain_text(md: str) -> str:
    # Convert Markdown to HTML, then HTML to plain text
    html = markdown(md)
    soup = BeautifulSoup(html, features="html.parser")
    return soup.get_text()

def extract_speechable_text(md: str) -> tuple:
    """
    Extract text for speech synthesis and auto-detect language
    Returns a tuple (text, language_code)
    """
    plain_text = markdown_to_plain_text(md)
    sentences = sent_tokenize(plain_text)
    speech_text = " ".join(sentences)
    
    # Auto-detect language if there's enough text
    language = "en"  # default to English
    if len(speech_text.strip()) > 10:  # Need a minimum amount of text for reliable detection
        try:
            language = detect(speech_text)
        except:
            # If detection fails, fall back to English
            language = "en"
    
    return speech_text, language