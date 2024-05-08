import redis
from models.config import Config
import json
import time

# Create a Redis connection with a retry mechanism
def get_redis_connection(max_retries=3, retry_delay=2):
    retry_count = 0
    while retry_count < max_retries:
        try:
            return redis.Redis.from_url(Config.REDIS_URL)
        except redis.RedisError as e:
            print(f"Attempt {retry_count + 1} failed to connect to Redis: {e}")
            time.sleep(retry_delay)  # Wait before retrying
            retry_count += 1
    print("Redis connection could not be established after several attempts.")
    return None  # Return None if all retries fail

# Cache data in Redis with JSON serialization
def cache_data(key, data, expire_time=3600):
    try:
        r = get_redis_connection()
        if r is not None:
            r.set(key, json.dumps(data), ex=expire_time)
        else:
            print(f"Redis connection not established. Cannot cache data for key: {key}")
    except redis.RedisError as e:
        print(f"Error setting cache for key {key}: {e}")

# Fetch cached data from Redis with JSON deserialization
def get_cached_data(key):
    try:
        r = get_redis_connection()
        if r is not None:
            data = r.get(key)
            return json.loads(data) if data else None
        else:
            print(f"Redis connection not established. Cannot fetch data for key: {key}")
            return None
    except redis.RedisError as e:
        print(f"Error fetching data from cache for key {key}: {e}")
        return None

# Check if a key exists in Redis
def key_exists(key):
    try:
        r = get_redis_connection()
        if r is not None:
            return r.exists(key) == 1
        else:
            print(f"Redis connection not established. Cannot check existence for key: {key}")
            return False
    except redis.RedisError as e:
        print(f"Error checking existence for key {key}: {e}")
        return False
