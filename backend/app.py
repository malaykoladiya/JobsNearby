from flask import Flask, redirect, jsonify, session, url_for, request, send_from_directory
from pymongo import MongoClient, errors
from flask_login import LoginManager
from flask_login import logout_user, login_required, login_user, current_user
from flask_session import Session
from flask_bcrypt import Bcrypt
from bson.objectid import ObjectId  # Import ObjectId to work with MongoDB Object IDs
from models.jobSeeker_model import JobSeeker
from models.employer_model import Employer
from models.config import Config
from flask_cors import CORS
import logging
import os
import awsgi 

"""
Making Log directory and logging data
"""
# Ensure the directory exists
LOG_DIR = '/tmp/logs'
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# Set up logging
log_file_path = os.path.join(LOG_DIR, 'app.log')
handlers = [logging.FileHandler(filename=log_file_path), logging.StreamHandler()]
# logging.basicConfig(level=logging.INFO, format='%(asctime)s:%(levelname)s:%(message)s', handlers=handlers)


"""
Flask Application
"""
app = Flask(__name__)


CORS(app, supports_credentials=True)
app.config.from_object(Config)
server_session = Session(app)


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
    logging.error("Invalid MongoDB URI:")
    raise uri_err
except errors.ConfigurationError as err:
    logging.error("Configuration error:")
    raise err
except Exception as e:
    logging.error("An error occurred:")
    raise e

#creating Index
db.user.create_index("jobSeekerEmail", unique = True)
db.employer.create_index("employerEmail", unique = True)
db.jobs.create_index([
    ("jobTitle", "text"),
    ("jobDescription", "text"),
    ("jobQualifications", "text"),
    ("jobSkills", "text"),
    ("companyName", "text"),
    ("companyDescription", "text"),
    ("jobCategory", "text"),
    ("employmentType", "text"),
    ("companyIndustry", "text")
])

app.secret_key = app.config["SECRET_KEY"]
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)

login_manager.login_view = "login"


@login_manager.unauthorized_handler
def unauthorized():
    # Check for user type from session or any other relevant source
    user_type = session.get('user_type')

    # Based on user type, redirect to appropriate login page
    if user_type == 'jobSeeker':
        return redirect(url_for('user_login'))
    elif user_type == 'employer':
        return redirect(url_for('em_login'))
    else:
        return jsonify({"error": "Unauthorized"}), 401



@login_manager.user_loader
def load_user(id):
    if session.get('user_type') == 'jobSeeker':
        user_data = db.user.find_one({'_id': ObjectId(id)})
        if user_data:
            return JobSeeker(user_data)
    elif session.get('user_type') == 'employer':
        employer_data = db.employer.find_one({'_id': ObjectId(id)})
        if employer_data:
            return Employer(employer_data)
    return None


#routes
from routes import user_routes, em_routes

    

@app.route('/api/current_user', methods=['GET'])
@login_required
def get_current_user():
    """
    Endpoint to get the current user's information based on the session.
    Returns a minimal response with user type if logged in, otherwise 401 Unauthorized.
    """
    if current_user.is_authenticated:
        # Here we assume 'user_type' is stored in the session when the user logs in.
        user_type = session.get('user_type', 'unknown')
        
        
        # Return basic user information, primarily the user type.
        # You can add more fields as needed based on your application's requirements.
        return jsonify({
            "authenticated": True,
            "currentUserType": user_type,
            "message": "User is authenticated."
        }), 200
    else:
        # The login_required decorator will typically prevent reaching this point 
        # as it will handle unauthorized access.
        return jsonify({
            "authenticated": False,
            "currentUserType": "unknown",
            "message": "User is not authenticated."
        }), 401

@app.route('/api/')
def home():
    latest_jobs = db.jobs.find().limit(10)
    job_list = [job for job in latest_jobs]

    return jsonify(jobs=job_list), 200

@app.route('/api/dashboard/')
@login_required
def dashboard():
    user_type = session.get('user_type')

    if user_type == 'jobSeeker':
        applied_jobs = db.user.find()
        return jsonify(applied_jobs = [job for job in applied_jobs]), 200
    
    elif user_type == 'employer':
        posted_jobs = db.jobs.find()
        return jsonify(posted_jobs = [job for job in posted_jobs]), 200


# Health Check Endpoint
@app.route('/', methods=['GET'])
def health_check():
    """
    Endpoint to check the health of the Flask application.
    Returns a simple response indicating the health status.
    """
    return jsonify({"status": "OK"}), 200
 
    

def lambda_handler(event, context):
    # Pass Lambda event and context to awsgi.response() function
    # This function adapts the Lambda event into a WSGI environment dictionary
    # and invokes the Flask application (app) to handle the request
    print("Received event:", event)
    return awsgi.response(app, event, context)
    

# if __name__ == '__main__':
#     # Run the Flask application on port 8000
#     app.run(host='0.0.0.0', port=8000)