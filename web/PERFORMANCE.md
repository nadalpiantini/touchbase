# Performance Optimization Guide

This document outlines the performance optimizations implemented in TouchBase Academy.

## Web App Optimizations

### Code Splitting & Lazy Loading

- **AICoach Component**: Lazy loaded in module player to reduce initial bundle size
- **AIAssistant Component**: Lazy loaded in teacher dashboard via wrapper component
- **Dynamic Imports**: Heavy components are loaded on-demand

### Image Optimization

- **Next.js Image Component**: Automatic image optimization with WebP/AVIF support
- **Responsive Images**: Multiple sizes for different device types
- **Lazy Loading**: Images load as they enter viewport

### Caching Strategy

- **API Routes**: 
  - Short cache (60s): User-specific data
  - Medium cache (5min): Public module/class data
  - Long cache (1hr): Static content
- **Static Assets**: 
  - Images/Fonts: 1 year cache
  - Scripts/Styles: 24 hour cache with revalidation

### Build Optimizations

- **SWC Minification**: Faster builds and smaller bundles
- **Package Import Optimization**: Tree-shaking for UI components
- **Compression**: Gzip/Brotli compression enabled

## Mobile App Optimizations

### Bundle Size

- **Code Splitting**: Navigation-based code splitting
- **Lazy Loading**: Screens loaded on-demand
- **Tree Shaking**: Unused code eliminated

### Performance

- **Offline Support**: Modules cached locally for instant access
- **Image Optimization**: Native image caching
- **Network Detection**: Smart sync when online

## Monitoring

- **Web Vitals**: Track Core Web Vitals (LCP, FID, CLS)
- **Bundle Analysis**: Regular bundle size audits
- **Performance Budgets**: Set limits for bundle sizes

## Best Practices

1. **Use Next.js Image component** for all images
2. **Lazy load heavy components** with React.lazy()
3. **Implement proper caching** for API routes
4. **Monitor bundle sizes** regularly
5. **Optimize images** before upload
6. **Use code splitting** for large features

