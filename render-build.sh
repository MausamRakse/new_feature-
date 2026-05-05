#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Building Frontend..."
cd frontend-next
npm install
npm run build
cd ..

echo "Installing Backend Dependencies..."
cd backend-node
npm install
