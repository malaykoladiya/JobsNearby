from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, user_data=None):
        if user_data:
            self._id = str(user_data.get('_id'))
            self.first_name = user_data.get('name')
            self.last_name = user_data.get('last_name')
            self.user_name = user_data.get('user_name')
            self.email = user_data.get('email')
            self.password = user_data.get('password')


    def to_json(self):
        """
        Returns a JSON representation of the object
        """
        return {
            '_id': self._id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'user_name': self.user_name,
            'email': self.email
        }
    def is_employer(self):
        return False
    
    def get_id(self):
        return str(self._id)  # Return a unique identifier for the user

    @classmethod
    def get_by_id(cls, user_id, db):
        # Implement a method to retrieve a user by their ID from the database
        return User(db.user.find_one({'_id': user_id}))
   