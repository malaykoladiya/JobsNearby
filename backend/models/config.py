import os
from dotenv import load_dotenv

load_dotenv('config.env', override=True)  # Always try to load from config.env

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY')  
    MONGO_URI = os.environ.get('MONGO_URI')
