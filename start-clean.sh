#!/bin/bash

# Navigate to the project directory
cd /Users/victoria/Downloads/buddyboardbackendsys

# Kill any existing processes
echo "Killing any existing processes..."
pkill -f "node" || true
pkill -f "npm" || true
pkill -f "python" || true
pkill -f "uvicorn" || true
sleep 2

# Kill any processes on specific ports
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true
sleep 2

# Start backend
echo "Starting backend..."
cd /Users/victoria/Downloads/buddyboardbackendsys
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 &
sleep 5

# Start frontend
echo "Starting frontend..."
cd /Users/victoria/Downloads/buddyboardbackendsys/frontend 
npm run dev &
sleep 5

echo "Servers started"
echo "Backend: http://127.0.0.1:8080"
echo "Frontend: http://127.0.0.1:3000"
echo "Dashboard: http://127.0.0.1:3000/dashboard" 