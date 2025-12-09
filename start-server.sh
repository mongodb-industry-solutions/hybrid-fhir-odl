#!/bin/bash
# Quick start script for FHIR Mongo Toolkit API

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"

cd "$BACKEND_DIR"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Virtual environment not found. Creating..."
    python3 -m venv .venv
    echo "Installing dependencies..."
    .venv/bin/pip install -e .
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.sample to .env and configure your MongoDB connection."
    exit 1
fi

echo "Starting FHIR Mongo Toolkit API server..."
echo "API will be available at: http://localhost:3100"
echo "API Documentation at: http://localhost:3100/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Use python -m to avoid shebang path issues
# .venv/bin/python -m uvicorn fhir_toolkit.api:app --host 0.0.0.0 --port 3100 --reload
./.venv/Scripts/python -m uvicorn fhir_toolkit.api:app --host 0.0.0.0 --port 3100 --reload
