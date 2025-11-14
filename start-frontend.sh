#!/bin/bash
# Start the Next.js frontend development server

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

cd "$FRONTEND_DIR"

echo "Starting Next.js frontend on http://localhost:3101"
npm run dev
