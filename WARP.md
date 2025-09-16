# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is an IELTS preparation application built with Next.js 15, TypeScript, and Firebase. The app provides comprehensive IELTS test practice with four main modules: Listening, Reading, Writing, and Speaking. It includes AI-powered evaluation, voice interaction via VAPI, and real-time feedback systems.

## Commands

### Development
```bash
npm run dev         # Start development server with turbopack
npm run build       # Build for production
npm start          # Start production server
npm run lint       # Lint the codebase
```

### Database Operations
```bash
npm run seed:speaking  # Seed speaking questions data to Firebase
npx tsx scripts/seed-speaking-questions.ts  # Direct seeding script execution
```

## Architecture

### Route Structure
The app uses Next.js App Router with route groups for organization:

- **`(root)/`** - Main application routes with Navbar layout
- **`(auth)/`** - Authentication routes (sign-in, sign-up) 
- **`(practice)/`** - Practice exercises and mock tests with toast notifications
- **`api/`** - API routes including admin verification and Firebase operations

### Core Systems

#### Authentication & User Management
- Firebase Auth for user authentication
- Admin role verification system at `/api/check-admin/`
- User stats tracking with comprehensive test result analytics
- Separate client and server Firebase configurations

#### Test Modules Architecture
Each IELTS module follows a consistent pattern:

**Listening Tests**
- Dynamic test structure with sections, questions, and audio integration
- Support for multiple question types: multiple-choice, fill-blank, true-false, matching, diagram-labeling, form-completion
- Audio playback with section-specific timing controls
- Complex answer validation with acceptable alternatives and case sensitivity options

**Speaking Tests** 
- Dual-mode system: AI voice interaction via VAPI and text-based practice
- Three-part IELTS structure with conversation capture and session management
- Real-time evaluation using AI with detailed criteria scoring (fluency, lexical resource, grammar, pronunciation)
- Session state management with message tracking and transcript generation

**Writing & Reading Tests**
- AI-powered feedback system using Google AI SDK
- Band score calculation and skill analysis
- Time tracking and comprehensive result storage

#### Data Management
- Firebase Firestore for user data, test results, and statistics
- JSON-based test content storage transitioning to database-driven approach
- Environment-based configuration for different deployment stages

### Key Technologies & Integrations

- **VAPI SDK**: Voice AI integration for speaking practice with custom wrapper (`lib/vapi.sdk.ts`)
- **Shadcn/UI**: Component library with Tailwind CSS styling
- **React Hook Form + Zod**: Form handling and validation
- **Firebase Admin/Client**: Separate configurations for server and client operations

### TypeScript Structure
Comprehensive type definitions across multiple files:

- `types/index.d.ts` - Core application types, auth, and test result interfaces
- `types/listening.d.ts` - Complex listening test structure with context-aware questions
- `types/speaking.d.ts` - Speaking session management, evaluation, and conversation types

### Component Organization
- **UI Components**: Reusable components in `/components/ui/`
- **Feature Components**: Module-specific components like `AuthForm`, `PracticeMode`, `WritingFeedback`
- **Layout Components**: Route group layouts with consistent navigation and notifications

## Development Notes

### Environment Variables Required
```bash
# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL  
FIREBASE_PRIVATE_KEY

# VAPI Integration
VAPI_TOKEN

# Google AI SDK
GOOGLE_API_KEY
```

### Known Issues
- Vercel hosting configuration needs attention (noted in `notes.txt`)
- Transition from public JSON files to Firebase database for listening content is in progress
- Admin panel system development for JSON file management is planned

### Testing Individual Components
For testing specific IELTS modules:
```bash
# Test listening module with specific audio files
npm run dev
# Navigate to /exercise/listening

# Test speaking with VAPI integration
npm run dev  
# Navigate to /exercise/speaking
# Ensure VAPI_TOKEN is configured

# Test writing AI feedback
npm run dev
# Navigate to /exercise/writing  
# Ensure GOOGLE_API_KEY is configured
```

### Working with Firebase
The app uses dual Firebase configuration:
- Client-side config in `firebase/client.ts` (public keys safe for client)
- Server-side admin config in `firebase/admin.ts` (requires private keys)

When working on authentication or database operations, ensure both configurations are properly set up.

### Path Aliases
The project uses `@/*` aliases pointing to the root directory for cleaner imports:
```typescript
import { testModules } from '@/constants'
import { db } from '@/firebase/client'
import Button from '@/components/ui/button'
```

## AI Integration Guidelines

When working on AI features:
- Speaking evaluations use conversation analysis with detailed criteria scoring
- Writing feedback leverages Google AI SDK for comprehensive assessment
- All AI responses should include band scores (1-9 scale) following IELTS standards
- Maintain conversation context in speaking sessions for coherent evaluation