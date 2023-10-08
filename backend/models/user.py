from flask import jsonify, request, session, redirect
from flask_login import logout_user, login_required, login_user, UserMixin

from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, user_data=None):
        if user_data:
            self.id = str(user_data.get('_id'))
            self.name = user_data.get('name')
            self.email = user_data.get('email')
            self.password = user_data.get('password')
            self.profile_image = user_data.get('profile_image')
            self.resume = user_data.get('resume')
            self.skills = user_data.get('skills', [])
            self.education = user_data.get('education', [])


    def is_employer(self):
        return False
    
    def get_id(self):
        return self.id  # Return a unique identifier for the user

    @classmethod
    def get_by_id(cls, user_id, db):
        # Implement a method to retrieve a user by their ID from the database
        return User(db.user.find_one({'_id': user_id}))
    #   Implement this according to your database structure

    # You can add more methods as needed for user management
