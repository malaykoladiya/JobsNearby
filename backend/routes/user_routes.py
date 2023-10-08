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
            name = request.json.get('name')
            email = request.json.get('email')
            password = request.json.get('password')
            
            passhash = bcrypt.generate_password_hash(password).decode('utf-8')
            
            
            user_data = {
                'name': name,
                'email': email,
                'password': passhash
            }
            try:
                db.user.insert_one(user_data)
            except pymongo.errors.DuplicateKeyError:
                return jsonify({"error": "Email already in use"}), 400

            user = User(user_data)
            session['user_type'] = 'user'
            login_user(user)
            return jsonify({"message": "Job Seeker Signup Successful!"}), 200


@app.route('/user/logout')
@login_required
def user_logout():
    if current_user.is_authenticated:
        logout_user()
        session.clear()
        return jsonify({"message": "Successfully Logout"})
    return redirect('/user/login')


@app.route('/user/login', methods=['GET','POST'])
def user_login():
    if request.method == 'POST':
        email = request.json.get('email')
        password = request.json.get('password')

        user_data = db.user.find_one({'email': email})
        
        if user_data and bcrypt.check_password_hash(user_data['password'], password):
            user_obj = User(user_data)
            session['user_type'] = 'user'
            login_user(user_obj)
            return jsonify({"message": "Job Seeker Login Successful"}), 200
        else:    
            return jsonify({"error": "Invalid credentials"}), 401
    
    elif request.method == 'GET':
            return jsonify({"message": "This is the login page"}), 200


@app.route('/user/profile', methods = ['GET', 'POST'])
@login_required
def user_profile():
    if request.method == "GET":
        trait = ['name', 'email']
        return jsonify({trt:getattr(current_user, trt) for trt in trait})
        
    elif request.method == 'POST':
        possible_fields = ['name', 'email', 'password']
        
        update_fields = {field: request.json.get(field) for field in possible_fields if request.json.get(field)}

        #Handling password
        password = request.json.get('password')
        if password:
            hashedPassword = bcrypt.generate_password_hash(password).decode('utf-8')
            update_fields['password'] = hashedPassword
        
        if update_fields:
            db.user.update_one(
                {'_id': ObjectId(current_user.id)},
                {'$set': update_fields}
            )

        return jsonify({"message": "Job Seeker Profile updated seccessfully"})


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
     return jsonify({"message": "Successfully applied for the job!"})