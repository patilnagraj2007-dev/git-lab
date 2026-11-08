# Local Skill Development and Employment Information Portal

## Overview

This project provides a local job and training portal for communities. It helps:

- job seekers discover open jobs
- employers post vacancies
- training providers publish learning programs
- administrators review and approve listings

## Directory structure

- frontend/ - React frontend application
- backend/ - Express REST API backend

## Run locally

1. Install dependencies:
   npm install
2. Configure environment files:
   cp .env.example .env
   cp backend/.env.example backend/.env
3. Start the app:
   npm run dev
4. Access the frontend at http://localhost:5173
5. Access the API at http://localhost:5000/api/health

## Demo credentials

- Admin: admin@skillportal.local / admin123
- Job seeker: seeker@skillportal.local / seeker123
- Employer: employer@skillportal.local / employer123
- Training provider: trainer@skillportal.local / trainer123

## Features included in the MVP

- Role-based authentication
- Job listing and posting
- Course listing and publishing
- Applications and enrollments
- Admin approval flow
- Responsive UI
- Seeded sample data

## Notes

The project currently uses an in-memory demo data store so it works immediately without needing a database. The backend is ready to be adapted to PostgreSQL with env-based configuration for production deployment.
