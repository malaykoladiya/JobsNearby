from flask import Flask, request, jsonify, redirect, session
from app import app
from models.employer_model import Employer
from models.jobschema import JobPostSchema
from flask_login import logout_user, login_required, login_user, current_user
from app import bcrypt
from app import db
import pymongo
from bson import ObjectId
import traceback
from utils.utils import validate_password, is_valid_email
from marshmallow import ValidationError
from datetime import datetime, timezone
import logging




@app.route('/api/employer/register', methods = ['POST'])
def em_signup():
    """
    This function handles the employer signup process.
    It accepts a POST request with a JSON object containing the employer's name, email, and password.
    The password is hashed using bcrypt and the employer's data is inserted into the database.
    If the signup is successful, the employer is logged in and a success message is returned.
    If the email is already in use, an error message is returned.

    Request body format:
        {
            employerEmail: ""
            employerFirstName: ""
            employerLastName: ""
            employerPassword: ""
        }
    """
    if request.json is not None and bool(request.json):
        data = request.json  
    else:
        return jsonify({"error": "invalid request format"}),  400
    
    data["employerEmail"] = data["employerEmail"].lower()
    
    #validate email
    if not is_valid_email(data.get("employerEmail", "")):
        return jsonify({"error": "Invalid email format"}), 400
    
    if not validate_password(data.get("employerPassword", "")):
        return jsonify({"error": "Invalid password format or weak password"}), 400
    
    # Hash the password
    hashed_password = bcrypt.generate_password_hash(data["employerPassword"]).decode('utf-8')
    data["employerPassword"] = hashed_password
    
    # Create an Employer object with the hashed password
    employer = Employer(data)
    
    try:
        employer.save_to_db(db)
        return jsonify({"message": "Employer Signup Successful! Please log in to continue."}), 200
    except pymongo.errors.DuplicateKeyError:
        return jsonify({"error": "Email already in use"}), 400
    except pymongo.errors.OperationFailure as e:
        # General MongoDB operation failure, which could be due to configuration issues, etc.
        return jsonify({"error": f"Database operation failed: {str(e)}"}), 500
    except pymongo.errors.NetworkTimeout:
        # Handle network-related issues, such as timeouts
        return jsonify({"error": "Database operation timed out"}), 503
    except Exception as e:
        # A catch-all for any other unexpected errors
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500



@app.route('/api/employer/logout', methods = ['POST'])
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
        return jsonify({"message": "Successfully Logout"})
    else:
        return jsonify({"error": "Not Logged In"}), 401


@app.route('/api/employer/login', methods=['POST'])
def em_login():
    """
    Endpoint for employer login.

    Request body format:
    {
        "employerEmail": "employer email",
        "employerPassword": "employer password"
    }

    Returns:
    - If login is successful, returns a JSON object with a success message and a 200 status code.
    - If login fails, returns a JSON object with an error message and a 401 status code.
    """
    if request.json is not None and bool(request.json):
        data = request.json
    else:
        return jsonify({"error": "Invalid request format"}), 400

    email = data.get("employerEmail", "").lower()
    password = data.get("employerPassword", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    # Find the employer based on the email
    em_data = db.employer.find_one({"employerEmail": email})

    if not em_data:
        return jsonify({"error": "Invalid credentials"}), 401

    if em_data and bcrypt.check_password_hash(em_data['employerPassword'], password):
        
        employer = Employer(em_data)
        login_user(employer)
        # login_user(employer, remember=True)

        session['user_type'] = 'employer'

        return jsonify({
        'authenticated': True,
        'message': 'Employer Login successful',
        'userType': session.get('user_type')
    }), 200
    else:
        return jsonify({
            'error': "Invalid credentials",
            'authenticated': False,
        }), 401


@app.route('/api/employer/current', methods=['GET'])
@login_required
def em_current_user_info():
    """
    This endpoint returns the current logged-in user's information.

    Returns:
        A JSON response containing the current user's email and name.
    """
    try:
        
        em_id = current_user.get_id()        
        if not em_id:
            return jsonify({"error": "Unauthorized"})
        
        # Find the current user in the database
        em_data = db.employer.find_one({'_id': ObjectId(em_id)})
        return jsonify({
            "_id": str(em_data["_id"]),
            "email": em_data["email"]
        })
        
    except Exception as e:
        print("Unexpected error: ", e)
        traceback.print_exc()
        return jsonify({"error": "An error occurred while fetching user info. Please try again later"}), 500




@app.route('/api/employer/profile', methods = ['GET'])
@login_required
def get_employer_profile():
    """
    This function handles GET and POST requests for employer profile.
    GET request returns the employer data.
    POST request updates the employer data.

    :return: JSON response with employer data or error message.
    """
     
    # Get employer data from the database
    employer_data = db.employer.find_one({'_id': ObjectId(current_user._id)})
    if employer_data:
        # Remove sensitive data from the employer data
        employer_data.pop('employerPassword', None)
        employer_data.pop('_id', None)
        return jsonify(employer_data), 200
    else:
        return jsonify({"error": "Employer not found"}), 404


@app.route('/api/employer/profile', methods=['PUT'])
@login_required
def update_employer_profile():
    """
    Updates the employer profile data.
    
    Expected request body format:
    {
        "employerFirstName": "employer first name",
        "employerLastName": "employer last name",
        "employerEmail": "employer email",
        # Add other fields as necessary
    }
    """
    if request.json is not None and bool(request.json):
        data = request.json

        # Remove sensitive and immutable fields
        data.pop('employerPassword', None)
        data.pop('_id', None)

        try:
            # Update the document in MongoDB
            result = db.employer.update_one(
                {'_id': ObjectId(current_user._id)},
                {'$set': data}
            )

            if result.matched_count == 0:
                # No document found to update
                return jsonify({"error": "Employer not found"}), 404

            # Fetch the updated employer data, excluding sensitive information
            updated_employer_data = db.employer.find_one({'_id': ObjectId(current_user._id)}, {'employerPassword': 0})
            updated_employer_data['_id'] = str(updated_employer_data['_id'])

            # Return the updated employer data
            response_data = {'success': True, 'data': updated_employer_data}
            return jsonify(response_data), 200

        except pymongo.errors.DuplicateKeyError:
            # Handle duplicate key error (e.g., trying to update to an existing email)
            return jsonify({"error": "Email already exists"}), 400
        except Exception as e:
            # General exception handling
            return jsonify({"error": str(e)}), 500
    else:
        # Handle case where no JSON data is sent with the request
        return jsonify({"error": "Invalid request data"}), 400



@app.route('/api/employer/updatepassword', methods = ['PUT'])
@login_required
def update_employer_password():
    """
    This function updates the password of the current employer.

    Request body format:
    {
        "employerEmail": "employer email",  # Required
        "employerOldPassword": "old employer password",  # Required
        "employerNewPassword": "new employer password",  # Required
    }

    Returns:
    - If the request is invalid, returns a JSON object with an error message and a 400 status code.
    - If the old password is incorrect, returns a JSON object with an error message and a 401 status code.
    - If the employer is not found, returns a JSON object with an error message and a 404 status code.
    - If the password is updated successfully, returns a JSON object with a success message and a 200 status code.
    - If an unexpected error occurs, returns a JSON object with an error message and a 500 status code.
    """
    try:
        # Check if the request is valid
        if request.json is None or not bool(request.json):
            return jsonify({"error": "Bad Request"}), 400

        # Get the email, old and new passwords from the request body
        data = request.json
        email = data.get("employerEmail")
        old_password = data.get("employerOldPassword")
        new_password = data.get("employerNewPassword")

        # Check if the email, old and new passwords are provided
        if not email or not old_password or not new_password:
            return jsonify({"error": "Email, old and new passwords are required"}), 400

        # Find the employer in the database by email
        existing_employer_data = db.employer.find_one({'employerEmail': email})

        if existing_employer_data:
            # Check if the old password is correct
            if not bcrypt.check_password_hash(existing_employer_data['employerPassword'], old_password):
                return jsonify({"error": "Old password is incorrect"}), 401

            # Generate a new password hash
            new_pass_hash = bcrypt.generate_password_hash(new_password, rounds=12).decode('utf-8')

            # Update the employer's password in the database
            db.employer.update_one(
                {'employerEmail': email},
                {'$set': {'employerPassword': new_pass_hash}}
            )
            return jsonify({"message": "Employer password updated successfully"}), 200
        else:
            return jsonify({"error": "Employer not found"}), 404
    except pymongo.errors.PyMongoError as e:
        # Handle unexpected errors
        print("Unexpected error: ", e)
        traceback.print_exc()
        return jsonify({"error": "An error occurred while updating employer password. Please try again later"}), 500
    

    
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
    if session.get('user_type') != 'employer':
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

    data = request.json
    if data is None or not bool(data):
        return jsonify({"error": "no data provided"}), 400
    

    try:
        validated_data = JobPostSchema().load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400
    
    job_creation_time = datetime.now(timezone.utc)
    job_data = {
        "reqId": validated_data.get('reqId'),
        "jobTitle": validated_data.get('jobTitle'),
        "jobCategory": validated_data.get('jobCategory'),
        "employmentType": validated_data.get('employmentType'),
        "noOfopening": validated_data.get('noOfopening'),
        "jobAdress": validated_data.get('jobAdress'),
        "jobCity": validated_data.get('jobCity'),
        "jobState": validated_data.get('jobState'),
        "jobZip": validated_data.get('jobZip'),
        "jobDescription": validated_data.get('jobDescription'),
        "jobQualifications": validated_data.get('jobQualifications'),
        "jobSkills": validated_data.get('jobSkills'),
        "jobSalary": validated_data.get('jobSalary'),
        "companyName": validated_data.get('companyName'),
        "companyDescription": validated_data.get('companyDescription'),
        "companyIndustry": validated_data.get('companyIndustry'),
        "startDate": datetime.combine(validated_data['startDate'], datetime.min.time()),
        "appDeadline": datetime.combine(validated_data['appDeadline'], datetime.min.time()),
        "employer_id": ObjectId(current_user._id),
        "createdAt": job_creation_time
    }

    try:
        db.jobs.insert_one(job_data)
        return jsonify({"message": "Job posted Successfully!"}), 200
    except pymongo.errors.DuplicateKeyError:
        return jsonify({'error':'You have already posted a job with this ID'}), 400
    except pymongo.errors.PyMongoError as e:
        print("pymongo error", e)
        return jsonify({"error": "An error occured while posting the job. Please try again later"}), 500

@app.route('/api/employer/updatejob/<job_id>', methods=['PATCH'])
@login_required
def update_job(job_id):
    """
    This function allows employers to update an existing job post.
    It checks if the user is an employer, if the job exists and belongs to them,
    and then updates the job data in the database.

    Args:
        job_id (str): The ID of the job to update.

    Returns:
        A JSON response indicating the success or failure of the update operation.
    """

    # Check if the user is an employer
    if session.get('user_type') != 'employer':
        return jsonify({"error": "Access denied! Only employers can update jobs."}), 403

    # Fetch the job to ensure it exists and belongs to the current employer
    job = db.jobs.find_one({"_id": ObjectId(job_id), "employer_id": ObjectId(current_user._id)})
    if not job:
        return jsonify({"error": "Job not found or you do not have permission to edit this job"}), 404

    data = request.json
    if data is None or not bool(data):
        return jsonify({"error": "No data provided for update"}), 400

    # Assuming JobUpdateSchema is similar to JobPostSchema but allows partial updates
    try:
        validated_data = JobPostSchema(partial=True).load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    # Prepare the update data, excluding None values that indicate no change
    update_data = {k: v for k, v in validated_data.items() if v is not None}

    # Convert startDate and appDeadline to datetime.datetime objects
    if 'startDate' in update_data:
        update_data['startDate'] = datetime.combine(update_data['startDate'], datetime.min.time())
    if 'appDeadline' in update_data:
        update_data['appDeadline'] = datetime.combine(update_data['appDeadline'], datetime.min.time())


    # Include the update time
    update_data['updatedAt'] = datetime.now(timezone.utc)

    try:
        db.jobs.update_one({"_id": ObjectId(job_id)}, {"$set": update_data})

        # Fetch the updated job document
        updated_job = db.jobs.find_one({"_id": ObjectId(job_id)})

        # Convert the ObjectId to string
        updated_job["_id"] = str(updated_job["_id"])
        if 'employer_id' in updated_job:
            updated_job["employer_id"] = str(updated_job["employer_id"])

        return jsonify({"message": "Job updated successfully", "job": updated_job}), 200
    except pymongo.errors.PyMongoError as e:
        print(e)
        return jsonify({"error": "An error occurred while updating the job. Please try again later"}), 500

@app.route('/api/employer/viewjobs', methods = ['GET'])
@login_required
def view_all_jobs():
    """
    This function returns all the jobs posted by the employer who is currently logged in.
    It only sends necessary data to the front end.
    """
    if session.get('user_type') != 'employer':
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
                "_id" : str(job.get("_id")),
                "reqId": job.get('reqId'),
                "jobTitle": job.get('jobTitle'),
                "jobCategory": job.get('jobCategory'),
                "employmentType": job.get('employmentType'),
                "noOfopening": job.get('noOfopening'),
                "jobAdress": job.get('jobAdress'),
                "jobCity": job.get('jobCity'),
                "jobState": job.get('jobState'),
                "jobZip": job.get('jobZip'),
                "jobDescription": job.get('jobDescription'),
                "jobQualifications": job.get('jobQualifications'),
                "jobSkills": job.get('jobSkills'),
                "jobSalary": job.get('jobSalary'),
                "companyName": job.get('companyName'),
                "companyDescription": job.get('companyDescription'),
                "companyIndustry": job.get('companyIndustry'),
                "startDate": job.get("startDate"),
                "appDeadline": job.get("appDeadline"),
                "createdAt": job.get('createdAt')
            }
            job_data_list.append(job_data)
        
        # Return the job_list with status code 200.
        return jsonify({"jobs": job_data_list}), 200
    
    except pymongo.errors.PyMongoError as e:
        # If an error occurs while fetching jobs, return an error message with status code 500.
        return jsonify({"error": f"An error occured while fetching jobs. Please try again later: {str(e)}"}), 500


@app.route('/api/employer/job/<job_id>', methods = ['GET'])
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
    
    if session.get('user_type') != 'employer':
        return jsonify({"error": "Access denied! Only employers can view their posted jobs"}), 403
    
    try:
        job = db.jobs.find_one({'_id': ObjectId(job_id)})
        if job:
            # Convert the job to a JSON serializable format
            job_data = {
                "_id": str(job.get('_id')),
                "reqId": job.get('reqId'),
                "companyName": job.get('companyName'),
                "jobTitle": job.get('jobTitle'),
                "jobCity": job.get('jobCity'),
                "jobState": job.get('jobState'),
                "jobAddress": job.get('jobAdress'),  # Make sure the key matches the DB field
                "jobSalary": job.get('jobSalary'),
                "employmentType": job.get('employmentType'),
                "noOfopening": job.get('noOfopening'),
                "jobDescription": job.get('jobDescription'),
                "jobSkills": job.get('jobSkills'),
                "companyDescription": job.get('companyDescription'),
                "companyIndustry": job.get('companyIndustry'),
                "jobQualifications": job.get('jobQualifications'),
                "startDate": job.get('startDate').isoformat() if job.get('startDate') else None,
                "appDeadline": job.get('appDeadline').isoformat() if job.get('appDeadline') else None,
                "createdAt": job.get('createdAt').isoformat() if job.get('createdAt') else None,
            }
        
            return jsonify(job_data), 200
        else:
            return jsonify({"error": "Job not found"}), 404
    except pymongo.errors.PyMongoError as e:
        logging.error(f"An error occurred while fetching job: {e}")
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
    if session.get('user_type') != 'employer':
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
        print(e)
        return jsonify({"error": "An error occured while deleting the job. Please try again later"}), 500 
    

@app.route('/api/employer/job/<job_id>/applicants', methods=['GET'])
@login_required
def get_job_applicants(job_id):
    """
    Fetches a list of applicants for a given job.

    Args:
        job_id (str): The ID of the job to fetch applicants for.

    Returns:
        A JSON response containing a list of applicants for the job.
    """
    if session.get('user_type') != 'employer':
        return jsonify({"error": "Access Denied! Only employers can view applicants."}), 403

    try:
        job = db.jobs.find_one({'_id': ObjectId(job_id), 'employer_id': ObjectId(current_user._id)})
        if not job:
            return jsonify({"error": "Job not found"}), 404
        
        applications = db.applications.find({'job_id': ObjectId(job_id)})
        
        
        applicants_list = []
        for app in applications:
           applicant_user = db.user.find_one({'_id': app['user_id']})
           if applicant_user:
                # Determine the application's current status
                # status = 'rejected' if app['rejected_status'] else ('under_review' if app['under_review_status'] else 'applied')
                status = ('accepted' if app['accepted_status'] else 
                        'rejected' if app['rejected_status'] else 
                        'under_review' if app['under_review_status'] else 
                        'applied')
                applicants_list.append({
                    "application_id": str(app['_id']),
                    "user_id": str(applicant_user['_id']),
                    "name": f"{applicant_user.get('jobSeekerFirstName', '')} {applicant_user.get('jobSeekerLastName', '')}",
                    "email": applicant_user.get('jobSeekerEmail', ''),
                    "phone": applicant_user.get('jobSeekerPhoneNumber', ''),
                    "location": applicant_user.get('jobSeekerLocation', ''),
                    "status": status,
                    "applied_on": app['applied_on'].isoformat() if 'applied_on' in app else 'Unknown'
                })
        
        return jsonify({"applicants": applicants_list}), 200

    except Exception as e:
        logging.error(f"An error occurred while fetching applicants: {e}")
        return jsonify({"error": "An error occurred while fetching applicants. Please try again later."}), 500


@app.route('/api/employer/applicant/<application_id>/status', methods=['PUT'])
@login_required
def update_applicant_status(application_id):
    """
    Updates a specific status of an applicant's application using only the application ID.

    Args:
        application_id (str): The ID of the application to be updated.
    
    Returns:
        A JSON response with the result of the operation.
    """
    if session.get('user_type') != 'employer':
        return jsonify({"error": "Access Denied! Only employers can update applicants."}), 403

    status_type = request.json.get('status')
    valid_statuses = ['accepted', 'rejected', 'under_review']

    if status_type not in valid_statuses:
        return jsonify({"error": "Invalid status"}), 400

    try:
        status_updates = {f"{status}_status": False for status in valid_statuses if status != status_type}
        status_updates[f"{status_type}_status"] = True

        result = db.applications.update_one(
            {'_id': ObjectId(application_id)},
            {'$set': status_updates}
        )

        if result.modified_count == 0:
            return jsonify({"error": "No changes made or application not found"}), 404

        return jsonify({"success": True, "message": f"Application status updated to {status_type}"}), 200

    except Exception as e:
        logging.error(f"An error occurred while updating applicant status: {e}")
        return jsonify({"error": "An error occurred while updating the status. Please try again later."}), 500


@app.route('/api/employer/user_profile/<user_id>', methods=['GET'])
@login_required
def get_user_details(user_id):
    """
    This function handles GET requests for user details from an employer's perspective.
    GET request returns the details of the specified user.

    :param user_id: The ID of the user whose details are to be fetched.
    :return: JSON response with user details or an error message.
    """
    
    # Validate the user ID
    if not ObjectId.is_valid(user_id):
        return jsonify({"error": "Invalid user ID"}), 400

    # Fetch user data from the database
    user_profile_data = db.user.find_one({'_id': ObjectId(user_id)})
    if user_profile_data:
        # Remove sensitive information from the user data
        user_profile_data.pop('jobSeekerPassword', None)  # Assume 'userPassword' is the sensitive field
        user_profile_data.pop('_id', None)
        return jsonify(user_profile_data), 200
    else:
        return jsonify({"error": "User not found"}), 404
