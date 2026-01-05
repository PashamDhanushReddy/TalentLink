## 🚀 Deployment Guide: Frontend (Static) + Backend (Web Service) on Render

This guide follows the industry-standard approach for deploying a React + Django + PostgreSQL application on Render. You will deploy two separate services (Frontend and Backend) under one project.

### 🧩 Concept
- **Frontend (React)**: Deployed as a **Static Site**.
- **Backend (Django API)**: Deployed as a **Web Service**.
- **Database**: **PostgreSQL** managed by Render.

They run simultaneously and communicate via HTTPS.

---

### 📁 Project Structure Alignment
Ensure your project looks like this:
```
project-root/
│
├── talentlink/        <-- Backend Root (Django)
│   ├── manage.py
│   ├── requirements.txt
│   └── backend/       <-- Django Settings Folder
│
└── frontend/          <-- Frontend Root (React)
    ├── package.json
    └── src/
```

---

### 🔹 STEP 1: Deploy Django Backend (Web Service)

#### 1️⃣ Prepare Backend Code
- **`requirements.txt`** must include:
  ```text
  Django
  gunicorn
  psycopg2-binary
  django-cors-headers
  whitenoise
  ```
- **`settings.py`** configuration:
  ```python
  ALLOWED_HOSTS = ["*"]
  
  INSTALLED_APPS = [
      ...
      'corsheaders',
      ...
  ]
  
  MIDDLEWARE = [
      'corsheaders.middleware.CorsMiddleware',
      ...
  ]
  
  CORS_ALLOW_ALL_ORIGINS = True
  ```

#### 2️⃣ Create Web Service on Render
- **Name**: `talentlink-backend`
- **Root Directory**: `talentlink`
- **Environment**: `Python 3`
- **Build Command**:
  ```bash
  pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate
  ```
- **Start Command**:
  ```bash
  gunicorn backend.wsgi:application
  ```

#### 3️⃣ Add PostgreSQL
- Create a new **PostgreSQL** database on Render.
- Copy the `Internal Database URL` (starts with `postgres://...`).
- Add it to your Backend Service **Environment Variables** as `DATABASE_URL`.
- Add `SECRET_KEY` variable (generate a random string).

---

### � STEP 2: Deploy React Frontend (Static Site)

#### 1️⃣ Update API URL in React
- In your local code or build configuration, ensure the API URL points to your deployed backend.
- We handle this via **Environment Variables** on Render, so no code change is needed if using `process.env.REACT_APP_API_URL`.

#### 2️⃣ Create Static Site on Render
- **Name**: `talentlink-frontend`
- **Root Directory**: `frontend`
- **Build Command**:
  ```bash
  npm install && npm run build
  ```
- **Publish Directory**: `build`
- **Environment Variables**:
  - `REACT_APP_API_URL`: `https://talentlink-backend.onrender.com/api` (Replace with your actual backend URL + `/api`)
  - `REACT_APP_ENVIRONMENT`: `production`

---

### 🔹 STEP 3: Connect Frontend ↔ Backend

1.  **Verify Backend**: Visit `https://talentlink-backend.onrender.com/admin/`. It should load the Django Admin login.
2.  **Verify Frontend**: Visit `https://talentlink-frontend.onrender.com`. It should load your React App.
3.  **Verify Connection**: Try to Login/Register on the Frontend. It should successfully communicate with the Backend.

---

### ❌ What NOT To Do
- ❌ Do **NOT** try to run React + Django in a single Render service (unless using the advanced build-copy method).
- ❌ Do **NOT** use `npm start` on Render.
- ❌ Do **NOT** hardcode `localhost` in your production code.

---

### � Alternative (Advanced - Single Service)
*Only if you want to serve React via Django (not recommended for beginners):*
1. `npm run build` locally.
2. Copy `build/` contents into Django's `static/` folder.
3. Configure Django to serve the `index.html` template.

---

### 🏁 Final Result
- ✔ **Frontend & Backend run at the same time**
- ✔ **One Render Project (Dashboard)**
- ✔ **Production-ready**
- ✔ **Free SSL**

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