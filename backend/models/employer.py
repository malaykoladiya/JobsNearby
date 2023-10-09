from flask_login import UserMixin

class Employer(UserMixin):
    def __init__(self, em_data=None):
        if em_data:
            self._id = str(em_data.get('_id'))
            self.name = em_data.get('name')
            self.email = em_data.get('email')
            self.password = em_data.get('password')

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
        return True
    
    def get_id(self):
        return str(self._id)  # Return a unique identifier for the user

    @classmethod
    def em_get_by_id(cls, em_id, db):
        # Implement a method to retrieve a user by their ID from the database
        return Employer(db.employer.find_one({'_id': em_id}))
    #   Implement this according to your database structure

    # You can add more methods as needed for user management
