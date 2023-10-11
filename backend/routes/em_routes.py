from flask import Flask, request, jsonify, redirect, session
from app import app
from models.employer import Employer
from flask_login import logout_user, login_required, login_user, current_user
from app import bcrypt
from app import db
import pymongo
from bson import ObjectId
import traceback

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
        employer_data = db.employer.find_one({'_id': ObjectId(current_user._id)})
        if employer_data:
            employer_data.pop('password', None)
            employer_data.pop('_id', None)
            return jsonify(employer_data), 200
        else:
            return jsonify({"error": "Employer not found"}), 404
        
    elif request.method == 'POST':
        """
        requst body format:

        {
            "name": "employer name",
            "email": "employer email",
            #add other fields
        }
        """

        if request.json is not None and bool(request.json):
            data = request.json
        existing_employer_data = db.employer.find_one({'_id': ObjectId(current_user._id)})

        if existing_employer_data:
            for key,value in data.items():
                if key!= 'password' and key in existing_employer_data:
                    existing_employer_data[key] = value
            
            db.employer.update_one(
                {'_id': ObjectId(current_user._id)},
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
    try:
        if request.json is None or not bool(request.json):
            return jsonify({"error": "Bad Request"}), 400
            
        data = request.json
        old_password = data.get("old_password")
        new_password = data.get("new_password")
        
        if not old_password or not new_password:
            return jsonify({"error": "Both old and new password are required"}), 400
        
        existing_employer_data = db.employer.find_one({'_id': ObjectId(current_user._id)})
        
        if existing_employer_data:

            if not bcrypt.check_password_hash(existing_employer_data['password'], old_password):
                return jsonify({"error": "Old password is incorrect"}), 401
            
            new_pass_hash = bcrypt.generate_password_hash(new_password, rounds=12).decode('utf-8')

            db.employer.update_one(
                {'_id': ObjectId(current_user._id)},
                {'$set': {'password': new_pass_hash}}
            )
            return jsonify({"message": "Paassword updates sucessfully"}), 200
        else:
            return jsonify({"error": "Employer not found"}), 404
    except pymongo.errors.PyMongoError as e:
        print("Unexcepted error: ", e)
        traceback.print_exc()
        return jsonify({"error": "An error occured while updating password. Please try again later"}), 500
   

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

    if request.json is not None or bool(request.json):
        data = request.json
    

    job_data = {
        "req_id" : data.get('req_id'),
        "company_name": data.get('company_name'),
        "employer_id": ObjectId(current_user._id),
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
def view_all_jobs():
    if not session.get('user_type') == 'employer':
        return jsonify({"error": "Access denied! Only employers can view their posted jobs"}), 403
    
    try:
        jobs = db.jobs.find({'employer_id': ObjectId(current_user._id)})

        if not jobs:
            return jsonify({"error": "No jobs found"}), 404

        # only send necesary data to the front end
        job_list= []
        for job in jobs:
            job_data = {
                "req_id" : jobs.get("req_id"),
                "company_name": jobs.get('comapny_name'),
                "job_title" : jobs.get("job_title") ,
                "job_description" : jobs.get("job_description"),
                "job_requirements" : jobs.get("job_requirements"),
            }
            job_list.append(job_data)
        
        return jsonify({"jobs": job_list}), 200
    
    except pymongo.errors.PyMongoError as e:
        return jsonify({"error": "An error occured while fetching jobs. Please try again later"}), 500

@app.route('/employer/viewjobs/<job_id>', methods = ['GET'])
@login_required
def employer_job(job_id):
    if not session.get('user_type') == 'employer':
        return jsonify({"error": "Access denied! Only employers can view their posted jobs"}), 403
    
    try:
        jobs = db.jobs.find({'_id': ObjectId(job_id) , 'employer_id': ObjectId(current_user._id)})

        if not jobs:
            return jsonify({"error": "Job not found"}), 404

        

        #Fetching the application for the job
        applications = db.applications.find({'job_id': ObjectId(job_id)})
        applicants_data = []

        for application in applications:
            applicant_id = application.get("user_id")
            applicant = db.user.find_one({'_id': ObjectId(applicant_id)})
            if applicant:
                applicant_data = {
                    "user_id" : str(applicant.get("_id")),
                    "first_name": applicant.get("first_name"),
                    "last_name": applicant.get("last_name"),
                    "email": applicant.get("email")
                }
                applicants_data.append(applicant_data)
        
        job_data = {
            "req_id" : jobs.get("req_id"),
            "company_name": jobs.get('comapny_name'),
            "job_title" : jobs.get("job_title") ,
            "job_description" : jobs.get("job_description"),
            "job_requirements" : jobs.get("job_requirements"),
            "applicants": applicants_data
        }
        
        return jsonify({job_data}), 200
    except pymongo.errors.PyMongoError as e:
        return jsonify({"error": "An error occured while fetching job details. Please try again later."}), 500
    
@app.route('/employer/deletejob/<job_id>', methods = ['DELETE'])
@login_required
def delete_jobs(job_id):
    if not session.get('user_type') == 'employer':
        return jsonify({"error": "Access Denied, Only employers can delete jobs"}), 403
    
    if not job_id:
        return jsonify({"error": "Job ID Required"}), 400
    
    try:
        job = db.jobs.find_one({'_id': ObjectId(job_id), 'employer_id': ObjectId(current_user.id) })
        
        if not job:
            return jsonify({"error": "Job not found"}), 404
        
        db.job.delete_one({'_id': ObjectId(job_id)})
        
        db.applications.delete_many({'job_id': ObjectId(job_id)})
        
        return jsonify({"message": "Job and its related applications are deleted sucessfully!"}), 200
    
    except pymongo.errors.PyMongoError as e:
        return jsonify({"error": "An error occured while deleting the job. Please try again later"}), 500