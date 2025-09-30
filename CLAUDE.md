# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Utopia Map**, a flexible collaborative mapping application for decentralized coordination and real-life networking. The project consists of three main parts:

- **`/app`**: React application (frontend) - the main Utopia Map instance
- **`/lib`**: React component library (`utopia-ui`) - reusable UI components
- **`/backend`**: Directus CMS backend configuration and Docker setup

## Development Commands

### App (Frontend)
```bash
cd app
npm install
npm run dev                    # Start development server
npm run build                  # Build for production
npm run test:lint:eslint       # Run ESLint
npm run preview               # Preview production build
```

### Library (utopia-ui)
```bash
cd lib
npm install
npm run build                 # Build library
npm run start                 # Build in watch mode
npm run test:lint:eslint      # Run ESLint
npm run lint                  # Run ESLint (alias)
npm run lintfix               # Auto-fix ESLint issues
npm run test:component        # Run Cypress component tests
npm run test:unit             # Run Vitest unit tests with coverage
npm run test:unit:dev         # Run Vitest in watch mode
npm run docs:generate         # Generate TypeDoc documentation
```

### Backend (Directus)
```bash
cd app
docker-compose up             # Start Directus backend locally

# Sync data to/from Directus (run from backend/)
npx directus-sync pull --directus-url http://localhost:8055 --directus-email admin@it4c.dev --directus-password admin123
npx directus-sync push --directus-url http://localhost:8055 --directus-email admin@it4c.dev --directus-password admin123
```

## Architecture Overview

### High-Level Structure

**Utopia Map** is built on a **3-tier monorepo architecture**:

1. **Frontend App** (`/app`): Consumer application using `utopia-ui` components
2. **Component Library** (`/lib`): Reusable React components with TypeScript
3. **Backend** (`/backend`): Directus headless CMS with Docker configuration

### Key Design Patterns

**API Abstraction Layer**: The app uses API classes (`itemsApi`, `mapApi`, `layersApi`, etc.) that implement TypeScript interfaces to abstract backend communication. This allows swapping backends without changing components.

**Layer-Based Data Model**: Items are organized into customizable **Layers** (e.g., Places, Projects, People) where each layer defines:
- Visual styling (icons, colors, markers)
- Data structure and validation
- Custom popup and profile templates

**Component Composition**: The `UtopiaMap` component accepts child components like `<Layer>`, `<Tags>`, and `<Permissions>` to configure its behavior declaratively.

**Type-Safe APIs**: All API interactions use TypeScript interfaces (`ItemsApi<T>`, `UserApi`, `InviteApi`) ensuring type safety across the frontend-backend boundary.

### Core Components Architecture

- **`UtopiaMap`**: Main map container with Leaflet integration
- **`Layer`**: Defines item types with custom styling and behavior
- **`AppShell`**: Navigation, sidebar, and global app state management
- **`AuthProvider`**: Authentication context and user management
- **Profile Templates**: Flexible system for custom item display (`SimpleView`, `TabsView`, `OnepagerView`)

### Data Flow

1. **Items** are fetched via API classes from Directus backend
2. **Layers** define how items are displayed on the map
3. **Popups** show item previews when clicking map markers
4. **Profiles** provide detailed item views with custom templates
5. **Permissions** control CRUD operations based on user roles

### Testing Strategy

- **Unit Tests**: Vitest for lib components with coverage reporting
<!-- 
  TODO: implement this component testing feature or remove this information from here
  - **Component Tests**: Cypress for React component integration
-->
- **Linting**: ESLint with TypeScript rules for code quality
- **Type Checking**: TypeScript strict mode across all packages
- **End-to-End Tests**: Cypress for testing the app's UI and user flows

### Import Conventions

The lib uses path mapping for clean imports:
- `#components/*` → `./src/Components/*`
- `#types/*` → `./src/types/*`
- `#utils/*` → `./src/Utils/*`
- `#assets/*` → `./src/assets/*`

### Backend Integration

Uses **Directus** as headless CMS with:
- RESTful API for CRUD operations
- GraphQL endpoint available
- Real-time updates via WebSocket
- File/media management
- Role-based permissions
- Collection definitions in `/backend/directus-config/`

## Code Quality

- **ESLint** enforces code style across both app and lib
- **TypeScript strict mode** ensures type safety
- Pre-commit hooks run linting checks via `scripts/check-lint.sh`
- Coverage reporting for unit tests
- Automated dependency updates via `npm-check-updates`

## CSS and Styling Conventions

- **Tailwind CSS Prefix**: Always use the `tw:` prefix for all Tailwind CSS classes (e.g., `tw:flex`, `tw:bg-base-100`)
- **DaisyUI Components**: Use the `tw:` prefix for all DaisyUI component classes (e.g., `tw:btn`, `tw:card`, `tw:modal`)
- This prefix system prevents conflicts with other CSS frameworks and maintains consistent styling across the codebase