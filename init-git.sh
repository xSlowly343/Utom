#!/bin/bash

# Lost Ark Raid Manager - Git Repository Initialization Script
# This script initializes a new Git repository and adds all project files

echo "🚀 Initializing Git repository for Lost Ark Raid Manager..."

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory."
    exit 1
fi

# Initialize Git repository
echo "📁 Initializing Git repository..."
git init

# Add .gitignore
echo "📝 Adding .gitignore..."
git add .gitignore

# Add all source files
echo "📦 Adding source files..."
git add src/

# Add configuration files
echo "⚙️ Adding configuration files..."
git add package.json
git add README.md

# Add assets
echo "🎨 Adding assets..."
git add assets/

# Add documentation
echo "📚 Adding documentation..."
git add docs/ 2>/dev/null || echo "No docs directory found"

# Add scripts
echo "🔧 Adding scripts..."
git add *.sh 2>/dev/null || echo "No shell scripts found"

# Add license
echo "📄 Adding license..."
git add LICENSE 2>/dev/null || echo "No LICENSE file found"

# Add contributing guide
echo "🤝 Adding contributing guide..."
git add CONTRIBUTING.md 2>/dev/null || echo "No CONTRIBUTING.md file found"

# Add changelog
echo "📋 Adding changelog..."
git add CHANGELOG.md 2>/dev/null || echo "No CHANGELOG.md file found"

# Add issue templates
echo "🐛 Adding issue templates..."
git add .github/ 2>/dev/null || echo "No .github directory found"

# Initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Lost Ark Raid Manager

🎮 Comprehensive desktop application for managing Lost Ark raids and characters

Features:
- Raid management and scheduling
- Character tracking and optimization
- OCR text recognition from screenshots
- AI-powered assistance
- Modern, responsive UI
- Multi-language support
- Desktop notifications
- Calendar and scheduling system
- Chat functionality
- Analytics and reporting

Built with:
- Electron for desktop application
- Node.js for backend logic
- SQLite for data storage
- Tesseract.js for OCR
- Modern CSS and JavaScript

This is the foundation for a powerful Lost Ark gaming companion application."

echo "✅ Git repository initialized successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Add your remote origin: git remote add origin <your-repo-url>"
echo "2. Push to GitHub: git push -u origin main"
echo "3. Set up GitHub Actions for CI/CD (optional)"
echo ""
echo "🎯 Your repository is ready for development!"

# Show repository status
echo ""
echo "📊 Repository status:"
git status --short

# Show commit history
echo ""
echo "📜 Recent commits:"
git log --oneline -5