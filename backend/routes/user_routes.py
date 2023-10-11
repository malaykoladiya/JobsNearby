from flask import Flask, request, jsonify, redirect, session
from app import app
from models.user import User
from flask_login import logout_user, login_required, login_user, current_user
from app import bcrypt
from app import db
import pymongo
import datetime
from bson import ObjectId
import traceback

@app.route('/user/signup', methods = ['POST'])
def user_signup():
    """
    requst body format:

    {
        "first_name": "user first name",
        "last_name": "user last name",
        "email": "user email",
        "user_name": "user_name",
        "password": "user password"
    }
    """
    if request.method == 'POST':
        if request.json is not None and bool(request.json):
            data = request.json
        
        passhash = bcrypt.generate_password_hash(data["password"]).decode('utf-8')
        data.pop("password")
        data["password"] = passhash
        
        try:
            db.user.insert_one(data)
            user = User(data)
            session['user_type'] = 'user'
            login_user(user)
            return jsonify({"message": "Job Seeker Signup Successful!"}), 200
        except pymongo.errors.DuplicateKeyError:
            return jsonify({"error": "Email already in use"}), 400


@app.route('/user/logout')
@login_required
def user_logout():
    logout_user()
    session.clear()
    return jsonify({"message": "Successfully Logout"})
    # return redirect('/user/login')


@app.route('/user/login', methods=['POST'])
def user_login():
    """
    requst body format:

    {
        "email": "user email",
        "password": "user password"
    }
    """
    if request.method == 'POST':
        if request.json is not None and bool(request.json):
            data = request.json

        user_data = db.user.find_one({"email": data.get("email")})
        
        if user_data and bcrypt.check_password_hash(user_data['password'], data['password']):
            session['user_type'] = 'user'
            login_user(User(user_data))
            return jsonify({"message": "Job Seeker Login Successful"}), 200
        else:    
            return jsonify({"error": "Invalid credentials"}), 401


@app.route('/user/profile', methods = ['GET', 'POST'])
@login_required
def user_profile():
    if request.method == "GET":    
        user_data = db.user.find_one({'_id': ObjectId(current_user._id)})
        if user_data:
            user_data.pop('password', None)
            user_data.pop('_id', None)
            return jsonify(user_data), 200
        else:
            return jsonify({"error": "Job Seeker not found"}), 404
        
    elif request.method == 'POST':
        """
        requst body format:

        {
            "first_name": "user first name",
            "lasst_name": "user last name",
            "email": "user email",
            "user_name": "user_name
            #add other fields
        }
        """
        if request.json is not None and bool(request.json):
            data = request.json

        existing_user_data = db.user.find_one({'_id': ObjectId(current_user._id)})

        if existing_user_data:
            for key,value in data.items():
                if key!= 'password' and key in existing_user_data:
                    existing_user_data[key] = value
            
            db.user.update_one(
                {'_id': ObjectId(current_user._id)},
                {'$set': existing_user_data}
            )
            return jsonify({"message": "Job Seeker Profile updated seccessfully"})
        else:
            return jsonify({"error": "Job Seeker not found"}), 404
        

@app.route('/user/updatepassword', methods = ['POST'])
@login_required
def update_password():
    """
    requst body format:

    {
        "old_password": "old user password"
        "new_password": "new user password"
    }
    """
    try:
        if request.json is None or not bool(request.json):
            return jsonify({"error": "Bad Request"}), 400
        
        data = request.json
        old_password = data.get("old_password")
        new_password = data.get("new_password")
        
        if not old_password or not new_password:
            return jsonify({"error": "Both old and new password are required"}), 400
        
        
        existing_user_data = db.user.find_one({'_id': ObjectId(current_user._id)})
        
        if existing_user_data:

            if not bcrypt.check_password_hash(existing_user_data['password'], old_password):
                return jsonify({"error": "Old password is incorrect"}), 401
            
            new_pass_hash = bcrypt.generate_password_hash(new_password, rounds=12).decode('utf-8')

            db.user.update_one(
                {'_id': ObjectId(current_user._id)},
                {'$set': {'password': new_pass_hash}}
            )
            return jsonify({"message": "Paassword updates sucessfully"}), 200
        else:
            return jsonify({"error": "Job Seeker not found"}), 404
    except pymongo.errors.PyMongoError as e:
        print("Unexcepted error: ", e)
        traceback.print_exc()
        return jsonify({"error": "An error occured while updating password. Please try again later"}), 500


##optimize the search route
@app.route('/user/searchjobs', methods = ['GET'])
@login_required
def search_jobs():
     keyword = request.args.get('keyword')
     page = int(request.args.get('page', 1))
     limit = int(request.args.get('limit', 10))

     if keyword:
         jobs_cursor = db.jobs.find({"$text": {"$search": keyword}}).skip((page-1)*limit(limit))
     else: 
         jobs_cursor = db.jobs.find().sort([("_id", 1)]).skip((page-1)*limit(limit))
     
     total_jobs = jobs_cursor.count()

     job_list = [job for job in jobs_cursor]

     return jsonify({
         "total": total_jobs,
         "page": page,
         "limit": limit,
         "data": job_list
     })

@app.route('/user/applyjobs/<job_id>', methods = ['POST'])
@login_required
def apply_jobs(job_id):
     user_id = current_user._id
     
     existing_application = db.applications.find_one({
         "user_id": ObjectId(user_id),
         "job_id": ObjectId(job_id)
     })

     if existing_application:
         return jsonify({"message": "You have already applied for this job!"}), 400

     application = {
          "user_id": ObjectId(user_id),
          "job_id": job_id,
          "applied_on": datetime.datetime.utcnow(),
          "status" : "applied"
     }
     db.applications.insert_one(application)
     
     return jsonify({"message": "Successfully applied for the job!"})

@app.route('/user/appliedjobs', methods = ['GET'])
def applied_jobs():
    return 1

