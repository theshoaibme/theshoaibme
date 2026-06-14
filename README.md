# DevPortfolio

> **A modern, fully responsive developer portfolio built with React + TypeScript + Vite.**

[![Homepage](https://s0.wp.com/mshots/v1/https://the-shoaib2.github.io/#hero)](https://the-shoaib2.github.io/#hero)

---

## Tech Stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/) (strict mode)
- [Vite 6](https://vite.dev/)
- [React Router](https://reactrouter.com/)
- [EmailJS](https://www.emailjs.com/) (contact form)

## Requirements

- **Node.js 20+**
- **npm 10+**

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open the URL shown in the terminal (default: `http://localhost:5173`).

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript checks only |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |

## Project Structure

```text
src/
├── app/                 # App shell, providers, routing entry
├── components/
│   ├── common/          # Loader, errors, shared UI
│   ├── layout/          # Header, footer, policy layout
│   ├── sections/        # Home page sections
│   └── effects/         # Particles, modals
├── hooks/               # Custom React hooks
├── pages/               # Route pages
├── styles/              # Global and module CSS
├── types/               # TypeScript types
└── utils/               # Helpers
public/
├── data.json            # Portfolio content (edit this!)
└── images/              # Static assets
```

## Configuration

| File | Purpose |
| :--- | :--- |
| **`public/data.json`** | Edit name, links, projects, skills, and all site content |
| **`src/styles/global/style.css`** | Colors, layout, and visual design (`:root` variables) |
| **`vite.config.ts`** | Vite + GitHub Pages base path |
| **`.github/workflows/deploy.yml`** | GitHub Pages CI/CD deploy |

## Deployment

Push to the `main` branch. GitHub Actions builds the React app and deploys to GitHub Pages automatically.

Ensure **GitHub Pages** source is set to **GitHub Actions** in repository settings.

---

<div align="center">
  <sub>Created by <a href="https://github.com/the-shoaib2">MD Shoaib Khan</a></sub>
</div>
