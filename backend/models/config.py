import os
from dotenv import load_dotenv
import redis

load_dotenv('config.env', override=True)  # Always try to load from config.env

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY')  
    MONGO_URI = os.environ.get('MONGO_URI')
    REDIS_URL = os.environ.get('SESSION_REDIS')



    SESSION_TYPE = os.environ.get('SESSION_TYPE')
    SESSION_PERMANENT = os.environ.get('SESSION_PERMANENT') == 'True'
    SESSION_USE_SIGNER = os.environ.get('SESSION_USE_SIGNER') == 'True'
    SESSION_REDIS = redis.from_url(os.environ.get('SESSION_REDIS'))
    SESSION_COOKIE_SAMESITE = os.environ.get('SESSION_COOKIE_SAMESITE')
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE') == 'True'

