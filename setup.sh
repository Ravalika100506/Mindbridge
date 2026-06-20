#!/bin/bash
echo "🧠 MindBridge v3.0 — Setup Script"
echo "=================================="

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install
cd ..

# Copy .env if it doesn't exist
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo ""
  echo "⚠️  Created backend/.env — please edit it and add your:"
  echo "   - MONGODB_URI (default: mongodb://localhost:27017/mindbridge)"
  echo "   - GROQ_API_KEY (free at https://console.groq.com)"
  echo "   - JWT_SECRET (any random string)"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the project:"
echo "  Terminal 1: cd backend && npm run dev    (port 5000)"
echo "  Terminal 2: cd frontend && npm run dev   (port 5173)"
echo ""
echo "Then open: http://localhost:5173"
