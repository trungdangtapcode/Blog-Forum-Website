from gtts import gTTS
from bs4 import BeautifulSoup
from markdown import markdown
import nltk
from nltk.tokenize import sent_tokenize
from utils import *

def markdown_to_plain_text(md: str) -> str:
    # Convert Markdown to HTML, then HTML to plain text
    html = markdown(md)
    soup = BeautifulSoup(html, features="html.parser")
    return soup.get_text()

def extract_speechable_text(md: str) -> str:
    plain_text = markdown_to_plain_text(md)
    sentences = sent_tokenize(plain_text)
    speech_text = " ".join(sentences)
    return speech_text