import nltk
from nltk.tokenize import word_tokenize

nltk.download('punkt')

def tokenize(text: str):
    return word_tokenize(text.lower())
