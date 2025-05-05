#!/bin/bash

echo "Starting Birthday Perks Tracker development server..."
echo "Make sure you have added your Firebase credentials to .env.local"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the development server
npm run dev 