#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js to run this application."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm to run this application."
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "Warning: .env.local file not found. Please create one based on .env.sample"
    echo "You can continue, but the application may not work properly."
fi

# Start the development server
echo "Starting development server..."
npm run dev 