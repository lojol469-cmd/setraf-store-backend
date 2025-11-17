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
    cleanup)
        echo "🧹 Cleaning up unused Docker resources..."
        docker system prune -f
        docker volume prune -f
        ;;
    *)
        echo "Usage: $0 {build|start|stop|restart|logs|status|cleanup}"
        echo ""
        echo "Commands:"
        echo "  build    - Build Docker images"
        echo "  start    - Start all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - Show service logs"
        echo "  status   - Show service status"
        echo "  cleanup  - Clean up Docker resources"
        exit 1
        ;;
esac