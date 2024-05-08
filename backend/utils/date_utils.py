from datetime import datetime

def serialize_date(d):
    """Convert datetime object to string."""
    return d.isoformat() if isinstance(d, datetime) else d
