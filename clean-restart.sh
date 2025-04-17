#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== BuddyBoard Clean Restart Script ===${NC}"

# Kill any existing processes
echo -e "${YELLOW}Killing all server processes...${NC}"
pkill -f "node"
pkill -f "next"
pkill -f "npm"
pkill -f "uvicorn"
pkill -f "python"

# Kill specific ports
echo -e "${YELLOW}Clearing ports 3000-3010 and 8080...${NC}"
for port in {3000..3010} 8080; do
  lsof -ti:$port | xargs kill -9 2>/dev/null || echo "No process on port $port"
done

# Clean build artifacts
if [ -d "frontend/.next" ]; then
  echo -e "${YELLOW}Cleaning Next.js build cache...${NC}"
  rm -rf frontend/.next
  rm -rf frontend/.turbo
  echo -e "${GREEN}Next.js cache cleared!${NC}"
fi

# Clean environment
echo -e "${YELLOW}Resetting environment...${NC}"
if [ -d "venv" ]; then
  source venv/bin/activate
else
  echo -e "${YELLOW}Creating new virtual environment...${NC}"
  python3 -m venv venv
  source venv/bin/activate
fi

# Install/Update dependencies
echo -e "${YELLOW}Updating backend dependencies...${NC}"
pip install -r requirements.txt

echo -e "${YELLOW}Updating frontend dependencies...${NC}"
cd frontend
npm install
cd ..

# Start the application with the startup script
echo -e "${GREEN}Starting application...${NC}"
./start.sh 