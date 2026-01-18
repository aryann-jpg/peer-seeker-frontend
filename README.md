# Peer Seeker – Frontend

## Overview
This repository contains the frontend of the Peer Seeker web application.  
The frontend provides the user interface and communicates with the backend API to handle authentication, bookings, and bookmarks.

The project is deployed using DevOps and GitOps principles with an automated CI/CD pipeline.

---

## Tech Stack
- React (Vite)
- JavaScript
- HTML
- CSS
- Axios
- GitHub Actions
- Vercel

---

## CI/CD Pipeline (GitOps)

This project uses GitHub Actions to implement a continuous integration pipeline.

### Trigger
- Any push to the `main` branch

### Pipeline Steps
1. Checkout source code
2. Install Node.js dependencies
3. Build the frontend application

The pipeline ensures the project builds successfully before deployment.

---

## Deployment Architecture

- Cloud Platform: **Vercel**
- Deployment Type: **Automatic**
- Hosting: Frontend static build

Once changes are pushed to the `main` branch, Vercel automatically deploys the latest version.

---

## Environment Variables
Frontend environment variables are managed securely in Vercel.

Example:
```env
VITE_API_BASE_URL=https://peer-seeker-backend.onrender.com
