from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, user_data=None):
        if user_data:
            self._id = str(user_data.get('_id'))
            self.name = user_data.get('name')
            self.email = user_data.get('email')
            self.password = user_data.get('password')
            self.profile_image = user_data.get('profile_image')
            self.resume = user_data.get('resume')
            self.skills = user_data.get('skills', [])
            self.education = user_data.get('education', [])


    def to_json(self):
        """
        Returns a JSON representation of the object
        """
        return {
            '_id': self._id,
            'name': self.name,
            'email': self.email,
            'password': self.password
        }
    def is_employer(self):
        return False
    
    def get_id(self):
        return str(self._id)  # Return a unique identifier for the user

    @classmethod
    def get_by_id(cls, user_id, db):
        # Implement a method to retrieve a user by their ID from the database
        return User(db.user.find_one({'_id': user_id}))
    #   Implement this according to your database structure

    # You can add more methods as needed for user management
