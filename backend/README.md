# BlogSpace Backend

Production-style Node.js, Express, MongoDB, and Mongoose API foundation for BlogSpace.

## Architecture

The backend is organized by responsibility so features can grow without crowding the entry points:

- `src/config` contains environment, database, and third-party service configuration.
- `src/controllers` owns HTTP request and response behavior.
- `src/services` owns business logic and data workflows.
- `src/models` contains Mongoose schemas and indexes.
- `src/routes` maps API endpoints to controllers.
- `src/middleware` contains cross-cutting request handling such as auth, validation, uploads, and errors.
- `src/utils` contains small shared helpers.
- `src/validators` contains request schemas.

Authentication uses JWT access tokens, bcrypt password hashing, protected middleware, and Zod request validation.

## Setup

```bash
npm install
npm run dev
```

On Windows PowerShell, create your local env file with:

```powershell
Copy-Item .env.example .env
```

The API will start on `http://localhost:5000` unless `PORT` is changed in `.env`.

## Scripts

```bash
npm run dev
npm start
```

## Health Check

```http
GET /api/health
```

Response:

```json
{
  "success": true,
  "message": "BlogSpace API running"
}
```

## Authentication

```http
POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me
```

Signup expects `name`, `username`, `email`, and `password`. Login expects `email` and `password`. Both return an access token and a password-free user object. Send protected requests with:

```http
Authorization: Bearer <accessToken>
```
