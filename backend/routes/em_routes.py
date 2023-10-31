from flask import Flask, request, jsonify, redirect, session
from app import app
from models.employer import Employer
from flask_login import logout_user, login_required, login_user, current_user
from app import bcrypt
from app import db
import pymongo
from bson import ObjectId
import traceback
from utils.utils import validate_password, is_valid_email


"""
need to make changes in signup route

        1. when singing up check first if the passwrod format is valid, then check for correct/incorrect password

"""
@app.route('/api/employer/signup', methods = ['POST'])
def em_signup():
    """
    This function handles the employer signup process.
    It accepts a POST request with a JSON object containing the employer's name, email, and password.
    The password is hashed using bcrypt and the employer's data is inserted into the database.
    If the signup is successful, the employer is logged in and a success message is returned.
    If the email is already in use, an error message is returned.
    """
    if request.method == 'POST':
        if request.json is not None and bool(request.json):
            data = request.json  
        else:
            return jsonify({"error": "invalid request format"}),  400
        
        data["email"] = data["email"].lower()
        
        #validate email
        if not is_valid_email(data.get("email", "")):
            return jsonify({"error": "Invalid email format"}), 400
        
        if not validate_password(data.get("password", "")):
            return jsonify({"error": "Invalid password format or weak password"}), 400
        
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


@app.route('/api/employer/logout')
@login_required
def em_logout():
    """
    Logs out the authenticated employer user and clears the session.

    Returns:
        A JSON response with a success message if the logout is successful.
        Otherwise, redirects to the employer login page.
    """
    if current_user.is_authenticated:
        logout_user()
        session.clear()
        return jsonify({"message": "Successfully Logout"})
    return redirect('/employer/login')


"""
need to make changes in login route
        1. validate email. when getting email for request.json check first for if it is valid or not than check if the user exisit in the db
        2. when logging in check first if the passwrod format is valid, then check for correct/incorrect password
"""

@app.route('/api/employer/login', methods=['POST'])
def em_login():
    """
    Endpoint for employer login.

    Request body format:
    {
        "email": "employer email",
        "password": "employer password"
    }

    Returns:
    - If login is successful, returns a JSON object with a success message and a 200 status code.
    - If login fails, returns a JSON object with an error message and a 401 status code.
    """
    if request.method == 'POST':
        if request.json is not None and bool(request.json):
            data = request.json

        email_lower = data.get("email", "").lower()
        # Find the employer based on the email
        em_data = db.employer.find_one({"email": email_lower})
    
        if em_data and bcrypt.check_password_hash(em_data['password'], data["password"]):
            session['user_type'] = 'employer'
            login_user(Employer(em_data))
            return jsonify({"message": "Employer Login Successful"}), 200
        else:
            return jsonify({"error" : "Invalid credentials!"}), 401


@app.route('/api/employer/profile', methods = ['GET', 'PUT'])
@login_required
def employer_profile():
    """
    This function handles GET and POST requests for employer profile.
    GET request returns the employer data.
    POST request updates the employer data.

    :return: JSON response with employer data or error message.
    """

    if request.method == "GET":    
        # Get employer data from the database
        employer_data = db.employer.find_one({'_id': ObjectId(current_user._id)})
        if employer_data:
            # Remove sensitive data from the employer data
            employer_data.pop('password', None)
            employer_data.pop('_id', None)
            return jsonify(employer_data), 200
        else:
            return jsonify({"error": "Employer not found"}), 404
        
    elif request.method == 'PUT':
        """
        requst body format:

        {
            "name": "employer name",
            "email": "employer email",
            #add other fields
        }
        """

        # Get the request data
        if request.json is not None and bool(request.json):
            data = request.json

        # Get existing employer data from the database
        existing_employer_data = db.employer.find_one({'_id': ObjectId(current_user._id)})

        if existing_employer_data:
            # Update the existing employer data with the new data
            for key,value in data.items():
                if key!= 'password':
                    existing_employer_data[key] = value
            
            # Update the employer data in the database
            db.employer.update_one(
                {'_id': ObjectId(current_user._id)},
                {'$set': existing_employer_data}
            )
            return jsonify({"message": "Employer Profile updated seccessfully"})
        else:
            return jsonify({"error": "Employer not found"}), 404


@app.route('/api/employer/updatepassword', methods = ['PUT'])
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
   

@app.route('/api/employer/postjob', methods = ['POST'])
@login_required
def post_jobs():
    """
    This function allows employers to post jobs on the platform. 
    It checks if the user is an employer and then extracts the job data from the request body.
    The job data is then inserted into the database. 

    Args:
        None

    Returns:
        A JSON response indicating whether the job was posted successfully or not.
    """
    
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

    if request.json is not None and bool(request.json):
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
    except pymongo.errors.DuplicateKeyError:
        return jsonify({'message':'This Job ID already exists'}), 400
    except pymongo.errors.PyMongoError as e:
        return jsonify({"error": "An error occured while posting the job. Please try again later"}), 500


@app.route('/api/employer/viewjobs', methods = ['GET'])
@login_required
def view_all_jobs():
    """
    This function returns all the jobs posted by the employer who is currently logged in.
    It only sends necessary data to the front end.
    """
    if not session.get('user_type') == 'employer':
        # If the user is not an employer, return an error message with status code 403.
        return jsonify({"error": "Access denied! Only employers can view their posted jobs"}), 403
    
    try:
        # Find all the jobs posted by the current employer.
        jobs_cursor = db.jobs.find({'employer_id': ObjectId(current_user._id)})
        
        if not jobs_cursor:
            # If no jobs are found, return an error message with status code 404.
            return jsonify({"error": "No jobs found"}), 404


        # only send necesary data to the front end
        job_data_list= []
        for job in jobs_cursor:
            # Extract only the necessary data from each job and append it to the job_list.
            job_data = {
                "req_id" : job.get("req_id"),
                "company_name": job.get('company_name'),
                "job_title" : job.get("job_title"),
                "job_description" : job.get("job_description"),
                "job_requirements" : job.get("job_requirements")
            }
            job_data_list.append(job_data)
        
        # Return the job_list with status code 200.
        return jsonify({"jobs": job_data_list}), 200
    
    except pymongo.errors.PyMongoError as e:
        # If an error occurs while fetching jobs, return an error message with status code 500.
        return jsonify({"error": f"An error occured while fetching jobs. Please try again later: {str(e)}"}), 500


@app.route('/api/employer/viewjobs/<job_id>', methods = ['GET'])
@login_required
def employer_job(job_id):
    """
    This function is used to fetch the details of a job posted by an employer.
    It takes in a job_id as a parameter and returns the job details along with the list of applicants who have applied for the job.

    Args:
        job_id (str): The id of the job to be fetched.

    Returns:
        A JSON response containing the job details and the list of applicants who have applied for the job.
    """
    
    if not session.get('user_type') == 'employer':
        return jsonify({"error": "Access denied! Only employers can view their posted jobs"}), 403
    
    try:
        job = db.jobs.find_one({'_id': ObjectId(job_id) , 'employer_id': ObjectId(current_user._id)})
        if not job:
            return jsonify({"error": "Job not found"}), 404


        #Fetching the application for the job
        appli = db.applications.find({'job_id': ObjectId(job_id)})
        applicants_data = []

        for application in appli:
            applicant_id = application.get("user_id")
            applicant = db.user.find_one({'_id': ObjectId(applicant_id)})
            if applicant:
                applicant_data = {
                    "user_id" : str(applicant.get("_id")),
                    "name": applicant.get("name"),
                    "email": applicant.get("email")
                }
                applicants_data.append(applicant_data)
            print(applicants_data)
        job_data = {
            "req_id" : job.get("req_id"),
            "company_name": job.get('company_name'),
            "job_title" : job.get("job_title") ,
            "job_description" : job.get("job_description"),
            "job_requirements" : job.get("job_requirements"),
            "applicants": applicants_data
        }
        
        return jsonify(job_data), 200
    except pymongo.errors.PyMongoError as e:
        return jsonify({"error": f"An error occured while fetching job details. Please try again later. {str(e)}"}), 500


@app.route('/api/employer/deletejob/<job_id>', methods = ['DELETE'])
@login_required
def delete_jobs(job_id):
    """
    This function deletes a job and its related applications from the database.

    Args:
        job_id (str): The ID of the job to be deleted.

    Returns:
        A JSON response containing a success or error message.

    Raises:
        400 Bad Request: If job_id is not provided.
        403 Forbidden: If the user is not an employer.
        404 Not Found: If the job with the given job_id is not found.
        500 Internal Server Error: If an error occurs while deleting the job.
    """
    # Check if the user is an employer
    if not session.get('user_type') == 'employer':
        return jsonify({"error": "Access Denied, Only employers can delete jobs"}), 403
    
    # Check if job_id is provided
    if not job_id:
        return jsonify({"error": "Job ID Required"}), 400
    
    try:
        # Find the job with the given job_id and employer_id
        job = db.jobs.find_one({'_id': ObjectId(job_id), 'employer_id': ObjectId(current_user._id) })
        
        # If job is not found, return 404 Not Found error
        if not job:
            return jsonify({"error": "Job not found"}), 404
        
        # Delete the job from the database
        db.jobs.delete_one({'_id': ObjectId(job_id)})
        
        # Delete all the applications related to the job from the database
        db.applications.delete_many({'job_id': ObjectId(job_id)})
        
        # Return success message
        return jsonify({"message": "Job and its related applications are deleted sucessfully!"}), 200
    
    except pymongo.errors.PyMongoError as e:
        # Return 500 Internal Server Error if an error occurs while deleting the job
        return jsonify({"error": "An error occured while deleting the job. Please try again later"}), 500