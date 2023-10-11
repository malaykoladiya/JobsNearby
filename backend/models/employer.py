from flask_login import UserMixin

class Employer(UserMixin):
    def __init__(self, em_data=None):
        if em_data:
            self._id = str(em_data.get('_id'))
            self.first_name = em_data.get('first_name')
            self.last_name = em_data.get('last_name')
            self.user_name = em_data.get('user_name')
            self.email = em_data.get('email')
            self.password = em_data.get('password')

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
        return True
    
    def get_id(self):
        return str(self._id)  # Return a unique identifier for the user

    @classmethod
    def em_get_by_id(cls, em_id, db):
        # Implement a method to retrieve a user by their ID from the database
        return Employer(db.employer.find_one({'_id': em_id}))
    