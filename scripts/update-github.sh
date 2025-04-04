#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Function to print status
print_status() {
    echo -e "${GREEN}==>${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}Error:${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    print_error "Not a git repository"
    exit 1
fi

print_status "Updating GitHub repository..."

# Fetch latest changes
print_status "Fetching latest changes..."
git fetch origin || { print_error "Failed to fetch changes"; exit 1; }

# Add all changes
print_status "Adding changes..."
git add . || { print_error "Failed to add changes"; exit 1; }

# Get current date for commit message
DATE=$(date +"%Y-%m-%d")
print_status "Creating commit..."
git commit -m "Update project structure and documentation - $DATE" || { print_error "Failed to commit changes"; exit 1; }

# Push changes
print_status "Pushing changes..."
git push origin main || { print_error "Failed to push changes"; exit 1; }

print_status "Successfully updated GitHub repository!"

# Make script executable
chmod +x scripts/update-github.sh
