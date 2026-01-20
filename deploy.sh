#!/bin/bash

# Desi Plaza Caterings - Docker Deployment Script
# Usage: chmod +x deploy.sh && ./deploy.sh

set -e

echo "================================================"
echo "🍽️  Desi Plaza Caterings - Docker Deployment"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker found${NC}"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker Compose found${NC}"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.docker.example .env
    echo -e "${RED}⚠️  Please edit .env and update the values!${NC}"
    echo "Opening .env in nano..."
    nano .env
fi

# Ask for confirmation
echo ""
echo -e "${YELLOW}Ready to deploy with these settings:${NC}"
grep -v "^#" .env | grep -v "^$"

read -p "Continue deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down --remove-orphans 2>/dev/null || true

# Build images
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose build --no-cache

# Start services
echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to become healthy...${NC}"
sleep 10

# Check status
echo ""
echo -e "${GREEN}Service Status:${NC}"
docker-compose ps

# Show summary
echo ""
echo "================================================"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo "================================================"
echo ""
echo "📋 Service URLs:"
echo "   Frontend:    http://localhost"
echo "   Backend API: http://localhost:3000"
echo "   MongoDB:     localhost:27017"
echo ""
echo "📋 Useful Commands:"
echo "   View logs:        docker-compose logs -f"
echo "   View backend:     docker-compose logs -f backend"
echo "   Restart services: docker-compose restart"
echo "   Stop services:    docker-compose down"
echo ""
echo "🔒 Don't forget to:"
echo "   1. Setup SSL certificate"
echo "   2. Configure DNS"
echo "   3. Test login functionality"
echo "   4. Setup backups"
echo ""
echo "📚 Full guide: DOCKER_DEPLOYMENT_GUIDE.md"
echo ""
