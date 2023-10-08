from flask import Flask, render_template, redirect, jsonify, session
from functools import wraps
from pymongo import MongoClient
from flask_login import LoginManager
from flask_login import logout_user, login_required, login_user, current_user
from flask_bcrypt import Bcrypt
from bson.objectid import ObjectId  # Import ObjectId to work with MongoDB Object IDs
from models.user import User
from models.employer import Employer




app = Flask(__name__)
app.secret_key = b'v(j\x07\x9c^e\xe4\xab\x06r\x88\xb4\xde\x0eY'
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





# MongoDB databse
client = MongoClient('localhost', 27017)
db = client['jobsnearby']

#creating Index
db.jobs.create_index("job_id", unique=True)
db.user.create_index("email", unique = True)
db.employer.create_index("email", unique = True)

#routes
from routes import user_routes, em_routes

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/dashboard/')
@login_required
def dashboard():
    return render_template('dashboard.html')