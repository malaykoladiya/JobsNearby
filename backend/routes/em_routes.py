from flask import Flask, request, jsonify, redirect, session
from app import app
from models.employer import Employer
from flask_login import logout_user, login_required, login_user, current_user
from app import bcrypt
from app import db
import pymongo
from functools import wraps
from bson import ObjectId

@app.route('/employer/signup', methods = ['POST'])
def em_signup():
    if request.method == 'POST':
        name = request.json.get('name')
        email = request.json.get('email')
        password = request.json.get('password')
            
        passhash = bcrypt.generate_password_hash(password).decode('utf-8')
            
        employer_data = {
            'name': name,
            'email': email,
            'password': passhash
            }

        try:
            db.employer.insert_one(employer_data)
        except pymongo.errors.DuplicateKeyError:
            return jsonify({"error": "Email already in use"}), 400
                
        employer = Employer(employer_data)
        session['user_type'] = 'employer'
        login_user(employer)
        return jsonify({"message": "Employer Signup Successful!"}), 200


@app.route('/employer/logout')
@login_required
def em_logout():
    if current_user.is_authenticated:
        logout_user()
        session.clear()
        return jsonify({"message": "Successfully Logout"})
    return redirect('/employer/login')


@app.route('/employer/login', methods=['GET','POST'])
def em_login():
    if request.method == 'POST':
        email = request.json.get('email')
        password = request.json.get('password')

        # Find the user based on the email
        em_data = db.employer.find_one({'email': email})
    
        if em_data and bcrypt.check_password_hash(em_data['password'], password):
            em_obj = Employer(em_data)
            session['user_type'] = 'employer'
            login_user(em_obj)
            return jsonify({"message": "Employer Login Successful"}), 200
        
        else:
            return jsonify({"error" : "Invalid credentials!"}), 401
        
    elif request.method == 'GET':    
        return jsonify({"message": "this is the employer login page"}), 200


@app.route('/employer/profile', methods = ['GET', 'POST'])
@login_required
def employer_profile():
    if request.method == "GET":    
        em_trait = ['name', 'email']
        return jsonify({em_trt: getattr(current_user,em_trt) for em_trt in em_trait})
        
    elif request.method == 'POST':
        em_possible_fields = ['name', 'email', 'password']
        em_update_fields = {em_field: request.json.get(em_field) for em_field in em_possible_fields if request.json.get(em_field)}

        #Password Handling
        em_password = request.json.get('password')
        if em_password:
            em_hashedpassword = bcrypt.generate_password_hash(em_password).decode('utf-8')
            em_update_fields['em_password'] = em_hashedpassword
        
        if em_update_fields:
            db.employer.update_one(
                {'_id': ObjectId(current_user.id)},
                {'$set': em_update_fields}
            )

        return jsonify({"message": "Employer Profile updated seccessfully"})
    

@app.route('/employer/postjob', methods = ['POST'])
@login_required
def post_jobs():

    # Check if the user is an employer
    if not session.get('user_type') == 'employer':
        return jsonify({"error": "Acess denied! Only employers can post jobs."}), 403
    
    job_title = request.json.get('job_title')
    job_description = request.json.get('job_description')
    job_requirement = request.json.get('job_requirement')
    job_id = request.json.get('job_requirement')
    

    job_data = {
        "job_id" : job_id,
        "employer_id": ObjectId(current_user.id),
        "job_title" : job_title ,
        "job_description" : job_description,
        'job_requirements' : job_requirement,
    }

    try:
        db.jobs.insert_one(job_data)
        return jsonify({"message": "Job posted Successfully!"}), 200
    except pymongo.error.DuplicateKeyError:
        return jsonify({'message':'This Job ID already exists'}), 400
    except pymongo.errors.PyMongoError as e:
        return jsonify({"error": "An error occured while posting the job. Please try again later"}), 500


@app.route('/employer/viewjobs', methods = ['GET'])
@login_required
def employer_job():
    if not session.get('user_type') == 'employer':
        return jsonify({"error": "Access denied! Only employers can view their posted jobs"}), 403
    
    try:
        jobs = db.jobs.find({'employer_id': ObjectId(current_user.id)})

        job_list = []
        for job in jobs:
            job_data = {
                "job_id" : job.get("job_id"),
                "job_title" : job.get("job_title") ,
                "job_description" : job.get("job_description"),
                "job_requirements" : job.get("job_requirements")
            }
            job_list.append(job_data)
        return jsonify({"jobs" :"job_list"}), 200
    except pymongo.errors.PyMongoError as e:
        return jsonify({"error": "An erro occured while fetching jobs. Please try again later."}), 500