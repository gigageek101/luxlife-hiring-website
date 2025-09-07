h#!/bin/bash

# POSTE MEDIA LLC Website Deployment Script
echo "🚀 Setting up POSTE MEDIA LLC website for deployment..."

# Initialize Git repository if not already initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git branch -M main
fi

# Add all files to Git
echo "📁 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Initial commit: Complete POSTE MEDIA LLC website

Features:
- Modern dark theme with animations
- Fully responsive design
- SEO optimized with meta tags and sitemap
- Complete pages: Home, About, Services, Case Studies, Blog, Contact
- Contact form with validation
- Framer Motion animations
- Tailwind CSS styling
- Next.js 14 with App Router
- TypeScript support
- Vercel deployment ready"

echo "✅ Git repository setup complete!"
echo ""
echo "🌐 Next steps for deployment:"
echo "1. Create a new repository on GitHub"
echo "2. Add the remote origin:"
echo "   git remote add origin https://github.com/yourusername/poste-media-website.git"
echo "3. Push to GitHub:"
echo "   git push -u origin main"
echo "4. Connect to Vercel for automatic deployment"
echo ""
echo "📚 To run the development server:"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "🎉 Your POSTE MEDIA LLC website is ready!"
