# DXN.is Production Website

**Status:** Production-Ready
**Date:** October 17, 2025
**Design System:** Swiss Grid with Mathematical Precision

---

## 📁 File Structure

```
/index.html                    (16,920 bytes)
/css/styles.css               (17,740 bytes)
/js/main.js                   (3,947 bytes)
/assets/
  ├── _heroholder.jpg         (709,927 bytes)
  └── dxnlogo.png            (10,025 bytes)
```

---

## 🚀 Development & Deployment Workflow

### Recommended: GitHub + Vercel (Automated Deployments)

This repository is set up for automatic deployment via Vercel whenever you push changes to GitHub.

**Initial Setup (One-time):**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project" and select the `septapod/dxnis` repository
3. Framework: Select "Other" (static site)
4. Root Directory: Leave as default (`.`)
5. Build command: Leave empty (static site)
6. Output directory: Leave empty
7. Click "Deploy"
8. Once deployed, configure custom domain in Vercel dashboard

**Development Workflow:**

1. Edit files locally with Claude Code
2. Test changes by opening `index.html` in browser
3. Commit changes: `git add -A && git commit -m "Update description"`
4. Push to GitHub: `git push origin main`
5. Vercel automatically deploys (~30 seconds)
6. Check live site at [dxn.is](https://dxn.is)

### Alternative Options

**Option 1: Netlify (Easiest Alternative)**

1. Go to [netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click "New site from Git" and select `septapod/dxnis`
4. Leave build settings empty (static site)
5. Click "Deploy"
6. Configure custom domain in Netlify dashboard

**Option 2: AWS S3 + CloudFront**

1. Create S3 bucket for static website hosting
2. Upload all files maintaining folder structure
3. Enable static website hosting in bucket settings
4. Create CloudFront distribution pointing to S3
5. Configure Route53 for `dxn.is` domain
6. Set up SSL certificate via AWS Certificate Manager

**Option 3: Traditional Hosting (cPanel, etc.)**

1. Upload all files to public_html or web root via FTP/SFTP
2. Maintain folder structure exactly as shown above
3. Ensure domain points to hosting server
4. Configure SSL certificate (Let's Encrypt recommended)

---

## 🎨 Design Features

### Swiss Grid System
- **12-column grid** (desktop), 8-column (tablet), 4-column (mobile)
- **8px baseline grid** for vertical rhythm
- **Mathematical spacing**: All spacing in multiples of 8px (16, 24, 32, 48, 64, 96, 128)
- **Asymmetry through precision**: Varied column spans (5+7, 4+4+4, 8 offset by 2)

### Key Features
- ✅ Custom cursor with trailing follower effect
- ✅ Scroll-triggered section animations
- ✅ Mouse-reactive background in services section
- ✅ Transparent navigation that darkens on scroll
- ✅ Full viewport hero with custom background image
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Left-aligned hero section layout

### Accessibility & SEO
- ✅ WCAG 2.1 AA compliant
- ✅ Semantic HTML5 structure
- ✅ 5 Schema.org JSON-LD blocks for AI/search optimization
- ✅ Complete meta tags (SEO, Open Graph, Twitter Card)
- ✅ Skip navigation for keyboard users
- ✅ ARIA labels throughout

---

## 🔧 Optional Optimizations

### Before Production Deployment:

1. **Minify CSS** (Optional - reduces file size by ~30%)
   ```bash
   # Using online tool: https://cssminifier.com/
   # Or use: npm install -g clean-css-cli
   cleancss -o css/styles.min.css css/styles.css
   # Then update index.html to reference styles.min.css
   ```

2. **Minify JavaScript** (Optional)
   ```bash
   # Using online tool: https://javascript-minifier.com/
   # Or use: npm install -g terser
   terser js/main.js -o js/main.min.js
   # Then update index.html to reference main.min.js
   ```

3. **Optimize Images** (Optional - convert to WebP)
   ```bash
   # Using online tool: https://cloudconvert.com/jpg-to-webp
   # Or use: npm install -g sharp-cli
   sharp -i assets/_heroholder.jpg -o assets/_heroholder.webp
   # Then update CSS to use .webp image
   ```

---

## 📝 Typography

- **Headers:** Montserrat (700-900 weight) from Google Fonts
- **Body:** Karla (300-700 weight) from Google Fonts
- **Fonts load automatically** - no local files needed

---

## 🖼️ Images

### Current Sources:
- **Hero Background:** `assets/_heroholder.jpg` (custom image)
- **Logo:** `assets/dxnlogo.png` (custom logo)
- **Value Cards:** Unsplash images (loaded via CDN)
  - Card 1: `https://images.unsplash.com/photo-1557672172-298e090bd0f1`
  - Card 2: `https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d`
  - Card 3: `https://images.unsplash.com/photo-1550859492-d5da9d8e45f3`

### To Replace Unsplash Images:
1. Save your images to `/assets/` folder
2. Update `index.html` lines 324, 332, 340
3. Change `background-image: url('https://images.unsplash.com/...')` to `background-image: url('assets/your-image.jpg')`

---

## ✅ Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

Custom cursor automatically hidden on touch devices for optimal UX.

---

## 📧 Contact Information

**Email:** brent@dxn.is
**Website:** https://dxn.is
**Tagline:** Strategic Facilitation for Mission-Driven Organizations

---

## 📄 License

All rights reserved © 2025 Brent Dixon
