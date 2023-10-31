from email_validator import validate_email, EmailNotValidError
from zxcvbn import zxcvbn
import re
def is_valid_email(email):
    """
    Validate the given email


    args: 
        email(str): email address
    
    returns:
        bool: True if email is valid, False otherwise
    """
    try:
        validate_email(email)
        return True
    except EmailNotValidError as e:
        return False

def is_valid_password(password):
    """
    Validate the password against basic criteria

    Args: password(str): password to be checked

    Returns:
        bool: True if password is valid, False otherwise
        
    """

    if ((len(password)) < 8 or
        not re.search(r"[A-Z]", password) or
        not re.search(r"[a-z]", password) or
        not re.search(r"[0-9]", password) or
        not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)): 
        return False
    return True


def is_strong_password(password):
    """
    Check if the given password is strong enough


    args:
        password(str): password to be checked
    
    returns:
        bool: True if password is strong, False otherwise
    """
    result = zxcvbn(password)
    if result['score'] >= 3:
        return True
    return False

def validate_password(password):
    """
    Validate password
    """
    return is_valid_password(password) and is_strong_password(password)