#!/bin/bash

# LuxLife Hiring Website - GitHub Setup Script
echo "🚀 Setting up LuxLife Hiring website for GitHub deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Initialize Git repository if not already initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git branch -M main
else
    echo "📦 Git repository already exists"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore file..."
    cat > .gitignore << EOF
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
EOF
fi

# Add all files to Git
echo "📁 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Initial commit: LuxLife Hiring website

Features:
- Modern Next.js 14 website with TypeScript
- Fully responsive design with Tailwind CSS
- Framer Motion animations
- Complete pages: Home, About, Services, Case Studies, Blog, Contact
- Contact form with API endpoint
- SEO optimized with meta tags and sitemap
- Ready for Vercel deployment"

echo "✅ Git repository setup complete!"
echo ""
echo "🌐 Next steps:"
echo "1. Create a new repository on GitHub named 'luxlife-hiring-website'"
echo "2. Copy your repository URL from GitHub (it will look like: https://github.com/yourusername/luxlife-hiring-website.git)"
echo "3. Run the following commands with YOUR repository URL:"
echo ""
echo "   git remote add origin https://github.com/YOURUSERNAME/luxlife-hiring-website.git"
echo "   git push -u origin main"
echo ""
echo "🎉 After pushing, your website will be ready for deployment on Vercel!"
