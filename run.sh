#!/usr/bin/env bash

set -e

# Function to cleanup background processes
cleanup() {
	echo "Stopping services..."
	pkill -f "node server.js" 2>/dev/null || true
	pkill -f "python3.*main.py" 2>/dev/null || true
	exit 0
}

# Trap Ctrl+C and kill background processes
trap cleanup INT TERM

echo "Starting backend server..."
cd ./backend
node server.js &
BACKEND_PID=$!

cd ..
echo "Starting geometry service..."
python3 ./backend/geometry-service/main.py &
GEOMETRY_PID=$!

echo "Starting frontend..."
cd ./frontend/oc
npm run dev &
FRONTEND_PID=$!

echo "Services started. Press Ctrl+C to stop all."

# Wait for any process to exit
wait $BACKEND_PID $GEOMETRY_PID $FRONTEND_PID
