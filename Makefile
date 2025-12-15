# Hybrid ODL Makefile

.PHONY: help install dev build up down logs clean restart backend frontend docker-build docker-up docker-down docker-logs docker-clean

# Default target
help:
	@echo "Available commands:"
	@echo "  install      - Install all dependencies"
	@echo "  dev          - Start development servers (both backend and frontend)"
	@echo "  backend      - Start only backend server"
	@echo "  frontend     - Start only frontend server"
	@echo "  build        - Build all components"
	@echo "  docker-build - Build Docker images"
	@echo "  docker-up    - Start Docker containers"
	@echo "  docker-down  - Stop Docker containers"
	@echo "  docker-logs  - View Docker container logs"
	@echo "  docker-clean - Clean Docker containers and images"
	@echo "  up           - Alias for docker-up"
	@echo "  down         - Alias for docker-down"
	@echo "  logs         - Alias for docker-logs"
	@echo "  clean        - Clean all build artifacts and dependencies"
	@echo "  restart      - Restart Docker containers"

# Install dependencies
install: install-backend install-frontend

install-backend:
	@echo "Installing backend dependencies..."
	cd backend && python -m venv .venv
	cd backend && .venv/Scripts/pip install -e .

install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

# Development servers
dev:
	@echo "Starting development servers..."
	@echo "Backend will be available at: http://localhost:3100"
	@echo "Frontend will be available at: http://localhost:3101"
	@echo "Press Ctrl+C to stop"
	@powershell -Command "Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd backend; .venv/Scripts/python -m uvicorn fhir_toolkit.api:app --host 0.0.0.0 --port 3100 --reload'"
	@powershell -Command "Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd frontend; npm run dev'"

backend:
	@echo "Starting backend server..."
	@echo "Backend API: http://localhost:3100"
	@echo "API Docs: http://localhost:3100/docs"
	cd backend && .venv/Scripts/python -m uvicorn fhir_toolkit.api:app --host 0.0.0.0 --port 3100 --reload

frontend:
	@echo "Starting frontend server..."
	@echo "Frontend: http://localhost:3101"
	cd frontend && npm run dev

# Build targets
build: build-backend build-frontend

build-backend:
	@echo "Building backend..."
	cd backend && .venv/Scripts/pip install -e .

build-frontend:
	@echo "Building frontend..."
	cd frontend && npm run build

# Docker commands
docker-build:
	@echo "Building Docker images..."
	docker-compose build

docker-up:
	@echo "Starting Docker containers..."
	docker-compose up -d
	@echo "Services started:"
	@echo "  Backend: http://localhost:3100"
	@echo "  Frontend: http://localhost:3101"

docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-clean:
	@echo "Cleaning Docker containers and images..."
	docker-compose down --volumes --remove-orphans
	docker system prune -f

# Aliases
up: docker-up
down: docker-down
logs: docker-logs
restart: docker-down docker-up

# Clean targets
clean: clean-backend clean-frontend clean-docker

clean-backend:
	@echo "Cleaning backend..."
	cd backend && rm -rf .venv __pycache__ *.egg-info build dist

clean-frontend:
	@echo "Cleaning frontend..."
	cd frontend && rm -rf node_modules .next

clean-docker:
	@echo "Cleaning Docker..."
	docker-compose down --volumes --remove-orphans || true
	docker system prune -f || true