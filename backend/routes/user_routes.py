from flask import Flask, request, jsonify, session
from app import app
from models.jobSeeker_model import JobSeeker
from flask_login import logout_user, login_required, login_user, current_user
from app import bcrypt
from app import db
import pymongo
from datetime import datetime, timezone
from bson import ObjectId, json_util
import traceback
from utils.utils import validate_password, is_valid_email
import logging
import json
from utils.date_utils import serialize_date


from utils.redis_utils import cache_data, get_cached_data


@app.route('/api/user/register', methods = ['POST'])
def user_signup():
    """
    This function handles the user signup process.
    It accepts a POST request with the following JSON data:

    It then generates a password hash using bcrypt and inserts the user data into the database.
    If the email is already in use, it returns a 400 error.
    If the signup is successful, it logs in the user and returns a 200 response with a success message.

     Request body format:
        {
            jobSeekerEmail: ""
            jobSeekerFirstName: ""
            jobSeekerLastName: ""
            jobSeekerPassword: ""
        }
    """
    if request.json is not None and bool(request.json):
        data = request.json
    else:
        return jsonify({"error": "invalid request format"}), 400
    
    data["jobSeekerEmail"] = data["jobSeekerEmail"].lower()


    #validate email and password
    if not is_valid_email(data.get("jobSeekerEmail", "")):
        return jsonify({"error": "Invalid email format"}), 400
    if not validate_password(data.get("jobSeekerPassword", "")):
        return jsonify({"error": "Invalid password format or weak password"}), 400
    
    # Hash the password before creating the JobSeeker object
    hashed_password = bcrypt.generate_password_hash(data["jobSeekerPassword"]).decode('utf-8')
    data['jobSeekerPassword'] = hashed_password

    # Create a JobSeeker object from the data
    job_seeker = JobSeeker(data)
    
    try:
        job_seeker.save_to_db(db)
        return jsonify({"message": "Job Seeker Signup Successful! Please log in to continue."}), 200
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


@app.route('/api/user/logout', methods = ['POST'])
@login_required
def user_logout():
    """
    Logs out the user and clears the session.

    Returns:
        A JSON response with a success message.
    """
    if current_user.is_authenticated:
        logout_user()
        return jsonify({"message": "Successfully Logout"})
    else:
        return jsonify({"error": "Not Logged In"}), 401


@app.route('/api/user/login', methods=['POST'])
def user_login():
    """
    This function handles the login request for users.
    It takes in the email and password from the request body and checks if they match with the user data in the database.
    If the credentials are valid, it logs in the user and sets the user_type in the session to 'user'.
    If the credentials are invalid, it returns an error message.

    Request Body Format:
    {
        "jobSeekerEmail": "user email",
        "jobSeekerPassword": "user password"
    }

    Returns:
    - If the login is successful, returns a success message with status code 200.
    - If the credentials are invalid, returns an error message with status code 401.
    """
    if request.json is not None and bool(request.json):
        data = request.json
    else:
        return jsonify({"error": "Invalid request format"}), 400

    email = data.get("jobSeekerEmail", "").lower()
    password = data.get("jobSeekerPassword", "")


    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    #Find the user based on the email
    user_data = db.user.find_one({"jobSeekerEmail": email})

    if not user_data:
        return jsonify({"error": "Invalid credentials"}), 401
    
    if user_data and bcrypt.check_password_hash(user_data['jobSeekerPassword'], password):
        job_seeker = JobSeeker(user_data)
        login_user(job_seeker)
        # login_user(job_seeker, remember=True)
                
        session['user_type'] = 'jobSeeker'

        return jsonify({
            'authenticated': True,
            'message': 'jobSeeker Login successful',
            'userType': session.get('user_type')
        }), 200
    else:    
        return jsonify({
            'error': "Invalid credentials",
            'authenticated': False,
        }), 401




@app.route('/api/user/profile', methods = ['GET'])
@login_required
def get_user_profile():
    """
    This function handles GET requests for user profile.
    GET request returns the user profile data.

    :return: JSON response with user profile data or error message.
    """
       
    # Get user data from the database
    user_data = db.user.find_one({'_id': ObjectId(current_user._id)})
    if user_data:
        # Remove sensitive information from the user data
        user_data.pop('jobSeekerPassword', None)
        user_data.pop('_id', None)
        return jsonify(user_data), 200
    else:
        return jsonify({"error": "Job Seeker not found"}), 404

@app.route('/api/user/profile', methods=['PUT'])
@login_required
def update_user_profile():  
        
    """
    This function handles PUT requests for user profile.
    PUT request updates the user profile data.

    :return: JSON response with user profile data or error message.

    request body format:

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
    # existing_user_data = db.user.find_one({'_id': ObjectId(current_user._id)})

    data.pop('jobSeekerPassword', None)
    data.pop('_id', None)

    try:
        # Update the document in MongoDB
        result = db.user.update_one(
            {'_id': ObjectId(current_user._id)},
            {'$set': data}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Job Seeker not found"}), 404
        
        
        # Return the updated user data
        updated_user_data = db.user.find_one({'_id': ObjectId(current_user._id)}, {'jobSeekerPassword': 0})
        updated_user_data['_id'] = str(updated_user_data['_id'])
        
        response_data = {'success': True, 'data': updated_user_data}
        
        return jsonify(response_data), 200
    except pymongo.errors.DuplicateKeyError:
        return jsonify({"error": "Email already exists"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# @app.route('/api/user/profile/workexperience', methods=['POST'])
# @login_required
# def user_add_work_experience():
#     """
#     Handles POST request to add work experience to the user's profile.

#     :return: JSON response with success message or error message.
#     """
#     user_id = current_user._id
#     work_experience_data = request.json

#     if not work_experience_data:
#         return jsonify({"error": "No data provided"}), 400

#     # Optional: Validate work_experience_data here

#     try:
#         # Add the new work experience to the 'jobSeekerWorkExperience' array in the user's document
#         db.user.update_one(
#             {'_id': ObjectId(user_id)},
#             {'$push': {'jobSeekerWorkExperience': work_experience_data}}
#         )
#         return jsonify({"message": "Work experience added successfully"}), 200

#     except Exception as e:
#         # Log the exception for debugging
#         logging.error(f"An error occurred while updating work experience: {e}")
#         # Return an error response
#         return jsonify({"error": "Unable to update the profile at this time"}), 500

    



@app.route('/api/user/updatepassword', methods = ['PUT'])
@login_required
def update_user_password():
    """
    This function updates the password of the current user.

    Request body format:
    {
        "jobSeekerEmail": "user email",  # Required
        "jobseekerOldPassword": "old user password",  # Required
        "jobSeekerNewPassword": "new user password",  # Required
    }

    Returns:
    - If the request is invalid, returns a JSON object with an error message and a 400 status code.
    - If the old password is incorrect, returns a JSON object with an error message and a 401 status code.
    - If the user is not found, returns a JSON object with an error message and a 404 status code.
    - If the password is updated successfully, returns a JSON object with a success message and a 200 status code.
    - If an unexpected error occurs, returns a JSON object with an error message and a 500 status code.
    """
    try:
        # Check if the request is valid
        if request.json is None or not bool(request.json):
            return jsonify({"error": "Bad Request"}), 400

        # Get the email, old and new passwords from the request body
        data = request.json
        email = data.get("jobSeekerEmail")
        old_password = data.get("jobSeekerOldPassword")
        new_password = data.get("jobSeekerNewPassword")

        # Check if the email, old and new passwords are provided
        if not email or not old_password or not new_password:
            return jsonify({"error": "Email, old and new passwords are required"}), 400

        # Find the user in the database by email
        existing_user_data = db.user.find_one({'jobSeekerEmail': email})

        if existing_user_data:
            # Check if the old password is correct
            if not bcrypt.check_password_hash(existing_user_data['jobSeekerPassword'], old_password):
                return jsonify({"error": "Old password is incorrect"}), 401

            # Generate a new password hash
            new_pass_hash = bcrypt.generate_password_hash(new_password, rounds=12).decode('utf-8')

            # Update the user's password in the database
            db.user.update_one(
                {'jobSeekerEmail': email},
                {'$set': {'jobSeekerPassword': new_pass_hash}}
            )
            return jsonify({"message": "User password updated successfully"}), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except pymongo.errors.PyMongoError as e:
        # Handle unexpected errors
        print("Unexpected error: ", e)
        traceback.print_exc()
        return jsonify({"error": "An error occurred while updating user password. Please try again later"}), 500




# """
# ##optimize the search route later
# """
# @app.route('/api/user/searchjobs', methods = ['GET'])
# @login_required
# def search_jobs():
#     """
#     This function searches for jobs based on a keyword and returns a paginated list of jobs.

#     Args:
#         keyword (str): The keyword to search for in the job titles and descriptions.
#         page (int): The page number of the results to return (default is 1).
#         limit (int): The maximum number of results to return per page (default is 10).

#     Returns:
#         A JSON object containing the total number of jobs found, the current page number,
#         the limit of jobs per page, and a list of jobs matching the search criteria.
#     """
#     keyword = request.args.get('keyword')
#     location = request.args.get('location')
#     page = int(request.args.get('page', 1))
#     limit = int(request.args.get('limit', 5))

#     query = {}
#     if keyword:
#         query["$text"] = {"$search": keyword}

#     location_conditions = []
#     if location:  # This will now be true for any non-empty string including whitespace
#         # You can strip whitespace to ensure an empty space is not considered a location
#         location = location.strip()
#         if location:  # Ensure that location is not just whitespace
#             location_conditions = [
#                 {"jobAddress": {"$regex": location, "$options": "i"}},
#                 {"jobCity": {"$regex": location, "$options": "i"}},
#                 {"jobState": {"$regex": location, "$options": "i"}},
#                 {"jobZip": {"$regex": location, "$options": "i"}}
#             ]

#     if location_conditions:
#         if "keyword" in query:
#             # Both keyword and location provided
#             query = {"$and": [query, {"$or": location_conditions}]}
#         else:
#             # Only location provided
#             query["$or"] = location_conditions
    
#     try:
#         jobs_cursor = db.jobs.find(query).sort([("createdAt", -1)]).skip((page - 1) * limit).limit(limit)
#         total_jobs = db.jobs.count_documents(query)
        
#         has_more = (page * limit) < total_jobs

#         # Convert the cursor to a list of jobs
#         job_data_list = []
#         for job in jobs_cursor:
#             # Check if the user has applied for this job
#             application = db.applications.find_one({
#                 "user_id": ObjectId(current_user._id),  # Assuming this is the logged in user's ID
#                 "job_id": job.get('_id')
#             })


#             job_data = {
#                 "_id": str(job.get('_id')),
#                 "reqId": job.get('reqId'),
#                 "jobTitle": job.get('jobTitle'),
#                 "jobCategory": job.get('jobCategory'),
#                 "employmentType": job.get('employmentType'),
#                 "noOfopening": job.get('noOfopening'),
#                 "jobAdress": job.get('jobAdress'),
#                 "jobCity": job.get('jobCity'),
#                 "jobState": job.get('jobState'),
#                 "jobZip": job.get('jobZip'),
#                 "jobDescription": job.get('jobDescription'),
#                 "jobQualifications": job.get('jobQualifications'),
#                 "jobSkills": job.get('jobSkills'),
#                 "jobSalary": job.get('jobSalary'),
#                 "companyName": job.get('companyName'),
#                 "companyDescription": job.get('companyDescription'),
#                 "companyIndustry": job.get('companyIndustry'),
#                 "startDate": job.get("startDate"),
#                 "appDeadline": job.get("appDeadline"),
#                 "createdAt": job.get('createdAt'),
#                 "applied_status": bool(application and application.get('applied_status')),
#                 "under_review_status": bool(application and application.get('under_review_status')),
#                 "rejected_status": bool(application and application.get('rejected_status')),
#                 "accepted_status": bool(application and application.get('accepted_status'))
#             }
#             job_data_list.append(job_data)


#         # Return the results as a JSON object
#         return jsonify({
#             "total": total_jobs,
#             "page": page,
#             "limit": limit,
#             "has_more": has_more,
#             "search_job_data": job_data_list
#         })
#     except pymongo.OperationFailure as e:
#         return jsonify({"error": "Database operation failed", "details": str(e)}), 500
#     except Exception as e:
#         return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500
    

@app.route('/api/user/searchjobs', methods=['GET'])
@login_required
def search_jobs():
    keyword = request.args.get('keyword')
    location = request.args.get('location')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 5))

    # Generate a unique cache key based on search criteria
    cache_key = f"jobs:user_id={current_user._id}:keyword={keyword or ''}:location={location or ''}:page={page}:limit={limit}"

    # Attempt to fetch cached data
    cached_result = get_cached_data(cache_key)
    if cached_result:
        # Since data is stored as JSON in Redis, parse it before sending it to the client
        return jsonify(json.loads(cached_result)), 200
   
    # If no cache hit, proceed with the database query
    query = {}
    if keyword:
        query["$text"] = {"$search": keyword}

    location_conditions = []
    if location:
        location = location.strip()
        if location:
            location_conditions = [
                {"jobAddress": {"$regex": location, "$options": "i"}},
                {"jobCity": {"$regex": location, "$options": "i"}},
                {"jobState": {"$regex": location, "$options": "i"}},
                {"jobZip": {"$regex": location, "$options": "i"}}
            ]

    if location_conditions:
        if "keyword" in query:
            query = {"$and": [query, {"$or": location_conditions}]}
        else:
            query["$or"] = location_conditions

    try:
        jobs_cursor = db.jobs.find(query).sort([("createdAt", -1)]).skip((page - 1) * limit).limit(limit)
        total_jobs = db.jobs.count_documents(query)
        has_more = (page * limit) < total_jobs

        job_data_list = []
        for job in jobs_cursor:
            application = db.applications.find_one({
                "user_id": ObjectId(current_user._id),
                "job_id": job.get('_id')
            })
            job_data = {
                "_id": str(job.get('_id')),
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
                "startDate": serialize_date(job.get("startDate")),
                "appDeadline": serialize_date(job.get("appDeadline")),
                "createdAt": serialize_date(job.get('createdAt')),
                "applied_status": bool(application and application.get('applied_status')),
                "under_review_status": bool(application and application.get('under_review_status')),
                "rejected_status": bool(application and application.get('rejected_status')),
                "accepted_status": bool(application and application.get('accepted_status'))
            }
            job_data_list.append(job_data)

        # Package results
        result = {
            "total": total_jobs,
            "page": page,
            "limit": limit,
            "has_more": has_more,
            "search_job_data": job_data_list
        }

        # Cache the result before returning, convert dict to JSON string for Redis
        cache_data(cache_key, json.dumps(result), expire_time=3600)  # Cache for 1 hour
        return jsonify(result), 200

    except pymongo.errors.PyMongoError  as e:
        return jsonify({"error": "Database operation failed", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500    


@app.route('/api/user/job/<job_id>', methods=['GET'])
@login_required
def get_single_job(job_id):
    """
    Fetch a single job by its ID.

    Args:
        job_id (str): The ID of the job to fetch.

    Returns:
        A JSON response containing the job data if found, otherwise an error message.
    """
    try:
        # Find the job in the database using the job_id
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
            # Get the current user's ID
            user_id = current_user.get_id()

            # Find an application by the current user for this job
            application = db.applications.find_one({
                'user_id': ObjectId(user_id),
                'job_id': ObjectId(job_id)
            })
            
            # Check and add application statuses
            if application:
                job_data['applied_status'] = bool(application.get('applied_status'))
                job_data['under_review_status'] = bool(application.get('under_review_status'))
                job_data['rejected_status'] = bool(application.get('rejected_status'))
                job_data['accepted_status'] = bool(application.get('accepted_status'))
            else:
                job_data.update({
                    'applied_status': False,
                    'under_review_status': False,
                    'rejected_status': False,
                    'accepted_status': False
                })


            return jsonify(job_data), 200
        else:
            return jsonify({"error": "Job not found"}), 404
    except pymongo.errors.PyMongoError as e:
        # Log the exception for debugging purposes
        logging.error(f"An error occurred while fetching job: {e}")
        return jsonify({"error": "An error occurred while fetching the job"}), 500


@app.route('/api/user/applyjobs/<job_id>', methods=['POST'])
@login_required
def apply_jobs(job_id):
    user_id = current_user._id
    try:
        # Check for an existing application
        existing_application = db.applications.find_one({
            "user_id": ObjectId(user_id),
            "job_id": ObjectId(job_id)
        })

        if existing_application:
            logging.info(f"User {user_id} has already applied for job {job_id}.")
            # You can return the existing application status here if needed
            return jsonify({
                "message": "You have already applied for this job!",
                "applied_status": True
            }), 400

        # Insert new application
        application = {
            "user_id": ObjectId(user_id),
            "job_id": ObjectId(job_id),
            "applied_on": datetime.now(timezone.utc),
            "applied_status": True,  # User has applied
            "under_review_status": False,  # Initially not under review
            "rejected_status": False,  # Initially not rejected
            "accepted_status": False
        }
        result = db.applications.insert_one(application)
        application_id = result.inserted_id
        logging.info(f"User {user_id} applied for job {job_id}. Application ID: {application_id}")

        # Returning applied status to reflect the new state
        return jsonify({
            "message": "Successfully applied for the job!",
            "applied_status": application["applied_status"]
        }), 200
    except Exception as e:
        logging.error(f"Error applying for job {job_id} by user {user_id}: {str(e)}")
        return jsonify({
            "error": "An error occurred while applying for the job",
            "applied_status": False
        }), 500



@app.route('/api/user/appliedjobs', methods = ['GET'])
@login_required
def applied_jobs():
    """
    Fetching all the jobs that the current user has applied  for
    """
    # Fetch all the applications of the current user
    try:
        applications = db.applications.find({'user_id': ObjectId(current_user._id)})
        job_list = []

        for application in applications:
            # Add the fields you want to retrieve in the projection parameter of find_one
            job = db.jobs.find_one(
                {'_id': ObjectId(application['job_id'])},
                {
                'reqId': 1, 'companyName': 1, 'jobTitle': 1, 'jobDescription': 1, 'jobSkills': 1,  'jobQualifications': 1,
                'jobCategory': 1, 'employmentType': 1, 'noOfopening': 1, 'jobAdress': 1,
                'jobCity': 1, 'jobState': 1, 'jobZip': 1, 'jobSalary': 1, 'companyDescription': 1, 'companyIndustry': 1,
                'startDate': 1, 'appDeadline': 1, 'createdAt': 1, '_id': 1
                # add other fields you want to include
                }
            )
            if job:
                # Add the additional fields to the job_data dictionary
                job_data = {
                   "_id": str(job['_id']),
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
                    "startDate": job.get('startDate').isoformat() if job.get('startDate') else None,
                    "appDeadline": job.get('appDeadline').isoformat() if job.get('appDeadline') else None,
                    "createdAt": job.get('createdAt').isoformat() if job.get('createdAt') else None,
                    "applied_status": bool(application.get('applied_status')),
                    "under_review_status": bool(application.get('under_review_status')),
                    "rejected_status": bool(application.get('rejected_status')),
                    "accepted_status": bool(application.get('accepted_status'))
                }
                job_list.append(job_data)
            else:
                print(f"Job {application['job_id']} not found")

        return jsonify({"jobs_applied": job_list}), 200
    except pymongo.errors.PyMongoError as e:
        return jsonify({"error": f"An error occurred. Please try again later. {str(e)}"}), 500
    

@app.route('/api/user/saved-jobs', methods=['GET'])
@login_required
def get_saved_jobs():
    user_id = current_user._id

    try:
        # Find the user document by _id
        user = db.user.find_one({'_id': ObjectId(user_id)})
        if user:
            # Get the saved job IDs from the user document
            saved_jobs_ids = [ObjectId(job_id) for job_id in user.get('jobSeekerSavedJobs', [])]
            # Find all job documents whose _id is in the saved_jobs_ids list
            saved_jobs_cursor = db.jobs.find({"_id": {"$in": saved_jobs_ids}})

            saved_jobs = []
            for job in saved_jobs_cursor:
                # Check if the user has applied for this job
                application = db.applications.find_one({
                    "user_id": ObjectId(current_user._id),  # Assuming this is the logged in user's ID
                    "job_id": job.get('_id')
                })


                job_dict = {
                    "_id": str(job['_id']),
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
                    "startDate": job.get('startDate').isoformat() if job.get('startDate') else None,
                    "appDeadline": job.get('appDeadline').isoformat() if job.get('appDeadline') else None,
                    "createdAt": job.get('createdAt').isoformat() if job.get('createdAt') else None,
                    
                    "applied_status": bool(application and application.get('applied_status')),
                    "under_review_status": bool(application and application.get('under_review_status')),
                    "rejected_status": bool(application and application.get('rejected_status')),
                    "accepted_status": bool(application and application.get('accepted_status'))
                }
                saved_jobs.append(job_dict)

            return jsonify(saved_jobs), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        logging.error(f"Failed to fetch saved jobs: {e}", exc_info=True)
        return jsonify({"error": "An error occurred while fetching the saved jobs"}), 500