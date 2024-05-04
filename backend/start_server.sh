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
pip install -r "$SCRIPT_DIR/requirements.txt" > "$SCRIPT_DIR/logs/pip_install.log" 2>&1

echo "Dependencies installed from requirement.txt"

echo ""
# Create logs directory if it does not exist
mkdir -p "$SCRIPT_DIR/logs"

echo "Starting gunicorn server"

# Check if port 8000 is in use
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Port 8000 is in use. Attempting to free it..."
    
    # Find the process ID of the process using port 8000
    PID=$(lsof -t -i:8000)
    
    # Kill the process
    kill -9 $PID

    echo "Killed process $PID that was using port 8000."
fi

# Start Gunicorn server
gunicorn app:app -b 127.0.0.1:8000 --access-logfile "$SCRIPT_DIR/logs/gunicorn_access.log" --error-logfile "$SCRIPT_DIR/logs/gunicorn_error.log" &

GUNICORN_PID=$!

if kill -0 $GUNICORN_PID > /dev/null 2>&1; then
    echo "Gunicorn server started on port 8000!"
else
    echo "Failed to start Gunicorn server. Check $SCRIPT_DIR/logs/gunicorn_error.log for details."
    exit 1
fi

echo ""
