# ProHealth Nexus

A full-stack healthcare web application for managing patient records, appointments, and health data.

## Features
- Role-based access — Patient, Doctor, Admin
- Two Factor Authentication (2FA)
- Appointment booking and management
- Health vitals tracking with charts
- Lab results management
- Medical history records
- Real-time and email notifications
- PDF health record export
- Dark mode
- HIPAA-aligned security features
- Search and filter

## Tech Stack
- Frontend: React.js, Tailwind CSS, Recharts, Font Awesome
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Auth: JWT, bcryptjs, OTP 2FA
- Email: Nodemailer + Gmail SMTP

## Setup
1. Clone the repository
2. Create a .env file in the server folder with your database and email credentials
3. Run npm install in both client and server folders
4. Run npm run dev in server and npm start in client