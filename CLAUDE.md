# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## Architecture Overview

This is a Next.js 14 web platform for Entropia Cursinho, a Brazilian pre-university preparatory school in Manaus, Amazonas. The application serves three main user types through distinct interfaces:

### Dual Authentication System
- **Student Authentication**: `AuthContext` + `ProtectedRoute` for student portals
- **Admin Authentication**: `AdminAuthContext` + `AdminProtectedRoute` for administrative access
- Both use localStorage persistence with separate keys (`entropia_usuario`, `entropia_admin`)

### Core Application Areas

**Public Landing** (`src/app/page.tsx`):
- Marketing homepage showcasing 850+ university approvals
- Hero sections for calculator, materials, and student portal access
- Optimized for Brazilian university entrance exam keywords (PSC UFAM, ENEM, SIS UEA, MACRO)

**Grade Calculator** (`src/app/calculadora/` + `src/components/CalculadoraPSC.tsx`):
- Multi-exam support: PSC, MACRO, SIS, ENEM
- Automatic quota determination based on demographics (public school, income, race)
- Real-time grade validation and approval/rejection calculations
- Course comparison with personalized study recommendations

**Student Portal** (`src/app/aluno/`):
- Dashboard with study statistics and progress tracking
- Access to video lessons, simulators, materials, forum
- ENEM countdown and weekly progress visualization

**Admin Panel** (`src/app/admin/`):
- Dark-themed administrative interface
- User management, course statistics, system monitoring
- N8N webhook integration for external systems
- Database management tools

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom green theme (`#16a34a`)
- **Animations**: Framer Motion for landing page interactions
- **Icons**: Lucide React
- **Font**: Inter variable font with weight variants
- **State**: React Context for authentication (no external state management)

### Key Patterns
- All pages use absolute imports with `@/` prefix
- Portuguese language throughout (Brazil market)
- SEO optimized with comprehensive metadata and structured data
- Responsive design with mobile-first approach
- Loading states and error boundaries for authentication flows