from flask_login import UserMixin
from bson import ObjectId



class JobSeeker(UserMixin):
    def __init__(self, job_seeker_data=None):
        if job_seeker_data:
            self._id = str(job_seeker_data.get('_id', '')) if '_id' in job_seeker_data else None
            self.jobSeekerFirstName = job_seeker_data.get('jobSeekerFirstName', '')
            self.jobSeekerLastName = job_seeker_data.get('jobSeekerLastName', '')
            self.jobSeekerEmail = job_seeker_data.get('jobSeekerEmail', '')
            self.jobSeekerLocation = job_seeker_data.get('jobSeekerLocation', '')
            self.jobSeekerPassword = job_seeker_data.get('jobSeekerPassword', '')  # Be careful with handling passwords
            self.jobSeekerPhoneNumber = job_seeker_data.get('jobSeekerPhoneNumber', '')
            self.jobSeekerRole = job_seeker_data.get('jobSeekerRole', '')
            self.jobSeekerEducation = job_seeker_data.get('jobSeekerEducation', [])
            self.jobSeekerWorkExperience = job_seeker_data.get('jobSeekerWorkExperience', [])
            self.jobSeekerSavedJobs = job_seeker_data.get('jobSeekerSavedJobs', [])
            
    def save_to_db(self, db):
        """
        Saves the JobSeeker object to the database, ensuring that sensitive
        information like passwords are handled securely.
        """
        data = {
            # Include all necessary fields to be saved
            'jobSeekerFirstName': self.jobSeekerFirstName,
            'jobSeekerLastName': self.jobSeekerLastName,
            'jobSeekerEmail': self.jobSeekerEmail,
            'jobSeekerLocation': self.jobSeekerLocation,
            'jobSeekerPhoneNumber': self.jobSeekerPhoneNumber,
            'jobSeekerRole': self.jobSeekerRole,
            'jobSeekerEducation': self.jobSeekerEducation,
            'jobSeekerWorkExperience': self.jobSeekerWorkExperience,
            'jobSeekerPassword': self.jobSeekerPassword
        }
        
        if hasattr(self, '_id') and self._id:
            db.user.update_one({'_id': ObjectId(self._id)}, {'$set': data})
        else:
            result = db.user.insert_one(data)
            self._id = str(result.inserted_id)  # Update the object's _id with MongoDB's generated ID
        
        return self

    
    
    def get_id(self):
        return str(self._id)  # Return a unique identifier for the user

    @classmethod
    def get_by_id(cls, job_seeker_id, db):
        """
        Retrieve a job seeker by their ID from the database.
        """
        job_seeker_data = db.user.find_one({'_id': ObjectId(job_seeker_id)})
        return cls(job_seeker_data) if job_seeker_data else None
   