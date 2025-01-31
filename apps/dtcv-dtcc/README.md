# Digital Twin City Viewer (DTCV) Template App

This is a [Next.js](https://nextjs.org) project that serves as a template for building Digital Twin City Viewer applications. For complete documentation, visit [digitaltwincityviewer.com](https://digitaltwincityviewer.com).

## Overview

DTCV Platform is built on Next.js 15 with a robust backend infrastructure:

- **Authentication & Database**: Supabase for auth, realtime/websocket, PostgreSQL database, and storage
- **Workflow Management**: n8n API for submitting and triggering workflows using JSON specification
- **AEC Data Handling**: Speckle API (REST and GraphQL) for uploading hashed project object data
- **3D Visualization**: deck.gl for rendering map and 3D data
- **UI Components**: Shadcn UI and Radix UI with Tailwind CSS styling
- **DTCC Platform**: The DTCC Platform is developed and maintained by the Digital Twin Cities Centre (DTCC) hosted by Chalmers University of Technology. The aim is to develop an open multimodal data, modeling, simulation and visualization platform for interactive planning, design, exploration, experimentation and optimization of cities.

## Project Structure

```
.
└── dtcv-app
├── app
│ ├── (protected)
│ │ └── _components
│ ├── _components
│ └── actions
└── public
```

- `app/(protected)`: Protected routes requiring authentication
- `app/actions`: Server actions for data operations
- `app/_components`: Shared components
- Component folders contain page-specific components

## Getting Started

### Using the Template

You can create a new DTCV project in two ways:

1. Using `create-next-app` with the template repository:

```bash
npx create-next-app@latest -e https://github.com/paramountric/dtcv-app
```

2. Or clone the repository directly:

```bash
git clone <repository-url>
cd dtcv-app
pnpm install
```

### Setting Up the Environment

1. Copy the environment variables:

```bash
cp .env.example .env.local
```

3. Start the development platform (includes Supabase and required services):

```bash
pnpm platform:start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Key Features

- **Authentication**: Integrated Supabase authentication with Speckle user synchronization
- **3D Visualization**: Powered by deck.gl with support for MVT layers and 3D tiles
- **Project Management**: Built-in project organization and management
- **Workflow Integration**: n8n workflow triggers and automation
- **Responsive Design**: Mobile-first approach using Tailwind CSS

## Development Guidelines

- Use TypeScript for all code with proper type definitions
- Follow functional and declarative programming patterns
- Implement server actions for data fetching
- Use zod for input validation
- Follow the mobile-first approach for responsive design
- Place components close to their usage unless shared across multiple pages

## Environment Setup

The platform requires several services to be configured in your `.env.local`:

- Supabase configuration
- n8n API endpoints
- Speckle API configuration
- Map tile services
- 3D tile services

Refer to `.env.example` for required variables.

## Available Scripts

```bash
# Development
pnpm dev                  # Start Next.js development server
pnpm platform:start      # Start all platform services including Supabase
pnpm platform:stop       # Stop all platform services

# Database
pnpm gen:types          # Generate TypeScript types from Supabase schema

# Production
pnpm build              # Build the application
pnpm start              # Start the production server
```

## DTCC Platform

The DTCC Platform is developed and maintained by the Digital Twin Cities Centre (DTCC) hosted by Chalmers
University of Technology. The aim is to develop an open multimodal
data, modeling, simulation and visualization platform for interactive
planning, design, exploration, experimentation and optimization of cities.

[Read more about DTCC](https://dtcc.chalmers.se/)

## License

The DTCC Platform is licensed under the [MIT
license](https://opensource.org/licenses/MIT).

Copyright is held by the individual authors as listed at the top of
each source file.

## Acknowledgements

This work has been created as part the Digital Twin Cities Centre (DTCC) hosted by Chalmers University of Technology and with funding from
Sweden's Innovation Agency Vinnova.
