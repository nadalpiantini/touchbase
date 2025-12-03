# TouchBase Academy - Web Application

Next.js 15 web application for TouchBase Academy, a life skills education platform.

## Features

- ✅ Multi-tenant organization support
- ✅ Role-based access control (Teacher, Student, Admin)
- ✅ Module system with quizzes and scenarios
- ✅ Progress tracking and analytics
- ✅ Gamification (XP, badges, streaks, leaderboards)
- ✅ AI coaching and teacher assistance
- ✅ Class management and assignments
- ✅ Scheduling and attendance
- ✅ Internationalization (English/Spanish)
- ✅ Responsive design
- ✅ Accessibility (WCAG 2.1 AA)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Analytics**: PostHog
- **i18n**: next-intl

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key (optional)
```

### Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
web/
├── app/                    # Next.js App Router pages
│   ├── [locale]/          # Internationalized routes
│   │   ├── (protected)/   # Protected routes
│   │   └── login/         # Auth pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # UI primitives
│   ├── student/          # Student-specific components
│   └── teacher/          # Teacher-specific components
├── lib/                   # Utilities and services
│   ├── supabase/         # Supabase clients
│   ├── services/         # Business logic
│   └── auth/             # Authentication helpers
├── messages/              # i18n translations
└── public/               # Static assets
```

## Testing

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run accessibility tests
npm run test:e2e -- tests/accessibility.spec.ts
```

## Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for production deployment instructions.

## Documentation

- [Performance Guide](./PERFORMANCE.md)
- [Accessibility Guide](./ACCESSIBILITY.md)
- [Design Tokens](./DESIGN_TOKENS.md)
- [Style Guide](./TOUCHBASE_STYLE_GUIDE.md)

## License

GPL-3.0-or-later
