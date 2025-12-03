# TouchBase Academy - Deployment Guide

Complete guide for deploying TouchBase Academy to production.

## Architecture Overview

- **Web App**: Next.js 15 on Vercel
- **Mobile App**: React Native Expo (iOS/Android via EAS Build)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Analytics**: PostHog
- **CDN**: Vercel Edge Network

## Prerequisites

- Vercel account
- Supabase project
- Expo account (for mobile builds)
- PostHog account (optional)

## Web App Deployment (Vercel)

### 1. Environment Variables

Set these in Vercel dashboard:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# PostHog (optional)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd web
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

### 3. Custom Domain

1. Add domain in Vercel dashboard
2. Update DNS records as instructed
3. SSL certificate is automatically provisioned

## Mobile App Deployment

### 1. Configure Expo

```bash
cd mobile

# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure
```

### 2. Build for Production

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production

# Both
eas build --platform all --profile production
```

### 3. Submit to Stores

```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

## Supabase Setup

### 1. Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 2. Configure RLS Policies

All tables have Row Level Security enabled. Policies are defined in migration files.

### 3. Deploy Edge Functions

```bash
# Deploy AI Gateway function
supabase functions deploy ai-gateway
```

## PostHog Setup

1. Create PostHog project
2. Get API key
3. Add to environment variables
4. Analytics will start tracking automatically

## Monitoring

### Performance Monitoring

- Vercel Analytics (built-in)
- PostHog for product analytics
- Supabase Dashboard for database metrics

### Error Tracking

Consider adding Sentry for error tracking:

```bash
npm install @sentry/nextjs
```

## Security Checklist

- [ ] All environment variables set
- [ ] RLS policies configured
- [ ] API routes protected with authentication
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (via Supabase)
- [ ] SSL certificates active
- [ ] Secrets not committed to git

## Performance Optimization

- [ ] Images optimized (Next.js Image component)
- [ ] Code splitting enabled
- [ ] Caching headers configured
- [ ] CDN enabled (Vercel Edge Network)
- [ ] Database indexes created

## Backup Strategy

### Database

Supabase provides automatic backups. Configure retention in Supabase dashboard.

### Manual Backup

```bash
# Export database
supabase db dump -f backup.sql
```

## Rollback Procedure

### Web App

1. Go to Vercel dashboard
2. Navigate to Deployments
3. Select previous deployment
4. Click "Promote to Production"

### Database

```bash
# Restore from backup
supabase db reset
psql -f backup.sql
```

## Troubleshooting

### Build Failures

- Check environment variables
- Verify TypeScript compilation
- Review build logs in Vercel

### Database Issues

- Check Supabase dashboard
- Verify RLS policies
- Review migration logs

### Mobile Build Issues

- Check EAS build logs
- Verify app.json configuration
- Ensure all dependencies installed

## Support

For deployment issues:
- Check Vercel documentation
- Review Supabase logs
- Consult Expo documentation

