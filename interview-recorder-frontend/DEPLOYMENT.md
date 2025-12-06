# Deployment Guide

This guide provides step-by-step instructions for deploying both the frontend and backend of the Interview Recorder application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Domain Configuration](#domain-configuration)
6. [Environment Variables](#environment-variables)
7. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

Before deploying, ensure you have:
- Access to deployment platforms (Vercel, Netlify, Render, Railway, Heroku, etc.)
- Domain name (optional but recommended)
- MongoDB Atlas account (for production database)
- SSL certificate (usually provided by platform)

## Backend Deployment

### Deploying to Render

1. **Create a Render Account**
   - Visit [https://render.com](https://render.com) and sign up
   - Connect your GitHub/GitLab account

2. **Prepare Your Repository**
   - Ensure your backend code is pushed to a public or connected private repository
   - Make sure you have a `start` script in your `package.json`:
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

3. **Create a Web Service**
   - Click "New +" → "Web Service"
   - Connect to your backend repository
   - Environment: Node
   - Branch: main/master
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Region: Choose closest to your users

4. **Configure Environment Variables**
   In the Environment tab, add:
   ```
   NODE_ENV=production
   MONGODB_URI=[your-mongodb-atlas-connection-string]
   JWT_SECRET=[your-super-secure-jwt-secret]
   JWT_EXPIRE=30d
   CORS_ORIGIN=[your-frontend-url, e.g., https://your-frontend.onrender.com]
   PORT=1000  # Render will provide this, but good to have a default
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Monitor the deploy log for any errors

### Alternative: Deploying to Railway

1. **Create a Railway Account**
   - Sign up at [https://railway.app](https://railway.app)
   - Install Railway CLI: `npm install -g @railway/cli`

2. **Deploy via Railway Dashboard**
   - Click "New Project"
   - Connect your git repository
   - Select your backend service
   - Railway will auto-detect Node.js and configure appropriately

3. **Configure Environment Variables**
   - Go to "Variables" tab
   - Add the same variables as Render (MONGODB_URI, JWT_SECRET, etc.)

4. **Deploy**
   - Railway will automatically deploy when you push to main branch

### Alternative: Deploying to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI="your-mongo-uri"
   heroku config:set JWT_SECRET="your-jwt-secret"
   heroku config:set JWT_EXPIRE=30d
   heroku config:set CORS_ORIGIN="https://your-frontend.herokuapp.com"
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

## Frontend Deployment

### Deploying to Vercel

1. **Create a Vercel Account**
   - Visit [https://vercel.com](https://vercel.com) and sign up
   - Connect your GitHub/GitLab account

2. **Prepare Your Frontend**
   Ensure your `package.json` has a build script:
   ```json
   {
     "scripts": {
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```

3. **Deploy**
   - Click "New Project"
   - Import your frontend repository
   - Framework preset: Other (Vite will be detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: (Leave empty)

4. **Environment Variables**
   Add these environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   VITE_APP_NAME=Interview Recorder
   VITE_APP_VERSION=1.0.0
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will automatically deploy for future pushes

### Alternative: Deploying to Netlify

1. **Create a Netlify Account**
   - Sign up at [https://netlify.com](https://netlify.com)

2. **Deploy**
   - Click "Add new site"
   - "Import an existing project"
   - Connect your git repository
   - Choose your framework: Vite
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   - Go to Site Settings → Build & Deploy → Environment
   - Add environment variables:
     - `VITE_API_URL`: Your backend URL
     - Any other VITE prefixed variables

4. **Deploy**
   - Netlify will auto-deploy on main branch updates

### Alternative: Deploying to Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Project**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure**
   Update `firebase.json`:
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Database Setup (MongoDB Atlas)

### Setting Up MongoDB Atlas

1. **Create Account**
   - Go to [https://mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose FREE tier (M0 - Shared RAM, 512 MB storage)
   - Select your region closest to users
   - Name your cluster

3. **Set Up Database Access**
   - Go to "Database Access" tab
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and strong password
   - Give "Read and write to any database" privilege

4. **Set Up Network Access**
   - Go to "Network Access" tab
   - Click "Add IP Address"
   - For development: Add "0.0.0.0/0" (Allow from anywhere)
   - For production: Add specific IP addresses of your servers

5. **Get Connection String**
   - Go to "Database" tab
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<username>` with your database user username

6. **Final Connection String Format**
   ```
   mongodb+srv://<username>:<password>@clusterXXXX.mongodb.net/interview-recorder?retryWrites=true&w=majority
   ```

## Domain Configuration

### Backend Domain
1. **Purchase Domain** (if needed)
   - Through Render, Namecheap, GoDaddy, etc.

2. **Configure DNS for Render**
   - Go to your Render dashboard
   - Click on your web service
   - Go to "Settings" → "Domains"
   - Add Custom Domain
   - Update DNS records as instructed

### Frontend Domain
1. **Configure DNS for Vercel**
   - Go to your project in Vercel dashboard
   - Go to Settings → Domains
   - Add Domain
   - Update DNS as instructed

2. **Update CORS Settings**
   - Modify your backend's `CORS_ORIGIN` to include your domain
   - Example: `https://www.yourdomain.com`

## Environment Variables Reference

### Backend Environment Variables
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.gcp.mongodb.net/interview-recorder?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-changeme-very-long-string
JWT_EXPIRE=30d
CORS_ORIGIN=https://your-frontend-domain.com
PORT=1000  # Render/Railway provide PORT automatically
```

### Frontend Environment Variables
```
VITE_API_URL=https://your-backend-domain.com
VITE_APP_NAME=Interview Recorder
VITE_APP_VERSION=1.0.0
VITE_PWA_ENABLED=true
VITE_PWA_NAME="Interview Recorder"
VITE_PWA_SHORT_NAME="Interviewer"
VITE_PWA_DESCRIPTION="Offline interview recorder for timetable problem research"
VITE_PWA_THEME_COLOR=#3b82f6
VITE_PWA_BACKGROUND_COLOR=#ffffff
VITE_PWA_DISPLAY=standalone
VITE_PWA_START_URL=/
VITE_PWA_LANG=en-US
```

## Monitoring & Maintenance

### Health Checks
- **Backend**: Add health check endpoint `/health` that returns:
  ```json
  {
    "status": "ok",
    "timestamp": "2023-01-01T00:00:00.000Z",
    "uptime": 3600
  }
  ```

### Performance Monitoring
- **Backend**: Use logging for monitoring
  ```javascript
  // Add to your server.js
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
  });
  ```

### Backup Strategy
- **Database**: MongoDB Atlas provides automated backup
- **Configuration**: Keep environment variables secure and documented
- **Code**: Use version control (Git) with proper branching strategies

### Common Deployment Issues & Solutions

#### Issue: CORS errors after deployment
**Solution**: Ensure your backend's `CORS_ORIGIN` includes your frontend domain exactly

#### Issue: API calls fail with 404
**Solution**: Check that your backend routes are properly deployed and that you're using the correct API URL

#### Issue: PWA not working in production
**Solution**: 
- Ensure HTTPS is enabled
- Verify service worker is registering correctly
- Check that manifest.json is accessible

#### Issue: Slow loading in production
**Solution**:
- Enable gzip compression
- Use CDN (handled automatically by Vercel/Netlify/Render)
- Optimize bundle size with code splitting

### Updating Deployments

#### For Vercel/Netlify/Render:
- Simply push to your main branch
- Auto-deployment will trigger

#### For Manual Updates:
- Backend: Update environment variables in your platform dashboard
- Frontend: Update VITE_API_URL if backend URL changes

### Rollback Strategy
- Keep previous deployments in your deployment platform
- Maintain git tags for stable releases
- Use environment variables to enable/disable features

---

## Security Considerations
- Never expose secrets in frontend environment variables
- Use strong passwords for database access
- Regularly rotate JWT secrets
- Monitor for suspicious activity
- Keep dependencies updated

For support with deployment issues, contact the development team with specific error messages and steps to reproduce.