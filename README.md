# BlogSpace

BlogSpace is a full-stack publishing platform for thoughtful long-form writing. The frontend presents a quiet, editorial reading and writing experience built with React, TanStack Router, Tailwind CSS, TipTap, Zustand, and shadcn/Radix UI primitives. The backend provides a production-style Express and MongoDB API foundation with authentication, validation, security middleware, and Mongoose domain models.

The project currently has two distinct layers:

- The frontend is a polished working demo that uses an in-memory mock API in `src/services/api.ts`.
- The backend is a real Node.js/Express API foundation with live health and auth endpoints, plus scaffolded post, draft, user, upload, like, and follow modules ready for feature wiring.

## Table of Contents

- [Product Overview](#product-overview)
- [Current Status](#current-status)
- [Feature Highlights](#feature-highlights)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Frontend Routes](#frontend-routes)
- [Backend API](#backend-api)
- [Data Model Overview](#data-model-overview)
- [Development Notes](#development-notes)
- [Deployment Notes](#deployment-notes)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Product Overview

BlogSpace is designed as a minimalist writing and reading application. Its interface focuses on calm typography, readable article layouts, writer profiles, and lightweight social interactions such as likes and follows.

Users can browse published stories, search across titles/authors/tags, switch between an explore feed and a following feed, open detailed article pages, authenticate through a modal flow, create a profile, write rich-text posts, save drafts, publish stories, like posts, follow authors, and share article links.

The product direction is similar to a focused publishing community: more intentional than a fast social feed, more personal than a generic CMS, and structured enough to grow into a real multi-author blogging platform.

## Current Status

| Area                | Status        | Notes                                              
|---------------------|---------------|-------------------------------------------------------------------------------|
| Frontend UI         | Working demo  | Built with seeded in-memory data and realistic interactions.                  |                             
| Frontend auth       | Mocked        | Auth state is persisted with Zustand local storage.                           |
| Frontend publishing | Mocked        | Posts and drafts are created in memory and reset  on full reload .            |                             
| Backend health API  | Live          | `GET /api` and `GET /api/health` are active.                                  |                             
| Backend auth API    | Live          | Signup, login, and current-user routes are implemented.                       |                             
| Backend content API | Scaffolded    | Models/services/controllers exist, but most content routes are not wired yet. |                             
| Database            | Backend-ready | MongoDB/Mongoose configuration and schemas are present.                       |
| Media uploads       | Scaffolded    | Cloudinary configuration and upload modules exist, route wiring is reserved.  |

## Feature Highlights

### Reader Experience

- Editorial home page with a restrained hero and responsive post grid.
- Explore and following feed modes.
- Search filtering across post titles, authors, and tags.
- Detailed article pages with cover images, metadata, tags, reading time, and author details.
- Markdown and HTML rendering support through a shared renderer.
- Empty states, loading skeletons, error states, and retry actions.

### Writer Experience

- Rich-text editor powered by TipTap.
- Formatting toolbar for headings, bold, italic, underline, lists, quotes, code blocks, alignment, links, images, and dividers.
- Post metadata fields for title, cover image URL, and comma-separated tags.
- Publish flow and draft-saving flow.
- Owner-only delete actions on posts and drafts in the UI.

### Social and Profile Features

- Auth dialog with sign-in and create-account tabs.
- Profile onboarding with full name, username, bio, and avatar URL.
- Username availability checks in the mock frontend service.
- Public profile pages with follower/following/story counts.
- Published and draft tabs on the current user's profile.
- Follow/unfollow interactions.
- Like/unlike interactions.
- Share menu for article sharing.

### Design System and UX

- Light and dark themes with persisted preference.
- Typography tuned for long-form reading with Playfair Display and Inter.
- shadcn-style UI components built on Radix primitives.
- Lucide icons for interface controls.
- Toast notifications through Sonner.
- Framer Motion page transitions.
- Responsive layout across mobile and desktop breakpoints.

## Tech Stack

### Frontend

| Technology                  | Purpose                                                  |
| --------------------------- | -------------------------------------------------------- |
| React 19                    | Component model and UI rendering.                        |
| TypeScript                  | Static typing for frontend domain models and components. |
| Vite                        | Development server and build tooling.                    |
| TanStack Router / Start     | File-based routing and app shell.                        |
| Zustand                     | Local state management and persistence.                  |
| Tailwind CSS 4              | Utility-first styling and design tokens.                 |
| Radix UI                    | Accessible low-level UI primitives.                      |
| shadcn-style components     | Composable UI building blocks in `src/components/ui`.    |
| TipTap                      | Rich-text editor experience.                             |
| React Markdown / remark-gfm | Markdown rendering for article content.                  |
| Framer Motion               | Page transition animation.                               |
| Lucide React                | Icon set.                                                |
| Sonner                      | Toast notifications.                                     |

### Backend

| Technology          | Purpose                                      |
| ------------------- | -------------------------------------------- |
| Node.js             | Runtime.                                     |
| Express 5           | HTTP API framework.                          |
| MongoDB             | Database.                                    |
| Mongoose            | Schema modeling, indexes, validation, hooks. |
| Zod                 | Request and environment validation.          |
| bcryptjs            | Password hashing.                            |
| JSON Web Tokens     | Bearer-token authentication.                 |
| Helmet              | Security headers.                            |
| CORS                | Frontend/backend cross-origin access.        |
| cookie-parser       | Cookie parsing for optional token transport. |
| Morgan              | Request logging.                             |
| Multer / Cloudinary | Upload pipeline foundation.                  |
| Nodemon             | Backend development reloads.                 |

## Architecture

BlogSpace is organized as a frontend application at the repository root and a backend API inside `backend/`.

```text
Browser
  |
  | current frontend demo calls
  v
src/services/api.ts
  |
  | in-memory seeded users, posts, follows, likes, drafts
  v
React UI

Planned production flow:

Browser
  |
  | HTTP JSON API
  v
Express API in backend/src
  |
  | Mongoose
  v
MongoDB
```

### Frontend Flow

1. Routes are declared with TanStack Router in `src/routes`.
2. Pages call custom hooks such as `usePosts`, `usePost`, `useDrafts`, `useProfile`, and `useAuth`.
3. Hooks call `src/services/api.ts`.
4. Stores in `src/store` keep auth, theme, search, and feed-mode state.
5. UI components render the product experience with shared primitives from `src/components/ui`.

### Backend Flow

1. `backend/src/server.js` owns process startup, database connection, and graceful shutdown.
2. `backend/src/app.js` configures Express middleware, health routes, and mounted routers.
3. Routers in `backend/src/routes` map HTTP routes to controllers.
4. Controllers in `backend/src/controllers` manage request/response behavior.
5. Services in `backend/src/services` own business logic and database workflows.
6. Mongoose models in `backend/src/models` define persistence structure and indexes.
7. Middleware handles authentication, validation, uploads, not-found responses, and centralized errors.

## Project Structure

```text
BlogSpace/
+-- src/
|   +-- components/
|   |   +-- ui/                    # Shared shadcn/Radix UI components
|   |   +-- AuthDialog.tsx         # Login/signup modal
|   |   +-- EditorForm.tsx         # Story editor form
|   |   +-- PostCard.tsx           # Feed/profile post preview
|   |   +-- RichTextEditor.tsx     # TipTap editor
|   |   +-- ...
|   +-- hooks/                     # Frontend data hooks
|   +-- lib/                       # Markdown, formatting, utility helpers
|   +-- routes/                    # TanStack file routes
|   +-- services/
|   |   +-- api.ts                 # Mock frontend data service
|   +-- store/                     # Zustand stores
|   +-- types/                     # Frontend TypeScript types
|   +-- router.tsx                 # Router configuration
|   +-- styles.css                 # Tailwind theme and global styles
+-- backend/
|   +-- src/
|   |   +-- config/                # Env, database, Cloudinary setup
|   |   +-- controllers/           # HTTP controllers
|   |   +-- middleware/            # Auth, validation, upload, error handling
|   |   +-- models/                # Mongoose schemas
|   |   +-- routes/                # Express routers
|   |   +-- services/              # Business logic
|   |   +-- utils/                 # Shared backend helpers
|   |   +-- validators/            # Zod request schemas
|   |   +-- app.js                 # Express app
|   |   +-- server.js              # HTTP server lifecycle
|   +-- .env.example
|   +-- package.json
+-- components.json                # UI component configuration
+-- eslint.config.js
+-- package.json                   # Frontend package manifest
+-- vite.config.ts
+-- wrangler.jsonc                 # Cloudflare/TanStack deployment config
```

## Getting Started

### Prerequisites

- Node.js 20 or newer is recommended.
- npm is available by default with Node.js.
- MongoDB is required only when running the backend API.
- A Cloudinary account is optional and only needed once upload routes are implemented.

This repository includes both `package-lock.json` and `bun.lockb`. The documented commands use npm because both the root app and backend include npm lockfiles. If your team standardizes on Bun, keep dependency installation consistent across the repository.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BlogSpace
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Start the Frontend

```bash
npm run dev
```

The frontend dev server is served by Vite. It usually runs at:

```text
http://localhost:5173
```

The frontend can be explored without starting the backend because it currently uses mock data from `src/services/api.ts`.

### 4. Install Backend Dependencies

Open a second terminal:

```bash
cd backend
npm install
```

### 5. Configure Backend Environment

Create a local backend environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then update `.env` as needed.

### 6. Start MongoDB

For a local MongoDB instance, make sure MongoDB is running at the URI configured in `.env`.

The default URI is:

```text
mongodb://127.0.0.1:27017/blogspace
```

### 7. Start the Backend

From the `backend/` directory:

```bash
npm run dev
```

By default, the API starts at:

```text
http://localhost:5000
```

Check the backend health endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "BlogSpace API running"
}
```

## Environment Variables

Backend environment variables are defined in `backend/.env.example`.

| Variable                | Required          | Default/Example                       | Description                            |
| ----------------------- | ----------------- | ------------------------------------- | -------------------------------------- |
| `NODE_ENV`              | No                | `development`                         | Runtime environment                    |
| `PORT`                  | No                | `5000`                                | Backend API port.                      |
| `MONGO_URI`             | Yes               | `mongodb://127.0.0.1:27017/blogspace` | MongoDB connection string.             |
| `CORS_ORIGIN`           | No                | `http://localhost:5173`               | Allowed frontend origin.               |
| `JWT_SECRET`            | Yes               | At least 32 characters                | Secret used to sign JWT access tokens. |
| `JWT_EXPIRES_IN`        | No                | `7d`                                  | Access token lifetime.                 |
| `CLOUDINARY_CLOUD_NAME` | Future upload use | Empty                                 | Cloudinary cloud name.                 |
| `CLOUDINARY_API_KEY`    | Future upload use | Empty                                 | Cloudinary API key.                    |
| `CLOUDINARY_API_SECRET` | Future upload use | Empty                                 | Cloudinary API secret.                 |

Important backend validation rules:

- `JWT_SECRET` must be at least 32 characters.
- `MONGO_URI` must be present.
- `PORT` must be a positive integer.
- `NODE_ENV` must be one of `development`, `test`, or `production`.

## Available Scripts

### Frontend Scripts

Run these from the repository root.

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Start the Vite development server.      |
| `npm run build`     | Build the frontend for production.      |
| `npm run build:dev` | Build the frontend in development mode. |
| `npm run preview`   | Preview the production build locally.   |
| `npm run lint`      | Run ESLint over the project.            |
| `npm run format`    | Format files with Prettier.             |

### Backend Scripts

Run these from `backend/`.

| Command       | Description                     |
| ------------- | ------------------------------- |
| `npm run dev` | Start the backend with Nodemon. |
| `npm start`   | Start the backend with Node.js. |

## Frontend Routes

| Route          | Purpose                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| `/`            | Home feed with hero, search results, explore/following toggle, and post cards.                                  |
| `/post/$id`    | Full article page with author metadata, content, likes, share menu, delete action for owners, and author bio.   |
| `/profile/$id` | Public profile page with writer details, counts, published stories, follow button, and current-user drafts tab. |
| `/editor`      | Rich-text story editor for publishing posts or saving drafts.                                                   |
| `/onboarding`  | Profile setup flow for authenticated users.                                                                     |

The root route also defines document metadata, global fonts, the navigation bar, toast container, and not-found handling.

## Backend API

The backend is mounted under `/api`.

### Health and Root Routes

#### `GET /api`

Returns a welcome response.

```json
{
  "success": true,
  "message": "Welcome to the BlogSpace API"
}
```

#### `GET /api/health`

Returns a health check response.

```json
{
  "success": true,
  "message": "BlogSpace API running"
}
```

### Authentication Routes

#### `POST /api/auth/signup`

Creates a user and returns an auth payload.

Request body:

```json
{
  "name": "Ada Lovelace",
  "username": "ada_lovelace",
  "email": "ada@example.com",
  "password": "password123",
  "bio": "Writer, programmer, and notes enthusiast.",
  "avatar": "https://example.com/avatar.jpg"
}
```

Validation highlights:

- `name`: 2 to 80 characters.
- `username`: 3 to 30 characters, lowercase letters, numbers, and underscores only.
- `email`: valid email format.
- `password`: 8 to 128 characters.
- `bio`: optional, up to 280 characters.
- `avatar`: optional, up to 2048 characters.

Successful response shape:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "mongo-user-id",
      "name": "Ada Lovelace",
      "username": "ada_lovelace",
      "email": "ada@example.com",
      "bio": "Writer, programmer, and notes enthusiast.",
      "avatar": "https://example.com/avatar.jpg",
      "followersCount": 0,
      "followingCount": 0,
      "role": "user",
      "isEmailVerified": false
    },
    "accessToken": "jwt-access-token",
    "tokenType": "Bearer",
    "expiresIn": "7d"
  }
}
```

#### `POST /api/auth/login`

Authenticates an existing user.

Request body:

```json
{
  "email": "ada@example.com",
  "password": "password123"
}
```

Successful response shape:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "mongo-user-id",
      "name": "Ada Lovelace",
      "username": "ada_lovelace",
      "email": "ada@example.com"
    },
    "accessToken": "jwt-access-token",
    "tokenType": "Bearer",
    "expiresIn": "7d"
  }
}
```

#### `GET /api/auth/me`

Returns the current authenticated user.

Send the token from signup or login:

```http
Authorization: Bearer <accessToken>
```

Successful response shape:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "mongo-user-id",
      "name": "Ada Lovelace",
      "username": "ada_lovelace",
      "email": "ada@example.com"
    }
  }
}
```

### Reserved Backend Routes

These route groups are mounted in `backend/src/app.js`, but their routers currently contain placeholders rather than active endpoint handlers:

| Route Prefix   | Current Purpose                                      |
| -------------- | ---------------------------------------------------- |
| `/api/posts`   | Reserved for post CRUD and published-feed endpoints. |
| `/api/drafts`  | Reserved for authenticated draft workflows.          |
| `/api/users`   | Reserved for public profile and account routes.      |
| `/api/uploads` | Reserved for authenticated media uploads.            |

Related models, services, and controllers already exist for several of these areas. For example, `Post`, `Draft`, `Like`, and `Follow` models are present, and `postService.findPublished()` is available, but the public post routes still need to be connected.

## Data Model Overview

### Frontend Types

Frontend domain types live in `src/types/index.ts`.

Core frontend models:

- `User`: profile identity, avatar, bio, username, profile completion state.
- `Post`: title, content, format, cover image, author, tags, dates, reading time, likes, status.
- `Profile`: user details plus follower/following/story counts and posts.
- `CreatePostDTO`: form payload for publishing or saving drafts.
- `UpdatePostDTO`: partial update payload for posts.
- `AuthDTO`: email/password auth payload used by the mock frontend.
- `ProfileSetupDTO`: onboarding/profile update payload.

### Backend Models

Backend Mongoose models live in `backend/src/models`.

| Model    | Purpose                                | Notable Details                                                                                 |
| -------- | -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `User`   | Registered account and public profile. | Unique email and username, password hashing, safe JSON transform, follower/following counts.    |
| `Post`   | Published article.                     | Author reference, content, cover image, tags, status, reading time, published date, text index. |
| `Draft`  | Private author draft.                  | Author reference, title/content metadata, cover image, tags, reading time, last-saved timestamp.|
| `Like`   | User-to-post like edge.                | Unique compound index on user and post.                                                         |
| `Follow` | User-to-user follow edge.              | Unique compound index on follower and following.                                                |

## Development Notes

### Mock Frontend Service

The frontend currently calls `src/services/api.ts` rather than the Express backend. This file contains seeded users, seeded posts, mock follows, mock likes, and mock drafts. It also simulates latency through a small artificial delay.

Because this service is in-memory:

- Published posts and drafts created in the UI reset on full page reload.
- Likes and follows reset on full page reload.
- Auth state and theme state are persisted by Zustand local storage.
- Backend auth is not yet connected to the UI.

### Frontend/Backend Integration Considerations

When connecting the frontend to the backend, pay special attention to these differences:

- Frontend mock signup accepts `email` and `password`; backend signup requires `name`, `username`, `email`, and `password`.
- Frontend auth form currently allows 6-character passwords; backend validation requires at least 8 characters.
- Frontend post IDs are strings like `p1`; backend post IDs will be MongoDB object IDs.
- Frontend `coverImage` is a string URL; backend `coverImage` is an object with `url` and `publicId`.
- Frontend supports `draft` and `published` statuses; backend `Post` currently supports `published` and `archived`, while drafts live in a separate `Draft` collection.
- Frontend `User` includes `isProfileComplete`; backend users currently do not expose that field.

### Styling and UI Conventions

- Global design tokens are defined in `src/styles.css`.
- Light and dark theme values are CSS variables.
- Font loading is configured in the root route.
- UI primitives live in `src/components/ui`.
- Component imports use the `@/` alias.
- Cards, dialogs, inputs, buttons, tabs, tooltips, dropdowns, and other primitives follow the local shadcn-style component structure.

### Code Quality

- Run `npm run lint` from the repository root before opening a pull request.
- Run `npm run format` to apply Prettier formatting.
- No automated test suite is currently configured.
- Backend request validation is handled with Zod.
- Backend environment validation happens at startup.

## Deployment Notes

### Frontend

The frontend is configured with `@lovable.dev/vite-tanstack-config`, which already includes the core plugins needed for TanStack Start, React, Tailwind CSS, path aliases, and Cloudflare build support.

`wrangler.jsonc` points Cloudflare Workers to:

```text
@tanstack/react-start/server-entry
```

It also enables:

```json
{
  "compatibility_flags": ["nodejs_compat"]
}
```

Before deploying, update the worker name in `wrangler.jsonc` if needed:

```json
{
  "name": "tanstack-start-app"
}
```

### Backend

The backend can be deployed to any Node.js host that supports:

- Node.js
- MongoDB connectivity
- Environment variables
- Long-running HTTP processes

Recommended production considerations:

- Use a strong `JWT_SECRET`.
- Restrict `CORS_ORIGIN` to trusted frontend domains.
- Use a managed MongoDB provider or secure production MongoDB instance.
- Configure Cloudinary credentials only when upload routes are active.
- Run the backend behind HTTPS.
- Add production logging and monitoring.

## Roadmap

Recommended next implementation steps:

1. Replace the frontend mock API with an HTTP client pointed at the Express backend.
2. Align frontend auth forms with backend signup and password validation requirements.
3. Wire `GET /api/posts` to the existing published-post controller/service.
4. Add authenticated post creation, update, delete, like, and unlike endpoints.
5. Add draft CRUD routes backed by the `Draft` model.
6. Add public profile routes backed by the `User`, `Post`, `Follow`, and `Like` models.
7. Add follow/unfollow routes and count updates.
8. Activate Cloudinary upload routes for cover images and inline editor images.
9. Add automated tests for auth, validation, post workflows, and frontend critical paths.
10. Add API client error handling, loading states, and token refresh or logout behavior.

## Troubleshooting

### Backend Fails on Startup with Invalid Environment Configuration

Check `backend/.env`.

Common causes:

- `MONGO_URI` is missing.
- `JWT_SECRET` is shorter than 32 characters.
- `NODE_ENV` is not one of `development`, `test`, or `production`.
- `PORT` is not a positive number.

### Backend Cannot Connect to MongoDB

Confirm MongoDB is running and that `MONGO_URI` is correct.

For the default local configuration, the backend expects:

```text
mongodb://127.0.0.1:27017/blogspace
```

### Frontend Does Not Reflect Backend Changes

This is expected in the current project state. The frontend reads from the mock service in `src/services/api.ts`, not the Express API.

### Created Posts Disappear After Reload

This is expected while the frontend uses the in-memory mock service. Created posts, drafts, likes, and follows are not persisted to MongoDB yet.

### Auth Works in the UI but Not Against the Backend

The UI auth flow is currently mocked. Backend auth requires a fuller signup payload and enforces an 8-character minimum password.

### CORS Errors When Calling the Backend

Update `backend/.env`:

```text
CORS_ORIGIN=http://localhost:5173
```

If the frontend runs on a different port, add that origin instead. Multiple origins can be comma-separated.

## Contributing

1. Create a focused branch for your change.
2. Keep frontend and backend behavior aligned when touching shared product flows.
3. Prefer existing component and service patterns before adding new abstractions.
4. Run linting and formatting before submitting changes.
5. Document new environment variables, scripts, and API endpoints in this README.

## License

The backend package currently declares `ISC` in `backend/package.json`. The root package does not currently declare a license. Add a repository-level license if this project will be distributed publicly.
