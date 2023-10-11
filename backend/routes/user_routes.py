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
    This function handles the user signup process.
    It accepts a POST request with the following JSON data:
    {
        "first_name": "user first name",
        "last_name": "user last name",
        "email": "user email",
        "user_name": "user_name",
        "password": "user password"
    }
    It then generates a password hash using bcrypt and inserts the user data into the database.
    If the email is already in use, it returns a 400 error.
    If the signup is successful, it logs in the user and returns a 200 response with a success message.
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
    """
    Logs out the user and clears the session.

    Returns:
        A JSON response with a success message.
    """
    logout_user()
    session.clear()
    return jsonify({"message": "Successfully Logout"})
    # return redirect('/user/login')


@app.route('/user/login', methods=['POST'])
def user_login():
    """
    This function handles the login request for users.
    It takes in the email and password from the request body and checks if they match with the user data in the database.
    If the credentials are valid, it logs in the user and sets the user_type in the session to 'user'.
    If the credentials are invalid, it returns an error message.

    Request Body Format:
    {
        "email": "user email",
        "password": "user password"
    }

    Returns:
    - If the login is successful, returns a success message with status code 200.
    - If the credentials are invalid, returns an error message with status code 401.
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
    """
    This function handles GET and POST requests for user profile.
    GET request returns the user profile data.
    POST request updates the user profile data.

    :return: JSON response with user profile data or error message.
    """
    if request.method == "GET":    
        # Get user data from the database
        user_data = db.user.find_one({'_id': ObjectId(current_user._id)})
        if user_data:
            # Remove sensitive information from the user data
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

        # Get existing user data from the database
        existing_user_data = db.user.find_one({'_id': ObjectId(current_user._id)})

        if existing_user_data:
            # Update the existing user data with the new data
            for key,value in data.items():
                if key!= 'password' and key in existing_user_data:
                    existing_user_data[key] = value
            
            # Update the user data in the database
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
    This function updates the password of the current user.

    Request body format:
    {
        "old_password": "old user password"
        "new_password": "new user password"
    }

    Returns:
    - If the request is invalid, returns a JSON object with an error message and a 400 status code.
    - If the old or new password is missing, returns a JSON object with an error message and a 400 status code.
    - If the old password is incorrect, returns a JSON object with an error message and a 401 status code.
    - If the user is not found, returns a JSON object with an error message and a 404 status code.
    - If the password is updated successfully, returns a JSON object with a success message and a 200 status code.
    - If an unexpected error occurs, returns a JSON object with an error message and a 500 status code.
    """
    try:
        # Check if the request is valid
        if request.json is None or not bool(request.json):
            return jsonify({"error": "Bad Request"}), 400
        
        # Get the old and new passwords from the request body
        data = request.json
        old_password = data.get("old_password")
        new_password = data.get("new_password")
        
        # Check if both old and new passwords are present
        if not old_password or not new_password:
            return jsonify({"error": "Both old and new password are required"}), 400
        
        # Find the current user in the database
        existing_user_data = db.user.find_one({'_id': ObjectId(current_user._id)})
        
        if existing_user_data:
            # Check if the old password is correct
            if not bcrypt.check_password_hash(existing_user_data['password'], old_password):
                return jsonify({"error": "Old password is incorrect"}), 401
            
            # Generate a new password hash and update the user's password in the database
            new_pass_hash = bcrypt.generate_password_hash(new_password, rounds=12).decode('utf-8')
            db.user.update_one(
                {'_id': ObjectId(current_user._id)},
                {'$set': {'password': new_pass_hash}}
            )
            return jsonify({"message": "Password updated successfully"}), 200
        else:
            return jsonify({"error": "Job Seeker not found"}), 404
    except pymongo.errors.PyMongoError as e:
        # Handle unexpected errors
        print("Unexpected error: ", e)
        traceback.print_exc()
        return jsonify({"error": "An error occurred while updating password. Please try again later"}), 500


##optimize the search route later
@app.route('/user/searchjobs', methods = ['GET'])
@login_required
def search_jobs():
    """
    This function searches for jobs based on a keyword and returns a paginated list of jobs.

    Args:
        keyword (str): The keyword to search for in the job titles and descriptions.
        page (int): The page number of the results to return (default is 1).
        limit (int): The maximum number of results to return per page (default is 10).

    Returns:
        A JSON object containing the total number of jobs found, the current page number,
        the limit of jobs per page, and a list of jobs matching the search criteria.
    """
    keyword = request.args.get('keyword')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))

    # If a keyword is provided, search for jobs containing that keyword
    if keyword:
        jobs_cursor = db.jobs.find({"$text": {"$search": keyword}}).skip((page-1)*limit(limit))
    # Otherwise, return all jobs sorted by ID
    else: 
        jobs_cursor = db.jobs.find().sort([("_id", 1)]).skip((page-1)*limit(limit))
    
    total_jobs = jobs_cursor.count()

    # Convert the cursor to a list of jobs
    job_list = [job for job in jobs_cursor]

    # Return the results as a JSON object
    return jsonify({
        "total": total_jobs,
        "page": page,
        "limit": limit,
        "data": job_list
    })


@app.route('/user/applyjobs/<job_id>', methods = ['POST'])
@login_required
def apply_jobs(job_id):
    """
    Apply for a job by creating a new application in the database.

    Args:
        job_id (str): The ID of the job to apply for.

    Returns:
        A JSON response indicating whether the application was successful or not.
    """
    user_id = current_user._id

    # Check if the user has already applied for this job
    existing_application = db.applications.find_one({
        "user_id": ObjectId(user_id),
        "job_id": ObjectId(job_id)
    })

    if existing_application:
        return jsonify({"message": "You have already applied for this job!"}), 400

    # Create a new application in the database
    application = {
        "user_id": ObjectId(user_id),
        "job_id": job_id,
        "applied_on": datetime.datetime.utcnow(),
        "status" : "applied"
    }
    db.applications.insert_one(application)

    return jsonify({"message": "Successfully applied for the job!"})


@app.route('/user/appliedjobs', methods = ['GET'])
@login_required
def applied_jobs():
    """
    Fetching all the jobs that the current user has applied  for
    """
    # Fetch all the applications of the current user
    try:
        applications = db.applications.find({'user_id' : ObjectId(current_user._id) })

        # If no applications found, return 404 error
        if applications.count() == 0:
            return jsonify({"message": "No jobs found"}), 404
        
        # Create a list of jobs applied by the user
        job_list =[]
        for application in applications:
            job = db.jobs.find_one('_id', ObjectId(application['job_id']))
            if job:
                job_data = {
                    "req_id": job.get("req_id"),
                    "company_name": job.get('company_name'),
                    "job_title": job.get("job_title"),
                    "job_description": job.get("job_description"),
                    "job_requirements": job.get("job_requirements")
                }
                job_list.append(job_data)
        # Return the list of jobs applied by the user
        return jsonify({"jobs": job_list}), 200
    except pymongo.errors.PyMongoError as e:
        # If any error occurs, return 500 error
        return jsonify({"error": "An error occured. Please try again later"}), 500

