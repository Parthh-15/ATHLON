# ATHLON — Personal Fitness Dashboard

A full-stack personal fitness tracker built with React + Vite, Express, MongoDB, JWT and Tailwind CSS.

## Features
- Register / login with hashed passwords and JWT authentication
- Dashboard with daily calorie, protein, water and workout summaries
- Weekly workout planner with editable exercises
- Meal logging with calories, protein, carbs and fats
- Water intake logging
- Sleep logging and daily routine schedule
- Body-weight progress history and analytics
- Responsive dark UI with lime accent

## Requirements
- Node.js 20+ and npm
- MongoDB running locally, or a MongoDB Atlas connection string

## 1. Start MongoDB
For a local Homebrew MongoDB installation, start your MongoDB service (service name can vary by installation):
```bash
brew services start mongodb-community
```
If you use MongoDB Atlas, copy your connection string instead.

## 2. Configure the backend
```bash
cd ATHLON/backend
cp .env.example .env
```
Edit `.env` and set `MONGO_URI` and a long random `JWT_SECRET`.

Install and run:
```bash
npm install
npm run dev
```
Backend runs at `http://localhost:5000`.

## 3. Configure the frontend
Open another Terminal tab:
```bash
cd ATHLON/frontend
cp .env.example .env
npm install
npm run dev
```
Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## 4. First use
Create an account from the Sign up screen. Each account sees only its own records.
The app uses the browser's local timezone to determine the current day. The API accepts dates as `YYYY-MM-DD`.

## API overview
All `/api` endpoints except `/api/auth/register` and `/api/auth/login` require:
`Authorization: Bearer <JWT>`

- `POST /api/auth/register` — `{ name, email, password }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/dashboard?date=YYYY-MM-DD`
- `GET/POST/PUT/DELETE /api/workouts`
- `GET/POST/DELETE /api/meals`
- `GET/POST/DELETE /api/water`
- `GET/POST/DELETE /api/sleep`
- `GET/POST/PUT/DELETE /api/routines`
- `GET/POST/DELETE /api/progress`

## Notes
- Nutrition values are user-entered estimates, not medical advice.
- Keep your `.env` private. Never commit it to GitHub.
- For deployment, use HTTPS, a managed MongoDB database, and a secure production JWT secret.
