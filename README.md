# Live Polling System

## Overview
A real-time Live Polling System with two personas: Teacher and Student. Built with React on the frontend and Express + Socket.io on the backend.

## Run locally

### Backend
cd backend
npm install
node server.js

### Frontend
cd frontend
npm install
npm start

Open http://localhost:3000
Teacher page: http://localhost:3000/teacher
Student page: http://localhost:3000/student

## Deployment
- Frontend: Vercel / Netlify
- Backend: Render / Railway / Heroku (enable websockets)

Make sure to update the socket URL in `frontend/src/socket.js` for production.
