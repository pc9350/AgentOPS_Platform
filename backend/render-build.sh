#!/usr/bin/env bash
# Render build script for AgentOps Backend

set -e

echo "🔧 Setting up Python 3.11..."
export PYTHON_VERSION=3.11

echo "📦 Upgrading pip..."
pip install --upgrade pip

echo "📥 Installing dependencies..."
pip install -r requirements.txt

echo "✅ Build complete!"

