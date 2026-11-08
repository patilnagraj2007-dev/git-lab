# Local Skill Development and Employment Information Portal

This repository contains a full-stack MVP for a local skill development and employment portal designed to help job seekers discover nearby opportunities and training programs.

## Features

- User signup/login with roles: job seeker, employer, training provider, admin
- Job posting, search, filtering, and applications
- Training course listing, enrollment, and admin approval
- Dashboard views for users and admin
- Demo backend with seeded data and optional PostgreSQL-ready configuration
- Responsive React frontend

## Tech stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Authentication: JWT
- Styling: Custom CSS
- Data storage: In-memory demo store with PostgreSQL-ready environment configuration

## Quick start

1. Clone the repository and switch to the project branch.
2. Install dependencies:
   npm install
3. Create environment files:
   cp .env.example .env
   cp backend/.env.example backend/.env
4. Start the application:
   npm run dev
5. Open the app at http://localhost:5173
6. Backend API runs at http://localhost:5000

## Default demo accounts

- Admin: admin@skillportal.local / admin123
- Job seeker: seeker@skillportal.local / seeker123
- Employer: employer@skillportal.local / employer123
- Training provider: trainer@skillportal.local / trainer123

## Project structure

- backend/ - Express API server and logic
- frontend/ - React frontend
- docs/ - Additional project documentation

## License

MIT
