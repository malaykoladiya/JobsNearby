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
    """
    requst body format:

    {
        "name": "employer name",
        "email": "employer email",
        "password": "employer password"
    }
    """
    if request.method == 'POST':
        if request.json is not None and bool(request.json):
            data = request.json  
        
        passhash = bcrypt.generate_password_hash(data["password"]).decode('utf-8')
        data.pop("password")
        data["password"] = passhash
        
        
        try:
            db.employer.insert_one(data)
            employer = Employer(data)
            session['user_type'] = 'employer'
            login_user(employer)
            return jsonify({"message": "Employer Signup Successful!"}), 200
        except pymongo.errors.DuplicateKeyError:
            return jsonify({"error": "Email already in use"}), 400


@app.route('/employer/logout')
@login_required
def em_logout():
    if current_user.is_authenticated:
        logout_user()
        session.clear()
        return jsonify({"message": "Successfully Logout"})
    return redirect('/employer/login')


@app.route('/employer/login', methods=['POST'])
def em_login():
    """
    requst body format:

    {
        "email": "employer email",
        "password": "employer password"
    }
    """
    if request.method == 'POST':
        if request.json is not None and bool(request.json):
            data = request.json

        # Find the user based on the email
        em_data = db.employer.find_one({"email": data.get("email")})
    
        if em_data and bcrypt.check_password_hash(em_data['password'], data["password"]):
            session['user_type'] = 'employer'
            login_user(Employer(em_data))
            return jsonify({"message": "Employer Login Successful"}), 200
        else:
            return jsonify({"error" : "Invalid credentials!"}), 401


@app.route('/employer/profile', methods = ['GET', 'POST'])
@login_required
def employer_profile():
    if request.method == "GET":    
        em_trait = ['name', 'email']
        return jsonify({em_trt: getattr(current_user,em_trt) for em_trt in em_trait})
        
    elif request.method == 'POST':
        """
        requst body format:

        {
            "name": "employer name",
            "email": "employer email",
            "password": "employer password"
            #add other fields
        }
        """

        if request.json is not None and bool(request.json):
            data = request.json
        existing_employer_data = db.employer.find_one({'_id': ObjectId(current_user.id)})

        if existing_employer_data:
            for key,value in data.items():
                if key!= 'password' and key in existing_employer_data:
                    existing_employer_data[key] = value
            
            db.employer.update_one(
                {'_id': ObjectId(current_user.id)},
                {'$set': existing_employer_data}
            )
            return jsonify({"message": "Employer Profile updated seccessfully"})
        else:
            return jsonify({"error": "Employer not found"}), 404


@app.route('/employer/updatepassword', methods = ['POST'])
@login_required
def em_update_password():
    """
    requst body format:

    {
        "old_password": "old employer password"
        "new_password": "new employer password"
    }
    """
    if request.json is not None and bool(request.json):
        data = request.json()
    
    existing_employer_data = db.employer.find_one({'_id': ObjectId(current_user.id)})
    
    if existing_employer_data:
        old_password = data.get('old_password')

        if old_password and not bcrypt.check_password_hash(existing_employer_data['password'], old_password):
            return jsonify({"error": "Old password is incorrect"}), 401
        
        new_password = data.get('new_password')
        new_pass_hash = bcrypt.check_password_hash(new_password).decode('utf-8')
        existing_employer_data['password'] = new_pass_hash

        db.employer.update_one(
            {'_id': ObjectId(current_user.id)},
            {'$set': {'password': existing_employer_data['password']}}
        )
        return jsonify({"message": "Paassword updates sucessfully"}), 200
    else:
        return jsonify({"error": "Employer not found"}), 404

    

@app.route('/employer/postjob', methods = ['POST'])
@login_required
def post_jobs():

    # Check if the user is an employer
    if not session.get('user_type') == 'employer':
        return jsonify({"error": "Acess denied! Only employers can post jobs."}), 403
    
    """
        requst body format:

        {
            "req_id": "req id",
            "company_name": "comapny name"
            "job_title": "job title",
            "job_description": "job description"
            "job_requirement": "job requirement"
            #add other fields
        }
    """

    if request.json() != None or request.json() != "":
        data = request.json()
    

    job_data = {
        "req_id" : data.get('req_id'),
        "company_name": data.get('comapny_name'),
        "employer_id": ObjectId(current_user.id),
        "job_title" : data.get('job_title'),
        "job_description" : data.get('job_description'),
        "job_requirements" : data.get('job_requirement'),
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
                "req_id" : job.get("req_id"),
                "company_name": job.get('comapny_name'),
                "job_title" : job.get("job_title") ,
                "job_description" : job.get("job_description"),
                "job_requirements" : job.get("job_requirements"),
                "applicants": job.get("applicants", [])
            }
            job_list.append(job_data)
        return jsonify({"jobs" :"job_list"}), 200
    except pymongo.errors.PyMongoError as e:
        return jsonify({"error": "An erro occured while fetching jobs. Please try again later."}), 500