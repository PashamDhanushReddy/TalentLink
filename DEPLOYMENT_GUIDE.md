# 🚀 Single Render Project Deployment Guide

## 🎯 **What You'll Get After Deployment**

### **Main URL**: `https://talentlink-frontend.onrender.com`
- ✅ **React Frontend** will load as the main page
- ✅ **React Router** will handle client-side routing
- ✅ **All API calls** will automatically route to Django backend

### **Backend URL**: `https://talentlink-backend.onrender.com`
- ✅ **Django Admin** accessible at `/admin/`
- ✅ **API endpoints** accessible at `/api/`
- ✅ **Static files** served from `/static/`

## 🔧 **Routing Configuration**

### **Frontend Routes** (React Router)
```
/                    → Home page (React)
/login               → Login page (React)
/register            → Register page (React)
/dashboard           → Dashboard (React)
/profile             → Profile (React)
/projects            → Projects (React)
...and more
```

### **Backend Routes** (Automatic API Routing)
```
/api/*               → Django API endpoints
/admin/*             → Django Admin panel
/static/*            → Django static files
/media/*             → Django media files
```

## 📋 **Deployment Steps**

### **1. Deploy with New Configuration**
```bash
# Option A: Use deployment script
deploy.bat

# Option B: Manual deployment
git add .
git commit -m "Configure frontend as main page"
git push origin main
```

### **2. Wait for Deployment**
- Frontend service will deploy first (main URL)
- Backend service will deploy second (API URL)
- Both services should show "Live" status

### **3. Test Your URLs**

#### **Main Frontend URL**: `https://talentlink-frontend.onrender.com`
- Should show your React app homepage
- All React routes should work
- API calls should work automatically

#### **Backend API URL**: `https://talentlink-backend.onrender.com`
- Should show Django REST Framework API page
- Admin panel at `/admin/`
- API endpoints at `/api/`

## 🧪 **Testing Checklist**

### **Frontend Tests**
- [ ] Main URL loads React app
- [ ] Login/Register pages work
- [ ] Dashboard loads after login
- [ ] API calls work (login, fetch data)
- [ ] React Router navigation works

### **Backend Tests**
- [ ] API endpoints respond
- [ ] Admin panel accessible
- [ ] Database connection works
- [ ] Static files served

### **Integration Tests**
- [ ] Frontend can call backend API
- [ ] Authentication works
- [ ] Data fetching works
- [ ] File uploads work (if applicable)

## 🔍 **Troubleshooting**

### **Frontend Not Loading**
1. Check Render dashboard for frontend service
2. Verify build logs show successful React build
3. Check `_redirects` file exists in `frontend/public/`

### **API Calls Not Working**
1. Check network tab in browser
2. Verify `REACT_APP_API_URL` environment variable
3. Check CORS configuration in Django settings

### **React Router Issues**
1. Verify `_redirects` file content: `/* /index.html 200`
2. Check React Router configuration
3. Test direct URL access (e.g., `/login`)

## 🌟 **Success Indicators**
✅ **Main URL shows React app**
✅ **All React routes work**
✅ **API calls succeed**
✅ **Admin panel accessible**
✅ **No CORS errors in console**

## 📞 **Need Help?**
Check the deployment logs in Render dashboard for any errors. The logs will show you exactly what's happening during deployment.