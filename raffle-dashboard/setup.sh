#!/bin/bash

echo "Installing Home Instead Raffle Dashboard..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed."
    echo "Please install Python 3.8+ from python.org"
    exit 1
fi

echo "Installing dependencies..."
python3 -m pip install -r requirements.txt

echo
echo "Setup complete!"
echo
echo "To run the application:"
echo "  ./run.sh"
echo
echo "Then open your browser and go to: http://localhost:5000"