#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$(dirname "$(realpath "$0")")"

# Define the path to the virtual environment
VENV_DIR="$SCRIPT_DIR/venv"

# Check if the virtual environment exists
if [[ ! -d "$VENV_DIR" || ! -f "$VENV_DIR/bin/activate" ]]; then
    # If not, create the virtual environment
    echo "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
else
    echo "Virtual environment already exists."
fi

echo ""
echo "Activating Virtual Environment"

# Activate the virtual environment
source "$VENV_DIR/bin/activate"

echo "Virtual Environment Activated"

echo ""
# Check if requirements.txt exists
if [[ ! -f "$SCRIPT_DIR/requirements.txt" ]]; then
    echo "Error: requirements.txt file not found in $SCRIPT_DIR"
    exit 1
fi


echo "Installing dependencies from requirement.txt"

# Install dependencies from requirements.txt
pip install -r "$SCRIPT_DIR/requirements.txt" > dev/null

echo "Dependencies installed from requirement.txt"

echo ""
# Create logs directory if it does not exist
mkdir -p "$SCRIPT_DIR/logs"

echo "Starting gunicorn server"

# Start Gunicorn server
gunicorn app:app -b 127.0.0.1:8000 --access-logfile "$SCRIPT_DIR/logs/gunicorn_access.log" --error-logfile "$SCRIPT_DIR/logs/gunicorn_error.log" &

echo "Gunicorn server started on port 8000!"

echo ""

# Print the Nginx config path
echo "Using Nginx config file at: $SCRIPT_DIR/nginx/nginx.conf"


echo "Starting nginx on port 8080"

# Start Nginx
sudo nginx -c "$SCRIPT_DIR/nginx/nginx.conf"


echo "Nginx started on port 8080!"