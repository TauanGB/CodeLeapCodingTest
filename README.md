# CodeLeap Coding Test - Frontend

This project was developed as a technical test for a potential role at **CodeLeap**.

The main goal is to implement a web post application with CRUD operations (create, read, update, delete), integrated with the official challenge API:

- `https://dev.codeleap.co.uk/careers/`

## Challenge Context

This project was structured to meet the CodeLeap frontend test requirements with a focus on:

- end-user experience (clean and consistent layout);
- hooks and strong typing;
- clear and scalable architecture;
- a foundation ready for bonus requirements.

## Tech Stack

- `Next.js` (App Router)
- `TypeScript`
- `Material UI v7`
- `Zustand` (global/local state)
- `TanStack React Query` (remote state/cache)

## Implemented Features

### Base Version (required)

- local login by username;
- post creation;
- post listing;
- post edit and deletion via modals;
- protection against multiple delete clicks (prevents duplicate requests);
- edit/delete actions visible only for the current user's own posts.

### Bonus Experience (activated by top button)

- light/dark mode toggle;
- likes per post;
- comments per post;
- highlighted mentions using `@username`;
- sorting and filtering options;
- animations and hover effects.

## Running Locally

### 1) Install dependencies

```bash
npm install
```

### 2) Run in development mode

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

### 3) Validate quality/build

```bash
npm run lint
npm run build
```

## Live Demo

- [CodeLeap Test App](https://tauangb.github.io/CodeLeapCodingTest/)

## Main Structure

- `src/app/` - App Router, layout, and global providers
- `src/components/` - UI and screen components
- `src/features/posts/` - posts domain layer (api/hooks/types)
- `src/store/` - global Zustand stores
- `src/theme/` - MUI theme and visual configuration
- `.cursor/rules/` - project-wide rules for coding assistant guidance

## Important Notes

- The CodeLeap API requires a trailing slash (`/`) in routes to avoid CORS issues.
- Data posted to the test API may be visible to other candidates.

## Target Company

This repository exists specifically for the **CodeLeap** hiring process.
