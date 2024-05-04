from flask_login import UserMixin
from bson import ObjectId


class Employer(UserMixin):
    def __init__(self, employer_data=None):
        if employer_data:
            self._id = str(employer_data.get('_id', '')) if '_id' in employer_data else None
            self.employerFirstName = employer_data.get('employerFirstName', '')
            self.employerLastName = employer_data.get('employerLastName', '')
            self.employerEmail = employer_data.get('employerEmail', '').lower()
            self.employerLocation = employer_data.get('employerLocation', '')
            self.employerPassword = employer_data.get('employerPassword', '')  # Assume already hashed
            self.employerPhoneNumber = employer_data.get('employerPhoneNumber', '')
            self.employerRole = employer_data.get('employerRole', '')
            self.employerCurrentComanyName = employer_data.get('employerCurrentComanyName', '')
            self.employerCurrentCompanyDescription = employer_data.get('employerCurrentCompanyDescription', '')
            self.employerCurrentCompanyIndustry = employer_data.get('employerCurrentCompanyIndustry', '')
            self.employerEducation = employer_data.get('employerEducation', [])
            self.employerWorkExperience = employer_data.get('employerWorkExperience', [])


    def save_to_db(self, db):
        """
        Saves the Employer object to the database, ensuring that sensitive
        information like passwords are handled securely.
        """
        data = {
            'employerFirstName': self.employerFirstName,
            'employerLastName': self.employerLastName,
            'employerEmail': self.employerEmail,
            'employerLocation': self.employerLocation,
            'employerPassword': self.employerPassword,
            'employerPhoneNumber': self.employerPhoneNumber,
            'employerRole': self.employerRole,
            'employerCurrentComanyName': self.employerCurrentComanyName,
            'employerCurrentCompanyDescription': self.employerCurrentCompanyDescription,
            'employerCurrentCompanyIndustry': self.employerCurrentCompanyIndustry,
            'employerEducation': self.employerEducation,
            'employerWorkExperience': self.employerWorkExperience
        }
        
        if hasattr(self, '_id') and self._id:
            db.employer.update_one({'_id': ObjectId(self._id)}, {'$set': data})
        else:
            result = db.employer.insert_one(data)
            self._id = str(result.inserted_id)  # MongoDB generates the _id
        
        return self


    
    def get_id(self):
        return str(self._id)  # Return a unique identifier for the user

    @classmethod
    def em_get_by_id(cls, employer_id, db):
        employer_data = db.employer.find_one({'_id': ObjectId(employer_id)})
        return cls(employer_data) if employer_data else None