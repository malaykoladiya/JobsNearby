from flask import Flask, request, jsonify, redirect, session
from app import app
from models.user import User
from flask_login import logout_user, login_required, login_user, current_user
from app import bcrypt
from app import db
import pymongo
import datetime
from bson import ObjectId

@app.route('/user/signup', methods = ['POST'])
def user_signup():
    """
    requst body format:

    {
        "name": "user name",
        "email": "user email",
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
    if current_user.is_authenticated:
        logout_user()
        session.clear()
        return jsonify({"message": "Successfully Logout"})
    return redirect('/user/login')


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
        trait = ['name', 'email']
        return jsonify({trt:getattr(current_user, trt) for trt in trait})
        
    elif request.method == 'POST':
        """
        requst body format:

        {
            "name": "user name",
            "email": "user email",
            "password": "user password"
            #add other fields
        }
        """
        if request.json is not None and bool(request.json):
            data = request.json

        existing_user_data = db.user.find_one({'_id': ObjectId(current_user.id)})

        if existing_user_data:
            for key,value in data.items():
                if key!= 'password' and key in existing_user_data:
                    existing_user_data[key] = value
            
            db.user.update_one(
                {'_id': ObjectId(current_user.id)},
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
    if request.json is not None and bool(request.json):
        data = request.json
    
    existing_user_data = db.user.find_one({'_id': ObjectId(current_user.id)})
    
    if existing_user_data:
        old_password = data['old_password']

        if old_password and not bcrypt.check_password_hash(existing_user_data['password'], old_password):
            return jsonify({"error": "Old password is incorrect"}), 401
        
        new_password = data['new_password']
        new_pass_hash = bcrypt.check_password_hash(new_password).decode('utf-8')
        existing_user_data['password'] = new_pass_hash

        db.user.update_one(
            {'_id': ObjectId(current_user.id)},
            {'$set': {'password': existing_user_data['password']}}
        )
        return jsonify({"message": "Paassword updates sucessfully"}), 200
    else:
        return jsonify({"error": "Job Seeker not found"}), 404


@app.route('/user/searchjobs', methods = ['GET'])
@login_required
def search_jobs():
     keyword = request.args.get('keyword')

     jobs = db.jobs.find({"title": {"$regex": keyword, "$options" : "i"}})

     return jsonify([job for job in jobs])


@app.route('/user/applyjobs', methods = ['POST'])
@login_required
def apply_jobs():
     job_id = request.json.get('job_id')
     user_id = current_user.id
     
     application = {
          "job_id": job_id,
          "applied_on": datetime.datetime.utcnow(),
          "status" : "applied"
     }
     db.user.update_one(
          {'_id': ObjectId(user_id)},
          {'$push' :  {'applications' : application}}
     )

     # update the job document as well
     db.jobs.update_one(
        {'_id': ObjectId(job_id)},
        {'$push' :  {'applicants' : user_id}}
    )
     
     return jsonify({"message": "Successfully applied for the job!"})