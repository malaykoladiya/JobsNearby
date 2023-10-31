from flask import Flask, render_template, redirect, jsonify, session
from pymongo import MongoClient, errors
from flask_login import LoginManager
from flask_login import logout_user, login_required, login_user, current_user
from flask_bcrypt import Bcrypt
from bson.objectid import ObjectId  # Import ObjectId to work with MongoDB Object IDs
from models.user import User
from models.employer import Employer
from models.config import Config
from flask_cors import CORS
import logging
import os


"""
Making Log directory and logging data
"""
# Ensure the directory exists
LOG_DIR = 'logs'
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# Set up logging
log_file_path = os.path.join(LOG_DIR, 'app.log')
handlers = [logging.FileHandler(filename='logs/app.log'), logging.StreamHandler()]
logging.basicConfig(level=logging.INFO, format='%(asctime)s:%(levelname)s:%(message)s', handlers=handlers)


"""
Flask Application
"""
app = Flask(__name__)


CORS(app)
app.config.from_object(Config)

SECRET_KEY = os.environ.get('SECRET_KEY')
MONGO_URI = os.environ.get('MONGO_URI')

if not app.config["SECRET_KEY"]:
    raise ValueError("Missing Ssecret_key configuration from .env file.")
if not app.config["MONGO_URI"]:
    raise ValueError("Missing mongodb configuration from .env file.")

"""
MongoDB Connection
"""
# MongoDB databse
try:
    # Try to establish a connection with MongoDB
    client = MongoClient(app.config["MONGO_URI"], serverSelectionTimeoutMS=5000)
    client.server_info()  # Force an immediate connection attempt
    db = client['jobsnearby']
except errors.ServerSelectionTimeoutError as err:
    logging.error("Timeout error while connecting to MongoDB:", err)
    raise err
except errors.ConnectionFailure:
    logging.error("Failed to connect to MongoDB. Ensure that the server is running.")
    raise
except errors.InvalidURI as uri_err:
    logging.error("Invalid MongoDB URI:", uri_err)
    raise uri_err
except errors.ConfigurationError as err:
    logging.error("Configuration error:", err)
    raise err
except Exception as e:
    logging.error("An error occurred:", e)
    raise e

#creating Index
db.user.create_index("email", unique = True)
db.employer.create_index("email", unique = True)
db.jobs.create_index([("title", "text"), ("description", "text")])

app.secret_key = app.config["SECRET_KEY"]
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
@login_manager.user_loader
def load_user(id):
    if session['user_type'] == 'user':
        user_data = db.user.find_one({'_id': ObjectId(id)})
        if user_data:
            return User(user_data)
    elif session['user_type'] == 'employer':
        employer_data = db.employer.find_one({'_id': ObjectId(id)})
        if employer_data:
            return Employer(employer_data)
    return None


#routes
from routes import user_routes, em_routes

@app.route('/api/')
def home():
    latest_jobs = db.jobs.find().limit(10)
    job_list = [job for job in latest_jobs]

    return jsonify(jobs=job_list), 200

@app.route('/api/dashboard/')
@login_required
def dashboard():
    user_type = session.get('user_type')

    if user_type == 'user':
        applied_jobs = db.user.find()
        return jsonify(applied_jobs = [job for job in applied_jobs]), 200
    
    elif user_type == 'employer':
        posted_jobs = db.jobs.find()
        return jsonify(posted_jobs = [job for job in posted_jobs]), 200
    
