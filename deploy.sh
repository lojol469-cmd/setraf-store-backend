#!/bin/bash

# Center Store Backend - Production Deployment Script
# Usage: ./deploy.sh [build|start|stop|restart|logs]

set -e

COMPOSE_FILE="docker-compose.yml"

case "$1" in
    build)
        echo "🏗️  Building Docker images..."
        docker-compose -f $COMPOSE_FILE build --no-cache
        ;;
    start)
        echo "🚀 Starting production services..."
        docker-compose -f $COMPOSE_FILE up -d
        echo "✅ Services started! Backend available at http://localhost:5000"
        ;;
    stop)
        echo "🛑 Stopping services..."
        docker-compose -f $COMPOSE_FILE down
        ;;
    restart)
        echo "🔄 Restarting services..."
        docker-compose -f $COMPOSE_FILE restart
        ;;
    logs)
        echo "📋 Showing logs..."
        docker-compose -f $COMPOSE_FILE logs -f
        ;;
    status)
        echo "📊 Service status:"
        docker-compose -f $COMPOSE_FILE ps
        ;;
    render)
        echo "🎯 Testing Render-like deployment locally..."
        if [ ! -f ".env.production" ]; then
            echo "❌ .env.production not found! Copy from .env.production.example"
            exit 1
        fi
        COMPOSE_FILE="docker-compose.render.yml"
        echo "🏗️  Building Docker image..."
        docker-compose -f $COMPOSE_FILE build --no-cache
        echo "🚀 Starting Render-like service..."
        docker-compose -f $COMPOSE_FILE up -d
        echo "✅ Render-like deployment started! Backend available at http://localhost:5000"
        echo "🔍 Health check: curl http://localhost:5000/api/health"
        ;;
    render-stop)
        echo "🛑 Stopping Render-like deployment..."
        docker-compose -f docker-compose.render.yml down
        ;;
    *)
        echo "Usage: $0 {build|start|stop|restart|logs|status|cleanup|render|render-stop}"
        echo ""
        echo "Commands:"
        echo "  build       - Build Docker images"
        echo "  start       - Start all services"
        echo "  stop        - Stop all services"
        echo "  restart     - Restart all services"
        echo "  logs        - Show service logs"
        echo "  status      - Show service status"
        echo "  cleanup     - Clean up Docker resources"
        echo "  render      - Test Render-like deployment locally"
        echo "  render-stop - Stop Render-like deployment"
        exit 1
        ;;
esac