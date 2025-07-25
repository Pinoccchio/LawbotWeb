# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LawBot Web is a Next.js-based web application serving as the administrative and investigative dashboard for the LawBot cybercrime reporting system. It provides specialized interfaces for PNP (Philippine National Police) officers and system administrators to manage cybercrime cases, evidence, and investigations.

### Key Features
- **Dual-Role Interface**: Separate dashboards for System Administrators and PNP Officers
- **AI-Powered Case Management**: Automatic case prioritization and routing using Gemini AI analysis
- **Evidence Management**: Secure viewing and handling of evidence files with chain of custody
- **Real-time Case Tracking**: 5-status workflow (Pending → Under Investigation → Requires More Info → Resolved/Dismissed)
- **Advanced Analytics**: Performance metrics, case statistics, and priority-based dashboards
- **Dark/Light Theme Support**: Full theme switching capability throughout the application

## Development Commands

### Core Next.js Commands
```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Check TypeScript types (inferred - no script defined)
npx tsc --noEmit
```

### Development Workflow
```bash
# Start development with hot reload
npm run dev
# Opens http://localhost:3000

# Production build and test
npm run build && npm start

# Code quality check
npm run lint
```

## Architecture Overview

### Application Structure
The app uses a single-page application architecture with view switching:
- **Landing Page**: Public interface with login modals for Admin/PNP access
- **Admin Dashboard**: System administration with 6 main views (dashboard, cases, users, units, settings, notifications)
- **PNP Dashboard**: Officer interface with 5 main views (dashboard, cases, search, evidence, profile)

### State Management
Uses React hooks for local state management:
- `useState` for view switching and UI state
- Theme state managed at root level and passed down
- No external state management library (Redux, Zustand, etc.)

### Component Architecture
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main application entry point
│   └── globals.css        # Global styles and CSS variables
├── components/
│   ├── admin/             # Admin dashboard components
│   │   ├── admin-dashboard.tsx    # Main admin container
│   │   ├── admin-header.tsx       # Admin navigation header
│   │   ├── admin-sidebar.tsx      # Admin navigation sidebar
│   │   └── views/                 # Admin view components
│   ├── auth/              # Authentication components
│   │   └── login-modal.tsx        # Login modal for both roles
│   ├── pnp/               # PNP officer dashboard components
│   │   ├── pnp-dashboard.tsx      # Main PNP container
│   │   ├── pnp-header.tsx         # PNP navigation header
│   │   ├── pnp-sidebar.tsx        # PNP navigation sidebar
│   │   └── views/                 # PNP view components
│   ├── modals/            # Shared modal components
│   ├── ui/                # Reusable UI components
│   └── landing-page.tsx   # Public landing page
└── lib/
    ├── mock-data.ts       # Sample data for development
    └── utils.ts           # Utility functions
```

### Key Design Patterns
- **Role-Based Views**: Separate component trees for Admin and PNP interfaces
- **Mock Data Integration**: Uses `mock-data.ts` for development and demonstration
- **Modal-Based Authentication**: Login handled through overlay modals rather than separate pages
- **Responsive Design**: Tailwind CSS with mobile-first approach and custom LawBot color scheme

## Technology Stack

### Core Framework
- **Next.js 15.4.4**: App Router with React 19.1.0
- **TypeScript**: Strict mode enabled with path aliases (@/*)
- **Tailwind CSS 4**: Custom design system with LawBot-specific colors and animations

### UI Components
- Custom component library built on Radix UI primitives
- Lucide React icons for consistent iconography
- Tailwind Animate for transitions and animations

### Development Tools
- **ESLint**: Next.js and TypeScript configuration
- **PostCSS**: Tailwind CSS processing
- **Turbopack**: Fast development server (Next.js dev mode)

## Styling and Theme System

### Custom Color Palette
The application uses a custom `lawbot` color palette defined in `tailwind.config.ts`:
- **Priority Colors**: High (red), Medium (amber), Low (emerald)
- **Brand Colors**: Primary blue, accent colors for different UI elements
- **Dark Mode**: Full dark mode support with CSS variables

### Component Styling Patterns
- Gradient backgrounds for hero sections and cards
- Hover animations and scale transforms
- Custom animations: fade-in, slide-up, slide-down
- Responsive design with custom breakpoints (3xl: 1600px)

## Data and Mock System

### Mock Data Structure
Located in `src/lib/mock-data.ts`, provides sample data for:
- Cybercrime cases with ID format: CYB-YYYY-XXX
- Priority levels (high, medium, low) with risk scores
- PNP unit assignments based on crime types
- Case statuses following the 5-status workflow

### Case Management Data Model
```typescript
interface Case {
  id: string              // Format: CYB-YYYY-XXX
  title: string
  priority: "high" | "medium" | "low"
  status: "Pending" | "Under Investigation" | "Requires More Info" | "Resolved" | "Dismissed"
  officer: string
  unit: string           // PNP specialized unit
  date: string
  riskScore: number      // 0-100 AI-calculated risk
  evidence: number       // Evidence file count
}
```

## Authentication and Access Control

### Role-Based Access
- **System Administrator**: Full access to all management features
- **PNP Officer**: Case-focused interface with investigation tools
- **Public Access**: Landing page only with login prompts

### Authentication Flow
1. User clicks role-specific login button
2. LoginModal opens with appropriate user type context
3. Mock authentication (no backend integration)
4. View switches to appropriate dashboard interface

## Development Patterns

### Component Development
- Use TypeScript interfaces for all props
- Implement responsive design with Tailwind CSS
- Follow the existing gradient and animation patterns
- Use Lucide React icons for consistency

### Adding New Features
- Admin features go in `src/components/admin/views/`
- PNP features go in `src/components/pnp/views/`
- Shared components go in `src/components/ui/`
- Update mock data in `src/lib/mock-data.ts` for new data requirements

### State Management Patterns
- Use local React state for UI interactions
- Pass theme state down from root component
- Implement view switching through props and callbacks
- No external state management required for current feature set

## AI Integration Concepts

The application showcases AI-powered features for cybercrime investigation:
- **Automatic Priority Assignment**: Based on report content analysis
- **Case Routing**: AI determines appropriate PNP unit assignment
- **Risk Scoring**: 0-100 scale for case prioritization
- **Action Plan Generation**: AI suggests investigation steps

Note: AI features are currently conceptual/mock implementations for demonstration purposes.

## Performance and Optimization

### Next.js Optimizations
- App Router for improved performance
- Turbopack for faster development builds
- Automatic code splitting and optimization

### CSS and Styling
- Tailwind CSS with PostCSS optimization
- CSS-in-JS avoided in favor of utility classes
- Custom animations defined in Tailwind config

## Deployment Considerations

### Build Process
- Next.js static export capability
- Production build optimization
- TypeScript strict mode compliance required

### Environment Setup
- No external API dependencies currently
- All data is mock/static for demonstration
- Theme persistence through localStorage (client-side)

## Integration with Mobile App

This web application is designed to complement the Flutter mobile app (LawBot):
- **Shared Data Model**: Compatible case structure and status workflow
- **Role Separation**: Web for investigators, mobile for report submission
- **Consistent Branding**: Shared color scheme and design language
- **Investigation Focus**: Web app handles case management and evidence review